import { app } from './app';
import { connectDB } from './db';
import { config } from './config';

// Lokal (va oddiy server) rejimi — Vercel'da bu ishlamaydi, u api/ funksiyasidan foydalanadi.
connectDB()
  .then(() => console.log('✅ API: MongoDB-ga ulandi'))
  .catch((err) => console.error('❌ DB ulanish xatosi:', err));

const PORT = config.port;
app.listen(PORT, () => console.log(`🚀 API Server ${PORT}-portda ishlamoqda`));
