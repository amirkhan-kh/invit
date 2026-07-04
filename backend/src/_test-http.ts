/**
 * HTTP end-to-end test: server + API + to'lov webhook (in-memory DB bilan).
 * Ishga tushirish: npx ts-node src/_test-http.ts
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, extra = '') {
  if (cond) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name} ${extra}`); }
}

async function main() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.PORT = '5099';
  process.env.API_PUBLIC_URL = 'http://localhost:5099';

  // Seed uchun alohida ulanish
  await mongoose.connect(uri);
  const { Invitation, TEMPLATE_PRICES } = await import('./models/invit.back');

  const paid = await Invitation.create({
    slug: 'paidone', templateId: 'medium', husband: 'Ali', wife: 'Aziza',
    date: '10.10.2030', venueName: 'Bog\'', inviteText: 'Taklif.',
    price: TEMPLATE_PRICES.medium, isPaid: true, amountPaid: TEMPLATE_PRICES.medium,
    telegramUserId: 1,
  });
  const unpaid = await Invitation.create({
    slug: 'unpaidone', templateId: 'standard', husband: 'Bek', wife: 'Noza',
    date: '11.11.2030', venueName: 'Zal', inviteText: 'Taklif.',
    price: TEMPLATE_PRICES.standard, telegramUserId: 2,
  });

  // Serverni yuklaymiz (o'z ulanishini yaratadi va tinglaydi)
  await import('./server');
  await new Promise((r) => setTimeout(r, 2500));

  const base = 'http://localhost:5099';

  console.log('\n=== API: taklifnomani o\'qish ===');
  const r404 = await fetch(`${base}/api/invitation/yoq-slug`);
  check('Mavjud bo\'lmagan slug -> 404', r404.status === 404, `(got ${r404.status})`);

  const r402 = await fetch(`${base}/api/invitation/unpaidone`);
  check('To\'lanmagan -> 402', r402.status === 402, `(got ${r402.status})`);

  const rOk = await fetch(`${base}/api/invitation/paidone`);
  const okBody: any = await rOk.json();
  check('To\'langan -> 200', rOk.status === 200, `(got ${rOk.status})`);
  check('Ma\'lumot to\'g\'ri (Ali & Aziza)', okBody.husband === 'Ali' && okBody.wife === 'Aziza');

  console.log('\n=== To\'lov webhook (Click complete) ===');
  const prep = await fetch(`${base}/api/payment/click/prepare`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ click_trans_id: '111', merchant_trans_id: String(unpaid._id) }),
  });
  const prepBody: any = await prep.json();
  check('prepare -> error:0', prepBody.error === 0);

  const comp = await fetch(`${base}/api/payment/click/complete`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant_trans_id: String(unpaid._id), amount: TEMPLATE_PRICES.standard, error: '0' }),
  });
  const compBody: any = await comp.json();
  check('complete -> is_paid:true', compBody.is_paid === true, JSON.stringify(compBody));

  const rNow = await fetch(`${base}/api/invitation/unpaidone`);
  check('To\'lovdan keyin unpaidone -> 200', rNow.status === 200, `(got ${rNow.status})`);

  await mongoose.disconnect();
  await mongod.stop();
  console.log(`\n=== NATIJA: ${passed} ta o'tdi, ${failed} ta yiqildi ===\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error('Test xatosi:', e); process.exit(1); });
