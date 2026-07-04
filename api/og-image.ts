// @ts-nocheck
// Vercel Edge — taklifnoma hero'sini (rasm + ustiga yozuvlar) 1200x630 PNG qilib yasaydi.
// JSX'siz (Satori element obyektlari bilan) — qo'shimcha konfiguratsiya kerak emas.
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const FONT_SCRIPT =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf';
const FONT_SERIF =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-SemiBold.ttf';

// Satori element yasovchi yordamchi: { type, props: { ...props, children } }
function el(type, props, children) {
  const p = { ...(props || {}) };
  if (children !== undefined) p.children = children;
  return { type, props: p };
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);

  // --- VAQTINCHA DIAGNOSTIKA ---
  if (searchParams.get('debug') === 'text') {
    return new Response('EDGE-OK ImageResponse=' + typeof ImageResponse, {
      headers: { 'content-type': 'text/plain' },
    });
  }
  if (searchParams.get('debug') === 'min') {
    const f = await fetch(FONT_SERIF).then((r) => r.arrayBuffer());
    return new ImageResponse(
      { type: 'div', props: { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e1512', color: '#e7cfa6', fontSize: 60, fontFamily: 'Serif' }, children: 'MINIMAL TEST' } },
      { width: 1200, height: 630, fonts: [{ name: 'Serif', data: f, style: 'normal', weight: 600 }] }
    );
  }
  // --- /diagnostika ---

  const h = (searchParams.get('h') || 'Kuyov').slice(0, 24);
  const w = (searchParams.get('w') || 'Kelin').slice(0, 24);
  const d = (searchParams.get('d') || '').slice(0, 12);
  const wd = (searchParams.get('wd') || '').slice(0, 20);
  const img = searchParams.get('img') || '';

  const [script, serif] = await Promise.all([
    fetch(FONT_SCRIPT).then((r) => r.arrayBuffer()),
    fetch(FONT_SERIF).then((r) => r.arrayBuffer()),
  ]);

  const full = { position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px' };
  const top = d ? `TAKLIFNOMA      ${d}` : 'TAKLIFNOMA';

  const content = [
    el('div', { style: { fontFamily: 'Serif', fontSize: 27, letterSpacing: 8, color: '#e7cfa6' } }, top),
    el('div', { style: { fontFamily: 'Script', fontSize: 120, color: '#f5e6c8', lineHeight: 1.15, marginTop: 4 } }, h),
    el('div', { style: { fontFamily: 'Script', fontSize: 62, color: '#c9a36b', lineHeight: 1 } }, '&'),
    el('div', { style: { fontFamily: 'Script', fontSize: 120, color: '#f5e6c8', lineHeight: 1.15 } }, w),
  ];
  if (wd) {
    content.push(
      el('div', { style: { fontFamily: 'Serif', fontSize: 25, letterSpacing: 8, color: '#d8c8a6', marginTop: 14 } }, wd.toUpperCase())
    );
  }

  const children = [];
  if (img) {
    children.push(el('img', { src: img, width: 1200, height: 630, style: { ...full, objectFit: 'cover' } }));
  }
  children.push(
    el('div', { style: { ...full, background: 'linear-gradient(180deg, rgba(10,20,16,0.5), rgba(10,20,16,0.85))' } })
  );
  children.push(
    el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' } }, content)
  );

  const tree = el(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0e1512',
      },
    },
    children
  );

  return new ImageResponse(tree, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Script', data: script, style: 'normal', weight: 400 },
      { name: 'Serif', data: serif, style: 'normal', weight: 600 },
    ],
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
  });
}
