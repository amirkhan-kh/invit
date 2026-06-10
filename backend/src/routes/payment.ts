import express from 'express';
import { Invitation } from '../models/invit.back';

const router = express.Router();

router.post('/payment/click/prepare', async (req, res) => {
  // Click'dan keladigan 'prepare' so'rovi
  const { click_trans_id, service_id, merchant_trans_id, amount } = req.body;
  
  const invitation = await Invitation.findById(merchant_trans_id);
  if (!invitation) return res.json({ error: -5, error_note: "User not found" });

  res.json({ click_trans_id, merchant_trans_id, error: 0, error_note: "Success" });
});

router.post('/payment/click/complete', async (req, res) => {
  const { merchant_trans_id, error } = req.body;

  if (error === "0") {
    // To'lov muvaffaqiyatli bo'lsa, bazada statusni o'zgartiramiz
    await Invitation.findByIdAndUpdate(merchant_trans_id, { isPaid: true });
  }

  res.json({ error: 0, error_note: "Success" });
});