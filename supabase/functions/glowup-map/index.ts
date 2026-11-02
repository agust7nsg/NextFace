import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { checkRateLimit } from "../_shared/rate-limit.ts";

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

const SYSTEM_PROMPT = `You are an expert facial aesthetics coach. Given a user's facial analysis scores, create a personalized "Glowup Map" — an improvement plan with specific, actionable advice.

Return a JSON object with this structure:
{
  "ok": true,
  "weakPoints": [
    {
      "key": string (one of: "jawline", "cheekbones", "skin", "eyeArea", "attractiveness"),
      "label": string (human-readable area name),
      "score": number,
      "explanation": string (2-4 sentences explaining the score and why it's a weak point),
      "daily": string[] (exactly 2 daily actionable tasks),
      "weekly": string[] (up to 3 weekly actionable tasks)
    }
  ],
  "maxPotential": {
    "low": number,
    "high": number,
    "rangeText": string (e.g., "78-85 with consistent effort")
  },
  "symmetryPlan": {
    "key": "symmetry",
    "title": string,
    "baseline": number,
    "explanation": string,
    "daily": string[],
    "weekly": string[]
  },
  "faceShapePlan": {
    "key": "faceShape",
    "title": string (include the face shape name, e.g., "Oval Face"),
    "baseline": number,
    "explanation": string,
    "daily": string[],
    "weekly": string[]
  },
  "haircuts": string[] (3 haircut recommendations based on face shape)
}

Rules:
- You MUST include EXACTLY 3 weakPoints — never 2, never 4. Pick the 3 lowest-scoring areas from: jawline, cheekbones, skin, eyeArea, attractiveness.
- You MUST always include the symmetryPlan and faceShapePlan sections, even if the scores are high.
- All tasks must be specific and actionable, not generic
- maxPotential should reflect realistic improvement with consistent effort over 6-12 months
- Return ONLY the JSON object, no markdown
- The app is designed for MEN. NEVER recommend makeup, contouring, foundation, concealer, highlighter, bronzer, blush, eyeliner, eyeshadow, false lashes, or any cosmetic makeup products or techniques. Tinted sunscreen is the ONLY acceptable cosmetic-adjacent product. Focus on skincare, grooming, facial exercises, diet, sleep, hydration, hair styling, posture, and fitness instead.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const tokenError = checkAppToken(req);
  if (tokenError) return tokenError;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
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

  try {
    const rateLimit = await checkRateLimit(req, "glowup-map", user.id);
    if (rateLimit.limited) return rateLimit.response;

    const { analysis, language } = await req.json();

    if (!analysis || typeof analysis !== "object") {
      return new Response(
        JSON.stringify({ error: "Missing analysis data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "Server is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lang = language === "es" ? "es" : "en";
    const langInstruction = lang === "es"
      ? "\n\nIMPORTANT: Write ALL textual content (weakPoint labels, explanations, daily/weekly tasks, symmetryPlan and faceShapePlan titles/explanations, maxPotential rangeText, haircuts) in Spanish. Keep JSON keys in English."
      : "";

    const scoresSummary = JSON.stringify(analysis, null, 2);

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + langInstruction },
          {
            role: "user",
            content: `Here are the user's facial analysis scores:\n\n${scoresSummary}\n\nCreate a personalized glowup map based on these scores.`,
          },
        ],
        max_tokens: 8000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text().catch(() => "");
      console.error(`OpenAI error: ${openaiRes.status} ${errText}`);
      return new Response(
        JSON.stringify({ error: "Could not generate your plan right now. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiRes.json();
    const choice = openaiData.choices?.[0];
    const content = choice?.message?.content ?? "";

    if (choice?.finish_reason === "length") {
      console.error("OpenAI response truncated due to max_tokens limit");
      return new Response(
        JSON.stringify({ error: "The plan was too large to generate completely. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!content) {
      return new Response(
        JSON.stringify({ error: "The service returned an empty response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let plan: Record<string, unknown>;
    try {
      plan = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({ error: "Could not parse the plan. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!plan.ok) {
      plan.ok = true;
    }

    const ALL_AREAS = ["jawline", "cheekbones", "skin", "eyeArea", "attractiveness"] as const;
    const LABELS: Record<string, string> = lang === "es"
      ? { jawline: "Mandíbula", cheekbones: "Pómulos", skin: "Piel", eyeArea: "Ojos", attractiveness: "Atractivo" }
      : { jawline: "Jawline", cheekbones: "Cheekbones", skin: "Skin", eyeArea: "Eye Area", attractiveness: "Attractiveness" };

    // Enforce exactly 3 weak points.
    let weakPoints = Array.isArray(plan.weakPoints) ? plan.weakPoints as Array<Record<string, unknown>> : [];

    if (weakPoints.length > 3) {
      // Keep the 3 lowest-scoring
      weakPoints.sort((a, b) => (Number(a.score) || 0) - (Number(b.score) || 0));
      weakPoints = weakPoints.slice(0, 3);
    }

    if (weakPoints.length < 3) {
      // Backfill from analysis scores using the areas not already present
      const present = new Set(weakPoints.map((wp) => wp.key));
      const scores: Array<{ key: string; score: number }> = [];
      for (const key of ALL_AREAS) {
        if (present.has(key)) continue;
        const raw = (analysis as Record<string, unknown>)[key];
        const numVal = typeof raw === "number" ? raw : undefined;
        if (numVal !== undefined) {
          scores.push({ key, score: numVal });
        }
      }
      // Also try the scores array from the analysis
      const scoresArr = Array.isArray((analysis as Record<string, unknown>)?.scores)
        ? ((analysis as Record<string, unknown>).scores as Array<Record<string, unknown>>)
        : [];
      for (const s of scoresArr) {
        const k = String(s.key ?? "");
        if (present.has(k) || scores.some((x) => x.key === k)) continue;
        scores.push({ key: k, score: Number(s.score) || 0 });
      }
      scores.sort((a, b) => a.score - b.score);

      while (weakPoints.length < 3 && scores.length > 0) {
        const next = scores.shift()!;
        weakPoints.push({
          key: next.key,
          label: LABELS[next.key] ?? next.key,
          score: next.score,
          explanation: `Your ${LABELS[next.key] ?? next.key} score is ${next.score}/100, making it one of the areas with the most room for improvement.`,
          daily: [],
          weekly: [],
        });
      }
    }

    plan.weakPoints = weakPoints;

    // Guarantee symmetryPlan and faceShapePlan exist
    if (!plan.symmetryPlan || typeof plan.symmetryPlan !== "object") {
      const symScore = Number((analysis as Record<string, unknown>)?.symmetryScore ?? (analysis as Record<string, unknown>)?.symmetry?.score ?? 75) || 75;
      plan.symmetryPlan = {
        key: "symmetry",
        title: lang === "es" ? "Simetría Facial" : "Facial Symmetry",
        baseline: symScore,
        explanation: lang === "es"
          ? `Tu puntuación de simetría actual es ${symScore}/100. Las mejoras en simetría provienen de hábitos diarios consistentes y ejercicios específicos.`
          : `Your current symmetry score is ${symScore}/100. Symmetry improvements come from consistent daily habits and targeted exercises.`,
        daily: [],
        weekly: [],
      };
    }

    if (!plan.faceShapePlan || typeof plan.faceShapePlan !== "object") {
      const faceShape = String((analysis as Record<string, unknown>)?.faceShape ?? "oval");
      const capitalized = faceShape.charAt(0).toUpperCase() + faceShape.slice(1);
      const FACE_SHAPE_ES: Record<string, string> = {
        oval: "Ovalado", square: "Cuadrado", rectangle: "Rectangular", round: "Redondo",
        diamond: "Diamante", triangle: "Triangular", heart: "Corazón",
      };
      const shapeName = lang === "es" ? (FACE_SHAPE_ES[faceShape] ?? capitalized) : capitalized;
      plan.faceShapePlan = {
        key: "faceShape",
        title: lang === "es" ? `Rostro ${shapeName}` : `${capitalized} Face`,
        baseline: Number((analysis as Record<string, unknown>)?.facialHarmony ?? 75) || 75,
        explanation: lang === "es"
          ? `La forma de tu rostro es ${shapeName}. Este plan se enfoca en realzar tu estructura natural ${shapeName}.`
          : `Your face shape is ${faceShape}. This plan focuses on enhancing your natural ${faceShape} structure.`,
        daily: [],
        weekly: [],
      };
    }

    return new Response(
      JSON.stringify(plan),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
