import express, { Request, Response } from 'express';
import cors from 'cors';
import paymentRouter from './routes/payment';
import { getBot } from './bot/bot';
import { lookupInvitation } from './services/invitation.service';
import { streamPhoto } from './services/photo.service';

const app = express();
app.use(cors());
app.use(express.json());

// Bot — webhook (Vercel/prod) va rasm proxy (getFile) uchun. Launch QILINMAYDI.
export const bot = getBot();

// Telegram webhook: yangiliklar shu manzilga POST qilinadi (serverless rejim)
app.use(bot.webhookCallback('/api/bot'));

/**
 * Rasm proxy: /api/photo/<file_id>
 * Telegram'dan rasmni server tomonda olib, mijozga oqib beradi (token yashirin).
 */
app.get('/api/photo/:fileId', async (req: Request, res: Response) => {
  try {
    await streamPhoto(String(req.params.fileId), res, bot.telegram);
  } catch (e) {
    res.status(404).end();
  }
});

// To'lov route'lari (Click/Payme sandbox)
app.use('/api', paymentRouter);

// API: Slug bo'yicha taklifnomani topish
app.get('/api/invitation/:slug', async (req: Request, res: Response) => {
  try {
    const r = await lookupInvitation(String(req.params.slug));
    if (r.status === 404) return res.status(404).json({ message: 'Taklifnoma topilmadi' });
    if (r.status === 402) {
      return res.status(402).json({ message: "To'lov qilinmagan", husband: r.husband, wife: r.wife });
    }
    return res.json(r.data);
  } catch (error) {
    console.error('API Xatosi:', error);
    return res.status(500).json({ message: 'Serverda ichki xatolik yuz berdi' });
  }
});

app.get('/', (_req, res) => res.json({ ok: true, service: 'seramony-invit API' }));
app.get('/api', (_req, res) => res.json({ ok: true, service: 'seramony-invit API' }));

export { app };
