import React, { useEffect, useState } from 'react';

interface Props {
  /** Minimal ko'rinish vaqti (ms) — flash oldini olish */
  minMs?: number;
  label?: string;
}

/**
 * Premium silliq loader — oltin ring + yurak nafas.
 * Mount bo'lgach minMs kutib, keyin yumshoq fade-out.
 */
const PageLoader: React.FC<Props> = ({ minMs = 700, label = 'baxt.uz' }) => {
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), minMs);
    return () => window.clearTimeout(t);
  }, [minMs]);

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setGone(true), 600);
    return () => window.clearTimeout(t);
  }, [done]);

  if (gone) return null;

  return (
    <div className={`mx-loader${done ? ' is-done' : ''}`} role="status" aria-live="polite">
      <div style={{ position: 'relative', width: 56, height: 56, margin: '0 auto' }}>
        <div className="mx-loader-ring" />
        <span className="mx-loader-heart" aria-hidden>
          ♥
        </span>
      </div>
      <div className="mx-loader-label">{label}</div>
      <div className="mx-loader-dots" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
};

export default PageLoader;
