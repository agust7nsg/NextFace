import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, x-app-token",
};

function checkAppToken(req: Request): Response | null {
  const token = req.headers.get("x-app-token");
  const expected = Deno.env.get("APP_TOKEN");
  if (!expected || token !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return null;
}

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Latin America
  CL: "CLP", MX: "MXN", AR: "ARS", CO: "COP", BR: "BRL",
  PE: "PEN", UY: "UYU", PY: "PYG", BO: "BOB", EC: "USD",
  VE: "VES", CR: "CRC", PA: "USD", GT: "GTQ", HN: "HNL",
  SV: "USD", NI: "NIO", DO: "DOP", CU: "CUP", JM: "JMD",
  // North America
  US: "USD", CA: "CAD",
  // Europe - Euro zone
  ES: "EUR", DE: "EUR", FR: "EUR", IT: "EUR", PT: "EUR",
  NL: "EUR", BE: "EUR", AT: "EUR", FI: "EUR", IE: "EUR",
  GR: "EUR", SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR",
  LT: "EUR", LU: "EUR", MT: "EUR", CY: "EUR",
  // Europe - Non-euro
  GB: "GBP", CH: "CHF", NO: "NOK", SE: "SEK", DK: "DKK",
  PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON", BG: "BGN",
  RU: "RUB", UA: "UAH", TR: "TRY", IL: "ILS",
  // Asia-Pacific
  JP: "JPY", CN: "CNY", KR: "KRW", HK: "HKD", TW: "TWD",
  SG: "SGD", AU: "AUD", NZ: "NZD", IN: "INR", PK: "PKR",
  BD: "BDT", LK: "LKR", TH: "THB", PH: "PHP", ID: "IDR",
  MY: "MYR", VN: "VND",
  // Middle East & Africa
  AE: "AED", SA: "SAR", QA: "QAR", ZA: "ZAR", NG: "NGN",
  KE: "KES", EG: "EGP",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const tokenError = checkAppToken(req);
  if (tokenError) return tokenError;

  // Extract real client IP from the forwarded header.
  // The header is attacker-controlled, so the value must be a literal IP address
  // before it is ever interpolated into an outbound URL.
  const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  const IPV6 = /^[0-9a-fA-F:]{2,45}$/;

  const isPublicIp = (ip: string): boolean => {
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
  };

  const forwarded = req.headers.get("x-forwarded-for");
  const candidate = forwarded ? forwarded.split(",")[0].trim() : "";
  const clientIp = candidate && isPublicIp(candidate) ? candidate : null;

  let countryCode = "US";

  if (clientIp) {
    try {
      const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`, {
        headers: { "User-Agent": "nextface-app/1.0" },
      });
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.country_code && typeof geo.country_code === "string") {
          countryCode = geo.country_code.toUpperCase();
        }
      }
    } catch {
      // fall through to default
    }
  }

  const currency = COUNTRY_TO_CURRENCY[countryCode] ?? "USD";

  return new Response(
    JSON.stringify({ country: countryCode, currency }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
