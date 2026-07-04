// Vercel serverless funksiyasi — rasm proxy.
// GET /api/photo/<file_id> -> Telegram'dan rasmni oqib beradi (token yashirin).
import { getBot } from '../../backend/src/bot/bot';
import { streamTelegramPhoto } from '../../backend/src/services/photo.service';

export default async function handler(req: any, res: any) {
  try {
    const fileId = String(req.query.fileId || '');
    await streamTelegramPhoto(getBot().telegram, fileId, res);
  } catch (e) {
    res.status(404).end();
  }
}
