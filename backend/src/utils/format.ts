// Ism-familiyani to'g'ri imlo bilan formatlash.
// Foydalanuvchi "ALI", "ali", "aLi" deb yozsa ham -> "Ali".
// O' va G' (o‘ktam, g‘ani) kabi harflar to'g'ri saqlanadi.
export function formatName(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLocaleLowerCase('uz');
      return lower.charAt(0).toLocaleUpperCase('uz') + lower.slice(1);
    })
    .join(' ');
}

// Ismlar validatsiyasi: faqat harflar, bo'sh joy, apostrof va tire.
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 40) return false;
  // Lotin + kirill + apostrof/tire/bo'sh joy
  return /^[a-zA-Zа-яА-ЯёЁ'ʻʼ‘’\- ]+$/.test(trimmed);
}

// "Ali va Aziza" / "Ali, Aziza" / "Ali & Aziza" -> { husband, wife }
export function splitCoupleNames(raw: string): { husband: string; wife: string } | null {
  const parts = raw.split(/\s+va\s+|\s*[,&]\s*|\s+&\s+/i).map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const husband = formatName(parts[0]);
  const wife = formatName(parts[1]);
  if (!isValidName(husband) || !isValidName(wife)) return null;
  return { husband, wife };
}

// Slug yasash: "Farhod", "Shirin" -> "farhodshirin"
// Uzbek/kirill harflarni lotinga o'giradi.
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 's', ч: 'ch', ш: 'sh', щ: 'sh',
  ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
};

export function makeSlug(husband: string, wife: string): string {
  const raw = `${husband}${wife}`;
  return raw
    .toLocaleLowerCase('uz')
    .split('')
    .map((ch) => (TRANSLIT[ch] !== undefined ? TRANSLIT[ch] : ch))
    .join('')
    .replace(/['ʻʼ‘’`]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 40);
}

// Validatsiya natijasi: error null bo'lsa — muvaffaqiyatli.
export interface ValidationResult {
  error: string | null;
  value: string;
}

// Sana validatsiyasi: "dd.mm.yyyy", haqiqiy va kelajakdagi sana.
export function validateDate(raw: string): ValidationResult {
  const m = raw.trim().match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
  if (!m) return { error: 'Sana formati: kun.oy.yil (masalan 02.04.2026)', value: '' };

  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);

  if (month < 1 || month > 12) return { error: "Oy 1-12 orasida bo'lishi kerak.", value: '' };
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return { error: 'Bunday kun mavjud emas.', value: '' };

  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return { error: "O'tib ketgan sanani kiritib bo'lmaydi.", value: '' };

  const value = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
  return { error: null, value };
}

// Taklif matni validatsiyasi: gap soni va uzunlik limiti.
export function validateInviteText(
  raw: string,
  maxSentences = 6,
  maxChars = 400
): ValidationResult {
  const text = raw.trim().replace(/\s+/g, ' ');
  if (text.length < 10) return { error: 'Matn juda qisqa (kamida 10 belgi).', value: '' };
  if (text.length > maxChars) {
    return { error: `Matn juda uzun. Ko'pi bilan ${maxChars} belgi (hozir ${text.length}).`, value: '' };
  }
  const sentences = text.split(/[.!?…]+/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length > maxSentences) {
    return { error: `Ko'pi bilan ${maxSentences} ta gap yozing (hozir ${sentences.length}).`, value: '' };
  }
  return { error: null, value: text };
}

// Telegram location (lat/lon) -> universal xarita havolasi (Google Maps)
export function locationToMapLink(lat: number, lon: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

// Foydalanuvchi yuborgan xarita havolasi to'g'rimi (Google/Yandex)
export function isValidMapLink(url: string): boolean {
  return /^https?:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps|yandex\.[a-z]+\/maps|maps\.yandex\.)/i.test(
    url.trim()
  );
}
