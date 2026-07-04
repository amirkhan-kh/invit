// Vercel serverless funksiyasi — taklifnomani slug bo'yicha berish.
// GET /api/invitation/<slug>
import { connectDB } from '../../backend/src/db';
import { lookupInvitation } from '../../backend/src/services/invitation.service';

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    const slug = String(req.query.slug || '');
    const r = await lookupInvitation(slug);
    if (r.status === 404) return res.status(404).json({ message: 'Taklifnoma topilmadi' });
    if (r.status === 402) {
      return res.status(402).json({ message: "To'lov qilinmagan", husband: r.husband, wife: r.wife });
    }
    return res.status(200).json(r.data);
  } catch (e: any) {
    console.error('Invitation API xatosi:', e);
    // VAQTINCHA diagnostika — sabab aniqlangach olib tashlanadi
    const uri = process.env.MONGO_URI || '';
    return res.status(500).json({
      message: 'Serverda ichki xatolik',
      error: String(e?.message || e).slice(0, 200),
      hasMongoEnv: !!process.env.MONGO_URI,
      mongoHost: uri.replace(/\/\/[^@]*@/, '//***@').split('?')[0].slice(0, 90),
      hasBotEnv: !!process.env.BOT_TOKEN,
    });
  }
}
