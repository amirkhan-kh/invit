/**
 * Rasm URL'larini normalize qiladi.
 * Eski yozuvlar: to'liq localhost/prod URL, boshida bo'shliq, Telegram file_id.
 * Yangi: doim `/api/photo/<id>` — har qanday domenda ishlaydi.
 */
export function normalizePhotoUrl(raw: string): string {
  const s = String(raw || '').trim();
  if (!s) return '';

  // Allaqachon nisbiy
  if (s.startsWith('/api/photo/')) return s;

  // To'liq URL ichidan /api/photo/xxx ajratib olish
  const m = s.match(/\/api\/photo\/([^/?#\s]+)/i);
  if (m) return `/api/photo/${m[1]}`;

  // Faqat id (blob id yoki eski file_id)
  if (!/^https?:\/\//i.test(s) && !s.includes(' ')) {
    // uploads eski yo'l
    if (s.startsWith('/uploads/')) return s;
    return `/api/photo/${s}`;
  }

  // Tashqi (unsplash demo) — o'zgartirmaymiz
  if (/^https?:\/\//i.test(s)) return s;

  return s;
}

export function normalizePhotoList(photos: string[] | undefined | null): string[] {
  return (photos || []).map(normalizePhotoUrl).filter(Boolean).slice(0, 3);
}

/** Brauzerda ko'rsatish uchun — nisbiy yo'lni joriy origin bilan birlashtirish shart emas (relative OK) */
export function photoSrcForClient(raw: string): string {
  return normalizePhotoUrl(raw);
}
