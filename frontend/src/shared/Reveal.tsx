import React, { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  // Animatsiya turi
  variant?: 'up' | 'left' | 'right' | 'zoom' | 'fade';
  delay?: number; // ms
  once?: boolean;
}

const base: Record<NonNullable<Props['variant']>, React.CSSProperties> = {
  up: { transform: 'translateY(40px)' },
  left: { transform: 'translateX(-40px)' },
  right: { transform: 'translateX(40px)' },
  zoom: { transform: 'scale(0.9)' },
  fade: {},
};

/**
 * Scroll qilib ko'rinish maydoniga kirganda elementni yumshoq animatsiya bilan
 * ko'rsatadi. Barcha shablonlarda qayta ishlatiladi.
 */
const Reveal: React.FC<Props> = ({
  children,
  className = '',
  variant = 'up',
  delay = 0,
  once = true,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) obs.unobserve(entry.target);
        } else if (!once) {
          setShown(false);
        }
      },
      { rootMargin: '-10% 0px -10% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        ...(shown ? { transform: 'none' } : base[variant]),
        transition: `opacity 0.9s ease-out ${delay}ms, transform 0.9s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default Reveal;
