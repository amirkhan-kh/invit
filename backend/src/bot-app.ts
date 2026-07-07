import { connectDB } from './db';
import { createBot } from './bot/bot';

async function ensurePollingCanStart(bot: ReturnType<typeof createBot>) {
  const webhook = await bot.telegram.getWebhookInfo();
  if (webhook.url) {
    throw new Error(
      `Telegram webhook faol: ${webhook.url}\n` +
        "Polling botni ishga tushirish uchun avval webhookni o'chiring yoki botni webhook rejimida ishlating."
    );
  }
}

// Lokal (polling) rejim — kompyuterда test qilish uchun.
// Vercel'da bot POLLING emas, WEBHOOK orqali ishlaydi (api/ + app.ts).
async function main() {
  await connectDB();
  console.log('✅ Bot: MongoDB-ga ulandi');

  const bot = createBot();

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  await ensurePollingCanStart(bot);

  console.log('🚀 Bot polling rejimida ishga tushmoqda...');
  await bot.launch(); // polling; to'xtaguncha kutadi
}

main().catch((err) => {
  console.error('❌ Botni ishga tushirishda xato:', err);
  process.exit(1);
});
