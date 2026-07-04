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
  { id: 'standard', label: '🌿 Standart', desc: 'Sodda, nafis, yengil animatsiyalar va musiqa' },
  { id: 'medium', label: '💐 Medium', desc: 'Boy bezaklar, kalendar, kapalaklar va musiqa' },
  { id: 'premium', label: '👑 Premium', desc: 'Eng hashamatli — oltin animatsiyalar, kinematografik dizayn' },
];

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
      `Assalomu alaykum! 🎉\n\n` +
        `Men *to'y taklifnomasi* yasab beruvchi botman.\n` +
        `Quyidagi 3 ta shablondan birini tanlang. Har birining namunasini ko'rib chiqing 👇`,
      { parse_mode: 'Markdown' }
    );

    for (const t of TEMPLATES) {
      const price = TEMPLATE_PRICES[t.id].toLocaleString('ru-RU');
      const caption = `${t.label} — *${price} so'm*\n${t.desc}`;
      const kb = Markup.inlineKeyboard([
        [Markup.button.callback('✅ Shu shablonni tanlash', `tpl_${t.id}`)],
      ]);

      const videoPath = path.join(config.mediaDir, `${t.id}.mp4`);
      try {
        if (fs.existsSync(videoPath)) {
          await ctx.replyWithVideo({ source: videoPath }, { caption, parse_mode: 'Markdown', ...kb });
        } else {
          await ctx.reply(
            `${caption}\n\n_(namuna video hali qo'shilmagan — media/${t.id}.mp4)_`,
            { parse_mode: 'Markdown', ...kb }
          );
        }
      } catch (e) {
        console.error('Video yuborishda xato:', e);
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

  bot.help((ctx) => ctx.reply('Yangi taklifnoma yaratish uchun /start bosing.'));

  return bot;
}

// Umumiy singleton — app.ts (webhook + rasm proxy) va api/ funksiyalari ishlatadi
let _bot: Telegraf<MyContext> | null = null;
export function getBot(): Telegraf<MyContext> {
  if (!_bot) _bot = createBot();
  return _bot;
}
