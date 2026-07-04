import { Scenes, Markup } from 'telegraf';
import { MyContext, textOf, photoOf, locationOf } from './context';
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
import { config, invitationLink } from '../config';

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

const doneKeyboard = Markup.keyboard([['✅ Tayyor', '⏭ Rasmsiz davom etish']])
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
      '📍 Endi to\'yxona manzilini xaritada belgilang.\n\n' +
        'Telegramda 📎 (skrepka) → *Location (Joylashuv)* orqali nuqtani yuboring,\n' +
        'yoki Google/Yandex Maps havolasini tashlang.',
      { parse_mode: 'Markdown' }
    );
    return ctx.wizard.next();
  },

  // 4 — manzil (lokatsiya yoki havola)
  async (ctx) => {
    const loc = locationOf(ctx);
    const text = textOf(ctx);

    if (loc) {
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
        'Eng ko\'pi 6 ta gap va 400 belgigacha.',
      { parse_mode: 'Markdown' }
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
      `📷 Endi ${config.maxPhotos} tagacha rasm yuborishingiz mumkin (juftlik rasmlari).\n` +
        'Rasmlarni birma-bir yuboring. Tugagach «✅ Tayyor» tugmasini bosing.\n' +
        'Rasmsiz davom etish ham mumkin.',
      doneKeyboard
    );
    return ctx.wizard.next();
  },

  // 6 — rasmlar (ko'p marta ishlaydi) yoki yakunlash
  async (ctx) => {
    const photos = ctx.scene.session.photos || [];
    const fileId = photoOf(ctx);
    const text = textOf(ctx);

    // Rasm yuborildi
    if (fileId) {
      if (photos.length >= config.maxPhotos) {
        await ctx.reply(`Siz allaqachon ${config.maxPhotos} ta rasm yubordingiz. «✅ Tayyor» bosing.`);
        return; // shu bosqichda qolamiz
      }
      try {
        const url = await downloadTelegramPhoto(ctx.telegram, fileId);
        photos.push(url);
        ctx.scene.session.photos = photos;
        if (photos.length >= config.maxPhotos) {
          await ctx.reply(`✅ ${photos.length}/${config.maxPhotos} rasm qabul qilindi. «✅ Tayyor» bosing.`);
        } else {
          await ctx.reply(`✅ ${photos.length}/${config.maxPhotos} rasm qabul qilindi. Yana yuboring yoki «✅ Tayyor».`);
        }
      } catch (e) {
        await ctx.reply('❌ Rasmni yuklab bo\'lmadi, qaytadan yuboring.');
      }
      return; // shu bosqichda qolamiz
    }

    // Yakunlash
    const finalize = /tayyor|rasmsiz|davom|skip/i.test(text || '');
    if (!finalize) {
      return ctx.reply('Rasm yuboring yoki «✅ Tayyor» tugmasini bosing.', doneKeyboard);
    }

    // === Taklifnomani yaratamiz ===
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
        address: s.venueName, // qisqa manzil sifatida nom (xohlasangiz alohida so'rasa bo'ladi)
        mapLink: s.mapLink,
        inviteText: s.inviteText,
        photos: s.photos || [],
        price: TEMPLATE_PRICES[templateId],
        telegramUserId: ctx.from?.id,
        telegramUsername: ctx.from?.username || '',
      });

      const price = TEMPLATE_PRICES[templateId].toLocaleString('ru-RU');
      await ctx.reply(
        `🎉 *Taklifnoma tayyor!*\n\n` +
          `👰 ${inv.wife} & 🤵 ${inv.husband}\n` +
          `📅 ${inv.date}\n` +
          `🏛 ${inv.venueName}\n` +
          `🖼 Shablon: ${TEMPLATE_LABELS[templateId]}\n` +
          `🖼 Rasmlar: ${(inv.photos || []).length} ta\n\n` +
          `🔗 Havola: \`${invitationLink(inv.slug)}\`\n` +
          `_(havola to'lovdan so'ng faollashadi)_\n\n` +
          `💳 Narxi: *${price} so'm*`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback(`💳 To'lov qilish (${price} so'm)`, `pay_${inv._id}`)],
          ]),
        }
      );
    } catch (err) {
      console.error('Taklifnoma yaratishda xato:', err);
      await ctx.reply('❌ Xatolik yuz berdi. Qaytadan /start bosing.');
    }

    return ctx.scene.leave();
  }
);
