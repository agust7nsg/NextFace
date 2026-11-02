import React from 'react';
import { CelebrityMatch } from '../types';

interface CelebrityMatchCardProps {
  match: CelebrityMatch;
}

export default function CelebrityMatchCard({ match }: CelebrityMatchCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 65) return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">{match.name}</h3>
        <span className={`text-xl font-bold ${getScoreColor(match.similarity)}`}>
          {match.similarity}% Similarity
        </span>
      </div>
      
      <div className="mb-3">
        <span className="text-yellow-400 font-medium text-sm">Reason: </span>
        <span className="text-slate-300 text-sm">{match.reason}</span>
      </div>
    </div>
  );
}