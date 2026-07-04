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
  res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.end(buffer);
}
