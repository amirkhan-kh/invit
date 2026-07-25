import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function parsePort(value: string | undefined): number {
  const port = Number(value || 5001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT noto'g'ri: ${value}`);
  }
  return port;
}

function parseAdminIds(raw: string | undefined): number[] {
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function cleanCardDigitsLike(raw: string | undefined): string {
  return String(raw || '').replace(/\D/g, '');
}

function cleanCardDigits(raw: string | undefined): string {
  return cleanCardDigitsLike(raw);
}

export type PayMethodId = 'uzcard' | 'humo' | 'bankomat' | 'international';

export interface PayCardInfo {
  id: PayMethodId;
  label: string;
  subtitle: string;
  number: string;
  holder: string;
  enabled: boolean;
  soon?: boolean;
}

/** Faqat env (sinxron) */
export function getMerchantCardFromEnv(): { number: string; holder: string; ready: boolean } {
  const number = cleanCardDigits(
    process.env.PAY_UZCARD_NUMBER ||
      process.env.PAY_HUMO_NUMBER ||
      process.env.PAY_CARD_NUMBER ||
      ''
  );
  const holder = (
    process.env.PAY_UZCARD_HOLDER ||
    process.env.PAY_HUMO_HOLDER ||
    process.env.PAY_CARD_HOLDER ||
    ''
  ).trim();
  return { number, holder: holder || '—', ready: number.length >= 16 };
}

/** @deprecated prefer loadMerchantCard() async — env sinxron fallback */
export function getMerchantCard(): { number: string; holder: string; ready: boolean } {
  return getMerchantCardFromEnv();
}

export function buildPayCards(number: string, holder: string): Record<PayMethodId, PayCardInfo> {
  const ready = number.length >= 16;
  const h = holder || '—';
  return {
    humo: {
      id: 'humo',
      label: 'HUMO',
      subtitle: "Kartaga o'tkazma",
      number,
      holder: h,
      enabled: ready,
    },
    uzcard: {
      id: 'uzcard',
      label: 'UZCARD',
      subtitle: "Kartaga o'tkazma",
      number,
      holder: h,
      enabled: ready,
    },
    bankomat: {
      id: 'bankomat',
      label: 'BANKOMAT',
      subtitle: 'Terminal orqali',
      number,
      holder: h,
      enabled: ready,
    },
    international: {
      id: 'international',
      label: 'XALQARO',
      subtitle: "Kartaga o'tkazma",
      number,
      holder: h,
      enabled: ready,
      soon: false,
    },
  };
}

export function getPayCards(): Record<PayMethodId, PayCardInfo> {
  const { number, holder } = getMerchantCardFromEnv();
  return buildPayCards(number, holder);
}

export const config = {
  botToken: process.env.BOT_TOKEN as string,
  supportUsername: (process.env.SUPPORT_USERNAME || 'elnox_uz').replace(/^@/, ''),

  mongoUri: (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invitationDB').trim(),
  port: parsePort(process.env.PORT),

  baseUrl: (process.env.BASE_URL || 'https://invit-silk.vercel.app').trim().replace(/\/$/, ''),
  apiPublicUrl: (process.env.API_PUBLIC_URL || process.env.BASE_URL || 'http://localhost:5001')
    .trim()
    .replace(/\/$/, ''),

  uploadsDir: path.resolve(__dirname, '..', 'uploads'),
  mediaDir: path.resolve(__dirname, '..', 'media'),
  maxPhotos: 3,

  paySessionMinutes: Math.max(3, Number(process.env.PAY_SESSION_MINUTES || 7) || 7),
  payMinAmount: Math.max(1000, Number(process.env.PAY_MIN_AMOUNT || 1000) || 1000),
  adminTelegramIds: parseAdminIds(process.env.ADMIN_TELEGRAM_IDS),

  /**
   * true — «To'lov qildim» darhol tasdiq (tavsiya etilmaydi).
   * false (default) — real: admin kartaga pul tushganini ko'rib tasdiqlaydi → link.
   */
  payAutoConfirm: String(process.env.PAY_AUTO_CONFIRM ?? 'false').toLowerCase() === 'true',

  /** true — test summalar / sinov tugmalari. false (default) — real to'lov. */
  payTestMode: String(process.env.PAY_TEST_MODE ?? 'false').toLowerCase() === 'true',
  payTestAmountMax: Math.min(99, Math.max(1, Number(process.env.PAY_TEST_AMOUNT_MAX || 8) || 8)),

  /** @deprecated use getPayCards() — saqlangan qulaylik uchun */
  get payCards() {
    return getPayCards();
  },
};

export function invitationLink(slug: string, templateId?: string): string {
  return templateId
    ? `${config.baseUrl}/preview/${templateId}/${slug}`
    : `${config.baseUrl}/${slug}`;
}

export function paymentAppUrl(invitationId: string): string {
  return `${config.baseUrl}/pay/${invitationId}`;
}

export function shopMenuUrl(): string {
  return `${config.baseUrl}/pay`;
}

export function photoUrl(fileId: string): string {
  return `/api/photo/${fileId}`;
}

export function formatCardDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '');
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function getPayMethod(method: string): PayCardInfo | null {
  const cards = getPayCards();
  const key = String(method || '').toLowerCase() as PayMethodId;
  if (key in cards) return cards[key];
  return null;
}
