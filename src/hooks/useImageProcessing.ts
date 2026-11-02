import { useState } from "react";
import {
  analyzeFacialFeatures,
  type AnalysisResult,
} from "../lib/faceAnalysis";

export interface FacialAnalysis {
  overall?: number;
  jawline?: number;
  cheekbones?: number;
  eyeArea?: number;
  skin?: number;
  attractiveness?: number;
  faceShape?: string;
  age?: number;
  recommendations?: string[];
  ageFactors?: string[];
  percentile?: number;
  facialHarmony?: number;
  featureBalance?: number;
  overallScore?: number;
  scores?: Array<{ key: string; label: string; score: number; raw?: number }>;

  symmetry?: {
    score?: number;
    faceSymmetryPct?: number;
    eyeHeightDiffPx?: number;
    mouthCornerTiltDeg?: number;
  };

  goldenRatio?: {
    score?: number;
    matchPct?: number;
    note?: string;
  };

  proportions?: {
    score?: number;
    thirdsBalance?: string;
    widthToHeight?: number;
    whatWeSee?: string;
    meaning?: string;
    whyScore?: string;
  };

  nose?: {
    score?: number;
    widthRel?: string;
    lengthRel?: string;
    deviation?: string;
    bridgeShape?: string;
    whatWeSee?: string;
    meaning?: string;
    whyScore?: string;
  };

  lipsMouth?: {
    score?: number;
    upperLowerRatio?: number;
    mouthWidthRel?: string;
    philtrumLabel?: string;
    whatWeSee?: string;
    meaning?: string;
    whyScore?: string;
  };

  ageEstimate?: {
    years?: number;
    range?: string;
    confidence?: string;
  };

  skinReport?: {
    score?: number;
    acne?: string;
    redness?: string;
    darkCircles?: string;
    texture?: string;
    oiliness?: string;
    toneEvenness?: string;
    notes?: string[];
  };

  eyes?: {
    score?: number;
    eyeType?: string;
    canthalTiltDeg?: number;
    tiltLabel?: string;
  };

  jawlineReport?: {
    reportText?: string;
    angleLabel?: string;
    chinProjection?: string;
    jawWidth?: string;
    lowerThird?: string;
    submental?: string;
  };

  cheekbonesReport?: {
    reportText?: string;
    heightLabel?: string;
    prominence?: string;
    malarContour?: string;
    zygToJawWidth?: string;
  };

  attractivenessReport?: {
    reportText?: string;
    styleLabel?: string;
    harmonyNotes?: string;
    impactPercentile?: number;
  };

  overallSummary?: { text?: string };
  maxPotential?: { low?: number; high?: number; rangeText?: string };

  [key: string]: unknown;
}

function ensureScoresArray(result: Record<string, unknown>): FacialAnalysis {
  const out = { ...result } as FacialAnalysis;

  if (!Array.isArray(out.scores) || out.scores.length === 0) {
    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : 0);
    out.scores = [
      { key: "overall", label: "Overall", score: num(out.overall) },
      { key: "jawline", label: "Jawline", score: num(out.jawline) },
      { key: "cheekbones", label: "Cheekbones", score: num(out.cheekbones) },
      { key: "eyeArea", label: "Eye Area", score: num(out.eyeArea) },
      { key: "skin", label: "Skin", score: num(out.skin) },
      { key: "attractiveness", label: "Attractiveness", score: num(out.attractiveness) },
    ];
  }

  if (out.overallScore == null && out.overall != null) {
    out.overallScore = out.overall;
  }

  return out;
}

export function useImageProcessing() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FacialAnalysis | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function analyzeImage(file: File) {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      try { setPreviewUrl(URL.createObjectURL(file)); } catch {}

      const result: AnalysisResult = await analyzeFacialFeatures(file);
      const transformed = ensureScoresArray(result as Record<string, unknown>);

      setAnalysis(transformed);
      return transformed;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Face analysis failed";
      setError(msg);
      throw e;
    } finally {
      setIsAnalyzing(false);
    }
  }

  return { isAnalyzing, error, analysis, previewUrl, analyzeImage };
}

export default useImageProcessing;
