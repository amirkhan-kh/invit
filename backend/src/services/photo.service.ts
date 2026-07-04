import fs from 'fs';
import path from 'path';
import { Telegram } from 'telegraf';
import { config, photoUrl } from '../config';

// Uploads papkasi mavjudligini ta'minlash
function ensureUploadsDir() {
  if (!fs.existsSync(config.uploadsDir)) {
    fs.mkdirSync(config.uploadsDir, { recursive: true });
  }
}

/**
 * Telegram rasm faylini yuklab olib, uploads papkasiga saqlaydi.
 * Qaytaradi: rasmning to'liq (public) URL manzili.
 */
export async function downloadTelegramPhoto(
  telegram: Telegram,
  fileId: string
): Promise<string> {
  ensureUploadsDir();

  const link = await telegram.getFileLink(fileId);
  const res = await fetch(link.href);
  if (!res.ok) throw new Error('Rasmni yuklab bo\'lmadi');

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = path.extname(link.pathname) || '.jpg';
  const filename = `ph_${Date.now()}_${Math.floor(Math.random() * 1e6)}${ext}`;
  const filePath = path.join(config.uploadsDir, filename);

  fs.writeFileSync(filePath, buffer);
  return photoUrl(filename);
}
