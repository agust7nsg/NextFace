import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ACTIVE_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
]);

const INACTIVE_EVENTS = new Set([
  "EXPIRATION",
  "CANCELLATION",
  "BILLING_ISSUE",
]);

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  product_id?: string;
  entitlement_ids?: string[];
  expiration_at_ms?: number;
}

interface RevenueCatWebhookPayload {
  event?: RevenueCatEvent;
  events?: RevenueCatEvent[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("REVENUECAT_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const providedSecret = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!providedSecret || providedSecret !== webhookSecret) {
      console.error("Webhook authentication failed");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RevenueCatWebhookPayload = await req.json();
    const events = body.events ?? (body.event ? [body.event] : []);

    if (events.length === 0) {
      return new Response(JSON.stringify({ received: true, processed: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    let processed = 0;

    for (const event of events) {
      const appUserId = event.app_user_id;
      if (!appUserId) {
        console.warn(`Skipping event ${event.type}: missing app_user_id`);
        continue;
      }

      let isPremium: boolean;

      if (ACTIVE_EVENTS.has(event.type)) {
        isPremium = true;
      } else if (INACTIVE_EVENTS.has(event.type)) {
        isPremium = false;
      } else {
        console.log(`Ignoring event type ${event.type} for user ${appUserId}`);
        continue;
      }

      const { error } = await adminClient
        .from("facial_profiles")
        .update({ is_premium: isPremium })
        .eq("user_id", appUserId);

      if (error) {
        console.error(
          `Failed to update is_premium for user ${appUserId} on event ${event.type}: ${error.message}`
        );
      } else {
        processed++;
        console.log(
          `Updated is_premium=${isPremium} for user ${appUserId} (event: ${event.type})`
        );
      }
    }

    return new Response(
      JSON.stringify({ received: true, processed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`RevenueCat webhook error: ${message}`);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
