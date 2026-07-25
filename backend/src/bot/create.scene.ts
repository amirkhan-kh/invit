import { Scenes, Markup } from 'telegraf';
import { MyContext, textOf, photoOf, locationOf, venueOf } from './context';
import {
  splitCoupleNames,
  validateDate,
  validateInviteText,
  locationToMapLink,
  isValidMapLink,
} from '../utils/format';
import { downloadTelegramPhoto } from '../services/photo.service';
import { Invitation, TEMPLATE_PRICES, TemplateId } from '../models/invit.back';
import { makeSlug } from '../utils/format';
import { config, paymentAppUrl } from '../config';
import { normalizePhotoList } from '../utils/photo-url';
import { showShopMenuForUser } from '../services/menu-button.service';

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  standard: 'Standart',
  medium: 'Medium',
  premium: 'Premium',
};

async function uniqueSlug(husband: string, wife: string): Promise<string> {
  const base = makeSlug(husband, wife) || 'taklif';
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Invitation.findOne({ slug })) {
    slug = `${base}${i}`;
    i++;
  }
  return slug;
}

const skipPhotoKeyboard = Markup.keyboard([['✅ Davom etish', '⏭ Rasmsiz']])
  .resize()
  .oneTime();

export const createScene = new Scenes.WizardScene<MyContext>(
  'create_invitation',

  // 0 — ismlar
  async (ctx) => {
    // Tanlangan shablon scene.state orqali keladi
    const st = ctx.scene.state as { templateId?: TemplateId };
    if (st.templateId) ctx.scene.session.templateId = st.templateId;

    const tpl = ctx.scene.session.templateId
      ? TEMPLATE_LABELS[ctx.scene.session.templateId]
      : 'shablon';
    ctx.scene.session.photos = [];
    await ctx.reply(
      `💍 *${tpl}* shabloni tanlandi.\n\nKelin va kuyov ismini kiriting.\nMasalan: \`Farhod va Shirin\``,
      { parse_mode: 'Markdown' }
    );
    return ctx.wizard.next();
  },

  // 1 — ismlarni tekshirish
  async (ctx) => {
    const text = textOf(ctx);
    if (!text) return ctx.reply('Iltimos, ismlarni matn ko\'rinishida yuboring.');

    const names = splitCoupleNames(text);
    if (!names) {
      return ctx.reply(
        '❌ Ismlarni to\'g\'ri kiriting.\nMasalan: `Farhod va Shirin`',
        { parse_mode: 'Markdown' }
      );
    }

    ctx.scene.session.husband = names.husband;
    ctx.scene.session.wife = names.wife;

    await ctx.reply(
      `✅ Ismlar shunday ko'rinadi:\n\n👰 *${names.wife}*  &  🤵 *${names.husband}*\n\nEndi to'y sanasini kiriting (kun.oy.yil).\nMasalan: \`12.09.2026\``,
      { parse_mode: 'Markdown' }
    );
    return ctx.wizard.next();
  },

  // 2 — sana
  async (ctx) => {
    const text = textOf(ctx);
    if (!text) return ctx.reply('Sanani matn ko\'rinishida kiriting (12.09.2026).');

    const res = validateDate(text);
    if (res.error) return ctx.reply(`❌ ${res.error}`);

    ctx.scene.session.date = res.value;
    await ctx.reply('🏛 To\'yxona nomini kiriting.\nMasalan: `Anhor Lounge`', {
      parse_mode: 'Markdown',
    });
    return ctx.wizard.next();
  },

  // 3 — to'yxona nomi
  async (ctx) => {
    const text = textOf(ctx);
    if (!text || text.trim().length < 2) {
      return ctx.reply('To\'yxona nomini kiriting (kamida 2 harf).');
    }
    ctx.scene.session.venueName = text.trim();

    await ctx.reply(
      '📍 Endi to\'yxona joylashuvini yuboring.\n\n' +
        'Telegramda 📎 → *Location* orqali nuqtani yuboring (yoki joyni qidirib tanlang),\n' +
        'yoki Google/Yandex Maps havolasini tashlang.',
      { parse_mode: 'Markdown' }
    );
    return ctx.wizard.next();
  },

  // 4 — joylashuv (venue / lokatsiya / havola). Manzil matni so'ralmaydi —
  // xaritada joy tanlansa manzil avtomatik olinadi, bo'lmasa faqat xarita nuqtasi.
  async (ctx) => {
    const venue = venueOf(ctx);
    const loc = locationOf(ctx);
    const text = textOf(ctx);

    if (venue) {
      ctx.scene.session.mapLink = locationToMapLink(venue.lat, venue.lon);
      if (venue.address) ctx.scene.session.address = venue.address;
      if (venue.title && !ctx.scene.session.venueName) {
        ctx.scene.session.venueName = venue.title;
      }
    } else if (loc) {
      ctx.scene.session.mapLink = locationToMapLink(loc.lat, loc.lon);
    } else if (text && isValidMapLink(text)) {
      ctx.scene.session.mapLink = text.trim();
    } else {
      return ctx.reply(
        '❌ Iltimos, joylashuvni (📎 → Location) yuboring yoki to\'g\'ri xarita havolasini tashlang.'
      );
    }

    await ctx.reply(
      '✍️ Taklifnoma matnini yuboring (oila nomidan).\n' +
        'Eng ko\'pi 6 ta gap va 400 belgigacha.'
    );
    return ctx.wizard.next();
  },

  // 5 — taklif matni
  async (ctx) => {
    const text = textOf(ctx);
    if (!text) return ctx.reply('Matnni yuboring.');

    const res = validateInviteText(text);
    if (res.error) return ctx.reply(`❌ ${res.error}`);

    ctx.scene.session.inviteText = res.value;

    await ctx.reply(
      `📷 Juftlik rasmlarini yuboring (ixtiyoriy, max ${config.maxPhotos}).\n` +
        `Tayyor bo'lgach «✅ Davom etish» — to'lovga o'tasiz.`,
      skipPhotoKeyboard
    );
    return ctx.wizard.next();
  },

  // 6 — rasmlar: status yozilmaydi; 3 ta yoki «Davom etish» → to'lov
  async (ctx) => {
    const photos = ctx.scene.session.photos || [];
    const fileId = photoOf(ctx);
    const text = textOf(ctx);

    if (fileId) {
      if (photos.length >= config.maxPhotos) {
        return finalizeInvitation(ctx);
      }
      try {
        const url = await downloadTelegramPhoto(ctx.telegram, fileId);
        photos.push(url);
        ctx.scene.session.photos = photos;
        if (photos.length >= config.maxPhotos) {
          return finalizeInvitation(ctx);
        }
      } catch {
        await ctx.reply("❌ Rasmni yuklab bo'lmadi, qaytadan yuboring.");
      }
      return;
    }

    if (/rasmsiz|davom|skip|tayyor/i.test(text || '')) {
      return finalizeInvitation(ctx);
    }

    if (text) {
      return ctx.reply(
        'Rasm yuboring yoki «✅ Davom etish» / «⏭ Rasmsiz» ni bosing.',
        skipPhotoKeyboard
      );
    }
    return;
  }
);

async function finalizeInvitation(ctx: MyContext) {
  const s = ctx.scene.session;
  const templateId = (s.templateId || 'medium') as TemplateId;
  try {
    const slug = await uniqueSlug(s.husband!, s.wife!);
    const inv = await Invitation.create({
      slug,
      templateId,
      husband: s.husband,
      wife: s.wife,
      date: s.date,
      venueName: s.venueName,
      address: s.address || '',
      mapLink: s.mapLink,
      inviteText: s.inviteText,
      photos: normalizePhotoList(s.photos || []),
      price: TEMPLATE_PRICES[templateId],
      paymentStatus: 'unpaid',
      paymentAmount: TEMPLATE_PRICES[templateId],
      telegramUserId: ctx.from?.id,
      telegramUsername: ctx.from?.username || '',
    });

    const price = TEMPLATE_PRICES[templateId].toLocaleString('ru-RU');
    const payUrl = paymentAppUrl(String(inv._id));
    const chatId = ctx.chat?.id || ctx.from?.id;

    if (chatId) {
      try {
        await showShopMenuForUser(chatId, String(inv._id));
      } catch (e) {
        console.error('showShopMenu', e);
      }
    }

    await ctx.reply('✅ Saqlandi', Markup.removeKeyboard());
    await ctx.reply(
      `🎉 *Taklifnoma tayyor — to'lov*\n\n` +
        `👰 ${inv.wife} & 🤵 ${inv.husband}\n` +
        `📅 ${inv.date}\n` +
        `🏛 ${inv.venueName}\n` +
        `🖼 ${TEMPLATE_LABELS[templateId]} · ${(inv.photos || []).length} ta rasm\n\n` +
        `💳 *${price} so'm*\n\n` +
        `⬇️ *SHOP* tugmasini bosing (pastda paydo bo'ladi).\n` +
        `To'lovdan keyin shaxsiy havola yuboriladi.`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp(`🛒 SHOP — To'lov (${price} so'm)`, payUrl)],
        ]),
      }
    );
  } catch (err) {
    console.error('Taklifnoma yaratishda xato:', err);
    await ctx.reply("❌ Xatolik yuz berdi. Qaytadan /start bosing.", Markup.removeKeyboard());
  }
  return ctx.scene.leave();
}
