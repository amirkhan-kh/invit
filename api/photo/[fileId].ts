// Vercel serverless funksiyasi — rasm.
// GET /api/photo/<id> -> avval Mongo blobdan (tez), bo'lmasa Telegram'dan proxy.
import { connectDB } from '../../backend/src/db';
import { getBot } from '../../backend/src/bot/bot';
import { streamPhoto } from '../../backend/src/services/photo.service';

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    const id = String(req.query.fileId || '');
    await streamPhoto(id, res, getBot().telegram);
  } catch (e) {
    res.status(404).end();
  }
}
