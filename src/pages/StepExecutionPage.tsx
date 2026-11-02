import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ArrowRight, Check, Clock } from "lucide-react";
import type { RoutineFlow } from "../types/routine";
import { tr } from "../contexts/LanguageContext";

interface StepExecutionPageProps {
  flow: RoutineFlow;
  onBack: () => void;
  onComplete?: () => void;
}

export default function StepExecutionPage({
  flow,
  onBack,
  onComplete,
}: StepExecutionPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalSteps = flow.steps.length;
  const step = flow.steps[currentIndex];
  const isLastStep = currentIndex === totalSteps - 1;
  const progress = ((currentIndex + 1) / totalSteps) * 100;

  const goToStep = useCallback(
    (index: number, dir: "forward" | "backward") => {
      if (index < 0 || index >= totalSteps) return;
      setDirection(dir);
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        requestAnimationFrame(() => setIsTransitioning(false));
      }, 200);
    },
    [totalSteps],
  );

  const handleNext = useCallback(() => {
    if (isLastStep) {
      // Placeholder: wire completion/celebration screen or analytics here.
      if (onComplete) {
        onComplete();
      } else {
        onBack();
      }
      return;
    }
    goToStep(currentIndex + 1, "forward");
  }, [isLastStep, onComplete, onBack, goToStep, currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex === 0) {
      onBack();
      return;
    }
    goToStep(currentIndex - 1, "backward");
  }, [currentIndex, onBack, goToStep]);

  // Keyboard support for back/next
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlePrev, handleNext]);

  const slideClass =
    direction === "forward"
      ? isTransitioning
        ? "opacity-0 translate-x-6"
        : "opacity-100 translate-x-0"
      : isTransitioning
        ? "opacity-0 -translate-x-6"
        : "opacity-100 translate-x-0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex flex-col">
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Progress bar — pinned at very top */}
      <div
        className="fixed top-0 left-0 right-0 z-30 h-1 bg-white/10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step image — hero visual */}
      <div
        className="relative -mx-0 w-full aspect-[10/9] bg-slate-800/40 overflow-hidden flex-shrink-0"
        aria-label="STEP_IMAGE_PLACEHOLDER"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300"
          style={{
            backgroundImage: step.imageUrl
              ? `url(${step.imageUrl})`
              : undefined,
          }}
        />
        {/* Fade gradient into background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

        {/* Back chevron — top left, consistent with routine page */}
        <button
          onClick={handlePrev}
          className="absolute left-4 z-20 rounded-2xl border border-slate-700/50 bg-black/50 p-3 backdrop-blur-md transition-all duration-200 hover:border-blue-500/30 active:scale-90"
          style={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}
          aria-label={currentIndex === 0 ? tr("Exit routine", "Salir de la rutina") : tr("Previous step", "Paso anterior")}
        >
          <ChevronLeft className="w-5 h-5 text-slate-200" />
        </button>

        {/* Step counter — top right */}
        <div
          className="absolute right-4 z-20 rounded-full bg-black/50 backdrop-blur-md border border-slate-700/50 px-3 py-1.5"
          style={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}
        >
          <span className="text-xs font-medium text-slate-200">
            {tr("Step", "Paso")} {currentIndex + 1} {tr("of", "de")} {totalSteps}
          </span>
        </div>
      </div>

      {/* Step content */}
      <div className="relative flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 pt-6 pb-32">
        <div
          className={`transition-all duration-300 ease-out ${slideClass}`}
          key={currentIndex}
        >
          {/* Step title */}
          <h1 className="text-2xl font-bold text-white leading-tight mb-3">
            {tr(step.title, step.titleEs ?? step.title)}
          </h1>

          {/* Duration badge — placeholder slot for future timer */}
          {step.durationSeconds && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>{Math.round(step.durationSeconds / 60)} min</span>
            </div>
          )}

          {/* Step description */}
          <p className="text-slate-400 text-sm leading-relaxed">
            {tr(step.description, step.descriptionEs ?? step.description)}
          </p>

          {/* Placeholder: per-step countdown timer can be wired here.
              For now navigation is manual via the button below. */}
        </div>
      </div>

      {/* Bottom navigation — pinned */}
      <div className="fixed bottom-0 left-0 right-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="max-w-2xl mx-auto px-4">
          <button
            onClick={handleNext}
            className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_60%_at_80%_50%,rgba(255,255,255,.16)_0%,transparent_55%)] opacity-70"
            />
            {isLastStep ? (
              <>
                <Check className="w-5 h-5 relative z-10" strokeWidth={2.5} />
                <span className="relative z-10">{tr("Finish Routine", "Finalizar rutina")}</span>
              </>
            ) : (
              <>
                <span className="relative z-10">{tr("Next Step", "Siguiente paso")}</span>
                <ArrowRight className="w-5 h-5 relative z-10" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
