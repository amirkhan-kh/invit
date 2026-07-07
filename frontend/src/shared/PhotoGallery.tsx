import React from 'react';

interface Props {
  photos: string[];
  // Bezak rangi (ramka)
  accent?: string;
  className?: string;
}

/**
 * Juftlik rasmlari galereyasi.
 * MUHIM: rasm soniga qarab moslashadi (0..3).
 *  - 0 rasm  -> hech narsa chizmaydi (UI da bo'sh joy qolmaydi)
 *  - 1 rasm  -> bitta katta markazlashgan ramka
 *  - 2 rasm  -> yonma-yon ikkita
 *  - 3 rasm  -> bitta katta + ikkita kichik
 */
const PhotoGallery: React.FC<Props> = ({ photos, accent = '#c9a36b', className = '' }) => {
  const list = (photos || []).map((p) => String(p || '').trim()).filter(Boolean).slice(0, 3);
  const n = list.length;

  if (n === 0) return null; // bo'sh joy ochilmaydi

  const frame: React.CSSProperties = {
    border: `2px solid ${accent}`,
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  };

  if (n === 1) {
    return (
      <div className={`px-8 py-6 ${className}`}>
        <div style={frame} className="mx-auto w-56 h-72">
          <img src={list[0]} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  if (n === 2) {
    return (
      <div className={`px-6 py-6 flex justify-center gap-3 ${className}`}>
        {list.map((src, i) => (
          <div key={i} style={frame} className="w-40 h-56">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  // n === 3
  return (
    <div className={`px-6 py-6 flex justify-center gap-3 ${className}`}>
      <div style={frame} className="w-40 h-64">
        <img src={list[0]} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col gap-3">
        <div style={frame} className="w-28 h-[122px]">
          <img src={list[1]} alt="" className="w-full h-full object-cover" />
        </div>
        <div style={frame} className="w-28 h-[122px]">
          <img src={list[2]} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;
