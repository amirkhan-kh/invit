// GET /api/pay/<invitationId>
// POST /api/pay/<invitationId>  body: { action: 'start'|'declare'|'cancel'|'admin_confirm'|'admin_reject', method?, initData?, reason? }
import { connectDB } from '../../backend/src/db';
import { Invitation } from '../../backend/src/models/invit.back';
import {
  adminConfirmPayment,
  adminRejectPayment,
  cancelTransferSession,
  declareTransferPaid,
  isAdmin,
  notifyAdminsPending,
  notifyUserPaid,
  publicSessionAsync,
  startTransferSession,
  validateTelegramWebAppInitData,
} from '../../backend/src/services/card-payment.service';
import { config, paymentAppUrl } from '../../backend/src/config';
import { getBot } from '../../backend/src/bot/bot';

function authFromReq(req: any): { userId: number; username?: string } | null {
  const initData =
    req.headers['x-telegram-init-data'] ||
    req.body?.initData ||
    req.query?.initData ||
    '';
  if (initData) {
    const v = validateTelegramWebAppInitData(String(initData), config.botToken);
    if (v.ok) return { userId: v.userId, username: v.username };
  }
  const uid = Number(req.headers['x-telegram-user-id'] || req.query?.userId || 0);
  if (uid > 0) return { userId: uid };
  return null;
}

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    const invitationId = String(req.query.invitationId || '');
    const inv = await Invitation.findById(invitationId).catch(() => null);
    if (!inv) return res.status(404).json({ message: 'Taklifnoma topilmadi' });

    if (req.method === 'GET') {
      const auth = authFromReq(req);
      if (auth && inv.telegramUserId !== auth.userId && !isAdmin(auth.userId)) {
        return res.status(403).json({ message: 'Ruxsat yo‘q' });
      }
      return res.status(200).json(await publicSessionAsync(inv));
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const auth = authFromReq(req);
    if (!auth) return res.status(401).json({ message: 'Telegram auth kerak' });
    const action = String(req.body?.action || '');

    if (action === 'start') {
      const method = String(req.body?.method || '').toLowerCase();
      if (!['uzcard', 'humo', 'bankomat', 'international'].includes(method)) {
        return res.status(400).json({ message: "To'lov usuli noto'g'ri" });
      }
      const result = await startTransferSession(invitationId, method as any, auth.userId);
      if (result.ok === false) return res.status(400).json({ message: result.error });
      return res.status(200).json(result.session);
    }

    if (action === 'declare') {
      const result = await declareTransferPaid(invitationId, auth.userId);
      if (result.ok === false) return res.status(400).json({ message: result.error });
      if (!result.autoConfirmed) {
        try {
          await notifyAdminsPending(invitationId);
        } catch (e) {
          console.error(e);
        }
      }
      return res.status(200).json(result.session);
    }

    if (action === 'cancel' || action === 'abandon' || action === 'abandon_only') {
      const result = await cancelTransferSession(invitationId, auth.userId);
      if (result.ok === false) return res.status(400).json({ message: result.error });
      return res.status(200).json({ ok: true, deleted: true });
    }

    if (action === 'admin_confirm') {
      if (!isAdmin(auth.userId)) return res.status(403).json({ message: 'Faqat admin' });
      const result = await adminConfirmPayment(invitationId, auth.username || String(auth.userId));
      if (result.ok === false) return res.status(400).json({ message: result.error });
      try {
        await notifyUserPaid(result.inv);
      } catch (e) {
        console.error(e);
      }
      return res.status(200).json({ ok: true, session: await publicSessionAsync(result.inv) });
    }

    if (action === 'admin_reject') {
      if (!isAdmin(auth.userId)) return res.status(403).json({ message: 'Faqat admin' });
      const result = await adminRejectPayment(invitationId, req.body?.reason);
      if (result.ok === false) return res.status(400).json({ message: result.error });
      return res.status(200).json({ ok: true, deleted: true });
    }

    return res.status(400).json({ message: 'Noma’lum action' });
  } catch (e) {
    console.error('Pay API xatosi:', e);
    return res.status(500).json({ message: 'Server xatosi' });
  }
}
