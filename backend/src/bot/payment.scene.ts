import { Scenes, Markup } from 'telegraf';
import { MyContext, textOf } from './context';
import { Invitation } from '../models/invit.back';
import { invitationLink, paymentAppUrl } from '../config';
import { detectLang, INVITE_TEXT } from '../utils/format';
import { publicSessionAsync } from '../services/card-payment.service';
import { loadMerchantCard } from '../services/merchant-card.service';

function fmt(n: number): string {
  return n.toLocaleString('ru-RU');
}

export async function sendSuccess(ctx: MyContext, slug: string, templateId?: string) {
  const inv = await Invitation.findOne({ slug });
  const link = invitationLink(slug, templateId);
  const lang = detectLang(inv?.inviteText || '');
  const s = INVITE_TEXT[lang];
  const names = inv ? `${inv.husband} & ${inv.wife}` : '';

  await ctx.reply(
    `${link}\n\n` +
      `💌  *${s.heading}*\n` +
      (names ? `_${names}_\n\n` : '\n') +
      `${s.wishes}\n\n` +
      `🎉 ${s.congrats}`,
    { parse_mode: 'Markdown', ...Markup.removeKeyboard() }
  );
}

function getInvId(ctx: MyContext): string | undefined {
  return (ctx.scene.state as { invitationId?: string }).invitationId;
}

function payKeyboard(invitationId: string) {
  const url = paymentAppUrl(invitationId);
  return Markup.inlineKeyboard([
    [Markup.button.webApp("🛒 SHOP — To'lov", url)],
  ]);
}

/**
 * To'lov ssenariysi — asosan Mini App (Verion Shop uslubi).
 * Bot faqat WebApp tugmasini va holatni ko'rsatadi.
 */
export const paymentScene = new Scenes.WizardScene<MyContext>(
  'payment_scene',

  async (ctx) => {
    const invId = getInvId(ctx);
    const inv = invId ? await Invitation.findById(invId) : null;
    if (!inv) {
      await ctx.reply('❌ Taklifnoma topilmadi. /start bosing.');
      return ctx.scene.leave();
    }
    if (inv.isPaid) {
      await sendSuccess(ctx, inv.slug, inv.templateId);
      return ctx.scene.leave();
    }

    const session = await publicSessionAsync(inv);
    const price = fmt(session.amount);

    const cardsReady = (await loadMerchantCard()).ready;

    if (!cardsReady) {
      await ctx.reply(
        "⚠️ To'lov kartasi sozlanmagan.\n" +
          'Admin `PAY_UZCARD_NUMBER` va `PAY_UZCARD_HOLDER` ni .env ga qo‘shishi kerak.\n' +
          'Hozircha yordam: @elnox_uz'
      );
      return ctx.scene.leave();
    }

    if (inv.paymentStatus === 'pending_review') {
      await ctx.reply(
        `⏳ *To'lovingiz tekshiruvda*\n\n` +
          `Summa: *${price} so'm*\n` +
          `Tasdiqlangach, havola avtomatik yuboriladi.\n` +
          `_Odatda bir necha daqiqa ichida._`,
        { parse_mode: 'Markdown', ...payKeyboard(String(inv._id)) }
      );
      return ctx.scene.leave();
    }

    await ctx.reply(
      `🛒 *SHOP — To'lov*\n\n` +
        `👰 ${inv.wife} & 🤵 ${inv.husband}\n` +
        `🖼 ${session.templateLabel}\n` +
        `💰 *${price} so'm*\n\n` +
        `Pastdagi *SHOP* tugmasini bosing — Mini App ochiladi:\n` +
        `HUMO / UZCARD → karta → o'tkazma → «To'lov qildim».\n\n` +
        `✅ Tasdiqlangach havola shu yerga yuboriladi.\n` +
        `🔒 Siz karta raqamingizni botga yozmaysiz.`,
      { parse_mode: 'Markdown', ...payKeyboard(String(inv._id)) }
    );
    return ctx.scene.leave();
  }
);

/** Botdan to'lov holati matni */
export async function paymentStatusText(invitationId: string): Promise<string> {
  const inv = await Invitation.findById(invitationId);
  if (!inv) return 'Taklifnoma topilmadi.';
  const s = await publicSessionAsync(inv);
  if (s.isPaid) {
    return `✅ To'langan.\n🔗 ${s.invitationUrl}`;
  }
  if (s.paymentStatus === 'pending_review') {
    return `⏳ Tekshiruvda · ${fmt(s.amount)} so'm\nTez orada tasdiqlanadi.`;
  }
  if (s.paymentStatus === 'awaiting_transfer') {
    const m = Math.floor(s.remainingSeconds / 60);
    const sec = s.remainingSeconds % 60;
    return (
      `💳 O'tkazma kutilmoqda · ${fmt(s.amount)} so'm\n` +
      `⏱ Qolgan vaqt: ${m}:${String(sec).padStart(2, '0')}\n` +
      `Usul: ${(s.paymentMethod || '—').toUpperCase()}`
    );
  }
  return `❌ Hali to'lanmagan · ${fmt(s.amount)} so'm\n«To'lov qilish» tugmasini bosing.`;
}
