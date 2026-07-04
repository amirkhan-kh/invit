import { useEffect, useRef, useState } from 'react';
import './_style.scss';

const DEFAULT_TIMINGS = [
  { time: '07:00', label: 'Nahorgi Osh' },
  { time: '11:00', label: 'Kunduzgi Bazm' },
  { time: '18:00', label: 'Kechki Bazm' },
];

const Timing = ({ data = {} }) => {
  const lineRef = useRef(null);
  const wrapperRef = useRef(null);
  const [textVisible, setTextVisible] = useState(false);

  const wishRef = useRef(null);
  const [wishVisible, setWishVisible] = useState(false);

  const endRef = useRef(null);

  const timings = data.timings && data.timings.length ? data.timings : DEFAULT_TIMINGS;
  const footerWish =
    data.footerWish ||
    "Siz aziz mehmonlarni samimiyat va iliqlik bilan kutib olamiz. Bu kunimiz siz bilan yanada go'zal va esda qolarli bo'lishiga ishonamiz.";
  const endPhoto = data.photos && data.photos[2];

  const handleScroll = () => {
    if (lineRef.current && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const start = window.innerHeight * 0.2;
      const end = window.innerHeight * 0.8;
      let progress = (window.innerHeight - rect.top - start) / (end - start);
      progress = Math.min(Math.max(progress, 0), 1);
      lineRef.current.style.transform = `rotate(45deg) scaleY(${progress})`;
      if (progress > 0.8) setTextVisible(true);
    }
    if (wishRef.current) {
      const rect = wishRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) setWishVisible(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!endRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '-10% 0px -10% 0px' }
    );
    observer.observe(endRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="timing" className="min-h-screen overflow-hidden">
      <div className="diagonal-wrapper" ref={wrapperRef}>
        <div ref={lineRef} className="diagonal-line"></div>
        <div className={`textTiming ${textVisible ? 'animateText' : ''}`}>
          {timings.map((t, i) => (
            <p key={i}>
              {t.time} <span>{t.label}</span>
            </p>
          ))}
        </div>
      </div>

      <div ref={wishRef} className={`wishTiming py-6 ${wishVisible ? 'animateWish' : ''}`}>
        <p className="leading-0">Tilaklar</p>
        <div className="pImg -translate-y-6 grid place-content-center h-full px-12">
          <p>{footerWish}</p>
        </div>
      </div>

      <div ref={endRef} className="endSec grid place-content-center text-center gap-8">
        <p>SIZNI INTIQLIK BILAN KUTAMIZ!</p>
        {endPhoto ? (
          <img className="w-full h-32 object-cover rounded-full" src={endPhoto} alt="" />
        ) : (
          <div className="endDeco" />
        )}
      </div>
    </section>
  );
};

export default Timing;
