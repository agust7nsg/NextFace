import React, { useMemo } from 'react';
import { tr } from '../contexts/LanguageContext';

const malePortraitUrl =
  'https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/Retrato%20recortado%20de%20joven%20de%20cabello%20oscuro.png';
const femalePortraitUrl =
  'https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/ChatGPT%20Image%2011%20sept%202026,%2020_55_41.png';

export interface GoalVariant {
  goalId: string;
  highlight_en: string;
  highlight_es: string;
  primaryText_en: string;
  primaryText_es: string;
  secondaryText_en: string;
  secondaryText_es: string;
  visualType: 'fullFaceBalance' | 'skinSurface' | 'jawlineCheekbone' | 'underEye' | 'youthful';
}

const GOAL_VARIANTS: GoalVariant[] = [
  {
    goalId: 'goal1',
    highlight_en: 'overall attractiveness',
    highlight_es: 'atractividad general',
    primaryText_en: 'Every facial feature will be evaluated for its impact on your overall appearance.',
    primaryText_es: 'Cada rasgo facial será evaluado por su impacto en tu apariencia general.',
    secondaryText_en: 'Proportions, symmetry, balance — the full picture.',
    secondaryText_es: 'Proporciones, simetría, equilibrio — el panorama completo.',
    visualType: 'fullFaceBalance',
  },
  {
    goalId: 'goal2',
    highlight_en: 'better-looking skin',
    highlight_es: 'mejor aspecto de piel',
    primaryText_en: 'We\u2019ll focus on clarity, texture, and the habits that shape how healthy your skin looks.',
    primaryText_es: 'Nos enfocaremos en la claridad, textura y los h\u00e1bitos que definen qu\u00e9 tan saludable se ve tu piel.',
    secondaryText_en: 'Surface analysis across forehead, cheeks, and chin.',
    secondaryText_es: 'An\u00e1lisis de superficie en frente, mejillas y ment\u00f3n.',
    visualType: 'skinSurface',
  },
  {
    goalId: 'goal3',
    highlight_en: 'facial definition',
    highlight_es: 'definici\u00f3n facial',
    primaryText_en: 'Jawline structure, cheekbone prominence, and puffiness — the features that define your face.',
    primaryText_es: 'Estructura de la mand\u00edbula, prominencia de los p\u00f3mulos y la inflamaci\u00f3n — los rasgos que definen tu rostro.',
    secondaryText_en: 'Bone structure and soft-tissue contouring.',
    secondaryText_es: 'Estructura \u00f3sea y contorno de tejido blando.',
    visualType: 'jawlineCheekbone',
  },
  {
    goalId: 'goal4',
    highlight_en: 'looking more refreshed',
    highlight_es: 'verte m\u00e1s descansado',
    primaryText_en: 'We\u2019ll target the under-eye area and the signs that make your face look tired.',
    primaryText_es: 'Nos enfocaremos en el \u00e1rea bajo los ojos y las se\u00f1ales que hacen que tu rostro se vea cansado.',
    secondaryText_en: 'Under-eye contours and brightness mapping.',
    secondaryText_es: 'Contornos bajo los ojos y mapeo de brillo.',
    visualType: 'underEye',
  },
  {
    goalId: 'goal5',
    highlight_en: 'a more youthful look',
    highlight_es: 'una apariencia m\u00e1s juvenil',
    primaryText_en: 'We\u2019ll focus on the areas and habits that influence how youthful your appearance reads.',
    primaryText_es: 'Nos enfocaremos en las \u00e1reas y h\u00e1bitos que influyen en qu\u00e9 tan juvenil se ve tu apariencia.',
    secondaryText_en: 'Eye area, midface volume, and skin vitality.',
    secondaryText_es: '\u00c1rea de los ojos, volumen del rostro medio y vitalidad de la piel.',
    visualType: 'youthful',
  },
];

function getVariant(goalId: string | undefined): GoalVariant {
  return GOAL_VARIANTS.find((v) => v.goalId === goalId) ?? GOAL_VARIANTS[0];
}

interface AnalysisOverlayProps {
  visualType: GoalVariant['visualType'];
}

function AnalysisOverlay({ visualType }: AnalysisOverlayProps) {
  return (
    <svg
      viewBox="0 0 480 640"
      className="absolute inset-0 w-full h-full pointer-events-none goal-analysis-layer"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="goalLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="goalLineGradSoft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
        </linearGradient>
        <filter id="goalLineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {visualType === 'jawlineCheekbone' && (
        <g className="goal-analysis-lines" filter="url(#goalLineGlow)">
          <path d="M 168 338 L 218 402" fill="none" stroke="url(#goalLineGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="goal-line-jaw-left" />
          <path d="M 218 402 L 272 402" fill="none" stroke="url(#goalLineGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="goal-line-jaw-chin" />
          <path d="M 327 340 L 272 402" fill="none" stroke="url(#goalLineGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="goal-line-jaw-right" />
          <path d="M 175 285 Q 204 273 231 279" fill="none" stroke="url(#goalLineGradSoft)" strokeWidth="1.4" strokeLinecap="round" className="goal-line-cheek-left" />
          <path d="M 259 279 Q 286 273 315 285" fill="none" stroke="url(#goalLineGradSoft)" strokeWidth="1.4" strokeLinecap="round" className="goal-line-cheek-right" />
          <circle cx="168" cy="338" r="2.5" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="327" cy="340" r="2.5" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="175" cy="285" r="2" fill="#7dd3fc" className="goal-endpoint" />
          <circle cx="315" cy="285" r="2" fill="#7dd3fc" className="goal-endpoint" />
        </g>
      )}

      {visualType === 'fullFaceBalance' && (
        <g className="goal-analysis-lines" filter="url(#goalLineGlow)">
          <path d="M 245 195 L 245 405" fill="none" stroke="url(#goalLineGradSoft)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="4 6" className="goal-line-balance-center" />
          <path d="M 180 258 Q 245 248 310 258" fill="none" stroke="url(#goalLineGrad)" strokeWidth="1.4" strokeLinecap="round" className="goal-line-balance-eye" />
          <path d="M 198 342 Q 245 336 292 342" fill="none" stroke="url(#goalLineGrad)" strokeWidth="1.4" strokeLinecap="round" className="goal-line-balance-lip" />
          <circle cx="245" cy="195" r="2" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="245" cy="405" r="2" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="180" cy="258" r="2" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="310" cy="258" r="2" fill="#22d3ee" className="goal-endpoint" />
        </g>
      )}

      {visualType === 'skinSurface' && (
        <g className="goal-analysis-lines" filter="url(#goalLineGlow)">
          <path d="M 190 215 Q 245 205 300 215" fill="none" stroke="url(#goalLineGrad)" strokeWidth="1.3" strokeLinecap="round" className="goal-line-skin-forehead" />
          <path d="M 175 290 Q 210 282 240 288" fill="none" stroke="url(#goalLineGradSoft)" strokeWidth="1.2" strokeLinecap="round" className="goal-line-skin-left" />
          <path d="M 270 288 Q 300 282 315 290" fill="none" stroke="url(#goalLineGradSoft)" strokeWidth="1.2" strokeLinecap="round" className="goal-line-skin-right" />
          <path d="M 215 340 Q 245 335 275 340" fill="none" stroke="url(#goalLineGrad)" strokeWidth="1.3" strokeLinecap="round" className="goal-line-skin-chin" />
          <circle cx="190" cy="215" r="2" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="300" cy="215" r="2" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="215" cy="340" r="2" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="275" cy="340" r="2" fill="#22d3ee" className="goal-endpoint" />
        </g>
      )}

      {visualType === 'underEye' && (
        <g className="goal-analysis-lines" filter="url(#goalLineGlow)">
          <path d="M 178 268 Q 200 278 222 270" fill="none" stroke="url(#goalLineGrad)" strokeWidth="1.5" strokeLinecap="round" className="goal-line-eye-left" />
          <path d="M 268 270 Q 290 278 312 268" fill="none" stroke="url(#goalLineGrad)" strokeWidth="1.5" strokeLinecap="round" className="goal-line-eye-right" />
          <circle cx="178" cy="268" r="2.5" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="222" cy="270" r="2.5" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="268" cy="270" r="2.5" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="312" cy="268" r="2.5" fill="#22d3ee" className="goal-endpoint" />
        </g>
      )}

      {visualType === 'youthful' && (
        <g className="goal-analysis-lines" filter="url(#goalLineGlow)">
          <path d="M 178 258 Q 200 252 222 256" fill="none" stroke="url(#goalLineGradSoft)" strokeWidth="1.3" strokeLinecap="round" className="goal-line-youth-eye-left" />
          <path d="M 268 256 Q 290 252 312 258" fill="none" stroke="url(#goalLineGradSoft)" strokeWidth="1.3" strokeLinecap="round" className="goal-line-youth-eye-right" />
          <path d="M 195 300 Q 245 295 295 300" fill="none" stroke="url(#goalLineGrad)" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="3 5" className="goal-line-youth-midface" />
          <circle cx="178" cy="258" r="2" fill="#7dd3fc" className="goal-endpoint" />
          <circle cx="312" cy="258" r="2" fill="#7dd3fc" className="goal-endpoint" />
          <circle cx="195" cy="300" r="2" fill="#22d3ee" className="goal-endpoint" />
          <circle cx="295" cy="300" r="2" fill="#22d3ee" className="goal-endpoint" />
        </g>
      )}
    </svg>
  );
}

function BackgroundGeometry({ visualType }: { visualType: GoalVariant['visualType'] }) {
  return (
    <svg
      viewBox="0 0 480 640"
      className="absolute inset-0 w-full h-full pointer-events-none goal-bg-geometry"
      preserveAspectRatio="xMidYMid meet"
    >
      {visualType === 'jawlineCheekbone' && (
        <g className="goal-bg-layer">
          <path d="M 120 200 Q 160 170 210 160 Q 245 155 280 160 Q 330 170 360 200 Q 380 240 375 290 Q 370 350 350 400 Q 320 440 280 455 Q 245 462 210 455 Q 170 440 140 400 Q 120 350 115 290 Q 110 240 120 200 Z" fill="none" stroke="#1e3a5f" strokeWidth="0.6" strokeOpacity="0.25" />
          <path d="M 150 230 Q 190 210 245 205 Q 300 210 330 230" fill="none" stroke="#1e3a5f" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M 160 340 Q 200 360 245 365 Q 290 360 320 340" fill="none" stroke="#1e3a5f" strokeWidth="0.5" strokeOpacity="0.15" />
        </g>
      )}

      {visualType === 'fullFaceBalance' && (
        <g className="goal-bg-layer">
          <path d="M 120 200 Q 160 170 210 160 Q 245 155 280 160 Q 330 170 360 200 Q 380 240 375 290 Q 370 350 350 400 Q 320 440 280 455 Q 245 462 210 455 Q 170 440 140 400 Q 120 350 115 290 Q 110 240 120 200 Z" fill="none" stroke="#1e3a5f" strokeWidth="0.6" strokeOpacity="0.2" />
          <path d="M 245 160 L 245 455" fill="none" stroke="#1e3a5f" strokeWidth="0.4" strokeOpacity="0.12" strokeDasharray="3 6" />
          <path d="M 120 280 L 360 280" fill="none" stroke="#1e3a5f" strokeWidth="0.4" strokeOpacity="0.12" strokeDasharray="3 6" />
        </g>
      )}

      {visualType === 'skinSurface' && (
        <g className="goal-bg-layer">
          <path d="M 120 200 Q 160 170 210 160 Q 245 155 280 160 Q 330 170 360 200 Q 380 240 375 290 Q 370 350 350 400 Q 320 440 280 455 Q 245 462 210 455 Q 170 440 140 400 Q 120 350 115 290 Q 110 240 120 200 Z" fill="none" stroke="#1e3a5f" strokeWidth="0.6" strokeOpacity="0.18" />
          <path d="M 170 220 Q 245 210 320 220 Q 325 280 320 340 Q 245 350 170 340 Q 165 280 170 220 Z" fill="none" stroke="#1e3a5f" strokeWidth="0.4" strokeOpacity="0.1" />
        </g>
      )}

      {visualType === 'underEye' && (
        <g className="goal-bg-layer">
          <path d="M 120 200 Q 160 170 210 160 Q 245 155 280 160 Q 330 170 360 200 Q 380 240 375 290 Q 370 350 350 400 Q 320 440 280 455 Q 245 462 210 455 Q 170 440 140 400 Q 120 350 115 290 Q 110 240 120 200 Z" fill="none" stroke="#1e3a5f" strokeWidth="0.6" strokeOpacity="0.18" />
          <path d="M 160 255 Q 200 245 225 252" fill="none" stroke="#1e3a5f" strokeWidth="0.4" strokeOpacity="0.12" />
          <path d="M 265 252 Q 290 245 320 255" fill="none" stroke="#1e3a5f" strokeWidth="0.4" strokeOpacity="0.12" />
        </g>
      )}

      {visualType === 'youthful' && (
        <g className="goal-bg-layer">
          <path d="M 120 200 Q 160 170 210 160 Q 245 155 280 160 Q 330 170 360 200 Q 380 240 375 290 Q 370 350 350 400 Q 320 440 280 455 Q 245 462 210 455 Q 170 440 140 400 Q 120 350 115 290 Q 110 240 120 200 Z" fill="none" stroke="#1e3a5f" strokeWidth="0.6" strokeOpacity="0.18" />
          <path d="M 150 260 Q 200 250 245 255 Q 290 250 330 260" fill="none" stroke="#1e3a5f" strokeWidth="0.4" strokeOpacity="0.1" />
          <path d="M 165 305 Q 245 298 315 305" fill="none" stroke="#1e3a5f" strokeWidth="0.4" strokeOpacity="0.1" />
        </g>
      )}
    </svg>
  );
}

interface GoalFeedbackStepProps {
  goalId: string | undefined;
  selectedGender: string | undefined;
}

export default function GoalFeedbackStep({ goalId, selectedGender }: GoalFeedbackStepProps) {
  const variant = useMemo(() => getVariant(goalId), [goalId]);
  const portraitUrl = selectedGender === 'female' ? femalePortraitUrl : malePortraitUrl;

  const highlight = tr(variant.highlight_en, variant.highlight_es);
  const primaryText = tr(variant.primaryText_en, variant.primaryText_es);
  const secondaryText = tr(variant.secondaryText_en, variant.secondaryText_es);

  return (
    <div className="mb-6 animate-fade-in flex flex-col items-center w-full">
      {/* Eyebrow label */}
      <div className="goal-eyebrow mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400/80">
          {tr('Based on your goal', 'Seg\u00fan tu objetivo')}
        </span>
      </div>

      {/* Headline */}
      <h1 className="goal-headline text-center font-bold text-white mb-6 leading-[1.15] text-[26px] px-4 tracking-[-0.01em]">
        {tr('Your focus:', 'Tu enfoque:')}{' '}
        <span
          className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-600 bg-clip-text text-transparent"
          style={{ filter: 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.3))' }}
        >
          {highlight}
        </span>
      </h1>

      {/* Visual centerpiece — full-bleed portrait */}
      <div
        className="relative w-full max-w-[320px] mx-auto goal-portrait-container rounded-3xl border-2 border-cyan-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/80 shadow-2xl shadow-cyan-950/40 overflow-hidden"
        style={{ aspectRatio: '3 / 4' }}
      >
        {/* Background geometry */}
        <BackgroundGeometry visualType={variant.visualType} />

        {/* Portrait */}
        <div className="absolute inset-0 goal-portrait-wrap overflow-hidden">
          <img
            src={portraitUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-contain object-[center_62%]"
            draggable={false}
          />
          {/* Bottom fade into background — strong so text reads cleanly */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0) 40%, rgba(2,6,23,0.4) 65%, rgba(2,6,23,0.92) 90%, rgba(2,6,23,1) 100%)',
            }}
          />
          {/* Very subtle top vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(2,6,23,0.45) 0%, rgba(2,6,23,0.1) 8%, rgba(2,6,23,0) 18%)',
            }}
          />
          {/* Top scan-line accent */}
          <div
            className="absolute top-0 inset-x-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)' }}
          />
        </div>

        {/* Analysis overlay */}
        <AnalysisOverlay visualType={variant.visualType} />

        {/* Bottom caption inside the portrait */}
        <div className="absolute bottom-0 inset-x-0 px-5 pb-5 pt-12 pointer-events-none goal-caption">
          <p className="text-center text-slate-200 text-[14px] leading-[1.5] font-medium">
            {primaryText}
          </p>
        </div>
      </div>

      {/* Secondary text below portrait */}
      <p className="goal-secondary text-center text-slate-400 text-[13px] leading-relaxed mt-4 max-w-[300px] px-3">
        {secondaryText}
      </p>

    </div>
  );
}
