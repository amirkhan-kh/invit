import express from 'express';
import { Invitation } from '../models/invit.back';
import { applyPayment } from '../services/payment.service';

const router = express.Router();

/**
 * Click "prepare" — to'lovni tayyorlash bosqichi.
 * merchant_trans_id = taklifnoma _id.
 * (Sandbox: imzo tekshiruvi soddalashtirilgan. Real rejimda SECRET_KEY bilan
 *  md5 imzo tekshiriladi — deploy paytida qo'shiladi.)
 */
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

/**
 * Click "complete" — to'lov yakunlangach chaqiriladi.
 * Muvaffaqiyatli bo'lsa, qisman to'lov mantig'i bilan qo'llaymiz.
 */
router.post('/payment/click/complete', async (req, res) => {
  const { merchant_trans_id, amount, error } = req.body;

  if (String(error) !== '0') {
    return res.json({ error: Number(error) || -1, error_note: 'To\'lov bekor qilindi' });
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
  } catch (e) {
    return res.json({ error: -5, error_note: 'Taklifnoma topilmadi' });
  }
});

// To'lov holatini tekshirish (frontend/bot uchun)
router.get('/payment/status/:id', async (req, res) => {
  const inv = await Invitation.findById(req.params.id).catch(() => null);
  if (!inv) return res.status(404).json({ message: 'Topilmadi' });
  return res.json({
    isPaid: inv.isPaid,
    price: inv.price,
    amountPaid: inv.amountPaid,
    remaining: Math.max(0, inv.price - inv.amountPaid),
    slug: inv.slug,
  });
});

export default router;
