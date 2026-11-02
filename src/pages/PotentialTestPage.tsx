import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, TrendingUp, Target } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { tr } from '../contexts/LanguageContext';

interface PotentialTestPageProps {
  onComplete: (boost: number, focusArea: string) => void;
  onBack: () => void;
}

function getQuestions() {
  return [
  {
    title: tr('How satisfied are you with your current appearance?', '¿Qué tan satisfecho estás con tu apariencia actual?'),
    subtitle: tr('Be honest -- this helps us calculate your true potential.', 'Sé honesto -- esto nos ayuda a calcular tu verdadero potencial.'),
    options: [
      { id: 'sat4', text: tr('Very satisfied', 'Muy satisfecho'), points: 1 },
      { id: 'sat3', text: tr('Somewhat satisfied', 'Algo satisfecho'), points: 2 },
      { id: 'sat2', text: tr('Not very satisfied', 'No muy satisfecho'), points: 3 },
      { id: 'sat1', text: tr('Unsatisfied', 'Insatisfecho'), points: 4 },
    ],
  },
  {
    title: tr('How often do you receive compliments on your appearance?', '¿Con qué frecuencia recibes cumplidos por tu apariencia?'),
    subtitle: tr('Think about the last few months.', 'Piensa en los últimos meses.'),
    options: [
      { id: 'comp4', text: tr('Frequently', 'Frecuentemente'), points: 1 },
      { id: 'comp3', text: tr('Occasionally', 'Ocasionalmente'), points: 2 },
      { id: 'comp2', text: tr('Rarely', 'Rara vez'), points: 3 },
      { id: 'comp1', text: tr('Almost never', 'Casi nunca'), points: 4 },
    ],
  },
  {
    title: tr('How do you feel you look in photos compared to the mirror?', '¿Cómo sientes que te ves en fotos comparado con el espejo?'),
    subtitle: tr('Select the one that fits best.', 'Elige la que mejor se ajuste.'),
    options: [
      { id: 'photo4', text: tr('Great in both', 'Bien en ambos'), points: 1 },
      { id: 'photo3', text: tr('Better in the mirror', 'Mejor en el espejo'), points: 2 },
      { id: 'photo2', text: tr('Depends on lighting', 'Depende de la luz'), points: 3 },
      { id: 'photo1', text: tr('Uncomfortable in both', 'Incómodo en ambos'), points: 4 },
    ],
  },
  {
    title: tr('How much effort do you currently put into optimizing your appearance?', '¿Cuánto esfuerzo dedicas actualmente a optimizar tu apariencia?'),
    subtitle: tr('Think about your daily routine.', 'Piensa en tu rutina diaria.'),
    options: [
      { id: 'eff4', text: tr('Maximum effort', 'Esfuerzo máximo'), points: 1 },
      { id: 'eff3', text: tr('Moderate effort', 'Esfuerzo moderado'), points: 2 },
      { id: 'eff2', text: tr('Low effort', 'Poco esfuerzo'), points: 3 },
      { id: 'eff1', text: tr('Zero effort', 'Ningún esfuerzo'), points: 4 },
    ],
  },
  {
    title: tr('Which area do you feel has the most untapped potential?', '¿Qué área sientes que tiene más potencial sin explotar?'),
    subtitle: tr('Pick the one you want to improve most.', 'Elige la que más quieres mejorar.'),
    options: [
      { id: 'area1', text: tr('Facial definition & jawline', 'Definición facial y mandíbula'), points: 0 },
      { id: 'area2', text: tr('Skin texture & clarity', 'Textura y claridad de piel'), points: 0 },
      { id: 'area3', text: tr('Hairstyle & hair quality', 'Estilo y calidad del cabello'), points: 0 },
      { id: 'area4', text: tr('Style, posture & grooming', 'Estilo, postura y cuidado personal'), points: 0 },
    ],
  },
  {
    title: tr('How close do you feel you are to your peak attractiveness?', '¿Qué tan cerca sientes que estás de tu máximo atractivo?'),
    subtitle: tr('Rate your current progress honestly.', 'Califica tu progreso actual con honestidad.'),
    options: [
      { id: 'peak4', text: tr('Almost at my peak', 'Casi en mi máximo'), points: 1 },
      { id: 'peak3', text: tr('Some room to improve', 'Algo que mejorar'), points: 2 },
      { id: 'peak2', text: tr('A lot of room to improve', 'Mucho que mejorar'), points: 3 },
      { id: 'peak1', text: tr('Far from it', 'Lejos de ello'), points: 4 },
    ],
  },
  ];
}

const SCORED_QUESTION_INDICES = [0, 1, 2, 3, 5];

const FOCUS_AREA_LABELS: Record<string, string> = {
  area1: 'Facial definition & jawline',
  area2: 'Skin texture & clarity',
  area3: 'Hairstyle & hair quality',
  area4: 'Style, posture & grooming',
};

function getFocusAreaLabel(area: string): string {
  const labels: Record<string, string> = {
    area1: tr('Facial definition & jawline', 'Definición facial y mandíbula'),
    area2: tr('Skin texture & clarity', 'Textura y claridad de piel'),
    area3: tr('Hairstyle & hair quality', 'Estilo y calidad del cabello'),
    area4: tr('Style, posture & grooming', 'Estilo, postura y cuidado personal'),
  };
  return labels[area] || tr('General improvement', 'Mejora general');
}

function calculateBoost(selectedValues: Record<number, string>, questions: ReturnType<typeof getQuestions>): number {
  let rawScore = 0;
  for (const qi of SCORED_QUESTION_INDICES) {
    const optionId = selectedValues[qi];
    if (!optionId) continue;
    const question = questions[qi];
    const option = question.options.find(o => o.id === optionId);
    if (option) rawScore += option.points;
  }
  // rawScore range: 5 (all best) to 20 (all worst)
  const ratio = (rawScore - 5) / 15; // 0.0 to 1.0
  const curved = Math.pow(ratio, 0.65); // push results above 50%
  const boost = Math.round(32 + curved * 42); // 32% to 74%
  return boost;
}

function getFocusArea(selectedValues: Record<number, string>): string {
  return selectedValues[4] || 'area1';
}

function getMotivationalText(boost: number): string {
  if (boost <= 45) return tr("You're already doing great -- small tweaks can unlock even more.", "Ya lo estás haciendo bien -- pequeños ajustes pueden unlockar aún más.");
  if (boost <= 60) return tr('You have solid untapped potential waiting to be unlocked.', 'Tienes un potencial sólido sin explotar esperando ser liberado.');
  return tr('You have massive room to glow up -- let\'s get started.', 'Tienes mucho espacio para mejorar -- empecemos.');
}

// --- Loading Ring Component ---
function LoadingRing({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const startTime = useRef(Date.now());
  const duration = 4000;

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - startTime.current;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onDone, 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const radius = 70;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-600/15 via-blue-500/8 to-transparent rounded-full blur-3xl" />

      <div className="relative w-48 h-48 mb-8">
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-1000"
          style={{
            boxShadow: `0 0 ${40 + progress * 30}px ${8 + progress * 12}px rgba(34, 211, 238, ${0.15 + progress * 0.2})`,
            opacity: 0.6 + progress * 0.4,
          }}
        />
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background track */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="rgba(51, 65, 85, 0.4)"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="url(#loadingGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-none"
            style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))' }}
          />
          <defs>
            <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white tabular-nums">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>

      <p className="text-slate-300 text-lg font-medium animate-pulse">
        {tr('Calculating your potential...', 'Calculando tu potencial...')}
      </p>
      <p className="text-slate-500 text-sm mt-2">
        {tr('Analyzing your responses', 'Analizando tus respuestas')}
      </p>
    </div>
  );
}

// --- Results Screen Component ---
function ResultsScreen({
  boost,
  focusArea,
  onContinue,
}: {
  boost: number;
  focusArea: string;
  onContinue: () => void;
}) {
  const [displayedBoost, setDisplayedBoost] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [arcProgress, setArcProgress] = useState(0);

  useEffect(() => {
    const countDuration = 1800;
    const startTime = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / countDuration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayedBoost(Math.round(eased * boost));
      setArcProgress(eased * (boost / 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    setTimeout(() => setShowContent(true), 600);
    return () => cancelAnimationFrame(raf);
  }, [boost]);

  const radius = 80;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const arcDashOffset = circumference * (1 - arcProgress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-600/15 via-blue-500/8 to-transparent rounded-full blur-3xl" />

      {/* Title */}
      <div
        className="text-center mb-10 transition-all duration-700"
        style={{ opacity: showContent ? 1 : 0, transform: showContent ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-medium">{tr('Your Results', 'Tus Resultados')}</span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-tight">
          {tr('Attractiveness Boost Potential', 'Potencial de Mejora de Atractivo')}
        </h1>
      </div>

      {/* Circular gauge */}
      <div className="relative w-56 h-56 mb-10">
        {/* Animated glow behind gauge */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 60px 16px rgba(34, 211, 238, ${0.1 + arcProgress * 0.25})`,
          }}
        />
        <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
          <circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke="rgba(51, 65, 85, 0.3)"
            strokeWidth={stroke}
          />
          <circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke="url(#resultGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={arcDashOffset}
            style={{ filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.6))' }}
          />
          <defs>
            <linearGradient id="resultGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-white tabular-nums leading-none">
            +{displayedBoost}%
          </span>
          <span className="text-slate-400 text-sm mt-1.5 font-medium">{tr('potential boost', 'mejora potencial')}</span>
        </div>
      </div>

      {/* Focus area card */}
      <div
        className="w-full max-w-sm transition-all duration-700 delay-300"
        style={{ opacity: showContent ? 1 : 0, transform: showContent ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{tr('Top Opportunity', 'Mayor Oportunidad')}</p>
              <p className="text-white font-semibold text-base">
                {getFocusAreaLabel(focusArea)}
              </p>
            </div>
          </div>
        </div>

        {/* Motivational text */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/30 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {getMotivationalText(boost)}
            </p>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div
        className="w-full max-w-sm transition-all duration-700 delay-500"
        style={{ opacity: showContent ? 1 : 0, transform: showContent ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 active:scale-[0.97]"
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        >
          {tr('Continue', 'Continuar')}
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function PotentialTestPage({ onComplete, onBack }: PotentialTestPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedValues, setSelectedValues] = useState<Record<number, string>>({});
  const [touchedButton, setTouchedButton] = useState<string | null>(null);
  const [phase, setPhase] = useState<'questions' | 'loading' | 'results'>('questions');
  const [boostResult, setBoostResult] = useState(0);
  const [focusAreaResult, setFocusAreaResult] = useState('area1');
  const { user } = useAuth();
  const questions = getQuestions();

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionClick = (optionId: string) => {
    setTouchedButton(optionId);
    setTimeout(() => setTouchedButton(null), 150);
    setSelectedValues(prev => ({ ...prev, [currentStep]: optionId }));
  };

  const isSelected = (optionId: string) => selectedValues[currentStep] === optionId;
  const canProceed = () => selectedValues[currentStep] !== undefined;

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const boost = calculateBoost(selectedValues, questions);
      const focus = getFocusArea(selectedValues);
      setBoostResult(boost);
      setFocusAreaResult(focus);
      setPhase('loading');

      if (user) {
        supabase
          .from('facial_profiles')
          .update({
            potential_boost: boost,
            potential_focus_area: focus,
            potential_test_completed_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Failed to save potential test result:', error);
          });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const handleLoadingDone = () => setPhase('results');

  const handleContinue = () => onComplete(boostResult, focusAreaResult);

  if (phase === 'loading') {
    return <LoadingRing onDone={handleLoadingDone} />;
  }

  if (phase === 'results') {
    return (
      <ResultsScreen
        boost={boostResult}
        focusArea={focusAreaResult}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden flex flex-col">
      <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-10 w-64 h-64 bg-gradient-to-bl from-cyan-400/15 via-blue-500/8 to-transparent rounded-full blur-2xl" />

      {/* Header */}
      <div className="w-full p-4 pt-8">
        <div className="max-w-sm mx-auto">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/30"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-slate-500 text-xs text-center mt-2">{currentStep + 1} {tr('of', 'de')} {questions.length}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-20 relative z-10">
        <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-8 animate-fade-in" key={currentStep}>
            <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
              {currentQuestion.title}
            </h1>
            <p className="text-slate-400 text-base">
              {currentQuestion.subtitle}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option) => {
              const selected = isSelected(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onTouchStart={() => handleOptionClick(option.id)}
                  onClick={() => handleOptionClick(option.id)}
                  className={`w-full p-4 rounded-xl text-center font-medium text-base border-2 pointer-events-auto transition-all duration-150 active:scale-95 ${
                    selected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : touchedButton === option.id
                      ? 'bg-slate-700/50 text-white border-slate-600/50 scale-95'
                      : 'bg-slate-800/40 text-slate-300 border-slate-700/50'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              type="button"
              onTouchStart={handleBack}
              onClick={handleBack}
              className="w-12 h-12 bg-slate-800/60 rounded-full flex items-center justify-center text-slate-300 active:text-white active:bg-slate-700/60 transition-all duration-150 active:scale-95"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onTouchStart={canProceed() ? handleNext : undefined}
              onClick={canProceed() ? handleNext : undefined}
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-full font-bold text-base transition-all duration-150 active:scale-95 ${
                canProceed()
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              {currentStep === questions.length - 1 ? tr('Complete', 'Completar') : tr('Continue', 'Continuar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
