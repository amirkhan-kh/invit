import type { InvitationData } from '../types/invitation.types';

// Natija turlari (discriminated union)
export type InvitationResult =
  | { status: 'ok'; data: InvitationData }
  | { status: 'unpaid'; husband?: string; wife?: string }
  | { status: 'notfound' }
  | { status: 'error'; message: string };

// Backend API'dan slug bo'yicha taklifnomani oladi.
// Dev rejimida Vite proxy /api ni localhost:5000 ga uzatadi.
export async function fetchInvitation(slug: string): Promise<InvitationResult> {
  try {
    const res = await fetch(`/api/invitation/${encodeURIComponent(slug)}`);

    if (res.status === 404) return { status: 'notfound' };

    if (res.status === 402) {
      const body = await res.json().catch(() => ({}));
      return { status: 'unpaid', husband: body.husband, wife: body.wife };
    }

    if (!res.ok) {
      return { status: 'error', message: `Server xatosi (${res.status})` };
    }

    const data = (await res.json()) as InvitationData;
    return { status: 'ok', data };
  } catch (e) {
    return {
      status: 'error',
      message: e instanceof Error ? e.message : 'Tarmoq xatosi',
    };
  }
}
