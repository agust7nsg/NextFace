import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ALLOWED_REDIRECT_ORIGINS = [
  "nextface://auth",
  "capacitor://localhost",
  "http://localhost",
  "http://localhost:5173",
  "https://hebwatwkpszebonmrige.supabase.co",
];

function isAllowedRedirect(url: string): boolean {
  try {
    const parsed = new URL(url);
    const origin = `${parsed.protocol}//${parsed.host}${parsed.pathname === "/" ? "" : parsed.pathname}`;
    if (ALLOWED_REDIRECT_ORIGINS.includes(`${parsed.protocol}//${parsed.host}`)) return true;
    if (ALLOWED_REDIRECT_ORIGINS.includes(origin)) return true;
    return ALLOWED_REDIRECT_ORIGINS.includes(url);
  } catch {
    return ALLOWED_REDIRECT_ORIGINS.includes(url);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const siteUrl = Deno.env.get("SITE_URL") || supabaseUrl;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const requestUrl = new URL(req.url);
  const rawRedirect = requestUrl.searchParams.get("redirect_url");

  const redirectTo =
    rawRedirect && isAllowedRedirect(rawRedirect)
      ? rawRedirect
      : siteUrl;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return new Response(
      JSON.stringify({ error: "Failed to generate OAuth URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ url: data.url }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
