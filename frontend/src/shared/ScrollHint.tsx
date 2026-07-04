import { useEffect, useState, type CSSProperties } from 'react';
import './ScrollHint.scss';

interface Props {
  /** Ranng (shablon accent rangi) */
  accent?: string;
  /** Ostidagi yozuv */
  label?: string;
}

/**
 * Nafis "pastga suring" indikatori — ekran pastida suzib turadi,
 * foydalanuvchi biroz scroll qilishi bilan asta g'oyib bo'ladi.
 * Barcha shablonlar uchun umumiy.
 */
export default function ScrollHint({ accent = '#c9a36b', label = 'Pastga suring' }: Props) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) setGone(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`scroll-hint${gone ? ' scroll-hint--gone' : ''}`}
      style={{ '--sh-accent': accent } as CSSProperties}
      aria-hidden="true"
    >
      <div className="scroll-hint__inner">
        <span className="scroll-hint__label">{label}</span>
        <span className="scroll-hint__mouse">
          <span className="scroll-hint__dot" />
        </span>
        <span className="scroll-hint__chev" />
      </div>
    </div>
  );
}
