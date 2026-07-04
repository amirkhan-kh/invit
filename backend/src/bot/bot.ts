import { Telegraf, Scenes, session, Markup } from 'telegraf';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { MyContext } from './context';
import { createScene } from './create.scene';
import { paymentScene } from './payment.scene';
import { mongoSessionStore } from './session-store';
import { TemplateId, TEMPLATE_PRICES } from '../models/invit.back';

const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: 'standard', label: '🌿 Standart', desc: 'Sodda va nafis — yengil animatsiya, fon musiqasi, countdown va xarita.' },
  { id: 'medium', label: '💐 Medium', desc: "Boy bezaklar — kalendar, uchuvchi kapalaklar, rasm galereyasi va musiqa." },
  { id: 'premium', label: '👑 Premium', desc: "Eng hashamatli — oltin animatsiyalar, kinematografik dizayn, barcha imkoniyat." },
];

// Har shablon uchun jonli namuna (portfolio demo) havolasi
const DEMO_FOR: Record<TemplateId, string> = {
  standard: 'jasurnigora',
  medium: 'azizmalika',
  premium: 'sardorkamila',
};

/**
 * Botni to'liq sozlab qaytaradi (launch QILMAYDI).
 * - Lokalда: bot-app.ts uni polling bilan ishga tushiradi.
 * - Vercel'da: app.ts uni webhook (bot.webhookCallback) orqali ishlatadi.
 */
export function createBot(): Telegraf<MyContext> {
  const bot = new Telegraf<MyContext>(config.botToken);

  const stage = new Scenes.Stage<MyContext>([createScene, paymentScene]);
  // Sessiya MongoDB'da (serverless'da ham, polling'da ham ishlaydi)
  bot.use(session({ store: mongoSessionStore }));
  bot.use(stage.middleware());

  // /start — shablon namunalari
  bot.start(async (ctx) => {
    await ctx.reply(
      `✨ *Assalomu alaykum!* ✨\n\n` +
        `Men — *baxt.uz* to'y taklifnomalari botiman 💍\n` +
        `Sizga *animatsiya, musiqa, xarita va countdown* bilan bezatilgan zamonaviy taklifnoma yasab beraman — bir necha daqiqada, shaxsiy havola bilan.\n\n` +
        `Quyidagi 3 uslubdan birini tanlang. Har birining *jonli namunasini* ochib ko'ring 👇\n\n` +
        `📩 Savol yoki yordam uchun: @Amirxonn_uz`,
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
  });

  // Shablon tanlandi -> ma'lumot yig'ish ssenariysiga o'tamiz
  bot.action(/^tpl_(standard|medium|premium)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const id = ctx.match[1] as TemplateId;
    await ctx.scene.enter('create_invitation', { templateId: id });
  });

  // To'lov tugmasi -> to'lov ssenariysi
  bot.action(/^pay_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const invitationId = ctx.match[1];
    await ctx.scene.enter('payment_scene', { invitationId });
  });

  bot.help((ctx) =>
    ctx.reply(
      "Yangi taklifnoma yaratish uchun /start bosing.\n\n📩 Savol yoki yordam: @Amirxonn_uz"
    )
  );

  return bot;
}

// Umumiy singleton — app.ts (webhook + rasm proxy) va api/ funksiyalari ishlatadi
let _bot: Telegraf<MyContext> | null = null;
export function getBot(): Telegraf<MyContext> {
  if (!_bot) _bot = createBot();
  return _bot;
}
