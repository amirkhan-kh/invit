/**
 * To'lovdan keyin mehmonlarga yuboriladigan nafis taklifnoma posti.
 * Telegram: HTML (bold/italic/blockquote) + katta link preview + intro OG rasm.
 */
import { config, invitationLink } from '../config';
import { normalizePhotoUrl } from '../utils/photo-url';

function escHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const UZ_WD = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const UZ_MO = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

export function parseWeddingParts(dateStr?: string): {
  weekday: string;
  pretty: string;
  raw: string;
} {
  const raw = String(dateStr || '').trim();
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(raw);
  if (!m) return { weekday: '', pretty: raw, raw };
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  const weekday = UZ_WD[dt.getDay()] || '';
  const pretty = `${d}-${UZ_MO[mo - 1] || ''} ${y}`;
  return { weekday, pretty, raw };
}

export function buildOgImageUrl(inv: {
  husband: string;
  wife: string;
  date?: string;
  photos?: string[];
  templateId?: string;
}): string {
  const { weekday } = parseWeddingParts(inv.date);
  let img = normalizePhotoUrl((inv.photos && inv.photos[0]) || '');
  if (img.startsWith('/')) img = `${config.baseUrl}${img}`;
  const params = new URLSearchParams({
    h: inv.husband || 'Kuyov',
    w: inv.wife || 'Kelin',
    d: inv.date || '',
    wd: weekday,
    img: img || '',
    tpl: inv.templateId || 'premium',
    v: '2',
  });
  return `${config.baseUrl}/api/og-image?${params.toString()}`;
}

/**
 * Mehmonlarga forward qilish uchun nafis matn (HTML).
 * Havola alohida yuboriladi yoki caption oxirida — preview uchun.
 */
function safeMapHref(mapLink?: string): string {
  const u = String(mapLink || '').trim();
  if (!u) return '';
  // faqat http(s) yoki geo/maps havolalari
  if (/^https?:\/\//i.test(u)) return u;
  if (/^(geo:|maps:)/i.test(u)) return u;
  return '';
}

export function buildInvitationShareHtml(inv: {
  husband: string;
  wife: string;
  date?: string;
  venueName?: string;
  address?: string;
  mapLink?: string;
  inviteText?: string;
  slug: string;
  templateId: string;
}): { html: string; link: string; ogUrl: string } {
  const link = invitationLink(inv.slug, inv.templateId);
  const ogUrl = buildOgImageUrl(inv);
  const { weekday, pretty, raw } = parseWeddingParts(inv.date);
  const dateLine = weekday ? `${pretty}  ·  ${weekday}` : pretty || raw;
  const venue = (inv.venueName || '').trim();
  const address = (inv.address || '').trim();
  const mapHref = safeMapHref(inv.mapLink);
  const wish = String(inv.inviteText || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 220);

  // Ornament + tipografiya — Telegram HTML (bold, italic, blockquote, spoiler, url)
  const lines: string[] = [
    `✦  <b>T A K L I F N O M A</b>  ✦`,
    ``,
    `<i>${escHtml(inv.husband)}</i>`,
    `     <b>&</b>`,
    `<i>${escHtml(inv.wife)}</i>`,
    ``,
  ];

  if (dateLine) {
    lines.push(`📅  ${escHtml(dateLine)}`);
  }
  // To'yxona nomi — location mapLink bilan bosiladigan havola
  if (venue) {
    if (mapHref) {
      lines.push(
        `🏛  <a href="${escHtml(mapHref)}">${escHtml(venue)}</a>`
      );
    } else {
      lines.push(`🏛  ${escHtml(venue)}`);
    }
  }
  // Qo'shimcha manzil matni (agar bo'lsa) — ham xaritaga bog'lanadi
  if (address && address !== venue) {
    if (mapHref) {
      lines.push(`📍  <a href="${escHtml(mapHref)}">${escHtml(address)}</a>`);
    } else {
      lines.push(`📍  ${escHtml(address)}`);
    }
  }
  // Joy bor, lekin nom yo'q — faqat xarita
  if (!venue && !address && mapHref) {
    lines.push(`📍  <a href="${escHtml(mapHref)}">Xaritada ochish</a>`);
  }

  if (wish) {
    lines.push(``);
    lines.push(`<blockquote>${escHtml(wish)}</blockquote>`);
  } else {
    lines.push(``);
    lines.push(
      `<blockquote>Sizni hayotimizning eng baxtli kuniga mehmon bo‘lishga taklif etamiz.</blockquote>`
    );
  }

  lines.push(``);
  lines.push(`────────────────`);
  lines.push(`✨ Ochish uchun bosing`);
  lines.push(link);
  lines.push(``);
  lines.push(`<tg-spoiler>baxt.uz  ·  sevgi bilan</tg-spoiler>`);

  return { html: lines.join('\n'), link, ogUrl };
}

/**
 * To'lov egasiga: qisqa tasdiq + go'zal share-post (rasm + caption).
 */
export async function sendPaidInvitationPost(
  telegram: {
    sendMessage: (chatId: number, text: string, extra?: object) => Promise<unknown>;
    sendPhoto: (chatId: number, photo: string, extra?: object) => Promise<unknown>;
  },
  chatId: number,
  inv: {
    husband: string;
    wife: string;
    date?: string;
    venueName?: string;
    address?: string;
    mapLink?: string;
    inviteText?: string;
    photos?: string[];
    slug: string;
    templateId: string;
  }
): Promise<void> {
  const { html, link, ogUrl } = buildInvitationShareHtml(inv);
  const mapHref = safeMapHref(inv.mapLink);
  const venue = (inv.venueName || '').trim() || 'Xarita';

  // 1) Qisqa tasdiq (faqat egaga) — toza, nafis
  try {
    await telegram.sendMessage(
      chatId,
      `✅ <b>To‘lovingiz tasdiqlandi</b>\n` +
        `<i>Taklifnomangiz tayyor — yaqinlaringizga yuboring 💍</i>`,
      {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      }
    );
  } catch {
    /* ignore */
  }

  // 2) Asosiy share-post: intro OG rasm + nafis caption (to'yxona = xarita havolasi)
  try {
    await telegram.sendPhoto(chatId, ogUrl, {
      caption: html,
      parse_mode: 'HTML',
    });
  } catch (e) {
    console.warn('sendPhoto OG failed, fallback text:', e);
    await telegram.sendMessage(chatId, `${link}\n\n${html}`, {
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: false,
        prefer_large_media: true,
        show_above_text: true,
        url: link,
      },
    } as any);
  }

  // 3) Taklifnoma havolasi — katta preview
  try {
    await telegram.sendMessage(chatId, link, {
      link_preview_options: {
        is_disabled: false,
        prefer_large_media: true,
        show_above_text: true,
      },
    } as any);
  } catch {
    /* ignore */
  }

  // 4) Xarita (ikkala joyda ham — caption + alohida qulay post)
  if (mapHref) {
    try {
      await telegram.sendMessage(
        chatId,
        `📍 <b>Manzil</b>\n` +
          `<a href="${escHtml(mapHref)}">${escHtml(venue)}</a>\n` +
          `<i>Xaritada ochish uchun bosing</i>`,
        {
          parse_mode: 'HTML',
          link_preview_options: {
            is_disabled: false,
            prefer_large_media: true,
            url: mapHref,
          },
        } as any
      );
    } catch {
      /* ignore */
    }
  }
}
