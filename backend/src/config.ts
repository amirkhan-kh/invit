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

function cleanCardDigits(raw: string | undefined): string {
  return String(raw || '').replace(/\D/g, '');
}

export type PayMethodId = 'uzcard' | 'humo' | 'bankomat';

export interface PayCardInfo {
  id: PayMethodId;
  label: string;
  subtitle: string;
  number: string;
  holder: string;
  enabled: boolean;
  soon?: boolean;
}

const uzcardNumber = cleanCardDigits(process.env.PAY_UZCARD_NUMBER || process.env.PAY_CARD_NUMBER);
const uzcardHolder = (process.env.PAY_UZCARD_HOLDER || process.env.PAY_CARD_HOLDER || '').trim();
const humoNumber = cleanCardDigits(process.env.PAY_HUMO_NUMBER);
const humoHolder = (process.env.PAY_HUMO_HOLDER || uzcardHolder).trim();

export const config = {
  botToken: process.env.BOT_TOKEN as string,

  mongoUri: (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invitationDB').trim(),
  port: parsePort(process.env.PORT),

  baseUrl: (process.env.BASE_URL || 'https://invit-silk.vercel.app').trim().replace(/\/$/, ''),
  apiPublicUrl: (process.env.API_PUBLIC_URL || process.env.BASE_URL || 'http://localhost:5001')
    .trim()
    .replace(/\/$/, ''),

  uploadsDir: path.resolve(__dirname, '..', 'uploads'),
  mediaDir: path.resolve(__dirname, '..', 'media'),
  maxPhotos: 3,

  // Karta o'tkazma (Hamkorbank UZCARD va boshqalar)
  paySessionMinutes: Math.max(3, Number(process.env.PAY_SESSION_MINUTES || 7) || 7),
  payMinAmount: Math.max(1000, Number(process.env.PAY_MIN_AMOUNT || 1000) || 1000),
  adminTelegramIds: parseAdminIds(process.env.ADMIN_TELEGRAM_IDS),

  payCards: {
    uzcard: {
      id: 'uzcard' as const,
      label: 'UZCARD',
      subtitle: "Kartaga o'tkazma",
      number: uzcardNumber,
      holder: uzcardHolder || '—',
      enabled: uzcardNumber.length >= 16,
    },
    humo: {
      id: 'humo' as const,
      label: 'HUMO',
      subtitle: "Kartaga o'tkazma",
      number: humoNumber || uzcardNumber,
      holder: humoHolder || uzcardHolder || '—',
      // HUMO alohida bo'lmasa — UZCARD raqamiga yo'naltiramiz (ko'p banklar qabul qiladi)
      enabled: (humoNumber.length >= 16) || uzcardNumber.length >= 16,
    },
    bankomat: {
      id: 'bankomat' as const,
      label: 'BANKOMAT',
      subtitle: 'Terminal orqali',
      number: uzcardNumber,
      holder: uzcardHolder || '—',
      enabled: uzcardNumber.length >= 16,
    },
    international: {
      id: 'international' as const,
      label: 'XALQARO',
      subtitle: 'Tez orada',
      number: '',
      holder: '',
      enabled: false,
      soon: true,
    },
  },
};

export function invitationLink(slug: string, templateId?: string): string {
  return templateId
    ? `${config.baseUrl}/preview/${templateId}/${slug}`
    : `${config.baseUrl}/${slug}`;
}

/** Mini App to'lov sahifasi */
export function paymentAppUrl(invitationId: string): string {
  return `${config.baseUrl}/pay/${invitationId}`;
}

/**
 * Rasmni doim nisbiy yo'l sifatida saqlaymiz — domen o'zgarsa ham ishlaydi.
 * Frontend va API bir domen (Vercel) bo'lgani uchun `/api/photo/...` yetarli.
 */
export function photoUrl(fileId: string): string {
  return `/api/photo/${fileId}`;
}

export function formatCardDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '');
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function getPayMethod(method: string): PayCardInfo | null {
  const key = String(method || '').toLowerCase();
  if (key === 'uzcard') return config.payCards.uzcard;
  if (key === 'humo') return config.payCards.humo;
  if (key === 'bankomat') return config.payCards.bankomat;
  return null;
}
