import React from 'react';
import { AnalysisScore } from '../types';

interface AnalysisCardProps {
  score: AnalysisScore;
}

export default function AnalysisCard({ score }: AnalysisCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 8) return 'text-emerald-400';
    if (value >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (value: number) => {
    if (value >= 8) return 'bg-emerald-500';
    if (value >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">{score.category}</h3>
        <span className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
          {score.score}/10
        </span>
      </div>
      
      <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(score.score)}`}
          style={{ width: `${score.score * 10}%` }}
        />
      </div>
      
      <p className="text-slate-300 text-sm leading-relaxed">{score.feedback}</p>
    </div>
  );
}