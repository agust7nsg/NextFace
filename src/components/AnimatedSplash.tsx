import { useState, useEffect } from 'react';

interface AnimatedSplashProps {
  onComplete: () => void;
}

export default function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const [phase, setPhase] = useState<'initial' | 'next' | 'face' | 'shimmer' | 'fadeOut'>('initial');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('next'), 200),
      setTimeout(() => setPhase('face'), 700),
      setTimeout(() => setPhase('shimmer'), 1100),
      setTimeout(() => setPhase('fadeOut'), 1900),
      setTimeout(() => onComplete(), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const showNext = phase !== 'initial';
  const showFace = ['face', 'shimmer', 'fadeOut'].includes(phase);
  const shimmerActive = ['shimmer', 'fadeOut'].includes(phase);
  const fading = phase === 'fadeOut';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ease-out ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#080d1a' }}
    >
      <div className="relative flex items-baseline select-none">
        {/* "Next" with gradient */}
        <span
          className={`text-5xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent transition-all duration-500 ease-out ${
            showNext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Next
        </span>

        {/* "Face" in white */}
        <span
          className={`text-5xl sm:text-6xl font-bold text-white transition-all duration-500 ease-out ${
            showFace ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Face
        </span>

        {/* Shimmer overlay */}
        {shimmerActive && (
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ maskImage: 'linear-gradient(to right, transparent, black, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)' }}
          >
            <div className="absolute inset-0 splash-shimmer" />
          </div>
        )}
      </div>

      {/* Glow effect behind text */}
      <div
        className={`absolute w-64 h-64 rounded-full transition-opacity duration-1000 ease-out ${
          showNext ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Tagline */}
      <p
        className={`mt-6 text-sm tracking-[0.2em] uppercase text-slate-500 transition-all duration-500 ease-out ${
          showFace ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        AI Face Analysis
      </p>
    </div>
  );
}
