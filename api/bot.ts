// Vercel serverless funksiyasi — Telegram WEBHOOK.
// Telegram har yangilikni shu manzilga POST qiladi: https://<domain>/api/bot
import { connectDB } from '../backend/src/db';
import { getBot } from '../backend/src/bot/bot';
import { writeBotError } from '../backend/src/services/bot-log.service';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(200).send('Bot webhook OK');
    return;
  }
  try {
    await connectDB();
    const bot = getBot();
    await bot.handleUpdate(req.body);
    res.status(200).end();
  } catch (e) {
    console.error('Bot webhook xatosi:', e);
    await writeBotError('webhook_error', e, { updateId: req.body?.update_id });
    // Telegram qayta yubormasligi uchun baribir 200 qaytaramiz
    if (!res.headersSent) res.status(200).end();
  }
}
