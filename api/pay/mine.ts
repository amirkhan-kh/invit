// GET /api/pay/mine — foydalanuvchining ochiq to'lovi (SHOP menu)
import { connectDB } from '../../backend/src/db';
import {
  findLatestUnpaidForUser,
  publicSession,
  validateTelegramWebAppInitData,
} from '../../backend/src/services/card-payment.service';
import { config } from '../../backend/src/config';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    await connectDB();
    const initData =
      req.headers['x-telegram-init-data'] || req.query?.initData || '';
    let userId = Number(req.headers['x-telegram-user-id'] || req.query?.userId || 0);
    if (initData) {
      const v = validateTelegramWebAppInitData(String(initData), config.botToken);
      if (v.ok) userId = v.userId;
    }
    if (!userId) return res.status(401).json({ message: 'Telegram auth kerak' });

    const inv = await findLatestUnpaidForUser(userId);
    if (!inv) {
      return res.status(404).json({
        message: "Ochiq to'lov yo'q. Botda /start bosing va taklifnoma yarating.",
      });
    }
    return res.status(200).json(publicSession(inv));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server xatosi' });
  }
}
