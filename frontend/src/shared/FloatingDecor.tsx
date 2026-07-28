import React from 'react';

type Tone = 'gold' | 'soft' | 'rose';

interface HeartDef {
  left: number;
  size: number;
  duration: number;
  delay: number;
  tone: Tone;
}

/** Deterministik yuraklar — Math.random yo'q (SSR/hydration xavfsiz) */
function makeHearts(count: number): HeartDef[] {
  return Array.from({ length: count }, (_, i) => ({
    left: (i * 37 + 9) % 96,
    size: 10 + (i % 5) * 3,
    duration: 11 + (i % 7),
    delay: (i % 9) * 1.15,
    tone: (['gold', 'soft', 'rose'] as Tone[])[i % 3],
  }));
}

interface FloatingHeartsProps {
  count?: number;
  className?: string;
}

/** Ambient sevgili yuraklar — landing va barcha shablonlar uchun */
export const FloatingHearts: React.FC<FloatingHeartsProps> = ({ count = 10, className = '' }) => {
  const hearts = makeHearts(count);
  return (
    <div className={`mx-float-field ${className}`} aria-hidden>
      {hearts.map((h, i) => (
        <span
          key={i}
          className={`mx-heart mx-heart--${h.tone}`}
          style={{
            left: `${h.left}%`,
            fontSize: h.size,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
};

interface SparksProps {
  count?: number;
  className?: string;
}

/** Yaltiroq zarrachalar (deterministik) */
export const MotionSparks: React.FC<SparksProps> = ({ count = 18, className = '' }) => {
  const items = Array.from({ length: count }, (_, i) => ({
    top: (i * 37 + 6) % 96,
    left: (i * 53 + 9) % 98,
    size: 2 + (i % 4),
    delay: (i % 7) * 0.4,
  }));
  return (
    <div className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} aria-hidden>
      {items.map((s, i) => (
        <span
          key={i}
          className="mx-spark"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingHearts;
