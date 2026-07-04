import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

/**
 * Fon musiqasi hook'i — barcha shablonlar uchun umumiy.
 * Brauzer autoplay cheklovini aylanib o'tadi: foydalanuvchi sahifaga
 * tekkanidan va biroz scroll qilganidan so'ng musiqa asta jaranglaydi.
 *
 * Qaytaradi: { audioRef, isPlaying, toggle } — audio elementga ref,
 * ijro holati va qo'lda yoqib/o'chirish tugmasi uchun toggle.
 */
export function useBackgroundMusic(src?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollCountRef = useRef(0);
  const audioAttemptedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio yuklanishi
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    const handleLoadedData = () => {
      setIsAudioReady(true);
      audio.muted = true;
      audio.volume = 0;
    };
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.load();
    return () => audio.removeEventListener('loadeddata', handleLoadedData);
  }, [src]);

  // Birinchi interaksiya
  useEffect(() => {
    if (!isAudioReady || userInteracted) return;

    const onFirst = () => {
      setUserInteracted(true);
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current && Ctx) {
        try {
          audioContextRef.current = new Ctx();
          if (audioRef.current) {
            const source = audioContextRef.current.createMediaElementSource(audioRef.current);
            source.connect(audioContextRef.current.destination);
          }
        } catch (e) {
          console.error('AudioContext failed:', e);
        }
      }
    };

    window.addEventListener('click', onFirst, { once: true });
    window.addEventListener('touchstart', onFirst, { once: true });
    window.addEventListener('keydown', onFirst, { once: true });
    return () => {
      window.removeEventListener('click', onFirst);
      window.removeEventListener('touchstart', onFirst);
      window.removeEventListener('keydown', onFirst);
    };
  }, [isAudioReady, userInteracted]);

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.volume = 0.3;
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        setIsPlaying(true);
        let v = 0.3;
        const iv = setInterval(() => {
          if (v < 0.7) {
            v += 0.05;
            audio.volume = Math.min(v, 0.7);
          } else clearInterval(iv);
        }, 100);
      }).catch(() => {
        audio.muted = true;
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setTimeout(() => (audio.muted = false), 1000);
          })
          .catch(() => console.log('Audio play failed'));
      });
    }
  };

  // Scroll orqali boshlash
  useEffect(() => {
    if (!userInteracted || !isAudioReady || audioAttemptedRef.current) return;

    let lastY = window.scrollY;
    let t: ReturnType<typeof setTimeout>;
    let scrolling = false;
    let startTime = 0;

    const attempt = () => {
      if (audioAttemptedRef.current) return;
      audioAttemptedRef.current = true;
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === 'suspended') ctx.resume().then(play).catch(play);
      else play();
      window.removeEventListener('scroll', onScroll);
    };

    const onScroll = () => {
      if (audioAttemptedRef.current) return;
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 10) {
        if (!scrolling) {
          scrolling = true;
          startTime = performance.now();
        }
        scrollCountRef.current++;
        lastY = y;
        clearTimeout(t);
        t = setTimeout(() => (scrolling = false), 300);
        if (
          scrollCountRef.current >= 2 ||
          (performance.now() - startTime > 1500 && scrollCountRef.current >= 1)
        ) {
          attempt();
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(t);
    };
  }, [userInteracted, isAudioReady]);

  // Tozalash
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioContextRef.current?.close();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audioAttemptedRef.current = true;
      play();
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return { audioRef, isPlaying, toggle };
}
