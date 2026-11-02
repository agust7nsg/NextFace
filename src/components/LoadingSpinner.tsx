import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { tr } from '../contexts/LanguageContext';

interface LoadingSpinnerProps {
  message?: string;
  imageSrc?: string | null;
}

const analysisSteps = [
  () => tr('Analyzing skin health…', 'Analizando la salud de la piel…'),
  () => tr('Measuring the jawline…', 'Midiendo la mandíbula…'),
  () => tr('Mapping facial landmarks…', 'Mapeando rasgos faciales…'),
  () => tr('Scoring the eye area…', 'Evaluando el área de los ojos…'),
  () => tr('Evaluating symmetry…', 'Evaluando la simetría…'),
  () => tr('Computing golden-ratio match…', 'Calculando la proporción áurea…'),
  () => tr('Preparing the overall report…', 'Preparando el reporte general…')
];

export default function LoadingSpinner({ message, imageSrc }: LoadingSpinnerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % analysisSteps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-white bg-gradient-to-br from-black via-slate-950 to-black relative">
      {/* Soft blue radial glow behind ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Glowing Ring */}
        <div className="relative mb-8">
          {/* Outer rotating ring */}
          <div className="w-48 h-48 rounded-full animate-spin-slow relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 p-1 shadow-[0_0_60px_#0ea5e980]">
              <div className="w-full h-full rounded-full bg-slate-900"></div>
            </div>
          </div>
          
          {/* Inner content */}
          <div className="absolute inset-4 rounded-full bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center overflow-hidden">
            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt={tr('Analyzing', 'Analizando')}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Sparkles className="w-16 h-16 text-cyan-400 animate-pulse" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white" style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
          {tr('AI Processing', 'Procesamiento con IA')}
        </h2>



        {/* Progress Bar */}
        <div className="w-full max-w-xl mb-6">
          <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-progress"></div>
          </div>
        </div>

        {/* Cycling Step Text */}
        <div className="text-center">
          <p className="text-slate-300 text-lg font-medium mb-2 transition-opacity duration-300">
            {analysisSteps[currentStepIndex]()}
          </p>
          
          {/* Subtext note */}
          <p className="text-xs text-slate-400 max-w-sm">
            {tr('Most analyses complete in 1–2 minutes. Please wait.', 'La mayoría de los análisis se completan en 1–2 minutos. Por favor espera.')}
          </p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}