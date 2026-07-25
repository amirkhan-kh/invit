/**
 * Shablon rasmlari uchun URL normalize.
 * Eski DB: to'liq localhost/prod URL, boshida bo'shliq.
 * Yangi: /api/photo/<id> — bir domen (Vercel) da ishlaydi.
 */
export function resolvePhotoUrl(raw: string | undefined | null): string {
  const s = String(raw || '').trim();
  if (!s) return '';

  if (s.startsWith('/api/photo/') || s.startsWith('/uploads/')) return s;

  const m = s.match(/\/api\/photo\/([^/?#\s]+)/i);
  if (m) return `/api/photo/${m[1]}`;

  // Tashqi CDN (demo Unsplash) — o'zgartirmaymiz
  if (/^https?:\/\//i.test(s)) {
    // Noto'g'ri host (localhost) dagi photo proxy ni joriy origin ga o'tkazish
    try {
      const u = new URL(s);
      if (u.pathname.startsWith('/api/photo/')) {
        return u.pathname + u.search;
      }
    } catch {
      /* ignore */
    }
    return s;
  }

  // Faqat id
  if (!s.includes(' ')) return `/api/photo/${s}`;
  return s;
}

export function resolvePhotos(photos: string[] | undefined | null): string[] {
  return (photos || []).map(resolvePhotoUrl).filter(Boolean).slice(0, 3);
}
