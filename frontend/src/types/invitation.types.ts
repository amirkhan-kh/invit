// Taklifnoma shablonlari (narxlari bilan)
export type TemplateId = 'standard' | 'medium' | 'premium';

export const TEMPLATE_PRICES: Record<TemplateId, number> = {
  standard: 110000,
  medium: 170000,
  premium: 200000,
};

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  standard: 'Standart',
  medium: 'Medium',
  premium: 'Premium',
};

// Backend'dan (API) keladigan taklifnoma ma'lumotlari.
// Bot ham aynan shu tuzilishni to'ldiradi.
export interface InvitationData {
  slug: string; // URL uchun (masalan: farhodshirin)
  templateId: TemplateId;

  husband: string; // Kuyov ismi (to'g'ri imlo bilan formatlangan)
  wife: string; // Kelin ismi (to'g'ri imlo bilan formatlangan)

  date: string; // "02.04.2026" (kun.oy.yil)

  venueName: string; // To'yxona nomi
  address: string; // To'liq manzil matni
  mapLink: string; // Xaritaga havola (Google/Yandex Maps)

  inviteText: string; // Taklifnoma matni (oila nomidan, 5-6 gapgacha)
  footerWish?: string; // Qo'shimcha tilak (ixtiyoriy)

  photos: string[]; // Juftlik rasmlari (0..3 ta), to'liq URL
}

export interface TemplateProps {
  data: InvitationData;
}

// "02.04.2026" -> { day: "02", month: "04", year: "2026", monthName: "Aprel", weekday: "Payshanba" }
export interface ParsedDate {
  day: string;
  month: string;
  year: string;
  monthName: string;
  weekday: string;
  dateObj: Date | null;
}

const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];
const UZ_WEEKDAYS = [
  'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba',
  'Payshanba', 'Juma', 'Shanba',
];

export function parseWeddingDate(dateStr: string): ParsedDate {
  const empty: ParsedDate = {
    day: '', month: '', year: '', monthName: '', weekday: '', dateObj: null,
  };
  if (!dateStr) return empty;

  const parts = dateStr.split('.');
  if (parts.length !== 3) return { ...empty, day: parts[0] || '' };

  const [d, m, y] = parts.map((p) => p.trim());
  const dayNum = parseInt(d, 10);
  const monthNum = parseInt(m, 10);
  const yearNum = parseInt(y, 10);

  let dateObj: Date | null = null;
  if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
    dateObj = new Date(yearNum, monthNum - 1, dayNum);
  }

  return {
    day: d.padStart(2, '0'),
    month: m.padStart(2, '0'),
    year: y,
    monthName: UZ_MONTHS[monthNum - 1] || '',
    weekday: dateObj ? UZ_WEEKDAYS[dateObj.getDay()] : '',
    dateObj,
  };
}
