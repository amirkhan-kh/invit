import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

interface Props {
  mapLink?: string;
  label?: string;
  bg?: string;
  color?: string;
  className?: string;
}

/**
 * "Manzil" tugmasi — bosilganda mehmon telefonida xaritada joyni ochadi.
 * mapLink bo'sh bo'lsa tugma ko'rsatilmaydi.
 */
const MapButton: React.FC<Props> = ({
  mapLink,
  label = 'Manzil',
  bg = '#ffffff',
  color = '#557693',
  className = '',
}) => {
  if (!mapLink) return null;
  return (
    <a
      href={mapLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium leading-none whitespace-nowrap shadow-md transition-transform active:scale-95 ${className}`}
      style={{ background: bg, color }}
    >
      {label} <FaMapMarkerAlt />
    </a>
  );
};

export default MapButton;
