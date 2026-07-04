import React from 'react';
import { Date as DateSection, Intro, IntroWish, Timing } from '../sections/medium';
import type { TemplateProps } from '../../types/invitation.types';
import { useBackgroundMusic } from '../../shared/useBackgroundMusic';
import MusicToggle from '../../shared/MusicToggle';
import PhotoGallery from '../../shared/PhotoGallery';

// Fon musiqasi manzili — o'z trekingizni public/audio/ ga tashlab, shu yo'lni yozing
const MUSIC_SRC = '/audio/wedding-medium.mp3';

const MediumTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { audioRef, isPlaying, toggle } = useBackgroundMusic(MUSIC_SRC);

  return (
    <main className="relative">
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        preload="auto"
        loop
        playsInline
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />

      <MusicToggle isPlaying={isPlaying} onToggle={toggle} accent="#c9a36b" />

      <Intro data={data} />
      <IntroWish data={data} />

      {/* Qo'shimcha rasmlar bo'lsa — galereya ochiladi, bo'lmasa hech narsa chizilmaydi */}
      {data.photos && data.photos.length > 0 && (
        <section className="bg-[#faf6ef] py-4">
          <PhotoGallery photos={data.photos} accent="#c9a36b" />
        </section>
      )}

      <DateSection data={data} />
      <Timing data={data} />

      <footer className="bg-[#3f5c74] text-center py-8 text-white/90">
        <p className="font-script text-3xl text-[#e7cfa6]">
          {data.husband} & {data.wife}
        </p>
        <p className="text-xs tracking-[3px] mt-1">{data.date}</p>
      </footer>
    </main>
  );
};

export default MediumTemplate;
