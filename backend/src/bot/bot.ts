import { Telegraf, Scenes, session, Markup } from 'telegraf';
import fs from 'fs';
import path from 'path';
import { config, paymentAppUrl } from '../config';
import { MyContext } from './context';
import { createScene } from './create.scene';
import { paymentScene, paymentStatusText } from './payment.scene';
import { mongoSessionStore } from './session-store';
import { Invitation, TemplateId, TEMPLATE_PRICES } from '../models/invit.back';
import { writeBotError, writeBotLog } from '../services/bot-log.service';
import {
  adminConfirmPayment,
  adminRejectPayment,
  isAdmin,
  notifyUserPaid,
} from '../services/card-payment.service';
import { hideShopMenuForUser } from '../services/menu-button.service';

const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: 'standard', label: '🌿 Standart', desc: 'Sodda va nafis — yengil animatsiya, fon musiqasi, countdown va xarita.' },
  { id: 'medium', label: '💐 Medium', desc: "Boy bezaklar — kalendar, uchuvchi kapalaklar, rasm galereyasi va musiqa." },
  { id: 'premium', label: '👑 Premium', desc: "Eng hashamatli — oltin animatsiyalar, kinematografik dizayn, barcha imkoniyat." },
];

const DEMO_FOR: Record<TemplateId, string> = {
  standard: 'jasurnigora',
  medium: 'azizmalika',
  premium: 'sardorkamila',
};
const SUPPORT_USERNAME_MD = '@elnox\\_uz';

/**
 * Botni to'liq sozlab qaytaradi (launch QILMAYDI).
 */
export function createBot(): Telegraf<MyContext> {
  const bot = new Telegraf<MyContext>(config.botToken);

  const stage = new Scenes.Stage<MyContext>([createScene, paymentScene]);
  bot.use(session({ store: mongoSessionStore }));

  bot.use(async (ctx, next) => {
    const startedAt = Date.now();
    const message: any = ctx.message;
    const callback: any = ctx.callbackQuery;
    const text = typeof message?.text === 'string' ? message.text : undefined;
    const callbackData = typeof callback?.data === 'string' ? callback.data : undefined;
    const base = {
      updateId: ctx.update.update_id,
      updateType: ctx.updateType,
      chatId: ctx.chat?.id,
      userId: ctx.from?.id,
      username: ctx.from?.username,
      text,
      callbackData,
    };

    await writeBotLog('info', 'update_received', base);
    try {
      await next();
      await writeBotLog('info', 'update_handled', {
        ...base,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      await writeBotError('update_error', error, base);
      throw error;
    }
  });

  function resetSession(ctx: MyContext) {
    const current = (ctx.session || {}) as Record<string, unknown>;
    for (const key of Object.keys(current)) delete current[key];
  }

  async function sendStartMenu(ctx: MyContext) {
    // Deep link: /start pay_<invitationId>
    const payload = (ctx as any).startPayload || '';
    if (typeof payload === 'string' && payload.startsWith('pay_')) {
      const invitationId = payload.slice(4);
      await ctx.scene.enter('payment_scene', { invitationId });
      return;
    }

    await ctx.reply(
      `✨ *Assalomu alaykum!* ✨\n\n` +
        `Men — *baxt.uz* to'y taklifnomalari botiman 💍\n` +
        `Sizga *animatsiya, musiqa, xarita va countdown* bilan bezatilgan zamonaviy taklifnoma yasab beraman — bir necha daqiqada, shaxsiy havola bilan.\n\n` +
        `Quyidagi 3 uslubdan birini tanlang. Har birining *jonli namunasini* ochib ko'ring 👇\n\n` +
        `📩 Savol yoki yordam uchun: ${SUPPORT_USERNAME_MD}`,
      { parse_mode: 'Markdown' }
    );

    for (const t of TEMPLATES) {
      const price = TEMPLATE_PRICES[t.id].toLocaleString('ru-RU');
      const demoUrl = `${config.baseUrl}/preview/${t.id}/${DEMO_FOR[t.id]}`;
      const caption = `${t.label} — *${price} so'm*\n${t.desc}\n\n👀 Namunani ochib ko'ring 👇`;
      const kb = Markup.inlineKeyboard([
        [Markup.button.url("👀 Namunani ko'rish", demoUrl)],
        [Markup.button.callback('✅ Shu shablonni tanlash', `tpl_${t.id}`)],
      ]);

      const videoPath = path.join(config.mediaDir, `${t.id}.mp4`);
      try {
        if (fs.existsSync(videoPath)) {
          await ctx.replyWithVideo({ source: videoPath }, { caption, parse_mode: 'Markdown', ...kb });
        } else {
          await ctx.reply(caption, { parse_mode: 'Markdown', ...kb });
        }
      } catch (e) {
        console.error('Namuna yuborishda xato:', e);
        await ctx.reply(caption, { parse_mode: 'Markdown', ...kb });
      }
    }
  }

  bot.command(['start', 'restart'], async (ctx) => {
    resetSession(ctx);
    // Boshida SHOP ko'rinmasin — faqat to'lov bosqichida yoqiladi
    if (ctx.chat?.id) {
      try {
        await hideShopMenuForUser(ctx.chat.id);
      } catch {
        /* ignore */
      }
    }
    const text = (ctx.message as any)?.text || '';
    const parts = text.split(/\s+/);
    if (parts[1]) (ctx as any).startPayload = parts[1];
    await sendStartMenu(ctx);
  });

  bot.command('cancel', async (ctx) => {
    resetSession(ctx);
    await ctx.reply("Jarayon bekor qilindi. Qaytadan boshlash uchun /start bosing.", Markup.removeKeyboard());
  });

  // Admin: /pending — kutilayotgan to'lovlar
  bot.command('pending', async (ctx) => {
    if (!ctx.from || !isAdmin(ctx.from.id)) {
      return ctx.reply('Faqat admin uchun.');
    }
    const list = await Invitation.find({ paymentStatus: 'pending_review' })
      .sort({ paymentDeclaredAt: 1 })
      .limit(20);
    if (!list.length) return ctx.reply('✅ Kutilayotgan to‘lov yo‘q.');
    for (const inv of list) {
      const amount = (inv.paymentAmount || inv.price).toLocaleString('ru-RU');
      await ctx.reply(
        `⏳ ${inv.wife} & ${inv.husband}\n` +
          `${inv.templateId} · ${amount} so'm · ${inv.paymentMethod}\n` +
          `ID: ${inv._id}`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback('✅', `adm_ok_${inv._id}`),
            Markup.button.callback('❌', `adm_no_${inv._id}`),
          ],
        ])
      );
    }
  });

  bot.use(stage.middleware());

  bot.action(/^tpl_(standard|medium|premium)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const id = ctx.match[1] as TemplateId;
    await ctx.scene.enter('create_invitation', { templateId: id });
  });

  bot.action(/^pay_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const invitationId = ctx.match[1];
    await ctx.scene.enter('payment_scene', { invitationId });
  });

  bot.action(/^paystatus_(.+)$/, async (ctx) => {
    const invitationId = ctx.match[1];
    const text = await paymentStatusText(invitationId);
    await ctx.answerCbQuery();
    await ctx.reply(text, {
      ...Markup.inlineKeyboard([
        [Markup.button.webApp("🛒 SHOP — To'lov", paymentAppUrl(invitationId))],
      ]),
    });
  });

  // Admin tasdiq / rad
  bot.action(/^adm_ok_(.+)$/, async (ctx) => {
    if (!ctx.from || !isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery('Faqat admin', { show_alert: true });
      return;
    }
    const id = ctx.match[1];
    const result = await adminConfirmPayment(id, ctx.from.username || String(ctx.from.id));
    if (result.ok === false) {
      await ctx.answerCbQuery(result.error, { show_alert: true });
      return;
    }
    await ctx.answerCbQuery('Tasdiqlandi ✅');
    try {
      await notifyUserPaid(result.inv);
    } catch (e) {
      console.error(e);
    }
    try {
      await hideShopMenuForUser(result.inv.telegramUserId);
    } catch {
      /* ignore */
    }
    try {
      await ctx.editMessageText(
        (ctx.callbackQuery.message as any)?.text + '\n\n✅ Tasdiqlandi',
        { parse_mode: undefined }
      );
    } catch {
      await ctx.reply(`✅ ${result.inv.slug} tasdiqlandi.`);
    }
  });

  bot.action(/^adm_no_(.+)$/, async (ctx) => {
    if (!ctx.from || !isAdmin(ctx.from.id)) {
      await ctx.answerCbQuery('Faqat admin', { show_alert: true });
      return;
    }
    const id = ctx.match[1];
    const result = await adminRejectPayment(id, 'Admin rad etdi');
    if (result.ok === false) {
      await ctx.answerCbQuery(result.error, { show_alert: true });
      return;
    }
    await ctx.answerCbQuery('Rad etildi');
    try {
      await ctx.telegram.sendMessage(
        result.inv.telegramUserId,
        "❌ To'lovingiz tasdiqlanmadi. Qaytadan urinib ko'ring yoki @elnox_uz ga yozing.",
        Markup.inlineKeyboard([
          [Markup.button.webApp("💳 Qayta to'lov", paymentAppUrl(String(result.inv._id)))],
        ])
      );
    } catch (e) {
      console.error(e);
    }
    try {
      await ctx.editMessageText(
        ((ctx.callbackQuery.message as any)?.text || '') + '\n\n❌ Rad etildi'
      );
    } catch {
      /* ignore */
    }
  });

  bot.help((ctx) =>
    ctx.reply(
      "Yangi taklifnoma yaratish uchun /start bosing.\n\n📩 Savol yoki yordam: @elnox_uz"
    )
  );

  return bot;
}

let _bot: Telegraf<MyContext> | null = null;
export function getBot(): Telegraf<MyContext> {
  if (!_bot) _bot = createBot();
  return _bot;
}
