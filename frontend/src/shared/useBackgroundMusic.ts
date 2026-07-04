import { useEffect, useRef, useState } from 'react';

/**
 * Fon musiqasi hook'i — barcha shablonlar uchun umumiy.
 *
 * Brauzer siyosati: OVOZLI avtoijro faqat foydalanuvchi biror harakat
 * qilgach (bosish / teginish / skroll) ruxsat etiladi. Shuning uchun:
 *   1) sahifa ochilishida musiqani OVOZSIZ (muted) avtomatik boshlaymiz;
 *   2) foydalanuvchining BIRINCHI harakatida ovozni yoqib, asta kuchaytiramiz.
 * Natijada foydalanuvchi tugmani bosmasa ham, sahifaga kirib biror harakat
 * qilishi bilan (odatda darhol skroll qiladi) musiqa jaranglaydi.
 *
 * Qaytaradi: { audioRef, isPlaying, toggle }.
 */
export function useBackgroundMusic(src?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const startedRef = useRef(false);
  const TARGET_VOL = 0.6;

  const fadeIn = (audio: HTMLAudioElement) => {
    audio.volume = 0;
    let v = 0;
    const iv = setInterval(() => {
      v += 0.04;
      if (v >= TARGET_VOL) {
        v = TARGET_VOL;
        clearInterval(iv);
      }
      audio.volume = Math.min(v, TARGET_VOL);
    }, 90);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    audio.loop = true;

    // 1) Ovozsiz avtoijro (brauzerlar ruxsat beradi) — musiqa "tayyor" turadi
    audio.muted = true;
    audio.volume = TARGET_VOL;
    audio.play().catch(() => {});

    // 2) Birinchi HAR QANDAY harakatda ovozni yoqamiz
    const events: (keyof WindowEventMap)[] = [
      'pointerdown',
      'touchstart',
      'click',
      'keydown',
      'scroll',
      'wheel',
    ];

    const onFirst = () => {
      const a = audioRef.current;
      if (!a || startedRef.current) return;
      a.muted = false;
      a
        .play()
        .then(() => {
          startedRef.current = true;
          setIsPlaying(true);
          fadeIn(a);
          events.forEach((e) => window.removeEventListener(e, onFirst));
        })
        .catch(() => {
          // Hali ruxsat yo'q — keyingi (haqiqiy) harakatni kutamiz
          a.muted = true;
        });
    };

    events.forEach((e) => window.addEventListener(e, onFirst, { passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, onFirst));
    };
  }, [src]);

  // Sahifadan chiqilganda to'xtatish
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Qo'lda yoqish/o'chirish tugmasi uchun
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused || audio.muted) {
      audio.muted = false;
      audio
        .play()
        .then(() => {
          startedRef.current = true;
          setIsPlaying(true);
          fadeIn(audio);
        })
        .catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return { audioRef, isPlaying, toggle };
}
