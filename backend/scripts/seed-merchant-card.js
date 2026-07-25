/**
 * Merchant kartani MongoDB'ga yozadi (Vercel env bo'lmasa ham Mini App ishlaydi).
 *   node scripts/seed-merchant-card.js
 * yoki: PAY_UZCARD_NUMBER=... PAY_UZCARD_HOLDER=... node scripts/seed-merchant-card.js
 */
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const number = String(process.env.PAY_UZCARD_NUMBER || process.env.PAY_HUMO_NUMBER || '')
  .replace(/\D/g, '');
const holder = String(process.env.PAY_UZCARD_HOLDER || process.env.PAY_HUMO_HOLDER || '').trim();
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('MONGO_URI yo‘q');
  process.exit(1);
}
if (number.length < 16) {
  console.error('PAY_UZCARD_NUMBER .env da yo‘q yoki noto‘g‘ri');
  process.exit(1);
}

(async () => {
  const c = new MongoClient(uri);
  await c.connect();
  await c.db().collection('appsettings').updateOne(
    { _id: 'merchant_pay_card' },
    { $set: { number, holder: holder || '—', updatedAt: new Date() } },
    { upsert: true }
  );
  console.log('✅ Merchant karta MongoDB ga yozildi ****' + number.slice(-4), holder);
  await c.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
