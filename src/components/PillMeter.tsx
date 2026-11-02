import React from "react";

type Props = {
  label: string;
  value: number;          // 1..100
  hint?: string;          // short 1-liner under bar
};

export default function PillMeter({ label, value, hint }: Props) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      {/* Header: label only (no dot, no 91/100) */}
      <div className="mb-2">
        <div className="font-semibold">{label}</div>
      </div>

      {/* Bar */}
      <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-cyan-400"
          style={{ width: `${v}%` }}
          aria-label={`${label} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={v}
          role="progressbar"
        />
      </div>

      {/* Hint line */}
      {hint ? <div className="mt-2 text-xs text-white/70">{hint}</div> : null}
    </div>
  );
}
