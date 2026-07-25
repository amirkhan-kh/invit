/**
 * Production sozlash:
 *   node scripts/telegram-setup.js
 * - webhook
 * - default MenuButton = commands (SHOP faqat to'lovda, per-user yoqiladi)
 * - bot commands
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const token = process.env.BOT_TOKEN;
const baseUrl = (process.env.BASE_URL || '').trim().replace(/\/$/, '');
const webhookUrl = (process.env.WEBHOOK_URL || `${baseUrl}/api/bot`).trim();

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function telegram(method, body) {
  if (!token) fail('BOT_TOKEN topilmadi');
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const json = await res.json();
  if (!json.ok) fail(`${method}: ${json.description || JSON.stringify(json)}`);
  return json.result;
}

(async () => {
  if (!/^https:\/\//.test(baseUrl)) {
    fail('BASE_URL https bo‘lishi kerak');
  }

  await telegram('setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false,
  });
  console.log('Webhook:', webhookUrl);

  // Global default: SHOP YO'Q (faqat to'lov bosqichida per-chat yoqiladi)
  await telegram('setChatMenuButton', {
    menu_button: { type: 'commands' },
  });
  console.log('Default menu: commands (SHOP yashirin)');

  await telegram('setMyCommands', {
    commands: [
      { command: 'start', description: 'Yangi taklifnoma yaratish' },
      { command: 'restart', description: 'Qaytadan boshlash' },
      { command: 'cancel', description: 'Joriy jarayonni bekor qilish' },
      { command: 'help', description: 'Yordam' },
    ],
  });
  console.log('Commands o‘rnatildi');

  const info = await telegram('getWebhookInfo', {});
  console.log('Webhook info:', info.url || '(empty)', '| errors:', info.last_error_message || 'none');

  const card = (process.env.PAY_UZCARD_NUMBER || '').replace(/\D/g, '');
  console.log('PAY_UZCARD configured:', card.length >= 16 ? `yes (****${card.slice(-4)})` : 'NO — Vercel env tekshiring!');
  console.log('ADMIN_TELEGRAM_IDS:', process.env.ADMIN_TELEGRAM_IDS || '(empty)');
  console.log('✅ Tayyor');
})().catch((e) => fail(e.message));
