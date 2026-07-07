import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function parsePort(value: string | undefined): number {
  const port = Number(value || 5001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT noto'g'ri: ${value}`);
  }
  return port;
}

export const config = {
  botToken: process.env.BOT_TOKEN as string,

  // MONGO_URI berilmasa — lokal (Docker) MongoDB'ga ulanadi.
  // Bot va API alohida process bo'lgani uchun ular BITTA doimiy DB'ni bo'lishishi shart
  // (in-memory emas). Prod'da .env'da real Atlas URI beriladi.
  mongoUri: (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invitationDB').trim(),
  port: parsePort(process.env.PORT),

  // Taklifnoma havolasi uchun asosiy domen (keyin baxt.uz qilib qo'yasiz).
  // .trim() — env qiymatida tasodifiy bo'shliq bo'lsa ham havola buzilmasin.
  baseUrl: (process.env.BASE_URL || 'https://baxt.uz').trim().replace(/\/$/, ''),

  // Rasmlar shu manzil orqali beriladi (frontend shu URL'dan yuklaydi)
  apiPublicUrl: (process.env.API_PUBLIC_URL || 'http://localhost:5001').trim().replace(/\/$/, ''),

  // Yuklangan rasmlar saqlanadigan papka
  uploadsDir: path.resolve(__dirname, '..', 'uploads'),

  // Shablon namunasi videolari (standard.mp4, medium.mp4, premium.mp4)
  mediaDir: path.resolve(__dirname, '..', 'media'),

  maxPhotos: 3,
};

export function invitationLink(slug: string, templateId?: string): string {
  // Havola formati: baxt.uz/preview/<shablon>/<slug>  (masalan: /preview/premium/farhodshirin)
  return templateId
    ? `${config.baseUrl}/preview/${templateId}/${slug}`
    : `${config.baseUrl}/${slug}`;
}

export function photoUrl(fileId: string): string {
  // Rasm Telegram'da qoladi; /api/photo/<file_id> orqali oqib beriladi (disk kerak emas)
  return `${config.apiPublicUrl}/api/photo/${fileId}`;
}
