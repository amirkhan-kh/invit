import { Context, Scenes } from 'telegraf';
import { TemplateId } from '../models/invit.back';

// Ssenariylar (scene) uchun umumiy session ma'lumotlari
export interface WizardData extends Scenes.WizardSessionData {
  templateId?: TemplateId;
  husband?: string;
  wife?: string;
  date?: string;
  venueName?: string;
  mapLink?: string;
  inviteText?: string;
  photos?: string[];
}

export interface MyContext extends Context {
  scene: Scenes.SceneContextScene<MyContext, WizardData>;
  wizard: Scenes.WizardContextWizard<MyContext>;
  session: Scenes.WizardSession<WizardData>;
}

// Xabar turini aniqlovchi yordamchilar
export function textOf(ctx: MyContext): string | null {
  const m: any = ctx.message;
  return m && typeof m.text === 'string' ? m.text : null;
}
export function photoOf(ctx: MyContext): string | null {
  const m: any = ctx.message;
  if (m && Array.isArray(m.photo) && m.photo.length) {
    return m.photo[m.photo.length - 1].file_id; // eng katta o'lcham
  }
  return null;
}
export function locationOf(ctx: MyContext): { lat: number; lon: number } | null {
  const m: any = ctx.message;
  if (m && m.location) return { lat: m.location.latitude, lon: m.location.longitude };
  return null;
}
