import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const tokenError = checkAppToken(req);
  if (tokenError) return tokenError;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // --- Step 1: Collect all storage paths BEFORE deleting any rows ---

    const { data: analyses, error: analysesErr } = await adminClient
      .from("facial_analyses")
      .select("image_url, avatar_path")
      .eq("user_id", userId);
    if (analysesErr) throw new Error("Failed to read analysis records: " + analysesErr.message);

    const { data: profile, error: profileErr } = await adminClient
      .from("facial_profiles")
      .select("avatar_path")
      .eq("user_id", userId)
      .maybeSingle();
    if (profileErr) throw new Error("Failed to read profile record: " + profileErr.message);

    const filePaths: string[] = [];
    for (const row of analyses ?? []) {
      if (row.image_url && !row.image_url.startsWith("http")) filePaths.push(row.image_url);
      if (row.avatar_path) filePaths.push(row.avatar_path);
    }
    if (profile?.avatar_path) filePaths.push(profile.avatar_path);

    // --- Step 2: Delete rows from all tables tied to the user (fail-fast) ---
    // Child tables first, then parent tables. If ANY delete fails, abort
    // before the irreversible auth deletion — the caller can retry.

    const { error: chatErr } = await adminClient
      .from("chat_messages")
      .delete()
      .eq("user_id", userId);
    if (chatErr) throw new Error("Failed to delete chat messages: " + chatErr.message);

    const { error: eventsErr } = await adminClient
      .from("user_events")
      .delete()
      .eq("user_id", userId);
    if (eventsErr) throw new Error("Failed to delete user events: " + eventsErr.message);

    const { error: analysesDeleteErr } = await adminClient
      .from("facial_analyses")
      .delete()
      .eq("user_id", userId);
    if (analysesDeleteErr) throw new Error("Failed to delete facial analyses: " + analysesDeleteErr.message);

    const { error: profileDeleteErr } = await adminClient
      .from("facial_profiles")
      .delete()
      .eq("user_id", userId);
    if (profileDeleteErr) throw new Error("Failed to delete facial profile: " + profileDeleteErr.message);

    // --- Step 3: Delete files from all private storage buckets (log-and-continue) ---

    const storageWarnings: string[] = [];

    if (filePaths.length > 0) {
      for (const bucket of ["user-images", "user_uploads"]) {
        const { error: storageError } = await adminClient.storage
          .from(bucket)
          .remove(filePaths);
        if (storageError) {
          console.error(`storage cleanup warning (${bucket}):`, storageError.message);
          storageWarnings.push(`Failed to clean ${bucket}: ${storageError.message}`);
        }
      }
    }

    // Also attempt to remove any orphaned objects under the user's folder prefix.
    for (const bucket of ["user-images", "user_uploads"]) {
      const { data: folderFiles, error: listError } = await adminClient.storage
        .from(bucket)
        .list(userId);
      if (listError) {
        console.error(`list ${bucket}/${userId} warning:`, listError.message);
        storageWarnings.push(`Failed to list ${bucket}/${userId}: ${listError.message}`);
        continue;
      }
      if (folderFiles && folderFiles.length > 0) {
        const extraPaths = folderFiles
          .filter((f) => f.name && !f.id)
          .map((f) => `${userId}/${f.name}`);
        if (extraPaths.length > 0) {
          const { error: rmErr } = await adminClient.storage.from(bucket).remove(extraPaths);
          if (rmErr) {
            console.error(`cleanup ${bucket}/${userId} warning:`, rmErr.message);
            storageWarnings.push(`Failed to clean orphaned files in ${bucket}: ${rmErr.message}`);
          }
        }
      }
    }

    // --- Step 4: Delete the auth user (final, irreversible step) ---

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw new Error("Failed to delete account: " + deleteError.message);
    }

    // Report storage warnings even on success — the account is gone but
    // some files may remain in storage and need manual cleanup.
    if (storageWarnings.length > 0) {
      return new Response(JSON.stringify({
        success: true,
        warning: "Account deleted, but some storage files could not be removed: " + storageWarnings.join("; "),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
