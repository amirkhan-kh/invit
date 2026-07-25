// @ts-nocheck
// Vercel Edge — taklifnoma intro (hero) 1200×630 PNG — Telegram/SEO link preview.
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const FONT_SCRIPT =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf';
const FONT_SERIF =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/cardo/Cardo-Regular.ttf';
const FONT_SERIF_I =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/cardo/Cardo-Italic.ttf';

function el(type, props, children) {
  const p = { ...(props || {}) };
  if (children !== undefined) p.children = children;
  return { type, props: p };
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const h = (searchParams.get('h') || 'Kuyov').slice(0, 28);
  const w = (searchParams.get('w') || 'Kelin').slice(0, 28);
  const d = (searchParams.get('d') || '').slice(0, 12);
  const wd = (searchParams.get('wd') || '').slice(0, 20);
  const img = searchParams.get('img') || '';
  const tpl = (searchParams.get('tpl') || 'premium').toLowerCase();

  // Palitra: premium oltin-yashil, medium qaymoq-ko'k, standard yashil
  const palette =
    tpl === 'standard'
      ? { gold: '#c5d4b0', soft: '#eef3e6', accent: '#8fa67a', veil: 'rgba(40,50,35,0.72)' }
      : tpl === 'medium'
        ? { gold: '#e7cfa6', soft: '#fff6e8', accent: '#c9a36b', veil: 'rgba(30,40,55,0.7)' }
        : { gold: '#e7cfa6', soft: '#f5e6c8', accent: '#c9a36b', veil: 'rgba(10,20,16,0.78)' };

  const [script, serif, serifI] = await Promise.all([
    fetch(FONT_SCRIPT).then((r) => r.arrayBuffer()),
    fetch(FONT_SERIF).then((r) => r.arrayBuffer()),
    fetch(FONT_SERIF_I).then((r) => r.arrayBuffer()).catch(() => null),
  ]);

  const full = { position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px' };
  const topLabel = d ? `TAKLIFNOMA  ·  ${d}` : 'TAKLIFNOMA';

  const ornament = el(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginTop: 8,
        marginBottom: 8,
      },
    },
    [
      el('div', {
        style: {
          width: 72,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${palette.gold})`,
        },
      }),
      el('div', { style: { color: palette.gold, fontSize: 18, letterSpacing: 4 } }, '✦'),
      el('div', {
        style: {
          width: 72,
          height: 1,
          background: `linear-gradient(90deg, ${palette.gold}, transparent)`,
        },
      }),
    ]
  );

  const content = [
    el(
      'div',
      {
        style: {
          fontFamily: 'Serif',
          fontSize: 22,
          letterSpacing: 12,
          color: palette.gold,
          textTransform: 'uppercase',
        },
      },
      topLabel
    ),
    ornament,
    el(
      'div',
      {
        style: {
          fontFamily: 'Script',
          fontSize: 108,
          color: palette.soft,
          lineHeight: 1.05,
          marginTop: 6,
          textAlign: 'center',
          maxWidth: 1000,
        },
      },
      h
    ),
    el(
      'div',
      {
        style: {
          fontFamily: 'Script',
          fontSize: 48,
          color: palette.accent,
          lineHeight: 1,
          marginTop: 2,
          marginBottom: 2,
        },
      },
      '&'
    ),
    el(
      'div',
      {
        style: {
          fontFamily: 'Script',
          fontSize: 108,
          color: palette.soft,
          lineHeight: 1.05,
          textAlign: 'center',
          maxWidth: 1000,
        },
      },
      w
    ),
  ];

  if (wd) {
    content.push(
      el(
        'div',
        {
          style: {
            fontFamily: 'SerifItalic',
            fontSize: 26,
            letterSpacing: 8,
            color: palette.gold,
            marginTop: 16,
            textTransform: 'uppercase',
            opacity: 0.95,
          },
        },
        wd.toUpperCase()
      )
    );
  }

  content.push(
    el(
      'div',
      {
        style: {
          fontFamily: 'Serif',
          fontSize: 18,
          letterSpacing: 6,
          color: palette.gold,
          marginTop: 28,
          opacity: 0.75,
        },
      },
      'S I Z N I  K U T A M I Z'
    )
  );

  const children = [];

  if (img && /^https?:\/\//i.test(img)) {
    children.push(
      el('img', {
        src: img,
        width: 1200,
        height: 630,
        style: { ...full, objectFit: 'cover' },
      })
    );
  } else {
    children.push(
      el('div', {
        style: {
          ...full,
          background:
            tpl === 'standard'
              ? 'linear-gradient(160deg, #3a4a32 0%, #1e281c 50%, #0f1410 100%)'
              : tpl === 'medium'
                ? 'linear-gradient(160deg, #2a3a4a 0%, #1a2535 50%, #0e1520 100%)'
                : 'linear-gradient(160deg, #1a2c22 0%, #0e1512 45%, #080c0a 100%)',
        },
      })
    );
  }

  // Soft vignette
  children.push(
    el('div', {
      style: {
        ...full,
        background: `linear-gradient(180deg, ${palette.veil} 0%, rgba(8,12,10,0.45) 35%, rgba(8,12,10,0.88) 100%)`,
      },
    })
  );

  // Gold frame
  children.push(
    el('div', {
      style: {
        position: 'absolute',
        top: 28,
        left: 28,
        right: 28,
        bottom: 28,
        border: `1px solid ${palette.gold}55`,
        borderRadius: 8,
      },
    })
  );
  children.push(
    el('div', {
      style: {
        position: 'absolute',
        top: 36,
        left: 36,
        right: 36,
        bottom: 36,
        border: `1px solid ${palette.gold}22`,
        borderRadius: 4,
      },
    })
  );

  children.push(
    el(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '48px 56px',
        },
      },
      content
    )
  );

  const fonts = [
    { name: 'Script', data: script, style: 'normal', weight: 400 },
    { name: 'Serif', data: serif, style: 'normal', weight: 400 },
  ];
  if (serifI) {
    fonts.push({ name: 'SerifItalic', data: serifI, style: 'normal', weight: 400 });
  } else {
    fonts.push({ name: 'SerifItalic', data: serif, style: 'normal', weight: 400 });
  }

  return new ImageResponse(
    el(
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
          overflow: 'hidden',
        },
      },
      children
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    }
  );
}
