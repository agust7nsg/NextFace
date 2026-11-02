import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, x-app-token",
};

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6 = /^[0-9a-fA-F:]{2,45}$/;

function isPublicIp(ip: string): boolean {
  if (IPV4.test(ip)) {
    const p = ip.split(".").map(Number);
    if (p[0] === 10) return false;
    if (p[0] === 127) return false;
    if (p[0] === 0) return false;
    if (p[0] === 169 && p[1] === 254) return false;
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return false;
    if (p[0] === 192 && p[1] === 168) return false;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return false;
    return true;
  }
  if (IPV6.test(ip) && ip.includes(":")) {
    const low = ip.toLowerCase();
    if (low === "::1" || low === "::") return false;
    if (low.startsWith("fe80") || low.startsWith("fc") || low.startsWith("fd")) return false;
    return true;
  }
  return false;
}

export function extractClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  const candidate = forwarded ? forwarded.split(",")[0].trim() : "";
  return candidate && isPublicIp(candidate) ? candidate : null;
}

export const RATE_LIMITS: Record<string, { ip: number; user: number; message: string }> = {
  "gpt5-analysis": {
    ip: 30,
    user: 25,
    message:
      "You've reached your monthly limit for facial analyses. Your limit refreshes at the start of next month. We detected unusual traffic from your network — if you believe this is a mistake, contact us at help.nextfaceapp@gmail.com.",
  },
  "glowup-map": {
    ip: 30,
    user: 20,
    message:
      "You've reached your monthly limit for Glowup Maps. Your limit refreshes at the start of next month. We detected unusual traffic from your network — if you believe this is a mistake, contact us at help.nextfaceapp@gmail.com.",
  },
  "gptmini-chat": {
    ip: 1000,
    user: 500,
    message:
      "You've reached your monthly limit for AI chat messages. Your limit refreshes at the start of next month. We detected unusual traffic from your network — if you believe this is a mistake, contact us at help.nextfaceapp@gmail.com.",
  },
};

export interface RateLimitResult {
  limited: boolean;
  response: Response | null;
}

export async function checkRateLimit(
  req: Request,
  functionName: string,
  userId: string,
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[functionName];
  if (!config) return { limited: false, response: null };

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const clientIp = extractClientIp(req);
  const ipKey = clientIp ?? "unknown";

  // Inline cleanup: delete rows older than 35 days
  await adminClient
    .from("rate_limit_log")
    .delete()
    .lt("called_at", new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString());

  // Count calls this calendar month for this IP + function
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count: ipCount, error: ipError } = await adminClient
    .from("rate_limit_log")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ipKey)
    .eq("function_name", functionName)
    .gte("called_at", monthStart.toISOString());

  if (ipError) {
    console.error(`Rate limit check error (IP): ${ipError.message}`);
    // On error, allow the call through — don't block users due to infrastructure issues
    return { limited: false, response: null };
  }

  if ((ipCount ?? 0) >= config.ip) {
    return {
      limited: true,
      response: new Response(
        JSON.stringify({ error: config.message, rate_limited: true }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ),
    };
  }

  // Count calls this calendar month for this user + function (secondary layer)
  const { count: userCount, error: userError } = await adminClient
    .from("rate_limit_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("function_name", functionName)
    .gte("called_at", monthStart.toISOString());

  if (userError) {
    console.error(`Rate limit check error (user): ${userError.message}`);
    return { limited: false, response: null };
  }

  if ((userCount ?? 0) >= config.user) {
    return {
      limited: true,
      response: new Response(
        JSON.stringify({ error: config.message, rate_limited: true }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ),
    };
  }

  // Not limited — log this call
  const { error: insertError } = await adminClient.from("rate_limit_log").insert({
    ip_address: ipKey,
    user_id: userId,
    function_name: functionName,
  });

  if (insertError) {
    console.error(`Rate limit log insert error: ${insertError.message}`);
    // Still allow the call through — logging failure shouldn't block users
  }

  return { limited: false, response: null };
}
