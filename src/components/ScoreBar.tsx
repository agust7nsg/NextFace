import React from "react";
import { Crown, Lock } from "lucide-react";
import { tr } from "../contexts/LanguageContext";

type Props = {
  label: string;
  score: number; // 0..100
  potentialImprovement?: number; // optional, points displayed as "+N pts" indicator
  locked?: boolean;
  onLockClick?: () => void;
  isOverall?: boolean;
};

function getScoreGradient(score: number): string {
  if (score >= 80) return "from-cyan-400 to-blue-500";
  if (score >= 60) return "from-cyan-400 to-blue-500";
  if (score >= 40) return "from-cyan-400 to-blue-500";
  return "from-blue-400 to-sky-500";
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return "text-cyan-400";
  if (score >= 60) return "text-cyan-400";
  if (score >= 40) return "text-cyan-400";
  return "text-blue-400";
}

export default function ScoreBar({
  label,
  score,
  potentialImprovement,
  locked = false,
  onLockClick,
  isOverall = false,
}: Props) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const gradient = getScoreGradient(clampedScore);
  const textColor = getScoreTextColor(clampedScore);

  return (
    <div
      className={`relative w-full rounded-2xl border bg-white/5 p-4 text-white transition-all duration-300 ${
        isOverall
          ? "border-cyan-500/30"
          : "border-white/10"
      } ${locked ? "cursor-pointer" : ""}`}
      onClick={locked ? onLockClick : undefined}
    >
      {/* Header row: label + score (or lock indicator) */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{label}</span>
          {locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5">
              <Crown className="w-3 h-3 text-yellow-400" strokeWidth={2} fill="currentColor" />
              <span className="text-[10px] font-medium text-yellow-400/90">Premium</span>
            </span>
          )}
        </div>

        {!locked ? (
          <span className={`text-sm font-bold ${textColor}`}>
            {clampedScore}
            <span className="text-slate-500 text-xs font-normal">/100</span>
          </span>
        ) : null}
      </div>

      {/* Bar or locked overlay */}
      {!locked ? (
        <>
          <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
              style={{ width: `${clampedScore}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={clampedScore}
              aria-label={label}
            />
          </div>
          {potentialImprovement != null && (
            <span className="mt-2 block text-xs font-medium text-emerald-400/80">
              {tr("Potential Improvement:", "Mejora potencial:")} +{potentialImprovement}
            </span>
          )}
        </>
      ) : (
        <div className="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
          <div className="absolute inset-0 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-300">Locked</span>
          </div>
        </div>
      )}
    </div>
  );
}
