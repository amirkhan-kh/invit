/**
 * Integratsion test — butun backend mantig'ini in-memory MongoDB bilan sinaydi.
 * Ishga tushirish: npx ts-node src/_test-flow.ts
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Invitation, TEMPLATE_PRICES } from './models/invit.back';
import { applyPayment, payWithTestCard, luhnValid, isTestCard } from './services/payment.service';
import {
  formatName,
  splitCoupleNames,
  validateDate,
  validateInviteText,
  makeSlug,
} from './utils/format';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`);
  }
}

async function main() {
  console.log('\n=== 1. Formatlash / validatsiya ===');
  check('formatName("ALI")="Ali"', formatName('ALI') === 'Ali');
  check('formatName("shirin oxunova") to\'g\'ri', formatName('shirin oxunova') === 'Shirin Oxunova');
  const names = splitCoupleNames('farhod va shirin');
  check('splitCoupleNames -> Farhod/Shirin', !!names && names.husband === 'Farhod' && names.wife === 'Shirin');
  check('splitCoupleNames("Ali & Aziza")', !!splitCoupleNames('Ali & Aziza'));
  check('splitCoupleNames("bitta") = null', splitCoupleNames('bitta') === null);
  check('makeSlug -> farhodshirin', makeSlug('Farhod', 'Shirin') === 'farhodshirin');

  check('validateDate("32.01.2030") xato', !!validateDate('32.01.2030').error);
  check('validateDate("01.01.2020") o\'tgan sana xato', !!validateDate('01.01.2020').error);
  check('validateDate("15.09.2030") to\'g\'ri', validateDate('15.09.2030').value === '15.09.2030');

  check('validateInviteText qisqa xato', !!validateInviteText('qisqa').error);
  const longText = 'Bir. Ikki. Uch. To\'rt. Besh. Olti. Yetti.';
  check('validateInviteText 7 gap xato', !!validateInviteText(longText).error);
  check('validateInviteText normal OK', !validateInviteText('Sizni to\'yga taklif qilamiz. Keling!').error);

  console.log('\n=== 2. To\'lov yordamchilari ===');
  check('luhnValid("4111111111111111") true', luhnValid('4111111111111111') === true);
  check('luhnValid("1234") false', luhnValid('1234') === false);
  check('isTestCard(TEST_CARD) true', isTestCard('1234567812345678') === true);

  console.log('\n=== 3. DB: yaratish + qisman/to\'liq to\'lov ===');
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const inv = await Invitation.create({
    slug: 'farhodshirin',
    templateId: 'premium',
    husband: 'Farhod',
    wife: 'Shirin',
    date: '15.09.2030',
    venueName: 'Anhor Lounge',
    address: 'Anhor Lounge',
    mapLink: 'https://maps.google.com/?q=41.3,69.2',
    inviteText: 'Sizni to\'yga taklif qilamiz.',
    photos: ['http://x/1.jpg', 'http://x/2.jpg'],
    price: TEMPLATE_PRICES.premium,
    telegramUserId: 12345,
  });
  check('Taklifnoma yaratildi (isPaid=false)', !inv.isPaid);
  check('Narx 200000 (premium)', inv.price === 200000);
  check('Rasmlar 2 ta', inv.photos.length === 2);

  const invId = String(inv._id);

  // Qisman to'lov: 50000 (kam)
  const r1 = await applyPayment(invId, 50000);
  check('Qisman to\'lovdan keyin isPaid=false', r1.isPaid === false);
  check('Qoldiq 150000', r1.remaining === 150000);
  check('To\'langan 50000', r1.amountPaid === 50000);

  // Yana kam to'lov: 100000 (jami 150000)
  const r2 = await applyPayment(invId, 100000);
  check('Ikkinchi qisman to\'lovdan keyin qoldiq 50000', r2.remaining === 50000);
  check('Hali to\'lanmagan', r2.isPaid === false);

  // Qolganini to'lash: 50000 -> to'liq
  const r3 = await applyPayment(invId, 50000);
  check('To\'liq to\'langach isPaid=true', r3.isPaid === true);
  check('Qoldiq 0', r3.remaining === 0);

  const reloaded = await Invitation.findById(invId);
  check('DB da isPaid=true saqlandi', reloaded!.isPaid === true);

  // Test kartasi bilan darhol to'lash (boshqa taklifnoma)
  const inv2 = await Invitation.create({
    slug: 'testkarta',
    templateId: 'standard',
    husband: 'Aziz',
    wife: 'Malika',
    date: '20.10.2030',
    inviteText: 'Taklif.',
    price: TEMPLATE_PRICES.standard,
    telegramUserId: 999,
  });
  const rt = await payWithTestCard(String(inv2._id));
  check('Test kartasi bilan darhol to\'landi', rt.isPaid === true && rt.amountPaid === 110000);

  await mongoose.disconnect();
  await mongod.stop();

  console.log(`\n=== NATIJA: ${passed} ta o'tdi, ${failed} ta yiqildi ===\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('Test xatosi:', e);
  process.exit(1);
});
