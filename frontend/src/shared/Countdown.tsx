import React, { useEffect, useState } from 'react';

interface Props {
  target: Date | null;
  accent?: string;
  labelColor?: string;
}

function diff(target: Date | null) {
  if (!target) return { d: 0, h: 0, m: 0, s: 0, done: true };
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s, done: false };
}

// To'y sanasigacha qolgan vaqt (kun / soat / daqiqa / soniya)
const Countdown: React.FC<Props> = ({ target, accent = '#c9a36b', labelColor = '#9a8b78' }) => {
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target) return null;

  const items = [
    { v: t.d, l: 'Kun' },
    { v: t.h, l: 'Soat' },
    { v: t.m, l: 'Daqiqa' },
    { v: t.s, l: 'Soniya' },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className="grid place-content-center rounded-2xl text-2xl font-bold"
            style={{
              width: 60,
              height: 64,
              color: '#3a2c14',
              background: 'rgba(255,255,255,0.96)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.22)',
              border: `1.5px solid ${accent}`,
            }}
          >
            {String(it.v).padStart(2, '0')}
          </div>
          <span
            className="mt-1.5 text-[11px] tracking-widest uppercase font-medium"
            style={{ color: labelColor }}
          >
            {it.l}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
