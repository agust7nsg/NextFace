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

const SYSTEM_PROMPT = `You are a clinical facial morphology and biometrics analyzer. Analyze the provided facial photo and return a comprehensive JSON object with structural symmetry and geometric proportions. All numeric values must be integers 0-100 unless specified.

Use clinical and anatomical terminology for your assessment. You MUST include ALL of the following JSON fields in your response without omitting any key:

{
  "overall": number (0-100, overall facial structural balance score),
  "jawline": number (0-100, mandibular definition and sharpness score),
  "cheekbones": number (0-100, malar prominence score),
  "eyeArea": number (0-100, periocular symmetry score),
  "skin": number (0-100, skin health and texture score),
  "attractiveness": number (0-100, aesthetic facial harmony score),
  "symmetryScore": number (0-100, bilateral facial symmetry score),
  "age": number (estimated age in years),
  "faceShape": string (one of: "oval", "square", "rectangle", "round", "diamond", "triangle", "heart"),
  "percentile": number (0-100, population distribution rank for facial balance),
  "facialHarmony": number (0-100, feature proportion balance score),
  "goldenRatioScore": number (0-100, adherence to 1.618 facial proportion ratio),
  "featureBalance": number (0-100, spatial feature distribution score),
  "overallSummary": string (2-3 sentence clinical summary of facial structure strengths and areas for improvement),
  "maxPotentialLow": number (0-100, low end of estimated maximum achievable score with optimization),
  "maxPotentialHigh": number (0-100, high end of estimated maximum achievable score with optimization),
  "symmetry": {
    "score": number (0-100),
    "faceSymmetryPct": number (0-100),
    "eyeHeightDiffPx": number,
    "mouthCornerTiltDeg": number
  },
  "goldenRatio": {
    "score": number (0-100),
    "matchPct": number (0-100, percentage match to golden ratio),
    "note": string (brief note about golden ratio adherence)
  },
  "proportions": {
    "score": number (0-100),
    "thirdsBalance": string,
    "widthToHeight": number,
    "whatWeSee": string (1 sentence describing observed proportions),
    "meaning": string (1 sentence explaining clinical significance),
    "whyScore": string (1 sentence justifying the score)
  },
  "nose": {
    "score": number (0-100),
    "widthRel": string ("narrow" | "average" | "slightly wide" | "wide"),
    "lengthRel": string ("short" | "average" | "long"),
    "deviation": string ("straight" | "mild left" | "mild right"),
    "bridgeShape": string ("straight" | "slight hump" | "saddle" | "other"),
    "whatWeSee": string (1 sentence describing observed nose features),
    "meaning": string (1 sentence explaining clinical significance),
    "whyScore": string (1 sentence justifying the score)
  },
  "lipsMouth": {
    "score": number (0-100),
    "upperLowerRatio": number,
    "mouthWidthRel": string ("narrow" | "average" | "wide"),
    "philtrumLabel": string ("short" | "normal" | "long"),
    "whatWeSee": string (1 sentence describing observed lip/mouth features),
    "meaning": string (1 sentence explaining clinical significance),
    "whyScore": string (1 sentence justifying the score)
  },
  "ageEstimate": {
    "years": number,
    "range": string (e.g. "19-23"),
    "confidence": string ("low" | "medium" | "high")
  },
  "skinReport": {
    "score": number (0-100),
    "acne": string ("none" | "mild" | "moderate" | "severe"),
    "redness": string ("none" | "mild" | "moderate" | "severe"),
    "darkCircles": string ("none" | "mild" | "moderate" | "severe"),
    "texture": string ("smooth" | "slightly uneven" | "uneven"),
    "oiliness": string ("dry" | "balanced" | "oily" | "combination"),
    "toneEvenness": string ("even" | "slightly uneven" | "uneven"),
    "notes": string[]
  },
  "eyes": {
    "score": number (0-100, periocular aesthetic score),
    "eyeType": string (e.g. "almond", "round", "hooded", "monolid", "upturned", "downturned"),
    "canthalTiltDeg": number (positive = upward tilt, negative = downward),
    "tiltLabel": string ("positive" | "neutral" | "negative")
  },
  "jawlineReport": {
    "reportText": string (2-3 sentence clinical description of jawline structure),
    "angleLabel": string (e.g. "sharp", "moderate", "soft"),
    "chinProjection": string (e.g. "strong", "average", "recessed"),
    "jawWidth": string (e.g. "narrow", "average", "wide"),
    "lowerThird": string (e.g. "short", "balanced", "long"),
    "submental": string (e.g. "tight", "average", "soft")
  },
  "cheekbonesReport": {
    "reportText": string (2-3 sentence clinical description of cheekbone structure),
    "heightLabel": string (e.g. "high", "medium", "low"),
    "prominence": string (e.g. "prominent", "moderate", "flat"),
    "malarContour": string (e.g. "defined", "soft", "flat"),
    "zygToJawWidth": string (e.g. "wider", "equal", "narrower")
  },
  "attractivenessReport": {
    "reportText": string (2-3 sentence description of overall aesthetic appeal),
    "styleLabel": string (e.g. "classic", "modern", "striking", "approachable"),
    "harmonyNotes": string (brief note on feature harmony),
    "impactPercentile": number (0-100)
  },
  "ageFactors": string[]
}

Return ONLY the JSON object. Do not omit any field. Evaluate geometric balance objectively.`;

const num = (v: unknown, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const str = (v: unknown, fallback: string): string =>
  typeof v === "string" && v.length > 0 ? v : fallback;

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
    const rateLimit = await checkRateLimit(req, "gpt5-analysis", user.id);
    if (rateLimit.limited) return rateLimit.response;

    const { image_base64, language } = await req.json();

    if (!image_base64 || typeof image_base64 !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing image_base64" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lang = language === "es" ? "es" : "en";
    const langInstruction = lang === "es"
      ? "\n\nIMPORTANT: Write ALL textual fields in Spanish using clinical Spanish terminology. This includes: overallSummary, all \"whatWeSee\"/\"meaning\"/\"whyScore\" descriptions, all reportText fields, goldenRatio note, skinReport notes, ageFactors, thirdsBalance, and ALL enum/string descriptive values such as: faceShape (e.g. \"ovalado\", \"cuadrado\", \"redondo\", \"diamante\", \"triangular\", \"corazón\"), nose widthRel/lengthRel/deviation/bridgeShape, lipsMouth mouthWidthRel/philtrumLabel, skinReport acne/redness/darkCircles/texture/oiliness/toneEvenness, eyes eyeType/tiltLabel, jawlineReport angleLabel/chinProjection/jawWidth/lowerThird/submental, cheekbonesReport heightLabel/prominence/malarContour/zygToJawWidth, attractivenessReport styleLabel/harmonyNotes, proportions thirdsBalance, ageEstimate range/confidence. Write ALL of these in Spanish. Keep only the JSON object keys themselves in English."
      : "";

    if (image_base64.length < 1000) {
      return new Response(
        JSON.stringify({ error: "The image data is too small to be valid. Please try a different photo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "Server is not configured for analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dataUrl = `data:image/jpeg;base64,${image_base64}`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT + langInstruction },
          {
            role: "user",
            content: [
              { type: "text", text: "Perform a complete facial morphology and biometric analysis of this subject. Return the full JSON with every field populated." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 3000,
        temperature: 0.3,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text().catch(() => "");
      console.error(`OpenAI error: ${openaiRes.status} ${errText}`);
      return new Response(
        JSON.stringify({ error: `The analysis service returned an error (${openaiRes.status}). Please try again.` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content ?? "";

    if (!content) {
      return new Response(
        JSON.stringify({ error: "The analysis returned an empty response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({ error: "Could not parse analysis result. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const overall = num(raw.overall, 75);
    const jawline = num(raw.jawline, 75);
    const cheekbones = num(raw.cheekbones, 75);
    const eyeArea = num(raw.eyeArea, 75);
    const skinScore = num(raw.skin, 75);
    const attractiveness = num(raw.attractiveness, 75);
    const symmetryFlat = num(raw.symmetryScore ?? raw.symmetry, 75);
    const age = num(raw.age, 25);
    const faceShape = str(raw.faceShape as string, "oval");
    const percentile = num(raw.percentile, 50);
    const facialHarmony = num(raw.facialHarmony, 75);
    const goldenRatioFlat = num(raw.goldenRatioScore ?? raw.goldenRatio, 75);
    const featureBalance = num(raw.featureBalance, 75);

    const scoreLabels: Record<string, string> = lang === "es"
      ? { overall: "General", jawline: "Mandíbula", cheekbones: "Pómulos", eyeArea: "Ojos", skin: "Piel", attractiveness: "Atractivo" }
      : { overall: "Overall", jawline: "Jawline", cheekbones: "Cheekbones", eyeArea: "Eye Area", skin: "Skin", attractiveness: "Attractiveness" };

    const scores = [
      { key: "overall", label: scoreLabels.overall, score: overall },
      { key: "jawline", label: scoreLabels.jawline, score: jawline },
      { key: "cheekbones", label: scoreLabels.cheekbones, score: cheekbones },
      { key: "eyeArea", label: scoreLabels.eyeArea, score: eyeArea },
      { key: "skin", label: scoreLabels.skin, score: skinScore },
      { key: "attractiveness", label: scoreLabels.attractiveness, score: attractiveness },
    ];

    const symBlock = raw.symmetry && typeof raw.symmetry === "object"
      ? raw.symmetry as Record<string, unknown>
      : raw.symmetryBlock && typeof raw.symmetryBlock === "object"
        ? raw.symmetryBlock as Record<string, unknown>
        : null;

    const grBlock = raw.goldenRatio && typeof raw.goldenRatio === "object"
      ? raw.goldenRatio as Record<string, unknown>
      : null;

    const propBlock = raw.proportions && typeof raw.proportions === "object"
      ? raw.proportions as Record<string, unknown>
      : raw.proportionsBlock && typeof raw.proportionsBlock === "object"
        ? raw.proportionsBlock as Record<string, unknown>
        : null;

    const noseBlock = raw.nose && typeof raw.nose === "object"
      ? raw.nose as Record<string, unknown>
      : raw.noseBlock && typeof raw.noseBlock === "object"
        ? raw.noseBlock as Record<string, unknown>
        : null;

    const lipsBlock = raw.lipsMouth && typeof raw.lipsMouth === "object"
      ? raw.lipsMouth as Record<string, unknown>
      : raw.lipsMouthBlock && typeof raw.lipsMouthBlock === "object"
        ? raw.lipsMouthBlock as Record<string, unknown>
        : null;

    const ageEstBlock = raw.ageEstimate && typeof raw.ageEstimate === "object"
      ? raw.ageEstimate as Record<string, unknown>
      : raw.ageEstimateBlock && typeof raw.ageEstimateBlock === "object"
        ? raw.ageEstimateBlock as Record<string, unknown>
        : null;

    const skinBlock = raw.skinReport && typeof raw.skinReport === "object"
      ? raw.skinReport as Record<string, unknown>
      : raw.skinReportBlock && typeof raw.skinReportBlock === "object"
        ? raw.skinReportBlock as Record<string, unknown>
        : null;

    const eyesBlock = raw.eyes && typeof raw.eyes === "object"
      ? raw.eyes as Record<string, unknown>
      : null;

    const jawReport = raw.jawlineReport && typeof raw.jawlineReport === "object"
      ? raw.jawlineReport as Record<string, unknown>
      : null;

    const cheekReport = raw.cheekbonesReport && typeof raw.cheekbonesReport === "object"
      ? raw.cheekbonesReport as Record<string, unknown>
      : null;

    const attrReport = raw.attractivenessReport && typeof raw.attractivenessReport === "object"
      ? raw.attractivenessReport as Record<string, unknown>
      : null;

    const summaryText = typeof raw.overallSummary === "string" && raw.overallSummary.length > 0
      ? raw.overallSummary
      : null;

    const maxLow = num(raw.maxPotentialLow, 0);
    const maxHigh = num(raw.maxPotentialHigh, 0);

    const analysis: Record<string, unknown> = {
      overall,
      jawline,
      cheekbones,
      eyeArea,
      skin: skinScore,
      attractiveness,
      age,
      faceShape,
      percentile,
      facialHarmony,
      featureBalance,
      overallScore: overall,
      scores,
      ageFactors: Array.isArray(raw.ageFactors) ? raw.ageFactors : [],
    };

    if (summaryText) {
      analysis.overallSummary = { text: summaryText };
    }

    if (maxLow > 0 && maxHigh > 0) {
      analysis.maxPotential = { low: maxLow, high: maxHigh, rangeText: `${maxLow}-${maxHigh}` };
    }

    if (symBlock) {
      analysis.symmetry = {
        score: num(symBlock.score, symmetryFlat),
        faceSymmetryPct: num(symBlock.faceSymmetryPct, undefined!),
        eyeHeightDiffPx: num(symBlock.eyeHeightDiffPx, undefined!),
        mouthCornerTiltDeg: num(symBlock.mouthCornerTiltDeg, undefined!),
      };
    }

    if (grBlock) {
      analysis.goldenRatio = {
        score: num(grBlock.score, goldenRatioFlat),
        matchPct: num(grBlock.matchPct, undefined!),
        note: typeof grBlock.note === "string" ? grBlock.note : undefined,
      };
    }

    if (propBlock) analysis.proportions = propBlock;
    if (noseBlock) analysis.nose = noseBlock;
    if (lipsBlock) analysis.lipsMouth = lipsBlock;
    if (ageEstBlock) analysis.ageEstimate = ageEstBlock;
    if (skinBlock) analysis.skinReport = skinBlock;
    if (eyesBlock) analysis.eyes = eyesBlock;
    if (jawReport) analysis.jawlineReport = jawReport;
    if (cheekReport) analysis.cheekbonesReport = cheekReport;
    if (attrReport) analysis.attractivenessReport = attrReport;

    return new Response(
      JSON.stringify({ analysis }),
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
