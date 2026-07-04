import { Telegram } from 'telegraf';
import mongoose from 'mongoose';
import { photoUrl } from '../config';

// Express res va Vercel res ikkalasiga mos minimal interfeys
interface HttpRes {
  setHeader(name: string, value: string): void;
  end(chunk?: Buffer): void;
}

function blobs() {
  return mongoose.connection.collection('photoblobs');
}

function mimeFromPath(p: string): string {
  const s = p.toLowerCase();
  return s.endsWith('.png')
    ? 'image/png'
    : s.endsWith('.webp')
    ? 'image/webp'
    : s.endsWith('.gif')
    ? 'image/gif'
    : 'image/jpeg';
}

/**
 * Rasmni Telegram'dan bir marta yuklab, MongoDB'ga saqlaydi (tez xizmat uchun).
 * Qaytaradi: /api/photo/<id> proxy manzili. Diskка yozmaydi (serverless mos).
 */
export async function downloadTelegramPhoto(
  telegram: Telegram,
  fileId: string
): Promise<string> {
  const link = await telegram.getFileLink(fileId);
  const r = await fetch(link.href);
  if (!r.ok) throw new Error("Rasmni yuklab bo'lmadi");
  const buffer = Buffer.from(await r.arrayBuffer());
  const type = mimeFromPath(link.pathname);
  const id = `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
  await blobs().insertOne({ _id: id as any, data: buffer, type });
  return photoUrl(id);
}

/**
 * Rasmni beradi: avval Mongo blobdan (tez), bo'lmasa eski file_id -> Telegram proxy.
 */
export async function streamPhoto(
  idOrFileId: string,
  res: HttpRes,
  telegram: Telegram
): Promise<void> {
  const doc = await blobs().findOne({ _id: idOrFileId as any });
  if (doc && (doc as any).data) {
    const raw: any = (doc as any).data;
    const buf: Buffer = Buffer.isBuffer(raw)
      ? raw
      : raw && raw.buffer
      ? Buffer.from(raw.buffer)
      : Buffer.from(raw);
    res.setHeader('Content-Type', (doc as any).type || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800');
    res.end(buf);
    return;
  }
  // Eski (file_id) taklifnomalar uchun zaxira yo'l
  await streamTelegramPhoto(telegram, idOrFileId, res);
}

/**
 * Zaxira: rasmni to'g'ridan-to'g'ri Telegram'dan oqib beradi (eski file_id'lar uchun).
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
  res.setHeader('Content-Type', mimeFromPath(link.pathname));
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  res.end(buffer);
}
