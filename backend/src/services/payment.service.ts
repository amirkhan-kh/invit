import { Invitation } from '../models/invit.back';

/**
 * TEST (bypass) kartasi — bu karta kiritilsa real pul yechilmaydi,
 * to'lov darhol muvaffaqiyatli deb belgilanadi. Faqat siz sinash uchun.
 * .env dagi TEST_CARD orqali o'zgartirsa bo'ladi.
 */
export const TEST_CARD = (process.env.TEST_CARD || '1234567812345678').replace(/\s/g, '');

// Karta raqamini tozalash (bo'sh joy/tirelarni olib tashlash)
export function cleanCard(raw: string): string {
  return raw.replace(/[\s-]/g, '');
}

// Luhn algoritmi — karta raqami to'g'ri tuzilishga egami
export function luhnValid(card: string): boolean {
  const digits = card.replace(/\D/g, '');
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function isTestCard(card: string): boolean {
  return cleanCard(card) === TEST_CARD;
}

export interface PaymentResult {
  isPaid: boolean;
  price: number;
  amountPaid: number;
  remaining: number;
  slug: string;
  templateId: string;
  message: string;
}

/**
 * To'lovni qo'llash (qisman to'lovlar mantig'i bilan).
 * - amount qo'shiladi amountPaid ga.
 * - amountPaid >= price bo'lsa -> isPaid = true.
 * - kam bo'lsa -> qolgan summa (remaining) qaytariladi (keyingi safar auto-to'ldirish uchun).
 */
export async function applyPayment(invitationId: string, amount: number): Promise<PaymentResult> {
  const inv = await Invitation.findById(invitationId);
  if (!inv) throw new Error('Taklifnoma topilmadi');

  if (inv.isPaid) {
    return {
      isPaid: true,
      price: inv.price,
      amountPaid: inv.amountPaid,
      remaining: 0,
      slug: inv.slug,
      templateId: inv.templateId,
      message: 'allaqachon to\'langan',
    };
  }

  inv.amountPaid += Math.max(0, Math.round(amount));
  const remaining = Math.max(0, inv.price - inv.amountPaid);

  if (inv.amountPaid >= inv.price) {
    inv.isPaid = true;
    await inv.save();
    return {
      isPaid: true,
      price: inv.price,
      amountPaid: inv.amountPaid,
      remaining: 0,
      slug: inv.slug,
      templateId: inv.templateId,
      message: 'to\'liq to\'landi',
    };
  }

  await inv.save();
  return {
    isPaid: false,
    price: inv.price,
    amountPaid: inv.amountPaid,
    remaining,
    slug: inv.slug,
    templateId: inv.templateId,
    message: 'qisman to\'landi',
  };
}

/**
 * Test kartasi orqali darhol to'liq to'lash (real pulsiz).
 */
export async function payWithTestCard(invitationId: string): Promise<PaymentResult> {
  const inv = await Invitation.findById(invitationId);
  if (!inv) throw new Error('Taklifnoma topilmadi');
  inv.amountPaid = inv.price;
  inv.isPaid = true;
  await inv.save();
  return {
    isPaid: true,
    price: inv.price,
    amountPaid: inv.amountPaid,
    remaining: 0,
    slug: inv.slug,
    templateId: inv.templateId,
    message: 'test kartasi bilan to\'landi',
  };
}
