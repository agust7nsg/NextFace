import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  Play,
  Clock,
  Dumbbell,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Crown,
  Droplet,
} from "lucide-react";
import ScoreBar from "../components/ScoreBar";
import PremiumModal from "../components/PremiumModal";
import BlueAtmosphereGlow from "../components/BlueAtmosphereGlow";
import { useAuth } from "../contexts/AuthContext";
import { tr } from "../contexts/LanguageContext";
import { getHistory } from "../lib/history";
import { getPotentialImprovements } from "../lib/potentialImprovement";

interface RoutineStep {
  id: number;
  title: string;
  titleEs: string;
  duration: string;
  icon: React.ReactNode;
}

const routineSteps: RoutineStep[] = [
  { id: 1, title: "Prep & Hydrate", titleEs: "Preparación e hidratación", duration: "1 min", icon: <Droplet className="w-5 h-5 text-cyan-400" /> },
  { id: 2, title: "Lymphatic Activation", titleEs: "Activación linfática", duration: "2 min", icon: <Sparkles className="w-5 h-5 text-cyan-400" /> },
  { id: 3, title: "Cheek Lift & Sculpt", titleEs: "Elevación y esculpido de pómulos", duration: "3 min", icon: <TrendingUp className="w-5 h-5 text-cyan-400" /> },
  { id: 4, title: "Jawline Definition", titleEs: "Definición de la mandíbula", duration: "4 min", icon: <Dumbbell className="w-5 h-5 text-cyan-400" /> },
  { id: 5, title: "Lymphatic Drainage", titleEs: "Drenaje linfático", duration: "3 min", icon: <ArrowUpRight className="w-5 h-5 text-cyan-400" /> },
  { id: 6, title: "Final Drainage", titleEs: "Drenaje final", duration: "2 min", icon: <Sparkles className="w-5 h-5 text-cyan-400" /> },
];

interface RoutineDetailPageProps {
  onBack: () => void;
  onStart?: () => void;
}

export default function RoutineDetailPage({ onBack, onStart }: RoutineDetailPageProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { user, isPremium } = useAuth();

  const [scores, setScores] = useState<{
    overall: number;
    jawline: number;
    cheekbones: number;
  } | null>(null);
  const [loadingScores, setLoadingScores] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoadingScores(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await getHistory({ userId: user.id, limit: 1 });
      if (cancelled) return;
      const latest = data?.[0];
      if (latest?.analysis) {
        const a = latest.analysis;
        setScores({
          overall: Number(a.overall) || 0,
          jawline: Number(a.jawline) || 0,
          cheekbones: Number(a.cheekbones) || 0,
        });
      }
      setLoadingScores(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const improvements = useMemo(() => {
    if (!scores) return { overall: 0, jawline: 0, cheekbones: 0 };
    return getPotentialImprovements(scores.overall, scores.jawline, scores.cheekbones);
  }, [scores]);

  const handleLockedClick = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
    }
  };

  const handleStartRoutine = () => {
    onStart?.();
  };

  const totalDuration = routineSteps.reduce((acc, s) => {
    return acc + parseInt(s.duration);
  }, 0);

  const overallScore = scores?.overall ?? 0;
  const jawlineScore = scores?.jawline ?? 0;
  const cheekbonesScore = scores?.cheekbones ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black pb-28">
      {/* Ambient header glow */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 pt-2">
        {/* === 1. HERO SECTION === */}
        <div className="animate-fade-in">
          {/* Before/After image placeholder */}
          <div
            className="relative -mx-4 -mt-2 w-[calc(100%+2rem)] aspect-[5/4] rounded-b-3xl bg-slate-800/40 flex items-center justify-center overflow-hidden mb-5"
            aria-label="BEFORE_AFTER_IMAGE_PLACEHOLDER"
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url(https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/RRoutine%20img%201.png)",
              }}
            />
            <button
              onClick={onBack}
              className="absolute left-4 z-20 rounded-2xl border border-slate-700/50 bg-black/50 p-3 backdrop-blur-md transition-all duration-200 hover:border-blue-500/30"
              style={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-slate-200" />
            </button>
            <div className="hidden">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-400/60" />
              </div>
              <span className="text-slate-500 text-xs font-medium tracking-wide uppercase">
                Before / After Image
              </span>
            </div>
          </div>

          <BlueAtmosphereGlow style={{ top: "min(80vw, 35rem)" }} />

          {/* Title + description */}
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-white leading-tight mb-3">
              {tr("Facial Massages", "Masajes faciales")}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {tr(
                "This routine uses lymphatic drainage massage techniques to help move retained fluid away from your face, revealing more definition in your jawline and cheekbones with consistent practice.",
                "Esta rutina utiliza técnicas de masaje de drenaje linfático para ayudar a mover el líquido retenido lejos de tu rostro, revelando mayor definición en tu mandíbula y pómulos con práctica constante."
              )}
            </p>
          </div>
        </div>

        {/* === 2. RELEVANCE / SCORE TAGS SECTION === */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h2 className="text-white font-semibold text-base">
              {tr("Your Relevance Scores", "Tus puntuaciones de relevancia")}
              <span className="block mt-1 text-xs font-normal text-slate-400">{tr("Based on your latest analysis", "Basado en tu último análisis")}</span>
            </h2>
          </div>

          {loadingScores ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-400 text-sm">
              {tr("Loading your latest scores…", "Cargando tus últimas puntuaciones…")}
            </div>
          ) : !scores ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-400 text-sm">
              {tr("Complete a facial analysis to see your personalized relevance scores.", "Completa un análisis facial para ver tus puntuaciones de relevancia personalizadas.")}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {/* Overall — always visible to all users */}
                <ScoreBar
                  label={tr("Overall", "General")}
                  score={overallScore}
                  potentialImprovement={improvements.overall}
                  isOverall
                  locked={false}
                />

                {/* Zone-specific — locked for free users */}
                <ScoreBar
                  label={tr("Jawline", "Mandíbula")}
                  score={jawlineScore}
                  potentialImprovement={improvements.jawline}
                  locked={!isPremium}
                  onLockClick={handleLockedClick}
                />
                <ScoreBar
                  label={tr("Cheekbones", "Pómulos")}
                  score={cheekbonesScore}
                  potentialImprovement={improvements.cheekbones}
                  locked={!isPremium}
                  onLockClick={handleLockedClick}
                />
              </div>

              {/* Single premium CTA below all three cards — only for free users */}
              {!isPremium && (
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-400 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <Crown className="w-4 h-4" strokeWidth={2} fill="currentColor" />
                  {tr("Unlock All Zone Scores with Premium", "Desbloquea todas las puntuaciones por zona con Premium")}
                </button>
              )}
            </>
          )}
        </div>

        {/* === 3. STEP-BY-STEP PREVIEW SECTION === */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-base">{tr("Routine Steps", "Pasos de la rutina")}</h2>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{routineSteps.length} {tr("steps", "pasos")} · {totalDuration} min</span>
            </div>
          </div>

          {/* Timeline-style step list */}
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[27px] top-3 bottom-3 w-px bg-gradient-to-b from-cyan-500/30 via-slate-700/40 to-transparent" />

            <div className="space-y-3">
              {routineSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="relative flex items-center gap-4 group"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Step number badge / icon */}
                  <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 group-hover:border-cyan-500/40 flex items-center justify-center transition-all duration-300">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-cyan-400">{step.id}</span>
                    </div>
                  </div>

                  {/* Step content */}
                  <div className="flex-1 flex items-center justify-between bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 py-3 group-hover:border-cyan-500/30 group-hover:bg-slate-800/60 transition-all duration-300">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs font-bold">
                          {String(step.id).padStart(2, "0")}
                        </span>
                        <span className="text-white text-sm font-medium">
                          {tr(step.title, step.titleEs)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{step.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === CTA: Start Routine === */}
        <div className="animate-slide-up">
          <button
            onClick={handleStartRoutine}
            className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_60%_at_80%_50%,rgba(255,255,255,.16)_0%,transparent_55%)] opacity-70"
            />
            <Play className="w-5 h-5 relative z-10" fill="currentColor" />
            <span className="relative z-10">{tr("Start Routine", "Iniciar rutina")}</span>
          </button>
        </div>
      </div>

      {/* Premium modal — shown when locked bars are tapped by free users */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
