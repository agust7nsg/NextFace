import React from 'react';
import { PersonalizedRecommendation } from '../types';

interface RecommendationCardProps {
  recommendation: PersonalizedRecommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">{recommendation.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(recommendation.priority)}`}>
          {recommendation.priority}
        </span>
      </div>
      
      <p className="text-slate-300 text-sm mb-4 leading-relaxed">{recommendation.description}</p>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-slate-400 text-xs">Time</p>
          <p className="text-white font-medium text-sm">{recommendation.time}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Cost</p>
          <p className="text-white font-medium text-sm">{recommendation.cost}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Difficulty</p>
          <p className="text-white font-medium text-sm">{recommendation.difficulty}</p>
        </div>
      </div>
    </div>
  );
}