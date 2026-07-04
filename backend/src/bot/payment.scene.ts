import { Scenes, Markup } from 'telegraf';
import { MyContext, textOf } from './context';
import { Invitation } from '../models/invit.back';
import {
  applyPayment,
  payWithTestCard,
  isTestCard,
  luhnValid,
  cleanCard,
  TEST_CARD,
} from '../services/payment.service';
import { invitationLink } from '../config';

function fmt(n: number): string {
  return n.toLocaleString('ru-RU');
}

async function sendSuccess(ctx: MyContext, slug: string) {
  await ctx.reply(
    `✅ *To'lov muvaffaqiyatli qabul qilindi!*\n\n` +
      `Sizning taklifnomangiz tayyor va faollashtirildi:\n\n` +
      `🔗 ${invitationLink(slug)}\n\n` +
      `Ushbu havolani mehmonlaringizga yuboring. Tabriklaymiz! 🎉`,
    { parse_mode: 'Markdown', ...Markup.removeKeyboard() }
  );
}

// scene.state dan invitationId ni olamiz
function getInvId(ctx: MyContext): string | undefined {
  return (ctx.scene.state as { invitationId?: string }).invitationId;
}

export const paymentScene = new Scenes.WizardScene<MyContext>(
  'payment_scene',

  // 0 — to'lov ma'lumotlari
  async (ctx) => {
    const invId = getInvId(ctx);
    const inv = invId ? await Invitation.findById(invId) : null;
    if (!inv) {
      await ctx.reply('❌ Taklifnoma topilmadi. /start bosing.');
      return ctx.scene.leave();
    }
    if (inv.isPaid) {
      await sendSuccess(ctx, inv.slug);
      return ctx.scene.leave();
    }

    const remaining = inv.price - inv.amountPaid;
    await ctx.reply(
      `💳 *To'lov*\n\n` +
        `Xizmat: taklifnoma (${inv.templateId})\n` +
        `Narxi: *${fmt(inv.price)} so'm*\n` +
        (inv.amountPaid > 0 ? `To'langan: ${fmt(inv.amountPaid)} so'm\n` : '') +
        `To'lash kerak: *${fmt(remaining)} so'm*\n\n` +
        `🔒 To'lov xavfsiz. Biz karta ma'lumotlaringizni saqlamaymiz.\n\n` +
        `Karta raqamingizni yuboring (16 raqam).\n` +
        `_Test uchun (pulsiz):_ \`${TEST_CARD}\``,
      { parse_mode: 'Markdown' }
    );
    return ctx.wizard.next();
  },

  // 1 — karta raqami
  async (ctx) => {
    const text = textOf(ctx);
    if (!text) return ctx.reply('Karta raqamini yuboring.');

    const card = cleanCard(text);
    const invId = getInvId(ctx);
    const inv = invId ? await Invitation.findById(invId) : null;
    if (!inv) {
      await ctx.reply('❌ Taklifnoma topilmadi.');
      return ctx.scene.leave();
    }

    // Test kartasi — real pulsiz darhol to'liq to'lash
    if (isTestCard(card)) {
      const res = await payWithTestCard(String(inv._id));
      await sendSuccess(ctx, res.slug);
      return ctx.scene.leave();
    }

    if (!luhnValid(card)) {
      return ctx.reply('❌ Karta raqami noto\'g\'ri. Iltimos, 16 xonali raqamni qaytadan yuboring.');
    }

    const remaining = inv.price - inv.amountPaid;
    await ctx.reply(
      `Karta qabul qilindi ✅\n\n` +
        `To'lov summasini kiriting (so'mda).\n` +
        `Qoldiq: *${fmt(remaining)} so'm*`,
      {
        parse_mode: 'Markdown',
        ...Markup.keyboard([[`${remaining}`], ['❌ Bekor qilish']]).resize().oneTime(),
      }
    );
    return ctx.wizard.next();
  },

  // 2 — summa (qisman to'lov mantig'i)
  async (ctx) => {
    const text = textOf(ctx);
    if (!text) return ctx.reply('Summani raqam bilan kiriting.');

    if (/bekor/i.test(text)) {
      await ctx.reply('To\'lov bekor qilindi.', Markup.removeKeyboard());
      return ctx.scene.leave();
    }

    const amount = parseInt(text.replace(/[\s'`.]/g, ''), 10);
    if (isNaN(amount) || amount <= 0) {
      return ctx.reply('❌ Summani to\'g\'ri raqam bilan kiriting.');
    }

    const invId = getInvId(ctx);
    if (!invId) {
      await ctx.reply('❌ Taklifnoma topilmadi.');
      return ctx.scene.leave();
    }

    try {
      const res = await applyPayment(invId, amount);

      if (res.isPaid) {
        await sendSuccess(ctx, res.slug);
        return ctx.scene.leave();
      }

      // Qisman to'lov: kam summa kiritilgan
      await ctx.reply(
        `⚠️ Siz *${fmt(amount)} so'm* to'ladingiz, bu to'liq summadan kam.\n\n` +
          `To'langan: ${fmt(res.amountPaid)} so'm\n` +
          `Qolgan summa: *${fmt(res.remaining)} so'm*\n\n` +
          `Iltimos, qolgan summani to'lang. Keyingi to'lovda aynan shu summa taklif qilinadi.`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback(`💳 Qolganini to'lash (${fmt(res.remaining)})`, `pay_${invId}`)],
          ]),
        }
      );
      return ctx.scene.leave();
    } catch (err) {
      console.error('To\'lov xatosi:', err);
      await ctx.reply('❌ To\'lovda xatolik. Qaytadan urinib ko\'ring.');
      return ctx.scene.leave();
    }
  }
);
