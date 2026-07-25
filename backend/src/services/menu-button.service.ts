/**
 * SHOP MenuButton — faqat to'lov bosqichida (foydalanuvchi chatiga).
 * Boshqa vaqtda oddiy commands menyu.
 */
import { config, paymentAppUrl, shopMenuUrl } from '../config';

async function telegram(method: string, body: Record<string, unknown>) {
  if (!config.botToken) return null;
  const res = await fetch(`https://api.telegram.org/bot${config.botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { ok: boolean; description?: string };
  if (!json.ok) {
    console.warn(`menu_button ${method}:`, json.description);
  }
  return json;
}

/** Global default: commands (SHOP yo'q) */
export async function setDefaultMenuButton(): Promise<void> {
  await telegram('setChatMenuButton', {
    menu_button: { type: 'commands' },
  });
}

/** Shu foydalanuvchi uchun SHOP (to'lov) */
export async function showShopMenuForUser(
  chatId: number,
  invitationId?: string
): Promise<void> {
  const url = invitationId ? paymentAppUrl(invitationId) : shopMenuUrl();
  await telegram('setChatMenuButton', {
    chat_id: chatId,
    menu_button: {
      type: 'web_app',
      text: 'SHOP',
      web_app: { url },
    },
  });
}

/** To'lov tugagach SHOP ni olib tashlash */
export async function hideShopMenuForUser(chatId: number): Promise<void> {
  await telegram('setChatMenuButton', {
    chat_id: chatId,
    menu_button: { type: 'commands' },
  });
}
