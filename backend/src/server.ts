import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Invitation, IInvitation } from './models/invit.back';
import paymentRouter from './routes/payment';
import { config } from './config';

const app = express();
app.use(cors());
app.use(express.json());

// Yuklangan rasmlarni ulashish (/uploads/...)
app.use('/uploads', express.static(config.uploadsDir));

// MongoDB-ga ulanish
mongoose
  .connect(config.mongoUri)
  .then(() => console.log('✅ API: MongoDB-ga ulandi'))
  .catch((err) => console.error('❌ DB ulanish xatosi:', err));

// To'lov route'lari (Click/Payme sandbox)
app.use('/api', paymentRouter);

/**
 * API: Slug bo'yicha taklifnomani topish
 */
app.get('/api/invitation/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const invitation: IInvitation | null = await Invitation.findOne({ slug });

    if (!invitation) {
      return res.status(404).json({ message: 'Taklifnoma topilmadi' });
    }

    if (!invitation.isPaid) {
      return res.status(402).json({
        message: "To'lov qilinmagan",
        husband: invitation.husband,
        wife: invitation.wife,
      });
    }

    return res.json(invitation);
  } catch (error) {
    console.error('API Xatosi:', error);
    return res.status(500).json({ message: 'Serverda ichki xatolik yuz berdi' });
  }
});

app.get('/', (_req, res) => res.json({ ok: true, service: 'seramony-invit API' }));

const PORT = config.port;
app.listen(PORT, () => console.log(`🚀 API Server ${PORT}-portda ishlamoqda`));
