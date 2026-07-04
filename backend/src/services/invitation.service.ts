import { Invitation, IInvitation } from '../models/invit.back';

// To'y sanasidan 2 kun o'tgach taklifnoma "muddati tugagan" -> 404 (slug bo'shaydi)
const EXPIRE_AFTER_MS = 2 * 24 * 60 * 60 * 1000;
export function isExpired(dateStr?: string): boolean {
  if (!dateStr) return false;
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(dateStr.trim());
  if (!m) return false;
  const [, d, mo, y] = m;
  const weddingEnd = new Date(Number(y), Number(mo) - 1, Number(d), 23, 59, 59).getTime();
  return Date.now() > weddingEnd + EXPIRE_AFTER_MS;
}

export type InvitationLookup =
  | { status: 404 }
  | { status: 402; husband: string; wife: string }
  | { status: 200; data: IInvitation };

// Slug bo'yicha taklifnomani topib, holatini qaytaradi (app va serverless ikkalasi ishlatadi)
export async function lookupInvitation(slug: string): Promise<InvitationLookup> {
  const inv = await Invitation.findOne({ slug });
  if (!inv) return { status: 404 };
  if (isExpired(inv.date)) return { status: 404 };
  if (!inv.isPaid) return { status: 402, husband: inv.husband, wife: inv.wife };
  return { status: 200, data: inv };
}
