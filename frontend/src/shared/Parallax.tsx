import React, { useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
  /** Scroll sezgirligi: 0.1 yumshoq, 0.35 sezilarli */
  strength?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Yengil parallax qatlami — scroll bo'yicha translateY.
 * Mobil uchun past strength tavsiya etiladi.
 */
const Parallax: React.FC<Props> = ({ children, strength = 0.18, className = '', style }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        // Element viewport markaziga qancha yaqin
        const offset = (rect.top + rect.height / 2 - vh / 2) * strength;
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`mx-parallax ${className}`} style={style}>
      {children}
    </div>
  );
};

export default Parallax;
