import { Telegram } from 'telegraf';
import { photoUrl } from '../config';

// Express res va Vercel res ikkalasiga mos minimal interfeys
interface HttpRes {
  setHeader(name: string, value: string): void;
  end(chunk?: Buffer): void;
}

/**
 * Rasmni DISKKA YUKLAMAYDI — faqat Telegram file_id asosida proxy URL qaytaradi.
 * (Serverless/Vercel'da disk yo'q. Rasm keyin /api/photo/<file_id> orqali oqib beriladi.)
 */
export async function downloadTelegramPhoto(
  _telegram: Telegram,
  fileId: string
): Promise<string> {
  return photoUrl(fileId);
}

/**
 * Rasmni Telegram serveridan SERVER TOMONDA olib, mijozga oqib beradi.
 * Bot tokeni URL'da ochilmaydi (mijoz faqat /api/photo/<file_id> ni ko'radi).
 */
export async function streamTelegramPhoto(
  telegram: Telegram,
  fileId: string,
  res: HttpRes
): Promise<void> {
  const link = await telegram.getFileLink(fileId);
  const r = await fetch(link.href);
  if (!r.ok) throw new Error('Rasm topilmadi');
  const buffer = Buffer.from(await r.arrayBuffer());

  // Telegram fayllarni "application/octet-stream" deb beradi — Telegram/brauzer
  // uni rasm deb tanishi uchun kengaytmaga qarab to'g'ri MIME turini qo'yamiz.
  const p = link.pathname.toLowerCase();
  const type = p.endsWith('.png')
    ? 'image/png'
    : p.endsWith('.webp')
    ? 'image/webp'
    : p.endsWith('.gif')
    ? 'image/gif'
    : 'image/jpeg';

  res.setHeader('Content-Type', type);
  // Edge/CDN keshi — Telegram va mehmonlar uchun tez (bir marta olinsa saqlanadi)
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  res.end(buffer);
}
