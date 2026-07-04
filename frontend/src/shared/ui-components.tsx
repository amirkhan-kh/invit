import React from 'react';
import './ui-components.scss';

// Bitta SVG kapalak (gradient qanotlar bilan)
const ButterflySVG: React.FC<{ size?: number; color?: string; color2?: string }> = ({
  size = 26,
  color = '#c9a36b',
  color2 = '#e7cfa6',
}) => {
  const gid = `bf-${color.replace('#', '')}-${color2.replace('#', '')}`;
  return (
    <svg
      className="bf-svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color2} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      {/* Chap qanotlar */}
      <g className="bf-wing left">
        <path
          d="M50 50 C 20 10, 0 30, 12 48 C 2 55, 15 75, 50 50 Z"
          fill={`url(#${gid})`}
          opacity="0.95"
        />
      </g>
      {/* O'ng qanotlar */}
      <g className="bf-wing right">
        <path
          d="M50 50 C 80 10, 100 30, 88 48 C 98 55, 85 75, 50 50 Z"
          fill={`url(#${gid})`}
          opacity="0.95"
        />
      </g>
      {/* Tana */}
      <ellipse cx="50" cy="50" rx="2.4" ry="14" fill={color} />
      <circle cx="50" cy="35" r="3" fill={color} />
    </svg>
  );
};

// Ekran bo'ylab uchib yuruvchi kapalaklar (medium intro uchun asosiy)
const Butterflies: React.FC = () => {
  return (
    <div className="bf-wrap bf-fly-1" style={{ top: 0, left: 0 }}>
      <ButterflySVG size={30} color="#c9a36b" color2="#f0dcb8" />
    </div>
  );
};

// Ikkinchi kapalak (boshqa yo'nalishda uchadi)
export const Butterfliess: React.FC = () => {
  return (
    <div className="bf-wrap bf-fly-2" style={{ top: 0, left: 0 }}>
      <ButterflySVG size={22} color="#b8905a" color2="#e7cfa6" />
    </div>
  );
};

// Markazda tabiiy uchib yuruvchi kapalaklar to'dasi (infinite orbit).
// count — nechta kapalak. Har biri turli yo'l, o'lcham, rang va tezlikda uchadi.
export const ButterflyField: React.FC<{ count?: number }> = ({ count = 6 }) => {
  const defs = [
    { size: 30, color: '#c9a36b', color2: '#f0dcb8', path: 1, dur: 15, delay: 0 },
    { size: 22, color: '#b8905a', color2: '#e7cfa6', path: 2, dur: 19, delay: 1.6 },
    { size: 27, color: '#caa46c', color2: '#f5e6c8', path: 3, dur: 13, delay: 0.8 },
    { size: 18, color: '#a9814e', color2: '#e7cfa6', path: 4, dur: 21, delay: 3.1 },
    { size: 24, color: '#c9a36b', color2: '#f0dcb8', path: 2, dur: 17, delay: 2.2 },
    { size: 20, color: '#b8905a', color2: '#f5e6c8', path: 1, dur: 23, delay: 4.3 },
    { size: 26, color: '#caa46c', color2: '#e7cfa6', path: 3, dur: 20, delay: 5.5 },
    { size: 16, color: '#a9814e', color2: '#f0dcb8', path: 4, dur: 16, delay: 6.4 },
  ];
  const items = defs.slice(0, Math.min(count, defs.length));
  return (
    <div className="bf-field">
      {items.map((b, i) => (
        <div
          key={i}
          className={`bf-node bf-orbit-${b.path}`}
          style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
        >
          <ButterflySVG size={b.size} color={b.color} color2={b.color2} />
        </div>
      ))}
    </div>
  );
};

// Yaltiroq zarrachalar to'plami (bezak uchun) — har qanday shablonda ishlatsa bo'ladi
export const Sparkles: React.FC<{ count?: number }> = ({ count = 14 }) => {
  // Deterministik joylashuv (Math.random ishlatmasdan)
  const items = Array.from({ length: count }, (_, i) => {
    const top = (i * 37) % 100;
    const left = (i * 53 + 11) % 100;
    const size = 3 + (i % 4);
    const delay = (i % 5) * 0.4;
    return { top, left, size, delay, key: i };
  });
  return (
    <>
      {items.map((s) => (
        <span
          key={s.key}
          className="sparkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </>
  );
};

export { ButterflySVG };
export default Butterflies;
