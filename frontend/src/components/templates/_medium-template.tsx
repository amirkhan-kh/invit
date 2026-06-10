import React, { useEffect, useRef, useState } from 'react';
import { Date, Intro, IntroWish, Timing } from "../sections/medium";
import { TemplateProps } from '../../types/invitation.types';

// Browserning AudioContext va webkitAudioContext turlari uchun kengaytma
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const MediumTemplate: React.FC<TemplateProps> = ({ data }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(false);
  const scrollCountRef = useRef<number>(0);
  const audioAttemptedRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio yuklanishini nazorat qilish
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleLoadedData = (): void => {
      setIsAudioReady(true);
      if (audio) {
        audio.muted = true;
        audio.volume = 0;
      }
    };

    if (audio) {
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.load();
    }

    return () => {
      if (audio) {
        audio.removeEventListener('loadeddata', handleLoadedData);
      }
    };
  }, []);

  // Birinchi interaksiyani aniqlash
  useEffect(() => {
    const handleFirstInteraction = (): void => {
      setUserInteracted(true);
      
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current && AudioContextClass) {
        try {
          audioContextRef.current = new AudioContextClass();
          
          if (audioRef.current && audioContextRef.current) {
            const source = audioContextRef.current.createMediaElementSource(audioRef.current);
            source.connect(audioContextRef.current.destination);
          }
        } catch (error) {
          console.error("AudioContext failed:", error);
        }
      }
      removeInteractionListeners();
    };

    const removeInteractionListeners = (): void => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    if (isAudioReady && !userInteracted) {
      window.addEventListener('click', handleFirstInteraction, { once: true });
      window.addEventListener('touchstart', handleFirstInteraction, { once: true });
      window.addEventListener('keydown', handleFirstInteraction, { once: true });
    }

    return () => removeInteractionListeners();
  }, [isAudioReady, userInteracted]);

  // Scroll orqali audioni boshlash logikasi
  useEffect(() => {
    if (!userInteracted || !isAudioReady || audioAttemptedRef.current) return;

    let lastScrollY: number = window.scrollY;
    let scrollTimeout: ReturnType<typeof setTimeout>;
    let isScrolling: boolean = false;
    let scrollStartTime: number = 0;

    const handleScroll = (): void => {
      if (audioAttemptedRef.current) return;

      const currentScrollY: number = window.scrollY;
      const scrollDelta: number = Math.abs(currentScrollY - lastScrollY);
      
      if (scrollDelta > 10) {
        if (!isScrolling) {
          isScrolling = true;
          scrollStartTime = Date.now();
        }
        
        scrollCountRef.current++;
        lastScrollY = currentScrollY;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 300);

        if (scrollCountRef.current >= 2 || 
            (Date.now() - scrollStartTime > 1500 && scrollCountRef.current >= 1)) {
          attemptAudioPlay();
        }
      }
    };

    const attemptAudioPlay = (): void => {
      if (audioAttemptedRef.current) return;
      audioAttemptedRef.current = true;

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          playAudioElement();
        }).catch(() => {
          playAudioElement();
        });
      } else {
        playAudioElement();
      }
      window.removeEventListener('scroll', handleScroll);
    };

    const playAudioElement = (): void => {
      const audio = audioRef.current;
      if (!audio || !audio.paused === false) return;
      
      audio.muted = false;
      audio.volume = 0.3;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            let volume: number = 0.3;
            const fadeInterval = setInterval(() => {
              if (volume < 0.7) {
                volume += 0.05;
                audio.volume = Math.min(volume, 0.7);
              } else {
                clearInterval(fadeInterval);
              }
            }, 100);
          })
          .catch(() => {
            audio.muted = true;
            audio.play()
              .then(() => {
                setTimeout(() => { audio.muted = false; }, 1000);
              })
              .catch(() => {
                console.log("Audio play failed. User interaction required.");
              });
          });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [userInteracted, isAudioReady]);

  // Tozalash (Cleanup)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <main className="container mx-auto">
      <audio
        ref={audioRef}
        src="/audio/Romantic_Piano_Free_Music_UNTIL_WE_MEET_AGAIN_by_Arthur.mp3"
        preload="auto"
        loop
        playsInline
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      
      {/* Har bir seksiyaga API'dan kelgan datani uzatamiz */}
      <Intro  />
      <IntroWish  />
      <Date  />
      <Timing  />
      
      {/* Agar footer tilagi bo'lsa ko'rsatamiz */}
      {data.footerWish && (
        <footer className="text-center py-10">
          <p>{data.footerWish}</p>
        </footer>
      )}
    </main>
  );
}

export default MediumTemplate;