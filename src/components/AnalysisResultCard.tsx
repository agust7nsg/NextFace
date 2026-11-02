import React from 'react';
import { Calendar, Star, Eye, Trash2, Share } from 'lucide-react';
import { StoredAnalysis } from '../lib/database';

interface AnalysisResultCardProps {
  analysis: StoredAnalysis;
  onDelete?: (id: string) => void;
  onView?: (analysis: StoredAnalysis) => void;
  onNavigate?: (page: string, analysisData?: any) => void;
}

export default function AnalysisResultCard({ analysis, onDelete, onView }: AnalysisResultCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 8) return 'from-emerald-500 to-emerald-400';
    if (score >= 6) return 'from-yellow-500 to-yellow-400';
    return 'from-blue-500 to-blue-400';
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 hover:scale-102 animate-fade-in group">
      {/* Profile Image with Blue Gradient Circle */}
      {analysis.image_url && (
        <div className="text-center mb-6 animate-scale-in">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 p-1 shadow-lg shadow-cyan-500/40 relative">
              <img 
                src={analysis.image_url}
                alt="Analyzed face"
                className="w-full h-full rounded-full object-cover relative z-10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {!analysis.image_url && (
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-white font-semibold">Facial Analysis</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(analysis.created_at)}</span>
            </div>
          </div>
        </div>
        
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
            {analysis.overall_score}/10
          </div>
          <div className="text-slate-400 text-xs">Overall</div>
        </div>
      </div>

      {/* Score Preview */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">Score Breakdown</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">
              {analysis.scores.length} features analyzed
            </span>
          </div>
        </div>
        
        {/* Mini score bars */}
        <div className="grid grid-cols-3 gap-2">
          {analysis.scores.slice(0, 3).map((score: any, index: number) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-2">
              <div className="text-white text-xs font-medium mb-1 truncate">
                {score.category}
              </div>
              <div className="w-full bg-slate-600 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full bg-gradient-to-r ${getScoreGradient(score.score)} transition-all duration-500`}
                  style={{ width: `${score.score * 10}%` }}
                />
              </div>
              <div className={`text-xs font-bold mt-1 ${getScoreColor(score.score)}`}>
                {score.score}/10
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
        <button
          onClick={() => onView?.(analysis)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 hover:scale-105"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-600/50 hover:text-white transition-all duration-200">
            <Share className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(analysis.id)}
              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}