import express from 'express';
import { Invitation } from '../models/invit.back';
import { applyPayment } from '../services/payment.service';
import {
  adminConfirmPayment,
  adminRejectPayment,
  cancelTransferSession,
  declareTransferPaid,
  findLatestUnpaidForUser,
  isAdmin,
  notifyAdminsPending,
  notifyUserPaid,
  publicSession,
  startTransferSession,
  validateTelegramWebAppInitData,
} from '../services/card-payment.service';
import { config, paymentAppUrl } from '../config';
import { getBot } from '../bot/bot';

const router = express.Router();

function authFromRequest(req: express.Request): { userId: number; username?: string } | null {
  const initData =
    (req.headers['x-telegram-init-data'] as string) ||
    (req.body && req.body.initData) ||
    (req.query.initData as string) ||
    '';
  if (initData) {
    const v = validateTelegramWebAppInitData(initData, config.botToken);
    if (v.ok) return { userId: v.userId, username: v.username };
  }
  const uid = Number(req.headers['x-telegram-user-id'] || req.query.userId || 0);
  if (uid > 0) return { userId: uid };
  return null;
}

/** SHOP menu: eng so'nggi ochiq to'lov */
router.get('/pay/mine', async (req, res) => {
  try {
    const auth = authFromRequest(req);
    if (!auth) return res.status(401).json({ message: 'Telegram auth kerak' });
    const inv = await findLatestUnpaidForUser(auth.userId);
    if (!inv) {
      return res.status(404).json({
        message: "Ochiq to'lov yo'q. Botda /start bosing va taklifnoma yarating.",
      });
    }
    return res.json(publicSession(inv));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server xatosi' });
  }
});

router.get('/pay/:invitationId', async (req, res) => {
  try {
    const auth = authFromRequest(req);
    const inv = await Invitation.findById(String(req.params.invitationId)).catch(() => null);
    if (!inv) return res.status(404).json({ message: 'Taklifnoma topilmadi' });
    if (auth && inv.telegramUserId !== auth.userId && !isAdmin(auth.userId)) {
      return res.status(403).json({ message: 'Ruxsat yo‘q' });
    }
    return res.json(publicSession(inv));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server xatosi' });
  }
});

/** Mini App + Vercel bilan bir xil: POST body.action */
router.post('/pay/:invitationId', async (req, res) => {
  try {
    const invitationId = String(req.params.invitationId);
    const auth = authFromRequest(req);
    const action = String(req.body?.action || '');

    if (!auth) return res.status(401).json({ message: 'Telegram auth kerak' });

    if (action === 'start') {
      const method = String(req.body?.method || '').toLowerCase();
      if (!['uzcard', 'humo', 'bankomat', 'international'].includes(method)) {
        return res.status(400).json({ message: "To'lov usuli noto'g'ri" });
      }
      const result = await startTransferSession(
        invitationId,
        method as any,
        auth.userId
      );
      if (result.ok === false) return res.status(400).json({ message: result.error });
      return res.json(result.session);
    }

    if (action === 'declare') {
      const result = await declareTransferPaid(invitationId, auth.userId);
      if (result.ok === false) return res.status(400).json({ message: result.error });
      try {
        await notifyAdminsPending(invitationId);
      } catch (err) {
        console.error('Admin notify xato:', err);
      }
      return res.json(result.session);
    }

    if (action === 'cancel') {
      const result = await cancelTransferSession(invitationId, auth.userId);
      if (result.ok === false) return res.status(400).json({ message: result.error });
      return res.json(result.session);
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
      return res.json({ ok: true, session: publicSession(result.inv) });
    }

    if (action === 'admin_reject') {
      if (!isAdmin(auth.userId)) return res.status(403).json({ message: 'Faqat admin' });
      const result = await adminRejectPayment(invitationId, req.body?.reason);
      if (result.ok === false) return res.status(400).json({ message: result.error });
      try {
        const bot = getBot();
        await bot.telegram.sendMessage(
          result.inv.telegramUserId,
          "❌ To'lovingiz tasdiqlanmadi.\n" +
            (req.body?.reason ? `Sabab: ${req.body.reason}\n` : '') +
            "Qaytadan to'lov qilish uchun pastdagi tugmani bosing.",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "💳 Qayta to'lov", web_app: { url: paymentAppUrl(String(result.inv._id)) } }],
              ],
            },
          }
        );
      } catch (e) {
        console.error(e);
      }
      return res.json({ ok: true, session: publicSession(result.inv) });
    }

    return res.status(400).json({ message: 'Noma’lum action' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server xatosi' });
  }
});

// Eski Click sandbox (kelajak)
router.post('/payment/click/prepare', async (req, res) => {
  const { click_trans_id, merchant_trans_id } = req.body;
  const invitation = await Invitation.findById(merchant_trans_id).catch(() => null);
  if (!invitation) {
    return res.json({ error: -5, error_note: 'Taklifnoma topilmadi' });
  }
  return res.json({
    click_trans_id,
    merchant_trans_id,
    merchant_prepare_id: merchant_trans_id,
    error: 0,
    error_note: 'Success',
  });
});

router.post('/payment/click/complete', async (req, res) => {
  const { merchant_trans_id, amount, error } = req.body;
  if (String(error) !== '0') {
    return res.json({ error: Number(error) || -1, error_note: "To'lov bekor qilindi" });
  }
  try {
    const result = await applyPayment(merchant_trans_id, Number(amount) || 0);
    return res.json({
      merchant_trans_id,
      error: 0,
      error_note: 'Success',
      is_paid: result.isPaid,
      remaining: result.remaining,
    });
  } catch {
    return res.json({ error: -5, error_note: 'Taklifnoma topilmadi' });
  }
});

router.get('/payment/status/:id', async (req, res) => {
  const inv = await Invitation.findById(req.params.id).catch(() => null);
  if (!inv) return res.status(404).json({ message: 'Topilmadi' });
  return res.json(publicSession(inv));
});

export default router;
