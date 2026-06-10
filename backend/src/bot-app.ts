import { Telegraf, Scenes, session, Context, NarrowedContext, Types } from 'telegraf';
import { Invitation } from './models/invit.back'; // Nomini to'g'irlab oling
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// 1. Session strukturasi
interface MyWizardSession extends Scenes.WizardSessionData {
  invData: {
    husband: string;
    wife: string;
    date: string;
    address: string;
    inviteText: string;
  };
}

// 2. Context strukturasi (Xatolik tuzatildi)
interface MyContext extends Context {
  // WizardContextWizard faqat 1 ta argument oladi
  wizard: Scenes.WizardContextWizard<MyContext>; 
  scene: Scenes.SceneContextScene<MyContext, MyWizardSession>;
  session: Scenes.WizardSession<MyWizardSession>;
}

// 3. Matnli xabar kelishini tekshiruvchi Type Guard
function hasText(ctx: any): ctx is NarrowedContext<MyContext, Types.MountMap['text']> {
  return ctx.message && 'text' in ctx.message;
}

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN as string);

// MongoDB ulanishi
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ MongoDB muvaffaqiyatli ulandi!"))
  .catch(err => console.error("❌ DB xatosi:", err));

const invitationWizard = new Scenes.WizardScene<MyContext>(
  'create_invitation',
  async (ctx) => {
    await ctx.reply("🤵 Kelin va kuyov ismini kiriting (Masalan: Ali va Aziza):");
    ctx.scene.session.invData = {} as any; // session orqali kirish xavfsizroq
    return ctx.wizard.next();
  },
  async (ctx) => {
    // hasText funksiyasi orqali TypeScript'ni ishontiramiz
    if (!hasText(ctx)) return ctx.reply("Iltimos, faqat matn yuboring.");
    
    const names = ctx.message.text.split(' va ');
    ctx.scene.session.invData.husband = names[0]?.trim() || 'Kuyov';
    ctx.scene.session.invData.wife = names[1]?.trim() || 'Kelin';
    
    await ctx.reply("📅 To'y sanasini kiriting:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!hasText(ctx)) return ctx.reply("Sanani matn ko'rinishida kiriting.");
    ctx.scene.session.invData.date = ctx.message.text;
    await ctx.reply("📍 To'yxona manzili:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!hasText(ctx)) return ctx.reply("Manzilni matn ko'rinishida kiriting.");
    ctx.scene.session.invData.address = ctx.message.text;
    await ctx.reply("✍️ Taklifnoma matnini yuboring:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!hasText(ctx)) return ctx.reply("Matnni yuboring.");
    const data = ctx.scene.session.invData;
    data.inviteText = ctx.message.text;

    const slug = `${data.husband}-${data.wife}`
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '');

    try {
      const newInv = await Invitation.create({
        ...data,
        slug,
        templateId: 'medium'
      });

      await ctx.reply(`✅ Tayyor! \nLink: https://seremony-invit.uz/${newInv.slug}`);
      await ctx.reply("💳 To'lov qilish uchun pastdagi tugmani bosing:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "To'lov qilish (50,000 so'm)", callback_data: `pay_${newInv._id}` }]
          ]
        }
      });
    } catch (err) {
      console.error(err);
      await ctx.reply("Xatolik yuz berdi. Balki bunday link banddir.");
    }
    return ctx.scene.leave();
  }
);

// Stage sozlamalari
const stage = new Scenes.Stage<MyContext>([invitationWizard]);
bot.use(session());
bot.use(stage.middleware());

bot.command('start', (ctx) => ctx.scene.enter('create_invitation'));

bot.action(/pay_(.+)/, async (ctx) => {
  const invId = ctx.match[1];
  await ctx.answerCbQuery();
  await ctx.reply(`To'lov tizimi ulanmoqda. ID: ${invId}`);
});

// bot-app.ts oxiriga qo'shing
bot.launch()
  .then(() => console.log("🚀 Bot muvaffaqiyatli yurgizildi!"))
  .catch((err) => console.error("❌ Botni yurgizishda xato:", err));

// Jarayon to'xtab qolmasligi uchun
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));