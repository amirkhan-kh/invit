import type { PaySession } from './types';

function initData(): string {
  return window.Telegram?.WebApp?.initData || '';
}

function userIdHeader(): Record<string, string> {
  const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const data = initData();
  if (data) headers['x-telegram-init-data'] = data;
  if (id) headers['x-telegram-user-id'] = String(id);
  return headers;
}

async function parseError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return j.message || j.error || `Xato (${res.status})`;
  } catch {
    return `Xato (${res.status})`;
  }
}

export async function fetchPaySession(invitationId: string): Promise<PaySession> {
  const res = await fetch(`/api/pay/${encodeURIComponent(invitationId)}`, {
    headers: userIdHeader(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** SHOP menyu: eng so'nggi ochiq to'lov */
export async function fetchMyPaySession(): Promise<PaySession> {
  const res = await fetch('/api/pay/mine', { headers: userIdHeader() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function startPay(
  invitationId: string,
  method: string
): Promise<PaySession> {
  const res = await fetch(`/api/pay/${encodeURIComponent(invitationId)}`, {
    method: 'POST',
    headers: userIdHeader(),
    body: JSON.stringify({ action: 'start', method, initData: initData() }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function declarePay(invitationId: string): Promise<PaySession> {
  const res = await fetch(`/api/pay/${encodeURIComponent(invitationId)}`, {
    method: 'POST',
    headers: userIdHeader(),
    body: JSON.stringify({ action: 'declare', initData: initData() }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function cancelPay(invitationId: string): Promise<PaySession> {
  const res = await fetch(`/api/pay/${encodeURIComponent(invitationId)}`, {
    method: 'POST',
    headers: userIdHeader(),
    body: JSON.stringify({ action: 'cancel', initData: initData() }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** Pulsiz sinov — karta o'tkazmasiz darhol tasdiq */
export async function freeTestPayApi(invitationId: string): Promise<PaySession> {
  const res = await fetch(`/api/pay/${encodeURIComponent(invitationId)}`, {
    method: 'POST',
    headers: userIdHeader(),
    body: JSON.stringify({ action: 'test_free', initData: initData() }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** To'lov to'xtatilsa — draft o'chadi */
export async function abandonPay(invitationId: string): Promise<void> {
  try {
    await fetch(`/api/pay/${encodeURIComponent(invitationId)}`, {
      method: 'POST',
      headers: userIdHeader(),
      body: JSON.stringify({ action: 'abandon', initData: initData() }),
      keepalive: true,
    });
  } catch {
    /* ignore — yopilishda tarmoq uzilishi mumkin */
  }
}
