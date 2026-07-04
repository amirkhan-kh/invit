import React from 'react';

// Oltin naqshli ajratkich (ornamental divider) — premium bezaklar uchun
export const OrnamentDivider: React.FC<{ color?: string; width?: number }> = ({
  color = '#c9a36b',
  width = 160,
}) => (
  <svg
    width={width}
    height="20"
    viewBox="0 0 200 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', margin: '0 auto' }}
  >
    <path d="M0 10 H70" stroke={color} strokeWidth="1" />
    <path d="M130 10 H200" stroke={color} strokeWidth="1" />
    <path
      d="M100 2 C107 2 112 7 100 10 C88 7 93 2 100 2 Z M100 18 C93 18 88 13 100 10 C112 13 107 18 100 18 Z"
      fill={color}
    />
    <circle cx="80" cy="10" r="2" fill={color} />
    <circle cx="120" cy="10" r="2" fill={color} />
  </svg>
);

// Burchak gul naqshi (corner flourish)
export const CornerFlourish: React.FC<{ color?: string; size?: number; className?: string }> = ({
  color = '#c9a36b',
  size = 90,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 5 C 40 5, 55 20, 50 50 C 48 25, 30 15, 5 18"
      stroke={color}
      strokeWidth="1.2"
      fill="none"
    />
    <path d="M5 5 C 5 40, 20 55, 50 50 C 25 48, 15 30, 18 5" stroke={color} strokeWidth="1.2" fill="none" />
    <circle cx="50" cy="50" r="2.5" fill={color} />
    <circle cx="8" cy="8" r="2" fill={color} />
  </svg>
);
