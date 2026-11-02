import React from 'react';
import { ArrowLeft, Download, Share, Star, Crown, Calendar, Sparkles, TrendingUp, X, BarChart3 } from 'lucide-react';
import { FacialAnalysis } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { tr } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { mockCelebrityMatches, mockPersonalizedRecommendations, mockAgeEstimation } from '../utils/mockData';

/** Inline pill meter **/
type PillProps = { label: string; value: number; hint?: string };
function PillMeterInline({ label, value, hint }: PillProps) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{label}</div>
        <div className="text-white/80">{v}/100</div>
      </div>
      <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-cyan-400"
          style={{ width: `${v}%` }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={v}
          role="progressbar"
        />
      </div>
      {hint ? <div className="mt-2 text-xs text-white/70">{hint}</div> : null}
    </div>
  );
}

/** Inline age card **/
type AgeEstimateData = { years?: number; range?: string; confidence?: "low" | "medium" | "high" };
function AgeEstimateCardInline({ data }: { data?: AgeEstimateData }) {
  if (!data?.years) return null;
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{tr('Estimated Age', 'Edad Estimada')}</div>
        <div className="text-lg font-bold">{data.years} yrs</div>
      </div>
      <div className="mt-1 text-sm text-white/80">
        {data.range ? tr(`Range: ${data.range}`, `Rango: ${data.range}`) : tr('Range: —', 'Rango: —')}
        {data.confidence ? ` • ${tr('Confidence:', 'Confianza:')} ${data.confidence}` : ""}
      </div>
    </div>
  );
}

/** Inline skin report (uses pill + categorical lines) **/
type SkinReportData = {
  score?: number;
  acne?: "none" | "mild" | "moderate" | "severe";
  redness?: "none" | "mild" | "moderate" | "severe";
  darkCircles?: "none" | "mild" | "moderate" | "severe";
  texture?: "smooth" | "slightly uneven" | "uneven";
  oiliness?: "dry" | "balanced" | "oily" | "combination";
  toneEvenness?: "even" | "slightly uneven" | "uneven";
  notes?: string[];
};
function SkinReportInline({ data }: { data?: SkinReportData }) {
  if (!data?.score) return null;

  const hintParts: string[] = [];
  if (data.acne && data.acne !== "none") hintParts.push(`${data.acne} acne`);
  if (data.redness && data.redness !== "none") hintParts.push(`${data.redness} redness`);
  if (data.darkCircles && data.darkCircles !== "none") hintParts.push(`${data.darkCircles} dark circles`);
  if (data.texture && data.texture !== "smooth") hintParts.push(`${data.texture} texture`);
  const hint = hintParts.length ? hintParts.join(" • ") : "Clear & balanced appearance";

  const Line = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
    ) : null;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white space-y-3">
      <PillMeterInline label={tr('Skin Report', 'Reporte de Piel')} value={data.score} hint={hint} />
      <div className="space-y-1">
        <Line label={tr('Acne', 'Acné')} value={data.acne} />
        <Line label={tr('Redness', 'Enrojecimiento')} value={data.redness} />
        <Line label={tr('Dark circles', 'Ojeras')} value={data.darkCircles} />
        <Line label={tr('Texture', 'Textura')} value={data.texture} />
        <Line label={tr('Oiliness', 'Sequedad/Grasa')} value={data.oiliness} />
        <Line label={tr('Tone evenness', 'Uniformidad del tono')} value={data.toneEvenness} />
      </div>
      {Array.isArray(data.notes) && data.notes.length > 0 && (
        <div className="text-xs text-white/70">{tr('Notes', 'Notas')}: {data.notes.join("; ")}</div>
      )}
    </div>
  );
}

interface AnalysisViewPageProps {
  onBack: () => void;
  analysisData?: FacialAnalysis | null;
}

export default function AnalysisViewPage({ onBack, analysisData }: AnalysisViewPageProps) {
  const { t } = useLanguage();
  const { isPremium } = useAuth();

  // Helper function to safely get numeric values
  const safeNumber = (value: any, fallback: number = 0): number => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? fallback : num;
  };

  // Helper function to safely format scores
  const formatScore = (value: any): string => {
    const num = safeNumber(value);
    return num > 0 ? num.toFixed(1) : 'N/A';
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8 pt-4">
            <button
              onClick={onBack}
              className="p-3 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-700/60 transition-all duration-300 mr-4 group"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:text-blue-400 transition-colors duration-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{tr('Analysis Details', 'Detalles del Análisis')}</h1>
              <p className="text-slate-400">{tr('No analysis data available', 'No hay datos de análisis disponibles')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validate and sanitize analysis data
  const safeOverallScore = safeNumber(analysisData.overallScore, 0);
  const safeScores = (analysisData.scores || []);
  const safeSymmetry = safeNumber(analysisData.symmetry, 0);
  const safeAttractiveness = safeNumber(analysisData.attractiveness, 0);
  const safeAge = safeNumber(analysisData.age, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8 pt-4 animate-fade-in">
          <button
            onClick={onBack}
            className="p-3 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-700/60 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:text-blue-400 transition-colors duration-300" />
          </button>
        </div>

        {/* Analysis Results */}
        <div className="space-y-8 animate-fade-in">
          <div className="w-full max-w-4xl mx-auto">

            {/* Circular Score Grid - 2x3 layout */}
            <div className="grid grid-cols-2 gap-4 mb-8 animate-slide-up">
              {/* Six rings in exact order */}
              {safeScores.map((scoreItem, index) => {
                const isOverall = scoreItem.key === 'overall';
                const isBlurred = !isPremium && !isOverall;
                
                return (
                  <div 
                    key={scoreItem.key || index}
                    className={`bg-slate-800/60 backdrop-blur-sm rounded-3xl p-4 border border-slate-700/50 text-center transition-all duration-300 overflow-visible relative ${
                      isOverall ? 'col-span-2' : ''
                    } ${
                      isBlurred ? 'cursor-pointer hover:border-yellow-500/30' : 'hover:border-blue-500/30'
                    }`}
                  >
                    {isBlurred && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
                        <div className="text-center">
                          <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <p className="text-yellow-400 font-semibold text-sm">{tr('Premium', 'Premium')}</p>
                        </div>
                      </div>
                    )}
                    <div className={`relative ${isOverall ? 'w-24 h-24' : 'w-20 h-20'} mx-auto mb-4`}>
                      <svg className={`${isOverall ? 'w-24 h-24' : 'w-20 h-20'} transform -rotate-90`} viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#334155"
                          strokeWidth="12"
                        />
                        {!isBlurred && (
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="url(#neonBlueGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${(scoreItem.score / 10) * 251} 251`}
                          />
                        )}
                      </svg>
                      {!isBlurred && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`${isOverall ? 'text-2xl' : 'text-xl'} font-bold text-white`}>
                            {Number.isFinite(scoreItem.score) ? scoreItem.score.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className={`text-white font-semibold ${isOverall ? 'text-lg' : 'text-base'}`}>
                      {scoreItem.label || 'Unknown'}
                    </h3>
                  </div>
                );
              })}

              {/* Enhanced Neon SVG Gradient Definition */}
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="neonBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00FFFF" stopOpacity="1" />
                    <stop offset="25%" stopColor="#00E5FF" stopOpacity="1" />
                    <stop offset="50%" stopColor="#00B4FF" stopOpacity="1" />
                    <stop offset="75%" stopColor="#0080FF" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0040FF" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Facial Analysis Block - Symmetry & Attractiveness */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 animate-slide-up mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 text-purple-400 mr-2" />
                {tr('Facial Analysis', 'Análisis Facial')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#neonBlueGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(safeSymmetry / 100) * 251} 251`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {Number.isFinite(safeSymmetry) ? (safeSymmetry / 10).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-white font-semibold">{tr('Symmetry', 'Simetría')}</h4>
                  <p className="text-slate-400 text-xs">{tr('out of 10', 'de 10')}</p>
                </div>
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#neonBlueGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(safeAttractiveness / 100) * 251} 251`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {Number.isFinite(safeAttractiveness) ? (safeAttractiveness / 10).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-white font-semibold">{tr('Attractiveness', 'Atractivo')}</h4>
                  <p className="text-slate-400 text-xs">{tr('out of 10', 'de 10')}</p>
                </div>
              </div>
            </div>

            {/* Estimated Age Section */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 animate-slide-up mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-6 h-6 text-blue-400 animate-pulse" />
                  <h3 className="text-2xl font-bold text-white">{tr('Estimated Age', 'Edad Estimada')}</h3>
                </div>
              </div>
              
              <div className="text-center mb-6 animate-scale-in">
                <div className="text-7xl font-bold text-cyan-400 mb-2 animate-number-count">
                  {Number.isFinite(safeAge) ? Math.round(safeAge) : 'N/A'} {Number.isFinite(safeAge) ? 'years' : ''}
                </div>
                <p className="text-slate-400">
                  {Number.isFinite(safeAge) ? `Range: ${Math.max(16, Math.round(safeAge) - 2)}-${Math.round(safeAge) + 2}` : 'Age data unavailable'}
                </p>
              </div>
            </div>

            {/* Personalized Tips Section */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 animate-slide-up mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Sparkles className="w-6 h-6 text-cyan-400 mr-2" />
                Personalized Tips
              </h3>
              <div className="space-y-3">
                {(analysisData.recommendations || []).map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Advanced Blocks (new) --- */}
            {analysisData && (
              <section className="mt-8 space-y-4" aria-label="Advanced Analysis Blocks">
                {/* Symmetry (pill) */}
                {(analysisData as any).symmetry?.score != null && (
                  <PillMeterInline
                    label="Symmetry"
                    value={(analysisData as any).symmetry.score}
                    hint={[
                      typeof (analysisData as any).symmetry.faceSymmetryPct === "number" ? `~${(analysisData as any).symmetry.faceSymmetryPct}% alignment` : null,
                      typeof (analysisData as any).symmetry.eyeHeightDiffPx === "number" ? `eye height Δ ${(analysisData as any).symmetry.eyeHeightDiffPx}px` : null,
                      typeof (analysisData as any).symmetry.mouthCornerTiltDeg === "number" ? `mouth tilt ${(analysisData as any).symmetry.mouthCornerTiltDeg}°` : null
                    ].filter(Boolean).join(" • ")}
                  />
                )}

                {/* Proportions (pill) */}
                {(analysisData as any).proportions?.score != null && (
                  <PillMeterInline
                    label="Proportions"
                    value={(analysisData as any).proportions.score}
                    hint={[
                      (analysisData as any).proportions.thirdsBalance || null,
                      typeof (analysisData as any).proportions.widthToHeight === "number" ? `W/H ${(analysisData as any).proportions.widthToHeight.toFixed(2)}` : null
                    ].filter(Boolean).join(" • ")}
                  />
                )}

                {/* Nose (pill) */}
                {(analysisData as any).nose?.score != null && (
                  <PillMeterInline
                    label="Nose"
                    value={(analysisData as any).nose.score}
                    hint={[
                      (analysisData as any).nose.bridgeShape || null,
                      (analysisData as any).nose.deviation || null,
                      (analysisData as any).nose.widthRel || null,
                      (analysisData as any).nose.lengthRel || null
                    ].filter(Boolean).join(" • ")}
                  />
                )}

                {/* Lips & Mouth (pill) */}
                {(analysisData as any).lipsMouth?.score != null && (
                  <PillMeterInline
                    label="Lips & Mouth"
                    value={(analysisData as any).lipsMouth.score}
                    hint={[
                      typeof (analysisData as any).lipsMouth.upperLowerRatio === "number" ? `UL ratio ${(analysisData as any).lipsMouth.upperLowerRatio}` : null,
                      (analysisData as any).lipsMouth.mouthWidthRel || null,
                      (analysisData as any).lipsMouth.philtrumLabel || null
                    ].filter(Boolean).join(" • ")}
                  />
                )}

                {/* Age (card) */}
                <AgeEstimateCardInline data={(analysisData as any).ageEstimate} />

                {/* Skin (pill + lines) */}
                <SkinReportInline data={(analysisData as any).skinReport} />
              </section>
            )}
          </div>

          {/* Detailed Analysis */}
        </div>
      </div>
    </div>
  );
}
