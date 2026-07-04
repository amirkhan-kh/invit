import React from 'react';
import './_standart-template.scss';
import { type TemplateProps, parseWeddingDate } from '../../types/invitation.types';
import { useBackgroundMusic } from '../../shared/useBackgroundMusic';
import MusicToggle from '../../shared/MusicToggle';
import MapButton from '../../shared/MapButton';
import PhotoGallery from '../../shared/PhotoGallery';
import Countdown from '../../shared/Countdown';
import Reveal from '../../shared/Reveal';
import ScrollHint from '../../shared/ScrollHint';

const MUSIC_SRC = '/audio/wedding-standard.m4a';

// Deterministik gulbarglar (Math.random ishlatmasdan)
const petals = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 41 + 7) % 100,
  duration: 7 + (i % 5),
  delay: (i % 6) * 1.1,
  key: i,
}));

const StandardTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { audioRef, isPlaying, toggle } = useBackgroundMusic(MUSIC_SRC);
  const parsed = parseWeddingDate(data.date);

  return (
    <div className="tpl-standard">
      <audio ref={audioRef} src={MUSIC_SRC} preload="auto" loop playsInline style={{ display: 'none' }} />
      <MusicToggle isPlaying={isPlaying} onToggle={toggle} accent="#7f8f6e" />
      <ScrollHint accent="#7f8f6e" />

      {/* HERO */}
      <section className="std-hero">
        {petals.map((p) => (
          <span
            key={p.key}
            className="petal"
            style={{ left: `${p.left}%`, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}
          />
        ))}
        <div className="std-hero-inner">
          <div className="std-label">Taklifnoma</div>
          <div className="std-mono">
            {data.husband?.[0]}
            {data.wife?.[0]}
          </div>
          <div className="std-names">
            {data.husband}
            <div className="std-amp">&</div>
            {data.wife}
          </div>
          <div className="std-date">{data.date}</div>
        </div>
      </section>

      {/* Taklif matni */}
      <Reveal className="std-section" variant="up">
        <div className="std-divider" />
        <h2 className="std-heading">Hurmatli Mehmon!</h2>
        <p className="std-text">
          {data.inviteText ||
            "Sizni farzandlarimizning to'y marosimiga taklif qilamiz. Ishtirokingiz biz uchun katta baxt."}
        </p>
        <p className="text-center mt-6 font-script text-2xl text-[#c9a36b]">
          {data.husband} & {data.wife}
        </p>
      </Reveal>

      {/* Countdown */}
      <Reveal className="std-section pt-0" variant="zoom">
        <p className="text-center mb-5 tracking-[4px] uppercase text-sm text-[#a8977f]">
          To'yga qoldi
        </p>
        <Countdown target={parsed.dateObj} accent="#7f8f6e" />
      </Reveal>

      {/* Sana */}
      <Reveal className="std-section pt-0" variant="up">
        {parsed.monthName && (
          <p className="text-center mb-5 tracking-[3px] uppercase text-sm text-[#a8977f]">
            {parsed.weekday}, {parsed.monthName} {parsed.year}
          </p>
        )}
        <div className="std-bigdate">
          <div className="unit">
            <span>{parsed.day}</span>
            <span>Kun</span>
          </div>
          <div className="sep" />
          <div className="unit">
            <span>{parsed.month}</span>
            <span>Oy</span>
          </div>
          <div className="sep" />
          <div className="unit">
            <span>{parsed.year}</span>
            <span>Yil</span>
          </div>
        </div>
      </Reveal>

      {/* Rasmlar (bo'lsa) */}
      {data.photos && data.photos.length > 0 && (
        <Reveal variant="fade">
          <PhotoGallery photos={data.photos} accent="#a8bb9a" />
        </Reveal>
      )}

      {/* Manzil */}
      <Reveal className="std-section" variant="up">
        <div className="std-divider" />
        <div className="std-venue">
          {data.venueName && <p className="vname">{data.venueName}</p>}
          {data.address && <p className="vaddr">{data.address}</p>}
          <MapButton mapLink={data.mapLink} bg="#7f8f6e" color="#ffffff" />
        </div>
      </Reveal>

      {/* Footer */}
      <footer className="std-footer">
        <p className="fnames">
          {data.husband} & {data.wife}
        </p>
        <p className="text-xs tracking-[3px] mt-2 opacity-90">SIZNI KUTIB QOLAMIZ</p>
      </footer>
    </div>
  );
};

export default StandardTemplate;
