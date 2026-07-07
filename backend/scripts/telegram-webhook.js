const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const action = process.argv[2] || 'info';
const token = process.env.BOT_TOKEN;
const webhookUrl = (process.env.WEBHOOK_URL || `${process.env.BASE_URL || ''}/api/bot`).trim();

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function telegram(method, params = {}) {
  if (!token) fail('BOT_TOKEN topilmadi. backend/.env yoki deploy env ni tekshiring.');

  const url = new URL(`https://api.telegram.org/bot${token}/${method}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const res = await fetch(url);
  const body = await res.json();
  if (!body.ok) fail(`${method} xato: ${body.description || JSON.stringify(body)}`);
  return body.result;
}

async function printInfo() {
  const info = await telegram('getWebhookInfo');
  console.log(`Webhook url: ${info.url || '(empty)'}`);
  console.log(`Pending updates: ${info.pending_update_count || 0}`);
  console.log(`Last error: ${info.last_error_message || '(none)'}`);
}

(async () => {
  if (action === 'set') {
    if (!/^https:\/\//.test(webhookUrl)) {
      fail('BASE_URL yoki WEBHOOK_URL https domen bo\'lishi kerak. Masalan: https://invit-silk.vercel.app');
    }
    await telegram('setWebhook', { url: webhookUrl });
    console.log(`Webhook o'rnatildi: ${webhookUrl}`);
    await printInfo();
    return;
  }

  if (action === 'delete') {
    await telegram('deleteWebhook', { drop_pending_updates: false });
    console.log('Webhook o\'chirildi.');
    await printInfo();
    return;
  }

  if (action === 'info') {
    await printInfo();
    return;
  }

  fail('Noma\'lum buyruq. Ishlatish: npm run webhook:set | webhook:info | webhook:delete');
})().catch((err) => fail(err.message));
