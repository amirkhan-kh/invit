import express, { Request, Response } from 'express';
import cors from 'cors';
import { Invitation, IInvitation } from './models/invit.back'; // To'g'ri import
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB-ga ulanish (Server ishlashi uchun shart)
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ API uchun MongoDB-ga ulandi"))
  .catch(err => console.error("❌ DB ulanish xatosi:", err));

/**
 * API: Slug bo'yicha taklifnomani topish
 * Request va Response turlari aniq ko'rsatilgan
 */
app.get('/api/invitation/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Invitations arrayi o'rniga Invitation.findOne ishlatamiz
    // Bu yerda invitation turi IInvitation | null bo'ladi
    const invitation: IInvitation | null = await Invitation.findOne({ slug });

    if (!invitation) {
      return res.status(404).json({ message: "Taklifnoma topilmadi" });
    }

    // To'lov holatini tekshirish
    if (!invitation.isPaid) {
      return res.status(402).json({ 
        message: "To'lov qilinmagan",
        husband: invitation.husband, // Balki to'lov sahifasida ismlar kerak bo'lar
        wife: invitation.wife 
      });
    }

    // Muvaffaqiyatli javob
    return res.json(invitation);
    
  } catch (error) {
    console.error("API Xatosi:", error);
    return res.status(500).json({ message: "Serverda ichki xatolik yuz berdi" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API Server running on port ${PORT}`));