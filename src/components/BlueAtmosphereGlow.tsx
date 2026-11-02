import type { CSSProperties } from 'react';

interface BlueAtmosphereGlowProps {
  style?: CSSProperties;
}

export default function BlueAtmosphereGlow({ style }: BlueAtmosphereGlowProps) {
  return (
    <div className="pointer-events-none absolute left-0 right-0 h-96" style={style} aria-hidden="true">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-bl from-cyan-400/15 via-blue-500/8 to-transparent rounded-full blur-2xl" />
    </div>
  );
}
