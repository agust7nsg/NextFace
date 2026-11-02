import React from 'react';
import { X, Eye, Star, Sparkles, Calendar, BarChart3, Crown } from 'lucide-react';
import { tr } from '../contexts/LanguageContext';

type Props = {
  analysis: any;             // exact object from Edge Function (don't reshape)
  imageUrl?: string | null;  // optional; used for the profile preview
  isPremium?: boolean;
  onClearImage?: () => void; // optional (used by AnalysisPage only)
  onPremiumClick?: () => void; // callback to show premium modal
};

const FACE_SHAPE_FACTS_EN: Record<string, string[]> = {
  oval: [
    "Length exceeds width with soft jaw and rounded chin.",
    "Weight gain tends to shift toward roundness; hairstyles exposing forehead length accentuate the oval look."
  ],
  square: [
    "Forehead, cheek, and jaw widths are similar with noticeable angles.",
    "Low bodyfat and strong masseter definition sharpen the square outline; higher bodyfat softens angles."
  ],
  rectangle: [
    "Face is longer than it is wide, with similar forehead and jaw widths.",
    "Perceived length increases with flat camera angles; hairstyles adding lateral volume reduce the tall look."
  ],
  round: [
    "Width and length are similar with a soft jaw and full cheeks.",
    "Bodyfat strongly influences roundness; very short or tight hairstyles can make it appear rounder."
  ],
  diamond: [
    "Zygomatic width is the widest point, with narrower forehead and jaw.",
    "Prominent cheekbones and a narrow chin accentuate the diamond shape; facial hair can visually balance it."
  ],
  triangle: [
    "Jaw is wider than the forehead, creating a base-heavy outline.",
    "Masseter hypertrophy emphasizes the triangle look; hairstyles adding top width help balance it."
  ],
  heart: [
    "Forehead/cheeks are wider with a narrow jaw and pointed chin.",
    "Stronger chin projection reduces the heart effect; styles minimizing top width can balance proportions."
  ]
};

const FACE_SHAPE_FACTS_ES: Record<string, string[]> = {
  oval: [
    "El largo supera al ancho con mandíbula suave y barbilla redondeada.",
    "El aumento de peso tiende a redondear el rostro; los peinados que muestran la frente alargan el aspecto ovalado."
  ],
  square: [
    "Frente, pómulos y mandíbula tienen anchos similares con ángulos notables.",
    "Un porcentaje de grasa bajo y masa muscular definida afilan el contorno cuadrado; mayor grasa corporal suaviza los ángulos."
  ],
  rectangle: [
    "El rostro es más largo que ancho, con anchos similares de frente y mandíbula.",
    "La longitud percibida aumenta con ángulos de cámara planos; los peinados que añaden volumen lateral reducen el aspecto alargado."
  ],
  round: [
    "Ancho y largo son similares con mandíbula suave y mejillas llenas.",
    "La grasa corporal influye mucho en la redondez; los peinados muy cortos o ajustados pueden hacer que parezca más redondo."
  ],
  diamond: [
    "El ancho cigomático es el punto más amplio, con frente y mandíbula más estrechas.",
    "Pómulos prominentes y barbilla estrecha acentúan la forma de diamante; la barba puede equilibrar visualmente."
  ],
  triangle: [
    "La mandíbula es más ancha que la frente, creando un contorno con base pesada.",
    "La hipertrofia maseterina enfatiza el aspecto triangular; los peinados que añaden ancho superior ayudan a equilibrar."
  ],
  heart: [
    "Frente y mejillas son más anchas con mandíbula estrecha y barbilla puntiaguda.",
    "Una mayor proyección de la barbilla reduce el efecto corazón; los estilos que minimizan el ancho superior equilibran las proporciones."
  ]
};

const FACE_SHAPE_NAMES_ES: Record<string, string> = {
  oval: "Ovalado", square: "Cuadrado", rectangle: "Rectangular", round: "Redondo",
  diamond: "Diamante", triangle: "Triangular", heart: "Corazón",
};

export default function AnalysisResults({ analysis, imageUrl, isPremium = false, onClearImage, onPremiumClick }: Props) {
  // Extract safe overall score from analysis
  const safeOverallScore = analysis?.overall ?? 0;

  const handlePremiumFeatureClick = () => {
    if (onPremiumClick) {
      onPremiumClick();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* Profile Photo */}
      {imageUrl && (
        <div className="text-center mb-8 animate-scale-in">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 p-2 shadow-2xl shadow-cyan-500/60 relative">
              <img src={imageUrl} alt="Profile Analysis" className="w-full h-full rounded-full object-cover relative z-10" />
            </div>
          </div>
        </div>
      )}

      {/* Six Rings */}
      <div className="grid grid-cols-2 gap-4 mb-8 animate-slide-up">
        {analysis.scores?.map((scoreItem: any) => {
          const isOverall = scoreItem.key === 'overall';
          const isBlurred = !isPremium && !isOverall;
          const val = Number.isFinite(scoreItem.score) ? Math.round(scoreItem.score) : 0;
          const pct = Math.max(0, Math.min(100, val));
          const CIRC = 2 * Math.PI * 40;

          return (
            <div
              key={scoreItem.key}
              className={`bg-slate-800/60 backdrop-blur-sm rounded-3xl p-5 border border-slate-700/50 text-center transition-all duration-300 overflow-visible relative ${isBlurred ? 'cursor-pointer' : 'hover:border-blue-500/30'}`}
              onClick={isBlurred ? handlePremiumFeatureClick : undefined}
            >
              {isBlurred && (
                <div className="absolute inset-0 bg-slate-900/95 rounded-3xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <Crown
                      className="w-12 h-12 text-yellow-400 mx-auto mb-2 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                      strokeWidth={2}
                      fill="currentColor"
                    />
                    <p className="text-yellow-400 font-bold text-xs tracking-wide">Premium</p>
                  </div>
                </div>
              )}

              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth={12} />
                  {!isBlurred && (
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#neonBlueGradient)" strokeWidth={12} strokeLinecap="round" strokeDasharray={`${(pct / 100) * CIRC} ${CIRC}`} />
                  )}
                </svg>
                {!isBlurred && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">{val}</span>
                  </div>
                )}
              </div>

              <h3 className="text-white font-semibold text-base">{scoreItem.label}</h3>
            </div>
          );
        })}

        {/* Gradient def */}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="neonBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFFF" />
              <stop offset="25%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor="#00B4FF" />
              <stop offset="75%" stopColor="#0080FF" />
              <stop offset="100%" stopColor="#0040FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Overall Evaluation Card */}
      <div className="bg-gradient-to-br from-slate-800/80 via-blue-900/20 to-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500 animate-slide-up mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{tr('Overall evaluation', 'Evaluación general')}</h3>
          </div>
          <div className="text-3xl font-bold text-cyan-400">{Math.round(safeOverallScore)}</div>
        </div>
        
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          {analysis.overallSummary?.text || tr("Your facial features show good harmony and balance with several areas of strength that contribute to an attractive overall appearance.", "Tus rasgos faciales muestran buena armonía y equilibrio con varias áreas de fortaleza que contribuyen a una apariencia general atractiva.")}
        </p>
        

        
        {imageUrl && (
          <div className="relative rounded-2xl overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Analysis preview" 
              className="w-full h-48 object-cover"
            />
          </div>
        )}
      </div>

      {/* Advanced Analysis Blocks */}
      {(() => {
        // Helpers
        type PillProps = { label: string; value: number; hint?: string };
        function PillMeterInline({ label, value, hint }: PillProps) {
          const v = Math.max(0, Math.min(100, Math.round(value || 0)));
          
          const getScoreColor = (score: number) => {
            if (score >= 80) return 'from-emerald-400 to-emerald-500';
            if (score >= 60) return 'from-yellow-400 to-yellow-500';
            return 'from-blue-400 to-blue-500';
          };

          return (
            <div className="bg-gradient-to-br from-slate-800/80 via-blue-900/20 to-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{label}</h3>
                </div>
              </div>
              <div className="h-4 w-full rounded-full bg-gradient-to-r from-slate-700/60 to-slate-600/60 overflow-hidden mb-4 shadow-inner">
                <div 
                  className={`h-4 rounded-full bg-gradient-to-r ${getScoreColor(v)} transition-all duration-1000 shadow-lg shadow-cyan-500/30`}
                  style={{ width: `${v}%` }}
                />
              </div>
              {hint && (
                <p className="text-slate-300 text-sm leading-relaxed">
                  {hint}
                </p>
              )}
            </div>
          );
        }

        function paragraphFromParts(a?: string, b?: string, c?: string) {
          const parts = [a, b, c].filter((s) => typeof s === 'string' && s.trim().length > 0);
          const text = parts.join(' ').replace(/\s+/g, ' ').trim();
          return text || '—';
        }

        // Eye style (hunter / prey / neutral) derived from canthal tilt
        function getEyeStyle(eyes: any): "hunter" | "prey" | "neutral" {
          const d = Number(eyes?.canthalTiltDeg);
          if (Number.isFinite(d)) {
            if (d >= 3) return "hunter";
            if (d <= -3) return "prey";
            return "neutral";
          }
          const lbl = String(eyes?.tiltLabel || '').toLowerCase();
          if (lbl === 'positive' || lbl === 'positivo' || lbl === 'positiva') return 'hunter';
          if (lbl === 'negative' || lbl === 'negativo' || lbl === 'negativa') return 'prey';
          return 'neutral';
        }

        // Reusable component for descriptive report cards
        function DescriptiveReportCard({ 
          title, 
          score, 
          paragraph, 
          chips 
        }: { 
          title: string; 
          score?: number; 
          paragraph?: string; 
          chips?: string[]; 
        }) {
          return (
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-500 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{title}</h3>
                </div>
                {score != null && (
                  <div className="px-3 py-1 bg-slate-700/50 rounded-full border border-slate-600/30">
                    <span className="text-cyan-400 font-semibold text-sm">{Math.round(score)}/100</span>
                  </div>
                )}
              </div>
              
              {paragraph && (
                <p className="text-slate-200 text-sm leading-relaxed mt-3">
                  {paragraph}
                </p>
              )}
              
              {chips && chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {chips.map((chip, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/80"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="relative mt-8">
            {/* Premium content is not rendered at all for free accounts */}
            {!isPremium ? (
            <section className="space-y-4" aria-label="Advanced Analysis Locked">
              <div className="min-h-[420px] rounded-3xl border border-slate-700/50 bg-slate-800/60 flex items-center justify-center" />
            </section>
            ) : (
            <section className="space-y-4" aria-label="Advanced Analysis Blocks">
            {/* Symmetry */}
            {analysis?.symmetry?.score != null && (
              <PillMeterInline
                label={tr('Symmetry', 'Simetría')}
                value={analysis.symmetry.score}
                hint={[
                  typeof analysis.symmetry.faceSymmetryPct === "number" ? tr(`~${analysis.symmetry.faceSymmetryPct}% alignment`, `~${analysis.symmetry.faceSymmetryPct}% alineación`) : null,
                  typeof analysis.symmetry.eyeHeightDiffPx === "number" ? tr(`eye height Δ ${analysis.symmetry.eyeHeightDiffPx}px`, `diferencia de altura ocular Δ ${analysis.symmetry.eyeHeightDiffPx}px`) : null,
                  typeof analysis.symmetry.mouthCornerTiltDeg === "number" ? tr(`mouth tilt ${analysis.symmetry.mouthCornerTiltDeg}°`, `inclinación de boca ${analysis.symmetry.mouthCornerTiltDeg}°`) : null
                ].filter(Boolean).join("  ")}
              />
            )}

            {/* Golden Ratio */}
            {analysis?.goldenRatio?.score != null && (
              <PillMeterInline
                label={tr('Golden Ratio', 'Proporción Áurea')}
                value={analysis.goldenRatio.score}
                hint={[
                  typeof analysis.goldenRatio.matchPct === "number" ? tr(`${analysis.goldenRatio.matchPct}% match`, `${analysis.goldenRatio.matchPct}% coincidencia`) : null,
                  analysis.goldenRatio.note || null
                ].filter(Boolean).join(" • ")}
              />
            )}

            {/* Eye Area (own block, not a report) */}
            {analysis?.eyes && (
              <div className="bg-gradient-to-br from-slate-800/80 via-blue-900/20 to-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                     <Eye className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{tr('Eye Area', 'Área Ocular')}</h3>
                  </div>
                  {analysis.eyes.score != null && (
                    <div className="text-2xl font-bold text-cyan-400">{Math.round(analysis.eyes.score)}/100</div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700/40 to-blue-800/20 rounded-xl border border-blue-500/10">
                    <span className="text-slate-400">{tr('Type:', 'Tipo:')}</span>
                    <span className="text-white font-semibold">
                      {analysis.eyes.eyeType ?? '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700/40 to-blue-800/20 rounded-xl border border-blue-500/10">
                    <span className="text-slate-400">{tr('Style:', 'Estilo:')}</span>
                    <span className="text-white font-semibold">
                      {(() => { const s = getEyeStyle(analysis.eyes); return tr(s, s === 'hunter' ? 'Depredador' : s === 'prey' ? 'Presa' : 'Neutral'); })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700/40 to-blue-800/20 rounded-xl border border-blue-500/10">
                    <span className="text-slate-400">{tr('Canthal tilt:', 'Inclinación cantal:')}</span>
                    <span className="text-white font-semibold">
                      {analysis.eyes.tiltLabel ?? '—'}
                      {typeof analysis.eyes.canthalTiltDeg === 'number'
                        ? ` (${analysis.eyes.canthalTiltDeg}°)`
                        : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Jawline Report */}
            {analysis?.jawlineReport?.reportText && (
              <DescriptiveReportCard
                title={tr('Jawline Report', 'Reporte de Mandíbula')}
                score={analysis.jawline}
                paragraph={analysis.jawlineReport.reportText}
                chips={[
                  analysis.jawlineReport.angleLabel,
                  analysis.jawlineReport.chinProjection,
                  analysis.jawlineReport.jawWidth,
                  analysis.jawlineReport.lowerThird,
                  analysis.jawlineReport.submental
                ].filter(Boolean)}
              />
            )}

            {/* Cheekbones Report */}
            {analysis?.cheekbonesReport?.reportText && (
              <DescriptiveReportCard
                title={tr('Cheekbones Report', 'Reporte de Pómulos')}
                score={analysis.cheekbones}
                paragraph={analysis.cheekbonesReport.reportText}
                chips={[
                  analysis.cheekbonesReport.heightLabel,
                  analysis.cheekbonesReport.prominence,
                  analysis.cheekbonesReport.malarContour,
                  analysis.cheekbonesReport.zygToJawWidth
                ].filter(Boolean)}
              />
            )}

            {/* Attractiveness Report */}
            {analysis?.attractivenessReport?.reportText && (
              <DescriptiveReportCard
                title={tr('Attractiveness Report', 'Reporte de Atractivo')}
                score={analysis.attractiveness}
                paragraph={analysis.attractivenessReport.reportText}
                chips={[
                  analysis.attractivenessReport.styleLabel,
                  analysis.attractivenessReport.harmonyNotes,
                  typeof analysis.attractivenessReport.impactPercentile === 'number' 
                    ? tr(`impact ~${analysis.attractivenessReport.impactPercentile}th %`, `impacto ~${analysis.attractivenessReport.impactPercentile}º %`) 
                    : null
                ].filter(Boolean)}
              />
            )}

            {/* Estimated Age - moved here after Attractiveness Report */}
            {(analysis.ageEstimate?.years || analysis.age) && (() => {
              // Random age factors pool
              const ageFactorsEn = [
                "Under-eye darkness/puffiness — shadows or bags add years; clear lower eyelids read younger.",
                "Skin texture & pores — smooth, even skin looks younger; roughness or enlarged pores reads older.",
                "Acne & post-acne marks — active acne can skew younger; scarring or hyperpigmentation can skew older.",
                "Facial hair pattern — dense stubble/beard often reads older; baby-face clean-shaven reads younger.",
                "Hairline density/recession — temple thinning/recession increases perceived age; dense hairline looks younger.",
                "Jawline & neck tightness — sharp edges look youthful; submental softness/double-chin adds years.",
                "Eyelid fullness & white show — hollow upper lids or lower scleral show suggest age; balanced lids look younger.",
                "Teeth color/alignment — whiter, straighter teeth read younger; yellowing/crowding reads older.",
                "Lighting, angle & image quality — harsh light, grain, or low angles add years; soft light reduces perceived age."
              ];
              const ageFactorsEs = [
                "Ojeras/bolsas bajo los ojos — las sombras o bolsas suman años; párpados inferiores despejados lucen más jóvenes.",
                "Textura de piel y poros — la piel suave y uniforme luce más joven; la aspereza o poros dilatados suman años.",
                "Acné y marcas de acné — el acné activo puede sesgar hacia más joven; las cicatrices o hiperpigmentación pueden sumar años.",
                "Patrón de vello facial — la barba densa suele leerse como mayor; el afeitado limpio y rostro juvenil luce más joven.",
                "Densidad/recesión de la línea del cabello — el adelgazamiento de las sienes aumenta la edad percibida; una línea densa luce más joven.",
                "Firmeza de mandíbula y cuello — los bordes definidos lucen jóvenes; la flacidez submentoniana o papada suma años.",
                "Plenitud de párpados y muestra de esclerótica — párpados superiores hundidos o muestra de esclerótica inferior sugieren edad; párpados equilibrados lucen más jóvenes.",
                "Color/alineación de los dientes — dientes más blancos y alineados lucen más jóvenes; amarillamiento o apiñamiento suma años.",
                "Iluminación, ángulo y calidad de imagen — la luz dura, el ruido o los ángulos bajos suman años; la luz suave reduce la edad percibida."
              ];
              const ageFactors = tr('en', 'es') === 'es' ? ageFactorsEs : ageFactorsEn;
              
              // Select 2 random factors
              const shuffled = [...ageFactors].sort(() => 0.5 - Math.random());
              const selectedFactors = shuffled.slice(0, 2);
              
              const estimatedAge = analysis.ageEstimate?.years || Math.round(analysis.age || 0);
              const ageRange = analysis.ageEstimate?.range || `${Math.max(16, estimatedAge - 2)}-${estimatedAge + 2}`;
              
              return (
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 animate-slide-up">
                  <div className="flex items-center space-x-2 mb-6">
                    <Calendar className="w-6 h-6 text-blue-400 animate-pulse" />
                    <h3 className="text-2xl font-bold text-white">{tr('Estimated Age', 'Edad Estimada')}</h3>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-7xl font-bold text-cyan-400 mb-2 animate-number-count">
                      {estimatedAge} {tr('years', 'años')}
                    </div>
                    <p className="text-slate-400">
                      {ageRange} • {tr('Estimated age range', 'Rango de edad estimado')}
                    </p>
                  </div>
                  
                  {/* Age factors */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm mb-3">{tr('Factors affecting age estimation:', 'Factores que afectan la estimación de edad:')}</h4>
                    {selectedFactors.map((factor, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                        <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{factor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Proportions + single paragraph report */}
            {analysis?.proportions?.score != null && (
              <div className="bg-gradient-to-br from-slate-800/80 via-blue-900/20 to-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{tr('Proportions', 'Proporciones')}</h3>
                  <div className="text-2xl font-bold text-cyan-400">{Math.round(analysis.proportions.score)}/100</div>
                </div>
                <div className="h-4 w-full rounded-full bg-gradient-to-r from-slate-700/60 to-slate-600/60 overflow-hidden mb-4 shadow-inner">
                  <div 
                    className={`h-4 rounded-full bg-gradient-to-r ${
                      analysis.proportions.score >= 80 ? 'from-emerald-400 to-emerald-500' :
                      analysis.proportions.score >= 60 ? 'from-yellow-400 to-yellow-500' :
                      'from-blue-400 to-blue-500'
                    } transition-all duration-1000 shadow-lg shadow-cyan-500/30`}
                    style={{ width: `${Math.max(0, Math.min(100, Math.round(analysis.proportions.score || 0)))}%` }}
                  />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  {[
                    analysis.proportions.thirdsBalance || null,
                    typeof analysis.proportions.widthToHeight === "number"
                      ? tr(`W/H ${analysis.proportions.widthToHeight.toFixed(2)}`, `A/L ${analysis.proportions.widthToHeight.toFixed(2)}`)
                      : null
                  ].filter(Boolean).join(" • ")}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {paragraphFromParts(
                    analysis.proportions.whatWeSee,
                    analysis.proportions.meaning,
                    analysis.proportions.whyScore
                  )}
                </p>
              </div>
            )}

            {/* Nose + single paragraph report */}
            {analysis?.nose?.score != null && (
              <div className="bg-gradient-to-br from-slate-800/80 via-blue-900/20 to-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{tr('Nose', 'Nariz')}</h3>
                  <div className="text-2xl font-bold text-cyan-400">{Math.round(analysis.nose.score)}/100</div>
                </div>
                <div className="h-4 w-full rounded-full bg-gradient-to-r from-slate-700/60 to-slate-600/60 overflow-hidden mb-4 shadow-inner">
                  <div 
                    className={`h-4 rounded-full bg-gradient-to-r ${
                      analysis.nose.score >= 80 ? 'from-emerald-400 to-emerald-500' :
                      analysis.nose.score >= 60 ? 'from-yellow-400 to-yellow-500' :
                      'from-blue-400 to-blue-500'
                    } transition-all duration-1000 shadow-lg shadow-cyan-500/30`}
                    style={{ width: `${Math.max(0, Math.min(100, Math.round(analysis.nose.score || 0)))}%` }}
                  />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  {[
                    analysis.nose.bridgeShape || null,
                    analysis.nose.deviation || null,
                    analysis.nose.widthRel || null,
                    analysis.nose.lengthRel || null
                  ].filter(Boolean).join(" • ")}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {paragraphFromParts(
                    analysis.nose.whatWeSee,
                    analysis.nose.meaning,
                    analysis.nose.whyScore
                  )}
                </p>
              </div>
            )}

            {/* Lips & Mouth + single paragraph report */}
            {analysis?.lipsMouth?.score != null && (
              <div className="bg-gradient-to-br from-slate-800/80 via-blue-900/20 to-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{tr('Lips & Mouth', 'Labios y Boca')}</h3>
                  <div className="text-2xl font-bold text-cyan-400">{Math.round(analysis.lipsMouth.score)}/100</div>
                </div>
                <div className="h-4 w-full rounded-full bg-gradient-to-r from-slate-700/60 to-slate-600/60 overflow-hidden mb-4 shadow-inner">
                  <div 
                    className={`h-4 rounded-full bg-gradient-to-r ${
                      analysis.lipsMouth.score >= 80 ? 'from-emerald-400 to-emerald-500' :
                      analysis.lipsMouth.score >= 60 ? 'from-yellow-400 to-yellow-500' :
                      'from-blue-400 to-blue-500'
                    } transition-all duration-1000 shadow-lg shadow-cyan-500/30`}
                    style={{ width: `${Math.max(0, Math.min(100, Math.round(analysis.lipsMouth.score || 0)))}%` }}
                  />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  {[
                    typeof analysis.lipsMouth.upperLowerRatio === "number"
                      ? tr(`UL ratio ${analysis.lipsMouth.upperLowerRatio}`, `Ratio SL ${analysis.lipsMouth.upperLowerRatio}`)
                      : null,
                    analysis.lipsMouth.mouthWidthRel || null,
                    analysis.lipsMouth.philtrumLabel || null
                  ].filter(Boolean).join(" • ")}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {paragraphFromParts(
                    analysis.lipsMouth.whatWeSee,
                    analysis.lipsMouth.meaning,
                    analysis.lipsMouth.whyScore
                  )}
                </p>
              </div>
            )}

            {/* Skin */}
            {(() => {
              type SkinReportData = {
                score?: number; acne?: string; redness?: string; darkCircles?: string;
                texture?: string; oiliness?: string; toneEvenness?: string; notes?: string[];
              };
              function SkinReportInline({ data }: { data?: SkinReportData }) {
                if (!data?.score) return null;
                
                const hintParts: string[] = [];
                const isEs = tr('en','es') === 'es';
                const NONE_VAL = isEs ? ['ninguno','ninguna','nada'] : ['none'];
                const SMOOTH_VAL = isEs ? ['suave','liso','uniforme'] : ['smooth'];
                const isNone = (v?: string) => v && NONE_VAL.includes(v.toLowerCase());
                const isSmooth = (v?: string) => v && SMOOTH_VAL.includes(v.toLowerCase());
                if (data.acne && !isNone(data.acne)) hintParts.push(`${data.acne} ${tr('acne', 'acné')}`);
                if (data.redness && !isNone(data.redness)) hintParts.push(`${data.redness} ${tr('redness', 'enrojecimiento')}`);
                if (data.darkCircles && !isNone(data.darkCircles)) hintParts.push(`${data.darkCircles} ${tr('dark circles', 'ojeras')}`);
                if (data.texture && !isSmooth(data.texture)) hintParts.push(`${data.texture} ${tr('texture', 'textura')}`);
                const hint = hintParts.length ? hintParts.join(" • ") : tr("Clear & balanced appearance", "Apariencia limpia y equilibrada");
                
                const Line = ({ label, value }: { label: string; value?: string }) =>
                  value ? (
                    <div className="flex items-center justify-between text-sm p-3 bg-slate-700/30 rounded-xl">
                      <span className="text-white/80">{label}</span>
                      <span className="text-white font-semibold">{value}</span>
                    </div>
                  ) : null;

                return (
                  <div className="bg-gradient-to-br from-slate-800/80 via-blue-900/20 to-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-500 animate-slide-up space-y-4">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4">{tr('Skin Report', 'Reporte de Piel')}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{hint}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Line label={tr('Acne', 'Acné')} value={data.acne} />
                      <Line label={tr('Redness', 'Enrojecimiento')} value={data.redness} />
                      <Line label={tr('Dark circles', 'Ojeras')} value={data.darkCircles} />
                      <Line label={tr('Texture', 'Textura')} value={data.texture} />
                      <Line label={tr('Oiliness', 'Sequedad/Grasa')} value={data.oiliness} />
                      <Line label={tr('Tone evenness', 'Uniformidad de tono')} value={data.toneEvenness} />
                    </div>
                    {Array.isArray(data.notes) && data.notes.length > 0 && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-slate-700/30 to-blue-800/20 rounded-xl border border-blue-500/10">
                        <p className="text-xs text-slate-400">{tr('Notes:', 'Notas:')} {data.notes.join("; ")}</p>
                      </div>
                    )}
                  </div>
                );
              }
              return <SkinReportInline data={analysis?.skinReport as any} />;
            })()}
          </section>
          )}

          {/* Watermark overlay for free users */}
          {!isPremium && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="flex flex-col items-center justify-center">
                <Crown
                  className="w-[120px] h-[120px] text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                  strokeWidth={2}
                  fill="currentColor"
                />

                <div className="mt-3 text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-lg filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                    Premium
                  </div>
                  <div className="text-sm text-slate-300/80 mt-1 font-medium drop-shadow-md">
                    {tr('Go premium to reveal your full analysis', 'Hazte premium para revelar tu análisis completo')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Face Shape — inline block (no new component) — PREMIUM ONLY */}
          {isPremium && analysis?.faceShape && (() => {
            const shapeRaw = String(analysis.faceShape).toLowerCase();
            const isEs = tr('en','es') === 'es';
            // Normalize Spanish face shape back to English key for fact lookup
            const SHAPE_ES_TO_EN: Record<string, string> = { 'ovalado':'oval','cuadrado':'square','rectangular':'rectangle','redondo':'round','diamante':'diamond','triangular':'triangle','corazón':'heart','corazon':'heart' };
            const shape = SHAPE_ES_TO_EN[shapeRaw] || shapeRaw;
            const facts = isEs ? (FACE_SHAPE_FACTS_ES[shape] || []) : (FACE_SHAPE_FACTS_EN[shape] || []);
            const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
            const shapeDisplay = isEs ? (FACE_SHAPE_NAMES_ES[shape] || cap(shape)) : cap(shape);

            return (
              <div className="mt-8 mb-12 bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-500">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-white">{tr('Face Shape', 'Forma del Rostro')}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    {shapeDisplay}
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-white text-xl font-semibold">{tr('Face shape:', 'Forma del rostro:')} {shapeDisplay}</div>
                  <div className="text-slate-400 text-sm mt-1">{tr('Detected facial structure', 'Estructura facial detectada')}</div>
                </div>

                {facts.length > 0 && (
                  <ul className="mt-4 space-y-1 text-slate-300 text-sm">
                    <li>• {facts[0]}</li>
                    <li>• {facts[1]}</li>
                  </ul>
                )}
              </div>
            );
          })()}
        </div>
      );
    })()}
    </div>
  );
}