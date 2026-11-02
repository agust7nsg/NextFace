/**
 * Extracts a user-facing error message from a supabase.functions.invoke() error.
 *
 * When the edge function returns a non-2xx status (e.g. 429 rate limit),
 * supabase-js returns an error object whose .context is the raw Response.
 * The response body contains the real JSON the edge function sent
 * (e.g. { error: "You've reached your monthly limit...", rate_limited: true }),
 * but the generic error.message is just "Function returned an error".
 *
 * This helper reads the response body and pulls out the real error message.
 * Returns null if no message could be extracted, so callers can fall back
 * to their own generic error text.
 */
export async function extractInvokeErrorMessage(error: unknown): Promise<string | null> {
  try {
    const ctx = (error as any)?.context;
    if (ctx && typeof ctx.json === "function") {
      const body = await ctx.json();
      if (body?.error && typeof body.error === "string") {
        return body.error;
      }
    }
    if (typeof (error as any)?.message === "string") {
      const msg = (error as any).message as string;
      if (msg && msg !== "Function returned an error" && msg !== "fetch failed") {
        return msg;
      }
    }
  } catch {
    // response body couldn't be parsed — return null so caller falls back
  }
  return null;
}
