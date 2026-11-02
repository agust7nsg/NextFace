import React from "react";
import PillMeter from "./PillMeter";
import type { SkinReportBlock } from "../lib/faceAnalysis";

function line(label: string, value?: string) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/80">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

export default function SkinReportCard({ data }: { data?: SkinReportBlock }) {
  if (!data?.score) return null;

  const hintParts: string[] = [];
  if (data.acne && data.acne !== "none") hintParts.push(`${data.acne} acne`);
  if (data.redness && data.redness !== "none") hintParts.push(`${data.redness} redness`);
  if (data.darkCircles && data.darkCircles !== "none") hintParts.push(`${data.darkCircles} dark circles`);
  if (data.texture && data.texture !== "smooth") hintParts.push(`${data.texture} texture`);
  if (hintParts.length === 0) hintParts.push("Clear & balanced appearance");

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white space-y-3">
      <PillMeter label="Skin Report" value={data.score} hint={hintParts.join(" • ")} />
      <div className="space-y-1">
        {line("Acne", data.acne)}
        {line("Redness", data.redness)}
        {line("Dark circles", data.darkCircles)}
        {line("Texture", data.texture)}
        {line("Oiliness", data.oiliness)}
        {line("Tone evenness", data.toneEvenness)}
      </div>
      {Array.isArray(data.notes) && data.notes.length > 0 && (
        <div className="text-xs text-white/70">
          Notes: {data.notes.join("; ")}
        </div>
      )}
    </div>
  );
}