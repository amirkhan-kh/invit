import React, { useEffect, useRef, useState } from 'react';

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade' | 'blur' | '3d';

interface Props {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number; // ms
  once?: boolean;
}

/**
 * Scroll-triggered entrance reveal.
 * Premium motion: ease-out decelerate, ~900ms, optional blur/3D.
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

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) obs.unobserve(entry.target);
        } else if (!once) {
          setShown(false);
        }
      },
      { rootMargin: '-8% 0px -8% 0px', threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const classes = ['mx-reveal', `mx-reveal--${variant}`, shown ? 'is-in' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
};

export default Reveal;
