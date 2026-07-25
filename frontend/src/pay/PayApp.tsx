import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cancelPay,
  declarePay,
  fetchMyPaySession,
  fetchPaySession,
  freeTestPayApi,
  startPay,
} from './api';
import type { PaySession } from './types';
import './PayApp.scss';

function fmt(n: number): string {
  return n.toLocaleString('ru-RU');
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function haptic(kind: 'success' | 'error' | 'light' = 'light') {
  try {
    const h = window.Telegram?.WebApp?.HapticFeedback;
    if (!h) return;
    if (kind === 'light') h.impactOccurred('light');
    else h.notificationOccurred(kind);
  } catch {
    /* ignore */
  }
}

export default function PayApp({
  invitationId,
  mode = 'id',
}: {
  invitationId: string;
  mode?: 'id' | 'menu';
}) {
  const [session, setSession] = useState<PaySession | null>(null);
  const [activeId, setActiveId] = useState(invitationId);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAmt, setCopiedAmt] = useState(false);
  const [remaining, setRemaining] = useState(0);

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const displayName = tgUser?.first_name || 'Mehmon';
  const username = tgUser?.username ? `@${tgUser.username}` : '';

  const load = useCallback(async () => {
    setError('');
    try {
      const s =
        mode === 'menu' || !invitationId
          ? await fetchMyPaySession()
          : await fetchPaySession(invitationId);
      setSession(s);
      setActiveId(s.invitationId);
      setRemaining(s.remainingSeconds || 0);
      // URL ni id ga to'g'rilash (menu → aniq sessiya)
      if ((mode === 'menu' || !invitationId) && s.invitationId) {
        const next = `/pay/${s.invitationId}`;
        if (window.location.pathname !== next) {
          window.history.replaceState(null, '', next);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yuklash xatosi');
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [invitationId, mode]);

  useEffect(() => {
    const wa = window.Telegram?.WebApp;
    try {
      wa?.ready();
      wa?.expand();
      wa?.setHeaderColor?.('#0b1220');
      wa?.setBackgroundColor?.('#0b1220');
    } catch {
      /* outside Telegram OK for preview */
    }
    load();
  }, [load]);

  // Timer
  useEffect(() => {
    if (!session || session.paymentStatus !== 'awaiting_transfer') return;
    setRemaining(session.remainingSeconds || 0);
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          load();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [session?.paymentStatus, session?.expiresAt, session?.remainingSeconds, load, session]);

  // Pending holatda poll
  useEffect(() => {
    if (!session || session.paymentStatus !== 'pending_review') return;
    const t = setInterval(() => load(), 4000);
    return () => clearInterval(t);
  }, [session?.paymentStatus, load, session]);

  const totalSeconds = useMemo(() => {
    // progress uchun taxminiy sessiya (default 7 daq)
    if (session?.expiresAt && session.remainingSeconds != null) {
      // saqlangan max — qayta hisoblash qiyin; 7*60 fallback
      return Math.max(session.remainingSeconds, 7 * 60);
    }
    return 7 * 60;
  }, [session]);

  const progressPct = totalSeconds > 0 ? Math.min(100, (remaining / totalSeconds) * 100) : 0;

  const payId = activeId || invitationId;

  async function onMethod(methodId: string) {
    if (busy || !payId) return;
    setBusy(true);
    setError('');
    try {
      const s = await startPay(payId, methodId);
      setSession(s);
      setRemaining(s.remainingSeconds || 0);
      haptic('light');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xato');
      haptic('error');
    } finally {
      setBusy(false);
    }
  }

  async function onCopy() {
    const num = session?.card?.number;
    if (!num) return;
    try {
      await navigator.clipboard.writeText(num);
      setCopied(true);
      haptic('success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = num;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function onDeclare() {
    if (busy || !payId) return;
    setBusy(true);
    setError('');
    try {
      const s = await declarePay(payId);
      setSession(s);
      haptic('success');
      if (s.isPaid || s.paymentStatus === 'paid') {
        // Muvaffaqiyat — biroz ko'rsatib Mini App yopiladi
        setTimeout(() => {
          try {
            window.Telegram?.WebApp?.close();
          } catch {
            /* ignore */
          }
        }, 2500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xato');
      haptic('error');
    } finally {
      setBusy(false);
    }
  }

  async function onFreeTest() {
    if (busy || !payId) return;
    setBusy(true);
    setError('');
    try {
      const s = await freeTestPayApi(payId);
      setSession(s);
      haptic('success');
      setTimeout(() => {
        try {
          window.Telegram?.WebApp?.close();
        } catch {
          /* ignore */
        }
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xato');
      haptic('error');
    } finally {
      setBusy(false);
    }
  }

  async function onCopyAmount() {
    const amt = String(session?.amount ?? '');
    if (!amt) return;
    try {
      await navigator.clipboard.writeText(amt);
      setCopiedAmt(true);
      haptic('success');
      setTimeout(() => setCopiedAmt(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function onCancel() {
    if (busy || !payId) return;
    setBusy(true);
    setError('');
    try {
      const s = await cancelPay(payId);
      setSession(s);
      haptic('light');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xato');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="pay-app">
        <div className="pay-loading">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="pay-app">
        {error && <div className="pay-error">{error}</div>}
        <div className="pay-status">
          <div className="icon">😕</div>
          <h2>Sessiya topilmadi</h2>
          <p>Botdan «To&apos;lov» tugmasi orqali qayta oching.</p>
        </div>
      </div>
    );
  }

  // Muvaffaqiyat
  if (session.isPaid || session.paymentStatus === 'paid') {
    return (
      <div className="pay-app">
        <Header name={displayName} username={username} />
        <div className="pay-status">
          <div className="icon">✅</div>
          <h2>To&apos;lovingiz tasdiqlandi!</h2>
          <p>
            {session.husband} &amp; {session.wife}
            <br />
            Taklifnoma faollashtirildi.
            <br />
            <span style={{ fontSize: 12, opacity: 0.7 }}>Havola Telegram chatga yuborildi…</span>
          </p>
          {session.invitationUrl && (
            <a
              className="pay-btn blue"
              href={session.invitationUrl}
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
              target="_blank"
              rel="noreferrer"
            >
              Taklifnomani ochish
            </a>
          )}
          <button type="button" className="pay-btn ghost" onClick={() => window.Telegram?.WebApp?.close()}>
            Yopish
          </button>
        </div>
      </div>
    );
  }

  // Tekshiruvda (faqat live + autoConfirm o'chiq)
  if (session.paymentStatus === 'pending_review') {
    return (
      <div className="pay-app">
        <Header name={displayName} username={username} />
        <div className="pay-status">
          <div className="icon">⏳</div>
          <h2>Tekshiruvda</h2>
          <p>
            O&apos;tkazma qabul qilindi.
            <br />
            Tez orada tasdiqlanadi.
            <br />
            <strong style={{ color: '#8eb6ff' }}>{fmt(session.amount)} so&apos;m</strong>
          </p>
          <button type="button" className="pay-btn blue" onClick={() => load()} disabled={busy}>
            Holatni yangilash
          </button>
          {(session.testMode || session.autoConfirm) && (
            <button type="button" className="pay-btn primary" onClick={onFreeTest} disabled={busy}>
              Sinov: darhol tasdiqlash
            </button>
          )}
        </div>
      </div>
    );
  }

  // Karta o'tkazma ekrani (Verion uslubi)
  if (session.paymentStatus === 'awaiting_transfer' && session.card && remaining > 0) {
    return (
      <div className="pay-app">
        <Header name={displayName} username={username} />
        {error && <div className="pay-error">{error}</div>}
        <div className="pay-section">
          <div className="pay-warn-row">
            <div className="pay-warn">
              ⚠️ Diqqat! Faqat ko&apos;rsatilgan summani yuboring
            </div>
            <a className="pay-help-mini" href="https://t.me/elnox_uz" target="_blank" rel="noreferrer">
              🎧 Yordam
            </a>
          </div>

          {session.testMode && (
            <div className="pay-test-banner">
              🧪 <b>Test rejim</b>: summa {fmt(session.amount)} so&apos;m (katalog:{' '}
              {fmt(session.catalogPrice || session.amount)}).
              Real pul yubormasdan «Sinov to&apos;lov» yoki «To&apos;lov qildim» bosing — darhol tasdiqlanadi.
            </div>
          )}

          <div className="pay-amount-hero">
            <div className="lbl">AYNAN shu summani o&apos;tkazing</div>
            <div className="row">
              <span className="big">{fmt(session.amount)} so&apos;m</span>
              <button type="button" className="icon-btn" onClick={onCopyAmount} title="Nusxa">
                {copiedAmt ? '✓' : '📋'}
              </button>
            </div>
          </div>

          <div className="pay-timer-bar">
            <div className="pay-timer-row">
              <span>⏱ Karta amal qiladi</span>
              <span className="t">{fmtTime(remaining)}</span>
            </div>
            <div className="pay-progress">
              <i style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="pay-card-box">
            <div>
              <span className="badge">{session.card.label}</span>
            </div>
            <div className="num">{session.card.numberDisplay}</div>
            <div className="holder">{session.card.holder}</div>
            <button type="button" className={`pay-copy${copied ? ' copied' : ''}`} onClick={onCopy}>
              {copied ? '✓ Nusxa olindi' : '📋 Nusxa olish'}
            </button>
          </div>

          <ul className="pay-rules">
            <li className="ok">Summani 1 so&apos;mga ham o&apos;zgartirmang</li>
            <li className="ok">Vaqt tugaguncha to&apos;lang</li>
            <li className="no">Faqat ko&apos;rsatilgan kartaga</li>
            <li className="no">
              {session.card.method === 'bankomat'
                ? 'Bankomat/terminal orqali mumkin'
                : 'Faqat kartadan kartaga'}
            </li>
          </ul>

          <button type="button" className="pay-btn primary" onClick={onDeclare} disabled={busy}>
            {busy ? '...' : session.autoConfirm ? '✓ To\'lov qildim — tasdiqlash' : '✓ To\'lov qildim'}
          </button>

          {session.testMode && (
            <button type="button" className="pay-btn blue" onClick={onFreeTest} disabled={busy}>
              🧪 Sinov to&apos;lov (pul yubormasdan)
            </button>
          )}

          <button type="button" className="pay-btn ghost" onClick={onCancel} disabled={busy}>
            To&apos;lovni bekor qilish
          </button>
        </div>
      </div>
    );
  }

  // Usul tanlash (asosiy ekran)
  return (
    <div className="pay-app">
      <Header name={displayName} username={username} />
      {error && <div className="pay-error">{error}</div>}

      <div className="pay-section">
        <div className="pay-label">To&apos;lov</div>
        <div className="pay-balance-card">
          <div style={{ fontSize: 13, color: '#9eb0cc' }}>To&apos;lanadigan summa</div>
          <div className="amt">{fmt(session.amount)} so&apos;m</div>
          <div className="sub">
            {session.husband} &amp; {session.wife}
            <br />
            {session.productTitle}
          </div>
        </div>

        <div className="pay-product">
          <span>Shablon: {session.templateLabel}</span>
          <span className="price">{fmt(session.catalogPrice || session.amount)} so&apos;m</span>
        </div>

        {session.testMode && (
          <div className="pay-test-banner" style={{ marginTop: 10 }}>
            🧪 Test rejim yoqilgan. Usul tanlang → «Sinov to&apos;lov» — pul ketmaydi, havola keladi.
          </div>
        )}

        <div className="pay-label">To&apos;lov usuli</div>
        <div className="pay-methods">
          {session.methods.map((m) => {
            const canUse = m.enabled !== false && !m.soon;
            return (
              <button
                key={m.id}
                type="button"
                className={`pay-method ${m.id}${!canUse ? ' soon' : ''}`}
                disabled={!canUse || busy}
                onClick={() => onMethod(m.id)}
              >
                <div className="ml">{m.label}</div>
                <div className="ms">{m.soon ? 'Tez orada' : m.subtitle}</div>
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: '#7d8eab', marginTop: 12, lineHeight: 1.45 }}>
          Eng kam: 1 000 so&apos;m · Karta o&apos;tkazma · Admin tasdiqlagach faollashadi
        </p>

        <a className="pay-help" href="https://t.me/elnox_uz" target="_blank" rel="noreferrer">
          <span>
            Texnik yordam
            <small>@elnox_uz</small>
          </span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
}

function Header({ name, username }: { name: string; username: string }) {
  return (
    <div className="pay-top">
      <div className="pay-user">
        <div className="pay-avatar">{(name[0] || 'B').toUpperCase()}</div>
        <div className="pay-user-meta">
          <strong>{name}</strong>
          {username && <span>{username}</span>}
        </div>
      </div>
      <div className="pay-brand">baxt.uz</div>
    </div>
  );
}
