/**
 * Karta o'tkazma to'lov (Verion Shop uslubi).
 * Foydalanuvchi: usul tanlaydi → karta + timer → "To'lov qildim" → admin tasdiqlaydi.
 * Kelajakda balanc/katalog qo'shish uchun productType/productId maydonlari tayyor.
 */
import crypto from 'crypto';
import { Invitation, IInvitation, PaymentMethod, TEMPLATE_PRICES } from '../models/invit.back';
import {
  buildPayCards,
  config,
  formatCardDisplay,
  getMerchantCardFromEnv,
  invitationLink,
  paymentAppUrl,
} from '../config';
import { loadMerchantCard } from './merchant-card.service';

export type ProductKind = 'invitation_template'; // kelajak: 'balance_topup' | 'catalog_item'

export interface PaymentSessionView {
  invitationId: string;
  slug: string;
  templateId: string;
  templateLabel: string;
  husband: string;
  wife: string;
  productKind: ProductKind;
  productTitle: string;
  amount: number;
  currency: 'UZS';
  isPaid: boolean;
  paymentStatus: string;
  paymentMethod: string;
  expiresAt: string | null;
  remainingSeconds: number;
  methods: Array<{
    id: string;
    label: string;
    subtitle: string;
    enabled: boolean;
    soon?: boolean;
  }>;
  card: null | {
    method: string;
    label: string;
    number: string;
    numberDisplay: string;
    holder: string;
  };
  rules: string[];
  invitationUrl: string | null;
  payUrl: string;
}

const TEMPLATE_LABELS: Record<string, string> = {
  standard: 'Standart',
  medium: 'Medium',
  premium: 'Premium',
};

function remainingSeconds(expiresAt?: Date | null): number {
  if (!expiresAt) return 0;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

function ensureNotExpired(inv: IInvitation): void {
  if (
    inv.paymentStatus === 'awaiting_transfer' &&
    inv.paymentExpiresAt &&
    new Date(inv.paymentExpiresAt).getTime() < Date.now()
  ) {
    inv.paymentStatus = 'expired';
    inv.paymentExpiresAt = null;
  }
}

export function publicSession(
  inv: IInvitation,
  merchant?: { number: string; holder: string; ready: boolean }
): PaymentSessionView {
  ensureNotExpired(inv);
  const m = merchant || getMerchantCardFromEnv();
  const cards = buildPayCards(m.number, m.holder);
  const methodKey = (inv.paymentMethod || '') as keyof typeof cards;
  const method = methodKey && cards[methodKey] ? cards[methodKey] : null;
  const amount = inv.paymentAmount || inv.price || TEMPLATE_PRICES[inv.templateId] || 0;
  const rem = remainingSeconds(inv.paymentExpiresAt);

  return {
    invitationId: String(inv._id),
    slug: inv.slug,
    templateId: inv.templateId,
    templateLabel: TEMPLATE_LABELS[inv.templateId] || inv.templateId,
    husband: inv.husband,
    wife: inv.wife,
    productKind: 'invitation_template',
    productTitle: `Taklifnoma — ${TEMPLATE_LABELS[inv.templateId] || inv.templateId}`,
    amount,
    currency: 'UZS',
    isPaid: !!inv.isPaid,
    paymentStatus: inv.isPaid ? 'paid' : inv.paymentStatus || 'unpaid',
    paymentMethod: inv.paymentMethod || '',
    expiresAt: inv.paymentExpiresAt ? new Date(inv.paymentExpiresAt).toISOString() : null,
    remainingSeconds: inv.paymentStatus === 'awaiting_transfer' ? rem : 0,
    methods: (['humo', 'uzcard', 'bankomat', 'international'] as const).map((id) => ({
      id: cards[id].id,
      label: cards[id].label,
      subtitle: cards[id].subtitle,
      enabled: cards[id].enabled,
      soon: cards[id].soon,
    })),
    card:
      method && inv.paymentStatus === 'awaiting_transfer' && rem > 0 && method.number
        ? {
            method: method.id,
            label: method.label,
            number: method.number,
            numberDisplay: formatCardDisplay(method.number),
            holder: method.holder,
          }
        : null,
    rules: [
      "Summani 1 so'mga ham o'zgartirmang",
      `${config.paySessionMinutes} daqiqa ichida to'lang`,
      "Faqat ko'rsatilgan kartaga",
      inv.paymentMethod === 'bankomat'
        ? 'Bankomat / terminal orqali to‘ldirish mumkin'
        : "Faqat kartadan kartaga o'tkazma",
    ],
    invitationUrl: inv.isPaid ? invitationLink(inv.slug, inv.templateId) : null,
    payUrl: paymentAppUrl(String(inv._id)),
  };
}

export async function publicSessionAsync(inv: IInvitation): Promise<PaymentSessionView> {
  const merchant = await loadMerchantCard();
  return publicSession(inv, merchant);
}

export async function getInvitationForPay(
  invitationId: string,
  telegramUserId?: number
): Promise<IInvitation | null> {
  const inv = await Invitation.findById(invitationId).catch(() => null);
  if (!inv) return null;
  if (telegramUserId && inv.telegramUserId !== telegramUserId) {
    // Admin emas va egasi emas
    if (!config.adminTelegramIds.includes(telegramUserId)) return null;
  }
  ensureNotExpired(inv);
  if (inv.isModified('paymentStatus')) await inv.save();
  return inv;
}

export async function startTransferSession(
  invitationId: string,
  method: PaymentMethod,
  telegramUserId: number
): Promise<{ ok: true; session: PaymentSessionView } | { ok: false; error: string }> {
  const inv = await getInvitationForPay(invitationId, telegramUserId);
  if (!inv) return { ok: false, error: 'Taklifnoma topilmadi yoki ruxsat yo‘q' };
  const merchantEarly = await loadMerchantCard();
  if (inv.isPaid || inv.paymentStatus === 'paid') {
    return { ok: true, session: publicSession(inv, merchantEarly) };
  }
  if (inv.paymentStatus === 'pending_review') {
    return { ok: false, error: "To'lov tekshiruvda. Iltimos, kuting." };
  }

  const allowed = ['uzcard', 'humo', 'bankomat', 'international'];
  if (!allowed.includes(method)) {
    return { ok: false, error: "To'lov usuli noto'g'ri" };
  }
  const merchant = await loadMerchantCard();
  if (!merchant.ready) {
    return { ok: false, error: "To'lov kartasi sozlanmagan (admin: PAY_UZCARD_NUMBER yoki DB)" };
  }

  inv.paymentMethod = method as PaymentMethod;
  inv.paymentNote = '';
  inv.paymentAmount = inv.price || TEMPLATE_PRICES[inv.templateId];
  inv.paymentStatus = 'awaiting_transfer';
  inv.paymentExpiresAt = new Date(Date.now() + config.paySessionMinutes * 60 * 1000);
  inv.paymentDeclaredAt = null;
  await inv.save();

  return { ok: true, session: publicSession(inv, merchant) };
}

export async function declareTransferPaid(
  invitationId: string,
  telegramUserId: number
): Promise<{ ok: true; session: PaymentSessionView } | { ok: false; error: string }> {
  const inv = await getInvitationForPay(invitationId, telegramUserId);
  if (!inv) return { ok: false, error: 'Taklifnoma topilmadi yoki ruxsat yo‘q' };
  const merchant = await loadMerchantCard();
  if (inv.isPaid) return { ok: true, session: publicSession(inv, merchant) };

  ensureNotExpired(inv);
  if (inv.paymentStatus === 'expired') {
    return { ok: false, error: "Vaqt tugadi. Yangi sessiya boshlang." };
  }
  if (inv.paymentStatus !== 'awaiting_transfer') {
    return { ok: false, error: "Avval to'lov usulini tanlang va kartaga o'tkazma qiling." };
  }
  if (remainingSeconds(inv.paymentExpiresAt) <= 0) {
    inv.paymentStatus = 'expired';
    await inv.save();
    return { ok: false, error: "Vaqt tugadi. Yangi sessiya boshlang." };
  }

  inv.paymentStatus = 'pending_review';
  inv.paymentDeclaredAt = new Date();
  await inv.save();

  return { ok: true, session: publicSession(inv, merchant) };
}

export async function cancelTransferSession(
  invitationId: string,
  telegramUserId: number
): Promise<{ ok: true; session: PaymentSessionView } | { ok: false; error: string }> {
  const inv = await getInvitationForPay(invitationId, telegramUserId);
  if (!inv) return { ok: false, error: 'Taklifnoma topilmadi' };
  const merchant = await loadMerchantCard();
  if (inv.isPaid) return { ok: true, session: publicSession(inv, merchant) };
  if (inv.paymentStatus === 'pending_review') {
    return { ok: false, error: "Tekshiruvdagi to'lovni bekor qilib bo'lmaydi. Admin bilan bog'laning." };
  }
  inv.paymentStatus = 'cancelled';
  inv.paymentExpiresAt = null;
  inv.paymentMethod = '';
  await inv.save();
  inv.paymentStatus = 'unpaid';
  await inv.save();
  return { ok: true, session: publicSession(inv, merchant) };
}

export async function adminConfirmPayment(
  invitationId: string,
  adminName: string
): Promise<{ ok: true; inv: IInvitation } | { ok: false; error: string }> {
  const inv = await Invitation.findById(invitationId).catch(() => null);
  if (!inv) return { ok: false, error: 'Topilmadi' };
  if (inv.isPaid) return { ok: true, inv };

  inv.isPaid = true;
  inv.amountPaid = inv.price;
  inv.paymentStatus = 'paid';
  inv.paymentConfirmedAt = new Date();
  inv.paymentConfirmedBy = adminName;
  inv.paymentExpiresAt = null;
  await inv.save();
  return { ok: true, inv };
}

export async function adminRejectPayment(
  invitationId: string,
  reason?: string
): Promise<{ ok: true; inv: IInvitation } | { ok: false; error: string }> {
  const inv = await Invitation.findById(invitationId).catch(() => null);
  if (!inv) return { ok: false, error: 'Topilmadi' };
  if (inv.isPaid) return { ok: false, error: 'Allaqachon to‘langan' };

  inv.paymentStatus = 'unpaid';
  inv.paymentMethod = '';
  inv.paymentExpiresAt = null;
  inv.paymentDeclaredAt = null;
  inv.paymentNote = reason || 'Admin rad etdi';
  await inv.save();
  return { ok: true, inv };
}

/** Telegram WebApp initData tekshiruvi */
export function validateTelegramWebAppInitData(
  initData: string,
  botToken: string
): { ok: true; userId: number; username?: string } | { ok: false; error: string } {
  if (!initData || !botToken) return { ok: false, error: 'initData yo‘q' };

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, error: 'hash yo‘q' };

  params.delete('hash');
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculated = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculated !== hash) return { ok: false, error: 'Imzo noto‘g‘ri' };

  const authDate = Number(params.get('auth_date') || 0);
  if (authDate && Date.now() / 1000 - authDate > 86400) {
    return { ok: false, error: 'initData eskirgan' };
  }

  let userId = 0;
  let username: string | undefined;
  try {
    const user = JSON.parse(params.get('user') || '{}');
    userId = Number(user.id || 0);
    username = user.username;
  } catch {
    return { ok: false, error: 'user parse xato' };
  }
  if (!userId) return { ok: false, error: 'user id yo‘q' };
  return { ok: true, userId, username };
}

export function isAdmin(userId: number): boolean {
  return config.adminTelegramIds.includes(userId);
}

/** Foydalanuvchining eng so'nggi to'lanmagan taklifnomasi (SHOP menu uchun) */
export async function findLatestUnpaidForUser(telegramUserId: number): Promise<IInvitation | null> {
  return Invitation.findOne({
    telegramUserId,
    isPaid: false,
    paymentStatus: { $ne: 'paid' },
  })
    .sort({ createdAt: -1 })
    .exec();
}

/** Adminlarga "to'lov tekshiruvi" xabari (bot lazy import — circular dependency yo'q) */
export async function notifyAdminsPending(invitationId: string): Promise<void> {
  const inv = await Invitation.findById(invitationId);
  if (!inv || !config.adminTelegramIds.length) return;
  const { getBot } = await import('../bot/bot');
  const bot = getBot();
  const amount = (inv.paymentAmount || inv.price).toLocaleString('ru-RU');
  const text =
    `🔔 *Yangi to'lov tekshiruvi*\n\n` +
    `👰 ${inv.wife} & 🤵 ${inv.husband}\n` +
    `🖼 ${inv.templateId} · \`${inv.slug}\`\n` +
    `💳 ${amount} so'm · ${(inv.paymentMethod || '').toUpperCase()}\n` +
    `👤 User: ${inv.telegramUserId}` +
    (inv.telegramUsername ? ` (@${inv.telegramUsername})` : '') +
    `\nID: \`${inv._id}\``;

  const reply_markup = {
    inline_keyboard: [
      [
        { text: '✅ Tasdiqlash', callback_data: `adm_ok_${inv._id}` },
        { text: '❌ Rad etish', callback_data: `adm_no_${inv._id}` },
      ],
    ],
  };

  for (const adminId of config.adminTelegramIds) {
    try {
      await bot.telegram.sendMessage(adminId, text, { parse_mode: 'Markdown', reply_markup });
    } catch (e) {
      console.error('Admin xabar xato', adminId, e);
    }
  }
}

export async function notifyUserPaid(inv: {
  telegramUserId: number;
  slug: string;
  templateId: string;
  husband: string;
  wife: string;
  price: number;
}): Promise<void> {
  const { getBot } = await import('../bot/bot');
  const { hideShopMenuForUser } = await import('./menu-button.service');
  const bot = getBot();
  const link = invitationLink(inv.slug, inv.templateId);
  const amount = inv.price.toLocaleString('ru-RU');
  try {
    await hideShopMenuForUser(inv.telegramUserId);
  } catch {
    /* ignore */
  }
  await bot.telegram.sendMessage(
    inv.telegramUserId,
    `✅ *To'lovingiz tasdiqlandi!*\n` +
      `Taklifnomangiz faollashtirildi.\n\n` +
      `💰 Summa: ${amount} so'm\n` +
      `👰 ${inv.wife} & 🤵 ${inv.husband}\n\n` +
      `🔗 Havola:\n${link}`,
    { parse_mode: 'Markdown' }
  );
}
