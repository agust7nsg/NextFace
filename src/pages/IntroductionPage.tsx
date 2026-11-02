import React from 'react';
import { tr } from '../contexts/LanguageContext';

interface IntroductionPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function IntroductionPage({ onGetStarted, onSignIn }: IntroductionPageProps) {
  const handleSwipe = (e: React.TouchEvent | React.MouseEvent) => {
    // For now, we'll trigger on touch/click, but this could be enhanced with actual swipe detection
    onGetStarted();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden flex flex-col">
      {/* === Space-like Background (from beta) === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circular rings */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full border border-cyan-500/10 animate-pulse-slow"></div>
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full border border-blue-500/10 animate-spin-slow"></div>

        {/* Glowing dots */}
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-cyan-400/40 rounded-full blur-[2px] animate-float"></div>
        <div className="absolute top-2/3 left-3/4 w-1.5 h-1.5 bg-blue-400/30 rounded-full blur-[1px] animate-float-delayed"></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-cyan-300/30 rounded-full blur-[3px] animate-float-slow"></div>
      </div>

      {/* Blue gradient overlay in top right */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-bl from-cyan-400/15 via-blue-500/8 to-transparent rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 py-12 relative z-10">
        {/* Phone Mockup */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src="https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/phone-mockup.png"
            alt="NextFace AI phone mockup"
            className="w-56 h-auto shadow-2xl"
          />
        </div>

        {/* Text content */}
        <div className="text-center mb-16 max-w-sm">
          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            {tr('Take your face to the next level with', 'Lleva tu rostro al siguiente nivel con')}{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent">
              NextFace
            </span>
          </h1>
        </div>

        {/* Get Started button */}
        <div className="w-full">
          <button
            onClick={handleSwipe}
            onTouchEnd={handleSwipe}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center relative overflow-hidden group text-lg"
          >
            <span>{tr('Get Started', 'Empezar')}</span>
          </button>
          
          {/* Sign in link */}
          <div className="text-center mt-4">
            <span className="text-slate-400">{tr('Already have an account?', '¿Ya tienes una cuenta?')} </span>
            <button
              onClick={onSignIn}
              className="text-cyan-400 font-semibold underline hover:text-cyan-300 transition-colors"
            >
              {tr('Sign in', 'Iniciar sesión')}
            </button>
          </div>
        </div>
      </div>

      {/* === Animations === */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 6s ease-in-out infinite 1s;
        }

        .animate-float-slow {
          animation: float 8s ease-in-out infinite 0.5s;
        }
      `}</style>
    </div>
  );
}
