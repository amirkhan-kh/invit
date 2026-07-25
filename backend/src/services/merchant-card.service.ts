/**
 * Merchant karta: avval env, bo'lmasa MongoDB `appsettings` (Vercel env kechiksa ham ishlaydi).
 */
import mongoose from 'mongoose';
import { cleanCardDigitsLike, getMerchantCardFromEnv } from '../config';

type MerchantDoc = {
  _id: string;
  number: string;
  holder: string;
  updatedAt?: Date;
};

const KEY = 'merchant_pay_card';

function col() {
  return mongoose.connection.collection('appsettings');
}

export async function loadMerchantCard(): Promise<{ number: string; holder: string; ready: boolean; source: string }> {
  const fromEnv = getMerchantCardFromEnv();
  if (fromEnv.ready) {
    return { ...fromEnv, source: 'env' };
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const doc = (await col().findOne({ _id: KEY as any })) as unknown as MerchantDoc | null;
      const number = cleanCardDigitsLike(doc?.number || '');
      const holder = String(doc?.holder || '—').trim();
      if (number.length >= 16) {
        return { number, holder, ready: true, source: 'mongodb' };
      }
    }
  } catch (e) {
    console.warn('merchant card db read:', e);
  }

  return { number: '', holder: '—', ready: false, source: 'none' };
}

export async function saveMerchantCard(number: string, holder: string): Promise<void> {
  const n = cleanCardDigitsLike(number);
  if (n.length < 16) throw new Error('Karta raqami noto‘g‘ri');
  await col().updateOne(
    { _id: KEY as any },
    { $set: { number: n, holder: holder.trim() || '—', updatedAt: new Date() } },
    { upsert: true }
  );
}
