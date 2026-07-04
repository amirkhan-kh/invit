import React from 'react';
import './_premium-template.scss';
import { type TemplateProps, parseWeddingDate } from '../../types/invitation.types';
import { useBackgroundMusic } from '../../shared/useBackgroundMusic';
import MusicToggle from '../../shared/MusicToggle';
import MapButton from '../../shared/MapButton';
import PhotoGallery from '../../shared/PhotoGallery';
import Countdown from '../../shared/Countdown';
import Reveal from '../../shared/Reveal';
import { OrnamentDivider, CornerFlourish } from '../../shared/Ornament';
import { HiOutlineChevronDown } from 'react-icons/hi';

const MUSIC_SRC = '/audio/wedding-premium.mp3';

// Suzuvchi oltin zarrachalar (deterministik)
const particles = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 5) % 100,
  duration: 9 + (i % 8),
  delay: (i % 10) * 0.9,
  size: 2 + (i % 3),
  key: i,
}));

const PremiumTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { audioRef, isPlaying, toggle } = useBackgroundMusic(MUSIC_SRC);
  const parsed = parseWeddingDate(data.date);
  const heroPhoto = data.photos && data.photos[0];

  return (
    <div className="tpl-premium">
      <audio ref={audioRef} src={MUSIC_SRC} preload="auto" loop playsInline style={{ display: 'none' }} />
      <MusicToggle isPlaying={isPlaying} onToggle={toggle} accent="#e7cfa6" />

      {/* ===== HERO ===== */}
      <section className="pr-hero">
        {heroPhoto && (
          <div className="pr-hero-photo" style={{ backgroundImage: `url(${heroPhoto})` }} />
        )}
        <div className="pr-hero-veil" />
        {particles.map((p) => (
          <span
            key={p.key}
            className="pr-particle"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
        <div className="pr-hero-inner">
          <div className="pr-pretitle">Taklifnoma · {data.date}</div>
          <div className="pr-names">{data.husband}</div>
          <div className="pr-amp">&</div>
          <div className="pr-names">{data.wife}</div>
          <div className="pr-date">{parsed.weekday ? parsed.weekday.toUpperCase() : ''}</div>
        </div>
        <div className="pr-scroll">
          <HiOutlineChevronDown size={26} />
        </div>
      </section>

      {/* ===== Taklif matni ===== */}
      <section className="pr-section">
        <CornerFlourish className="pr-corner tl" color="#c9a36b" />
        <CornerFlourish className="pr-corner br" color="#c9a36b" />
        <Reveal variant="up">
          <OrnamentDivider color="#c9a36b" />
          <h2 className="pr-heading">Hurmatli Mehmon</h2>
          <p className="pr-text">
            {data.inviteText ||
              "Hayotimizning eng go'zal kunida sizni yonimizda ko'rishni istaymiz. Bu qutlug' onlarni biz bilan birga baham ko'rishingizni so'raymiz."}
          </p>
          <p className="pr-signature">
            {data.husband} & {data.wife}
          </p>
        </Reveal>
      </section>

      {/* ===== Countdown ===== */}
      <Reveal className="pr-section pt-0" variant="zoom">
        <p className="text-center mb-6 tracking-[6px] uppercase text-[12px] text-[#c9a36b]">
          Baxtli kungacha
        </p>
        <Countdown target={parsed.dateObj} accent="#e7cfa6" labelColor="#a8977f" />
      </Reveal>

      {/* ===== Sana ===== */}
      <Reveal className="pr-section pt-0" variant="up">
        <OrnamentDivider color="#c9a36b" width={130} />
        {parsed.monthName && (
          <p className="text-center my-5 tracking-[4px] uppercase text-sm text-[#b9ad97]">
            {parsed.weekday}, {parsed.monthName} {parsed.year}
          </p>
        )}
        <div className="pr-datebox">
          <div className="u">
            <span>{parsed.day}</span>
            <span>Kun</span>
          </div>
          <div className="d" />
          <div className="u">
            <span>{parsed.month}</span>
            <span>Oy</span>
          </div>
          <div className="d" />
          <div className="u">
            <span>{parsed.year}</span>
            <span>Yil</span>
          </div>
        </div>
      </Reveal>

      {/* ===== Rasmlar (bo'lsa) ===== */}
      {data.photos && data.photos.length > 0 && (
        <Reveal className="pt-2 pb-4" variant="fade">
          <p className="text-center mb-3 tracking-[5px] uppercase text-[12px] text-[#c9a36b]">
            Biz haqimizda
          </p>
          <PhotoGallery photos={data.photos} accent="#c9a36b" />
        </Reveal>
      )}

      {/* ===== Manzil ===== */}
      <section className="pr-section">
        <Reveal variant="up">
          <OrnamentDivider color="#c9a36b" width={130} />
          <div className="pr-venue mt-6">
            {data.venueName && <p className="vn">{data.venueName}</p>}
            {data.address && <p className="va">{data.address}</p>}
            <MapButton mapLink={data.mapLink} bg="#c9a36b" color="#0e1512" label="Xaritada ochish" />
          </div>
        </Reveal>
      </section>

      {/* ===== Footer ===== */}
      <footer className="pr-footer">
        <OrnamentDivider color="#c9a36b" width={110} />
        <p className="fn mt-5">
          {data.husband} & {data.wife}
        </p>
        <p className="fd">SIZNI INTIQLIK BILAN KUTAMIZ</p>
      </footer>
    </div>
  );
};

export default PremiumTemplate;
