// src/lib/history.ts
import { supabase } from "./supabaseClient";
import { getSignedUrl, deleteStorageFile } from "./storage";

const TABLE = "facial_analyses";

export type AnalysisRow = {
  id: string;
  user_id: string;
  created_at: string;
  image_url: string | null;
  analysis: any;
  overall_score: number;
};

// Clamp to 0..100, fallback to 0 if missing
const toScore = (n: unknown) => {
  const v = Number(n);
  return Number.isFinite(v) ? Math.min(100, Math.max(0, Math.round(v))) : 0;
};

export async function saveAnalysis(opts: { userId: string; imagePath?: string | null; analysis: any }) {
  const { userId, imagePath = null, analysis } = opts;

  const overall = toScore(analysis?.overall);

  const { data: insertedRows, error: insertErr } = await supabase
    .from(TABLE)
    .insert([{ user_id: userId, image_url: imagePath, analysis, overall_score: overall }])
    .select("id");

  if (insertErr) {
    console.error("Failed to save analysis to history:", insertErr);
    return { ok: false, error: insertErr.message };
  }

  const analysisId: string | undefined = insertedRows?.[0]?.id;

  // Keep only the newest 10 rows for this user
  const { data: rows } = await supabase
    .from<Pick<AnalysisRow, "id" | "created_at">>(TABLE)
    .select("id,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const toDelete = (rows ?? []).slice(10);
  if (toDelete.length) {
    const { data: oldRows } = await supabase
      .from<Pick<AnalysisRow, "id" | "image_url">>(TABLE)
      .select("id,image_url")
      .in("id", toDelete.map(r => r.id));

    const { error: delErr } = await supabase.from(TABLE).delete().in("id", toDelete.map(r => r.id));
    if (delErr) console.error("history cleanup error:", delErr);

    const paths = (oldRows ?? [])
      .map(r => r.image_url)
      .filter((p): p is string => !!p && !p.startsWith("http"));
    if (paths.length) {
      await Promise.all(paths.map(p => deleteStorageFile(p)));
    }
  }

  return { ok: true, analysisId };
}

export async function getHistory(opts: { userId: string; limit?: number }) {
  const { userId, limit = 10 } = opts;
  const { data, error } = await supabase
    .from<AnalysisRow>(TABLE)
    .select("id, user_id, created_at, image_url, analysis, overall_score")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error loading analysis history:", error);
    return { ok: false, error: error.message, data: [] as AnalysisRow[] };
  }

  // Hydrate signed URLs for any rows that store a storage path
  const rows = data ?? [];
  await Promise.all(
    rows.map(async (row) => {
      if (row.image_url && !row.image_url.startsWith("http")) {
        const signed = await getSignedUrl(row.image_url);
        if (signed) row.image_url = signed;
      }
    })
  );

  return { ok: true, data: rows };
}

export async function deleteAnalysis(id: string) {
  const { data: row } = await supabase
    .from(TABLE)
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const imageUrl = (row as Pick<AnalysisRow, "image_url"> | null)?.image_url ?? null;

  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) {
    console.error("deleteAnalysis error:", error);
    return { ok: false, error: error.message };
  }

  if (imageUrl && !imageUrl.startsWith("http")) {
    await deleteStorageFile(imageUrl);
  }

  return { ok: true };
}

export async function getAnalysisCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error getting analysis count:", error);
    return 0;
  }
  return count ?? 0;
}
