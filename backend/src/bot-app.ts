import { connectDB } from './db';
import { createBot } from './bot/bot';

// Lokal (polling) rejim — kompyuterда test qilish uchun.
// Vercel'da bot POLLING emas, WEBHOOK orqali ishlaydi (api/ + app.ts).
async function main() {
  await connectDB();
  console.log('✅ Bot: MongoDB-ga ulandi');

  const bot = createBot();

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  console.log('🚀 Bot polling rejimida ishga tushmoqda...');
  await bot.launch(); // polling; to'xtaguncha kutadi
}

main().catch((err) => console.error('❌ Botni ishga tushirishda xato:', err));
