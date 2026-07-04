import React from 'react';
import { HiOutlineMusicNote, HiOutlineVolumeOff } from 'react-icons/hi';

interface Props {
  isPlaying: boolean;
  onToggle: () => void;
  accent?: string;
}

// Suzuvchi musiqa boshqaruv tugmasi (o'ng yuqori burchakda)
const MusicToggle: React.FC<Props> = ({ isPlaying, onToggle, accent = '#c9a36b' }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Musiqani boshqarish"
      className="fixed top-4 right-4 z-[100] grid place-content-center w-10 h-10 rounded-full shadow-lg backdrop-blur-sm transition-transform active:scale-90"
      style={{ background: 'rgba(255,255,255,0.85)', color: accent }}
    >
      {isPlaying ? (
        <HiOutlineMusicNote size={20} className="animate-pulse" />
      ) : (
        <HiOutlineVolumeOff size={20} />
      )}
    </button>
  );
};

export default MusicToggle;
