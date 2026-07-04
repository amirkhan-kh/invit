// Vercel serverless — taklifnoma sahifasi uchun per-slug OG/SEO meta teglar (SSR-lite).
// /preview/<template>/<slug> so'rovlari shu funksiyaga yo'naltiriladi (vercel.json).
// index.html olib, og:title / og:image / og:description ni o'sha juftlik bo'yicha
// almashtiradi -> Telegram/ijtimoiy tarmoq/Google preview'да juftlik rasmi va ismi chiqadi.
// Haqiqiy foydalanuvchi baribir to'liq SPA'ni oladi (skript teglar saqlanadi).
import { connectDB } from '../backend/src/db';
import { lookupInvitation } from '../backend/src/services/invitation.service';
import { OG_DEMOS } from '../backend/src/services/og-demos';

function esc(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setMeta(html: string, prop: string, content: string): string {
  const re = new RegExp(`(<meta property="${prop}" content=")[^"]*(")`, 'i');
  if (re.test(html)) return html.replace(re, `$1${esc(content)}$2`);
  return html.replace('</head>', `  <meta property="${prop}" content="${esc(content)}" />\n</head>`);
}

function setNamedMeta(html: string, name: string, content: string): string {
  const re = new RegExp(`(<meta name="${name}" content=")[^"]*(")`, 'i');
  if (re.test(html)) return html.replace(re, `$1${esc(content)}$2`);
  return html.replace('</head>', `  <meta name="${name}" content="${esc(content)}" />\n</head>`);
}

function setTitle(html: string, title: string): string {
  return html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`);
}

const GENERIC_IMG =
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=630&fit=crop&q=80';

export default async function handler(req: any, res: any) {
  const slug = String(req.query.slug || '');
  const template = String(req.query.template || 'premium');
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  const origin = `${proto}://${host}`;

  // OG ma'lumot: avval demo, keyin DB (haqiqiy taklifnoma)
  let data: { husband: string; wife: string; image: string } | null = OG_DEMOS[slug] || null;
  if (!data) {
    try {
      await connectDB();
      const r = await lookupInvitation(slug);
      if (r.status === 200) {
        data = { husband: r.data.husband, wife: r.data.wife, image: r.data.photos?.[0] || '' };
      } else if (r.status === 402) {
        data = { husband: (r as any).husband, wife: (r as any).wife, image: '' };
      }
    } catch (e) {
      // e'tiborsiz -> generic OG
    }
  }

  // Joriy index.html ni olamiz (asset-hash'lar to'g'ri bo'lishi uchun)
  let html = '';
  try {
    const resp = await fetch(`${origin}/index.html`);
    html = await resp.text();
  } catch (e) {
    html = '<!doctype html><html lang="uz"><head><title>Taklifnoma</title></head><body><div id="root"></div></body></html>';
  }

  const title = data ? `${data.husband} & ${data.wife} — Taklifnoma` : "💍 To'y taklifnomasi — baxt.uz";
  const image = data && data.image ? data.image.trim() : GENERIC_IMG;
  const desc = data
    ? `${data.husband} va ${data.wife}ning to'y taklifnomasiga taklif qilinasiz. Ochish uchun bosing 💍`
    : "Nafis onlayn to'y taklifnomasi — animatsiya, musiqa va xarita bilan.";
  const url = `${origin}/preview/${template}/${slug}`;

  html = setTitle(html, title);
  html = setNamedMeta(html, 'description', desc);
  html = setMeta(html, 'og:type', 'website');
  html = setMeta(html, 'og:title', title);
  html = setMeta(html, 'og:description', desc);
  html = setMeta(html, 'og:image', image);
  html = setMeta(html, 'og:url', url);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).send(html);
}
