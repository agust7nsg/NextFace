import React, { useState, useRef } from 'react';
import { ArrowRight, ArrowLeft, Moon, Scan } from 'lucide-react';
import { tr } from '../contexts/LanguageContext';
import FaceScanAnimation from '../components/FaceScanAnimation';
import GoalFeedbackStep from '../components/GoalFeedbackStep';
const malePortraitUrl = 'https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/Retrato%20recortado%20de%20joven%20de%20cabello%20oscuro.png';
const femalePortraitUrl = 'https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/ChatGPT%20Image%2011%20sept%202026,%2020_55_41.png';

const beforeGlowupUrl = 'https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/Before%20glowup%20(bloated).png';
const afterGlowupUrl = 'https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/After%20glowup%20(defined).png';

interface OnboardingPageProps {
  onComplete: () => void;
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showThanks, setShowThanks] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Record<number, string | string[]>>({});

  const [touchedButton, setTouchedButton] = useState<string | null>(null);
  const [glowupReveal, setGlowupReveal] = useState(58);
  const sleepDragRef = useRef(false);
  const glowupDragRef = useRef(false);

  const questions = [
    {
      title: tr("Help us personalize your experience", "Ayúdanos a personalizar tu experiencia"),
      subtitle: tr("Choose your gender", "Elige tu género"),
      options: [
        { id: 'male', text: tr('Male', 'Hombre') },
        { id: 'female', text: tr('Female', 'Mujer') }
      ],
      multiSelect: false
    },
    {
      title: tr("What's your age?", "¿Cuál es tu edad?"),
      subtitle: tr("Help us personalize your experience.", "Ayúdanos a personalizar tu experiencia."),
      options: [],
      multiSelect: false
    },
    {
      title: tr("What's your main goal?", "¿Cuál es tu objetivo principal?"),
      subtitle: tr("Choose what matters most to you.", "Elige lo que más te importa."),
      options: [
        { id: 'goal1', text: tr('Look more attractive overall', 'Lucir más atractivo en general') },
        { id: 'goal2', text: tr('Improve skin', 'Mejorar la piel') },
        { id: 'goal3', text: tr('Sharpen jawline / cheekbones', 'Definir mandíbula / pómulos') },
        { id: 'goal4', text: tr('Reduce tired look / eyebags', 'Reducir aspecto cansado / ojeras') },
        { id: 'goal5', text: tr('Look younger', 'Parecer más joven') }
      ],
      multiSelect: false
    },
    {
      title: tr('Your focus', 'Tu enfoque'),
      subtitle: tr('Personalized based on your goal.', 'Personalizado según tu objetivo.'),
      options: [],
      multiSelect: false
    },
    {
      title: tr('Which of these habits do you already have?', '¿Cuáles de estos hábitos ya tienes?'),
      subtitle: tr('Select all that apply to you.', 'Selecciona todos los que apliquen.'),
      options: [
        { id: 'habit1', text: tr('Skincare routine', 'Rutina de cuidado de piel') },
        { id: 'habit2', text: tr('Gym / exercise', 'Gimnasio / ejercicio') },
        { id: 'habit3', text: tr('Diet awareness', 'Conciencia de dieta') },
        { id: 'habit4', text: tr('Face exercises', 'Ejercicios faciales') },
        { id: 'none', text: tr('None of the above', 'Ninguno de los anteriores') }
      ],
      multiSelect: true
    },
    {
      title: tr('Habits make a great difference', 'Los habitos hacen la difference'),
      subtitle: tr('Same face, different habits.', 'Mismo rostro, distintos habitos.'),
      options: [],
      multiSelect: false
    },
    {
      title: tr('How much sleep do you get?', '¿Cuánto duermes?'),
      subtitle: tr('Sleep directly affects your skin and appearance.', 'El sueño afecta directamente tu piel y apariencia.'),
      options: [],
      multiSelect: false
    },
    {
      title: tr('How much effort are you willing to put in?', '¿Cuánto esfuerzo estás dispuesto a invertir?'),
      subtitle: tr("Choose your commitment level.", "Elige tu nivel de compromiso."),
      options: [
        { id: 'effort1', text: tr('Light (2–3 min daily)', 'Ligero (2–3 min diarios)') },
        { id: 'effort2', text: tr('Medium (5–10 min daily)', 'Medio (5–10 min diarios)') },
        { id: 'effort3', text: tr('Heavy (willing to invest more time)', 'Intenso (dispuesto a invertir más tiempo)') }
      ],
      multiSelect: false
    }
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionClick = (optionId: string) => {
    setTouchedButton(optionId);
    setTimeout(() => setTouchedButton(null), 150);
    
    if (currentQuestion.multiSelect) {
      const currentSelections = (selectedValues[currentStep] as string[]) || [];
      
      if (optionId === 'none') {
        // Toggle "none" - if selected, clear all; if not selected, select only "none"
        if (currentSelections.includes('none')) {
          setSelectedValues(prev => ({ ...prev, [currentStep]: [] }));
        } else {
          setSelectedValues(prev => ({ ...prev, [currentStep]: ['none'] }));
        }
      } else {
        // For other options, remove "none" and toggle the option
        const withoutNone = currentSelections.filter(id => id !== 'none');
        if (withoutNone.includes(optionId)) {
          // Remove this option
          const newSelections = withoutNone.filter(id => id !== optionId);
          setSelectedValues(prev => ({ ...prev, [currentStep]: newSelections }));
        } else {
          // Add this option
          const newSelections = [...withoutNone, optionId];
          setSelectedValues(prev => ({ ...prev, [currentStep]: newSelections }));
        }
      }
    } else {
      // Single select
      setSelectedValues(prev => ({ ...prev, [currentStep]: optionId }));
    }
  };

  const isSelected = (optionId: string) => {
    const currentSelections = selectedValues[currentStep];
    if (currentQuestion.multiSelect) {
      return (currentSelections as string[] || []).includes(optionId);
    } else {
      return currentSelections === optionId;
    }
  };

  const canProceed = () => {
    const currentSelections = selectedValues[currentStep];
    if (currentQuestion.multiSelect) {
      return (currentSelections as string[] || []).length > 0;
    } else {
      return currentStep === 3 || currentStep === 5 || (currentSelections !== undefined && currentSelections !== '');
    }
  };

  const AGE_MIN = 16;
  const AGE_MAX = 50;
  const selectedGender = selectedValues[0] as string | undefined;
  const selectedGoal = selectedValues[2] as string | undefined;
  const portraitImg = selectedGender === 'male' ? malePortraitUrl : selectedGender === 'female' ? femalePortraitUrl : null;

  const getAgeValue = (): number => {
    const stored = selectedValues[1];
    if (stored === undefined || stored === '') return AGE_MIN;
    const n = parseInt(stored as string, 10);
    return isNaN(n) ? AGE_MIN : n;
  };

  const ageValue = getAgeValue();
  const ageFillPercent = ((ageValue - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;

  const ageDisplay = ageValue >= AGE_MAX ? '50+' : String(ageValue);

  const handleAgeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSelectedValues(prev => ({ ...prev, 1: String(val) }));
  };

  const SLEEP_MIN = 3;
  const SLEEP_MAX = 12;
  const SLEEP_DEFAULT = 7;
  const SLEEP_ARC = 2 * Math.PI * 90;

  const getSleepValue = (): number => {
    const stored = selectedValues[6];
    if (stored === undefined || stored === '') return SLEEP_DEFAULT;
    const n = parseInt(stored as string, 10);
    return isNaN(n) ? SLEEP_DEFAULT : Math.max(SLEEP_MIN, Math.min(SLEEP_MAX, n));
  };

  const sleepValue = getSleepValue();
  const sleepProgress = (sleepValue - SLEEP_MIN) / (SLEEP_MAX - SLEEP_MIN);
  const sleepAngle = 135 + sleepProgress * 270;
  const sleepHandleX = 120 + 90 * Math.cos(sleepAngle * Math.PI / 180);
  const sleepHandleY = 120 + 90 * Math.sin(sleepAngle * Math.PI / 180);

  const angleToSleepProgress = (angle: number) => {
    let a = angle;
    while (a < 0) a += 360;
    while (a >= 360) a -= 360;
    const start = 135;
    const sweep = 270;
    if (a >= start) return Math.min(1, Math.max(0, (a - start) / sweep));
    if (a <= 45) return Math.min(1, Math.max(0, (a + 360 - start) / sweep));
    return a < 90 ? 1 : 0;
  };

  const handleSleepPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 240 - 120;
    const y = ((e.clientY - rect.top) / rect.height) * 240 - 120;
    const angle = Math.atan2(y, x) * 180 / Math.PI;
    const progress = angleToSleepProgress(angle);
    const hours = Math.round(SLEEP_MIN + progress * (SLEEP_MAX - SLEEP_MIN));
    setSelectedValues(prev => ({ ...prev, 6: String(hours) }));
  };

  const handleGlowupPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nextReveal = ((e.clientX - rect.left) / rect.width) * 100;
    setGlowupReveal(Math.max(8, Math.min(92, nextReveal)));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      if (currentStep === 0 && selectedValues[1] === undefined) {
        setSelectedValues(prev => ({ ...prev, 1: String(AGE_MIN) }));
      }
      if (currentStep === 4 && selectedValues[6] === undefined) {
        setSelectedValues(prev => ({ ...prev, 6: String(SLEEP_DEFAULT) }));
      }
      setCurrentStep(prev => prev + 1);
    } else {
      setShowThanks(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Thanks / "You're All Set" screen
  if (showThanks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex flex-col items-center justify-start relative overflow-hidden px-6">
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-600/15 via-blue-500/8 to-transparent rounded-full blur-3xl" />

        <div
          className="flex-1 flex flex-col items-center justify-start max-w-md mx-auto relative z-10 animate-fade-in pb-4"
          style={{ paddingTop: 'max(40px, env(safe-area-inset-top))' }}
        >
            {/* Face scan animation */}
            <div className="mb-7">
              <FaceScanAnimation />
            </div>

            {/* Small tagline pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 mb-4">
              <Scan className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-300">
                {tr('Your first analysis', 'Tu primer análisis')}
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-[29px] sm:text-[31px] font-bold mb-3 leading-[1.15] tracking-[-0.02em] text-center">
              <span className="text-white">
                {tr('Time to see your ', 'Es hora de ver tu ')}
              </span>
              <span className="bg-gradient-to-r from-cyan-200 via-sky-400 to-blue-600 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 14px rgba(56, 189, 248, 0.35))' }}>
                {tr('potential', 'potencial')}
              </span>
            </h1>

            <p className="text-slate-400 text-[13px] leading-relaxed mb-7 text-center max-w-[300px]">
              {tr(
                'Your first scan reveals the scores, traits, and areas where you can improve. Let\'s begin.',
                'Tu primer escaneo revela tus puntuaciones, rasgos y dónde puedes mejorar. Empecemos.'
              )}
            </p>

            {/* CTA button */}
            <button
              onClick={onComplete}
              className="w-full max-w-sm mx-auto py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group animate-pulse-glow"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="relative flex items-center justify-center gap-2">
                <span>{tr('Start My Analysis', 'Comenzar Mi Análisis')}</span>
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden flex flex-col">
      {/* Blue gradient overlay */}
      <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
      <div className="pointer-events-none absolute top-10 right-10 w-64 h-64 bg-gradient-to-bl from-cyan-400/15 via-blue-500/8 to-transparent rounded-full blur-2xl"></div>
      
      {/* Progress Bar */}
      <div className="w-full p-4 pt-8">
        <div className="max-w-sm mx-auto">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/30"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-20 relative z-10">
        <div className="max-w-sm mx-auto w-full">
          {/* Question Header */}
          <div className="text-center mb-8 animate-fade-in">
            {currentStep === 5 ? (
              <>
                <h1 className="habits-title text-[34px] sm:text-[38px] font-bold text-white mb-3 leading-[1.08] tracking-[-0.02em]">
                  {tr('Habits make a great', 'Los habitos hacen la')}
                  <span className="block bg-gradient-to-r from-cyan-200 via-sky-400 to-blue-600 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 18px rgba(56, 189, 248, 0.35))' }}>
                    {tr('difference', 'diferencia')}
                  </span>
                </h1>
                <p className="habits-subtitle text-slate-400 text-base font-medium mb-5">
                  {currentQuestion.subtitle}
                </p>
              </>
            ) : currentStep === 3 ? null : (
              <>
                <h1 className="font-bold text-white mb-3 leading-tight text-[26px]">
                  {currentQuestion.title}
                </h1>
                <p className="text-slate-400 text-[18px]">
                  {currentQuestion.subtitle}
                </p>
              </>
            )}
          </div>

          {/* Gender step — portrait-card layout */}
          {currentStep === 0 ? (
            
            <div className="mb-8">
              <div className="flex gap-3 animate-fade-in">
                {currentQuestion.options.slice(0, 2).map((option) => {
                  const selected = isSelected(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onTouchStart={() => handleOptionClick(option.id)}
                      className={`group relative flex-1 aspect-[3/5] overflow-hidden rounded-2xl border-2 flex flex-col items-center justify-end p-4 pb-5 transition-all duration-300 active:scale-95 ${
                        selected
                          ? 'border-cyan-400 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 shadow-lg shadow-cyan-500/30'
                          : touchedButton === option.id
                          ? 'border-cyan-400/60 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 scale-95 shadow-lg shadow-blue-500/20'
                          : 'border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 shadow-lg shadow-blue-500/10 hover:border-cyan-400/40 hover:shadow-blue-500/20'
                      }`}
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/35 via-transparent to-blue-950/30" />
                      <img
                        src={option.id === 'male' ? 'https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/Retrato%20recortado%20de%20joven%20de%20cabello%20oscuro.png' : 'https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/Retrato%20recortado%20de%20mujer%20con%20transparencia.png'}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 z-10 h-full w-full object-cover object-[center_70%] opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/2 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900" />
                      <span className={`relative z-30 text-base font-bold tracking-tight ${selected ? 'text-white' : 'text-slate-200'}`}>
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : currentStep === 1 ? (
            <div className="mb-8 animate-fade-in">
              {/* Portrait card matching selected gender */}
              {portraitImg && (
                <div className="flex justify-center mb-5">
                  <div className="relative w-48 h-60 rounded-2xl border-2 border-cyan-400/30 overflow-hidden bg-gradient-to-b from-slate-800/40 to-slate-950/50 shadow-[0_0_24px_rgba(34,211,238,0.25)] shadow-cyan-500/20">
                    <img
                      src={portraitImg}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover object-[center_70%]"
                    />
                  </div>
                </div>
              )}

              {/* Age display */}
              <div className="text-center mb-5">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-cyan-300 via-cyan-100 to-blue-300 bg-clip-text text-transparent tabular-nums">
                  {ageDisplay}
                </span>
                <span className="text-slate-400 text-sm font-medium ml-1">{tr('years old', 'años')}</span>
              </div>

              {/* Slider */}
              <div className="px-1">
                <input
                  type="range"
                  min={AGE_MIN}
                  max={AGE_MAX}
                  step={1}
                  value={ageValue}
                  onChange={handleAgeSlider}
                  className="age-slider"
                  style={{ ['--slider-fill' as string]: `${ageFillPercent}%` }}
                />
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-xs text-slate-500 font-medium">{AGE_MIN}</span>
                  <span className="text-xs text-slate-500 font-medium">50+</span>
                </div>
              </div>
            </div>
          ) : currentStep === 3 ? (
            <GoalFeedbackStep
              key={`goal-${selectedGoal}`}
              goalId={selectedGoal}
              selectedGender={selectedGender}
            />
          ) : currentStep === 6 ? (
            <div className="mb-8 animate-fade-in flex flex-col items-center">
              <div className="relative w-[240px] h-[240px]">
                <svg
                  viewBox="0 0 240 240"
                  className="w-full h-full touch-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  onPointerDown={(e) => {
                    sleepDragRef.current = true;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    handleSleepPointer(e);
                  }}
                  onPointerMove={(e) => {
                    if (sleepDragRef.current) handleSleepPointer(e);
                  }}
                  onPointerUp={(e) => {
                    sleepDragRef.current = false;
                    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                      e.currentTarget.releasePointerCapture(e.pointerId);
                    }
                  }}
                  onPointerCancel={() => { sleepDragRef.current = false; }}
                >
                  <defs>
                    <linearGradient id="sleepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>

                  {/* Track */}
                  <circle
                    cx="120" cy="120" r="90"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${0.75 * SLEEP_ARC} ${0.25 * SLEEP_ARC}`}
                    transform="rotate(135 120 120)"
                  />

                  {/* Progress arc */}
                  <circle
                    cx="120" cy="120" r="90"
                    fill="none"
                    stroke="url(#sleepGrad)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${sleepProgress * 0.75 * SLEEP_ARC} ${SLEEP_ARC}`}
                    transform="rotate(135 120 120)"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.5))' }}
                  />

                  {/* Hour tick marks */}
                  {Array.from({ length: SLEEP_MAX - SLEEP_MIN + 1 }, (_, i) => {
                    const h = SLEEP_MIN + i;
                    const p = (h - SLEEP_MIN) / (SLEEP_MAX - SLEEP_MIN);
                    const a = (135 + p * 270) * Math.PI / 180;
                    const tx = 120 + 72 * Math.cos(a);
                    const ty = 120 + 72 * Math.sin(a);
                    const isActive = h === sleepValue;
                    return (
                      <circle
                        key={h}
                        cx={tx} cy={ty} r={isActive ? 4 : 2.5}
                        fill={isActive ? '#22d3ee' : '#475569'}
                        style={{ transition: 'all 0.15s' }}
                      />
                    );
                  })}

                  {/* Handle */}
                  <circle
                    cx={sleepHandleX} cy={sleepHandleY} r="13"
                    fill="white"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))' }}
                  />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <Moon className="w-6 h-6 text-cyan-400 mb-1" />
                  <span className="text-5xl font-extrabold bg-gradient-to-r from-cyan-300 via-cyan-100 to-blue-300 bg-clip-text text-transparent tabular-nums leading-none">
                    {sleepValue}
                  </span>
                  <span className="text-slate-400 text-sm font-medium mt-1.5">{tr('hours', 'horas')}</span>
                </div>
              </div>

              {/* Quality indicator */}
              <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold border ${
                sleepValue >= 7
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                  : sleepValue >= 5
                  ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-400/30'
              }`}>
                {sleepValue >= 7
                  ? tr('Optimal', 'Óptimo')
                  : sleepValue >= 5
                  ? tr('Fair', 'Regular')
                  : tr('Low', 'Bajo')}
              </div>
            </div>
          ) : currentStep === 5 ? (
            <div className="mb-4">
              <div
                className="habits-card relative w-full aspect-square max-w-[320px] sm:max-w-[340px] mx-auto overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-900 shadow-2xl shadow-cyan-950/40 touch-none select-none"
                onPointerDown={(e) => {
                  glowupDragRef.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  handleGlowupPointer(e);
                }}
                onPointerMove={(e) => {
                  if (glowupDragRef.current) handleGlowupPointer(e);
                }}
                onPointerUp={(e) => {
                  glowupDragRef.current = false;
                  if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  }
                }}
                onPointerCancel={() => { glowupDragRef.current = false; }}
              >
                <img src={beforeGlowupUrl} alt={tr('Before glow-up', 'Antes del glow up')} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${glowupReveal}%` }}>
                  <img src={afterGlowupUrl} alt={tr('After glow-up', 'Después del glow up')} className="absolute inset-0 h-full w-full max-w-none object-cover" style={{ width: `${100 / (glowupReveal / 100)}%` }} />
                </div>
                <div className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" style={{ left: `${glowupReveal}%` }}>
                  <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-cyan-500 shadow-xl shadow-cyan-500/50">
                    <ArrowLeft className="w-4 h-4 text-white" />
                    <ArrowRight className="w-4 h-4 text-white -ml-1" />
                  </div>
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200 backdrop-blur-sm">
                  {tr('Before', 'Antes')}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-cyan-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-cyan-500/30">
                  {tr('After', 'Después')}
                </span>
              </div>

              <p className="habits-hint mt-3 text-center text-xs font-medium text-slate-500">
                {tr('Drag the divider to compare', 'Arrastra el divisor para comparar')}
              </p>

            </div>
          ) : (
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => {
              const selected = isSelected(option.id);
              
              return (
                <button
                  key={option.id}
                  type="button"
                  onTouchStart={() => handleOptionClick(option.id)}
                  className={`w-full p-4 rounded-xl text-center font-medium text-base border-2 pointer-events-auto transition-all duration-150 active:scale-95 ${
                    selected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : touchedButton === option.id
                      ? 'bg-slate-700/50 text-white border-slate-600/50 scale-95'
                      : 'bg-slate-800/40 text-slate-300 border-slate-700/50'
                  }`}
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {currentStep > 0 ? (
              <button
                type="button"
                onTouchStart={handleBack}
                className="w-12 h-12 bg-slate-800/60 rounded-full flex items-center justify-center text-slate-300 active:text-white active:bg-slate-700/60 transition-all duration-150 active:scale-95"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-12 h-12"></div>
            )}

            <button
              type="button"
              onTouchStart={handleNext}
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-full font-bold text-l transition-all duration-150 active:scale-95 ${
                canProceed()
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              {currentStep === questions.length - 1 ? tr('Complete', 'Completar') : tr('Continue', 'Continuar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
