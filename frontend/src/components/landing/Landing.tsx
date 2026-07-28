import './Landing.scss';
import Reveal from '../../shared/Reveal';
import PageLoader from '../../shared/PageLoader';
import { FloatingHearts, MotionSparks } from '../../shared/FloatingDecor';
import Parallax from '../../shared/Parallax';
import { DEMO_LIST } from '../../preview/demoData';
import { parseWeddingDate, TEMPLATE_PRICES } from '../../types/invitation.types';
import {
  HiOutlineMusicNote,
  HiOutlineSparkles,
  HiOutlineLocationMarker,
  HiOutlineDeviceMobile,
  HiOutlineLink,
  HiOutlineLightningBolt,
} from 'react-icons/hi';
import { FaTelegramPlane, FaInstagram } from 'react-icons/fa';

const BOT = 'https://t.me/ceremony_invit_bot';
const CONTACT = 'https://t.me/elnox_uz';

const DEMO_FOR: Record<string, string> = {
  standard: 'jasurnigora',
  medium: 'azizmalika',
  premium: 'sardorkamila',
};

const fmt = (n: number) => n.toLocaleString('ru-RU');

const FEATURES = [
  { icon: <HiOutlineMusicNote />, title: 'Fon musiqasi', text: 'Har bir taklifnoma yumshoq, nafis kuy bilan ochiladi.' },
  { icon: <HiOutlineSparkles />, title: 'Jonli animatsiyalar', text: "Silliq o'tishlar, kapalaklar va oltin zarrachalar." },
  { icon: <HiOutlineLocationMarker />, title: 'Xarita & taymer', text: "To'y joyi xaritada, kunlarni sanovchi countdown." },
  { icon: <HiOutlineDeviceMobile />, title: 'Mobil uchun ideal', text: "Telefonda mukammal — mehmon istagan joyda ochadi." },
  { icon: <HiOutlineLink />, title: 'Bitta havola', text: 'Telegram, Instagram, WhatsApp — hammasi bitta link.' },
  { icon: <HiOutlineLightningBolt />, title: 'Tez tayyor', text: 'Bir necha daqiqada tayyor va darhol faol.' },
];

const STEPS = [
  { n: 1, title: 'Botga yozing', text: 'Telegram botimizda /start bosib, yoqqan shablonni tanlaysiz.' },
  { n: 2, title: "Ma'lumot kiriting", text: 'Ismlar, sana, manzil, taklif matni va rasmlarni yuborasiz.' },
  { n: 3, title: 'Havolangizni oling', text: "To'lovdan so'ng shaxsiy havola tayyor — mehmonlarga ulashing." },
];

const TPLS = [
  { id: 'standard', name: 'Standart', cap: 'linear-gradient(135deg,#7f8f6e,#566b48)', price: TEMPLATE_PRICES.standard, feats: ['Nafis, sodda dizayn', 'Fon musiqasi', 'Countdown va xarita'] },
  { id: 'medium', name: 'Medium', cap: 'linear-gradient(135deg,#547792,#3f5c74)', price: TEMPLATE_PRICES.medium, feats: ['Boy bezaklar', 'Kalendar va kapalaklar', 'Rasmlar galereyasi'] },
  { id: 'premium', name: 'Premium', cap: 'linear-gradient(135deg,#1a2c22,#c9a36b)', price: TEMPLATE_PRICES.premium, feats: ['Kinematografik dizayn', 'Oltin animatsiyalar', 'Barcha imkoniyatlar'] },
];

function TelegramBtn({ className = 'l-btn l-btn-primary mx-press', label = 'Telegram botda yaratish' }: { className?: string; label?: string }) {
  return (
    <a href={BOT} target="_blank" rel="noopener noreferrer" className={className}>
      <FaTelegramPlane /> {label}
    </a>
  );
}

function SectionHead({ eyebrow, title, lead, light }: { eyebrow: string; title: string; lead: string; light?: boolean }) {
  return (
    <Reveal variant="blur">
      <div className="l-eyebrow" style={light ? { color: '#e7cfa6' } : undefined}>{eyebrow}</div>
      <div className="mx-love-divider" aria-hidden><span>♥</span></div>
      <h2 className="l-title">{title}</h2>
      <p className="l-lead">{lead}</p>
    </Reveal>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <PageLoader label="baxt.uz" minMs={650} />

      {/* ===== NAV ===== */}
      <nav className="l-nav">
        <div className="brand l-script">
          baxt.uz
          <small>TO'Y TAKLIFNOMALARI</small>
        </div>
        <div className="links">
          <a href="#shablonlar">Shablonlar</a>
          <a href="#jarayon">Jarayon</a>
          <a href="#namunalar">Namunalar</a>
          <a href="#narxlar">Narxlar</a>
        </div>
        <TelegramBtn className="l-btn l-btn-primary mx-press" label="Boshlash" />
      </nav>

      {/* ===== HERO ===== */}
      <header className="l-hero">
        <MotionSparks count={42} />
        <FloatingHearts count={12} />
        <div className="l-hero-glow mx-ambient-glow" aria-hidden />
        <Parallax strength={0.12} className="l-hero-content">
          <div className="pretitle">Premium onlayn taklifnomalar</div>
          <h1 className="mx-shimmer-text">Baxtli kuningiz — bitta havolada</h1>
          <p className="sub">
            Animatsiya, musiqa, xarita va countdown bilan bezatilgan zamonaviy to'y taklifnomasi.
            Telegram bot orqali bir necha daqiqada yarating.
          </p>
          <div className="cta-row">
            <TelegramBtn />
            <a href="#namunalar" className="l-btn l-btn-ghost mx-press">Namunalarni ko'rish</a>
          </div>
        </Parallax>
      </header>

      {/* ===== AFZALLIKLAR ===== */}
      <section className="l-section l-features-section">
        <SectionHead
          eyebrow="Afzalliklar"
          title="Nega aynan biz?"
          lead="Qog'oz taklifnoma o'rniga — jonli, interaktiv va esda qoladigan raqamli taassurot."
        />
        <div className="l-features">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} variant={i % 2 === 0 ? 'left' : 'right'} delay={(i % 3) * 80}>
              <div className="l-feat mx-hover-lift mx-hover-glow mx-tilt">
                <div className="ic mx-icon-pop">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== JARAYON ===== */}
      <section className="l-section l-process" id="jarayon">
        <SectionHead
          eyebrow="Jarayon"
          title="Uch oddiy qadam"
          lead="Dizayner ham, dastur ham kerak emas — hammasi Telegram bot ichida."
        />
        <div className="l-steps">
          <div className="mx-step-line" aria-hidden />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} variant="3d" delay={i * 120}>
              <div className="l-step">
                <div className="num l-play mx-pulse-ring">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== SHABLONLAR ===== */}
      <section className="l-section" id="shablonlar">
        <SectionHead
          eyebrow="Shablonlar"
          title="Uch uslub — har didga"
          lead="Har birini haqiqiy namuna orqali jonli ko'rib chiqing va mosini tanlang."
        />
        <div className="l-tpls">
          {TPLS.map((t, i) => (
            <Reveal key={t.id} variant="up" delay={i * 100}>
              <div className="l-tpl mx-hover-lift mx-tilt">
                <div className="cap" style={{ background: t.cap }}>
                  <span className="cap-heart" aria-hidden>♥</span>
                  {t.name}
                </div>
                <div className="body">
                  <div className="price l-play">{fmt(t.price)} <small>so'm</small></div>
                  <ul>
                    {t.feats.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  <a href={`/preview/${t.id}/${DEMO_FOR[t.id]}`} className="l-btn l-btn-primary mx-press" style={{ marginTop: 'auto' }}>
                    Namunani ko'rish
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== NAMUNALAR / MIJOZLAR ===== */}
      <div className="l-portfolio-wrap" id="namunalar">
        <section className="l-section">
          <SectionHead
            eyebrow="Mijozlar"
            title="Biz tayyorlagan taklifnomalar"
            lead="Kartaga bosing (yoki ustiga oling — to'xtaydi) — haqiqiy taklifnoma qanday ko'rinishini jonli sinab ko'ring."
          />
          <div className="l-marquee">
            <div className="l-marquee-track">
              {[...DEMO_LIST, ...DEMO_LIST].map((d, i) => {
                const p = parseWeddingDate(d.date);
                return (
                  <a className="l-card mx-hover-lift" key={`${d.slug}-${i}`} href={`/preview/${d.templateId}/${d.slug}`}>
                    <div className="ph" style={{ backgroundImage: `url(${d.cover})` }} />
                    <div className="veil" />
                    <span className="badge">{d.templateId}</span>
                    <div className="info">
                      <div className="names l-script">
                        {d.husband} <span className="amp">&</span> {d.wife}
                      </div>
                      <div className="meta">{p.monthName ? `${p.monthName} ${p.year}` : d.date} · {d.city}</div>
                      <span className="open">Ochish →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ===== NARXLAR ===== */}
      <div className="l-pricing-wrap" id="narxlar">
        <section className="l-section">
          <SectionHead
            eyebrow="Narxlar"
            title="Bir martalik to'lov"
            lead="Yashirin to'lovlarsiz. Havola doimiy — to'y kunigacha faol turadi."
            light
          />
          <div className="l-prices">
            {TPLS.map((t, i) => (
              <Reveal key={t.id} variant="zoom" delay={i * 100}>
                <div className={`l-price mx-hover-lift${t.id === 'medium' ? ' feat' : ''}`}>
                  <div className="tier">{t.name}</div>
                  <div className="amt l-play">{fmt(t.price)} <small>so'm</small></div>
                  <ul>
                    {t.feats.map((f) => <li key={f}>{f}</li>)}
                    <li>Shaxsiy havola</li>
                  </ul>
                  <TelegramBtn className="l-btn l-btn-primary mx-press" label="Tanlash" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      {/* ===== CTA ===== */}
      <section className="l-cta">
        <MotionSparks count={24} />
        <FloatingHearts count={8} />
        <Reveal variant="zoom">
          <div className="mx-love-divider" style={{ color: '#e7cfa6' }} aria-hidden><span>♥</span></div>
          <h2 className="mx-shimmer-text">Baxtingizni ulashing</h2>
          <p>Bugun o'z to'y taklifnomangizni yarating — bir necha daqiqada tayyor bo'ladi.</p>
          <TelegramBtn />
        </Reveal>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="l-footer">
        <div className="brand">baxt.uz</div>
        <div className="fl">
          <a href="#shablonlar">Shablonlar</a>
          <a href="#namunalar">Namunalar</a>
          <a href="#narxlar">Narxlar</a>
          <a href={CONTACT} target="_blank" rel="noopener noreferrer">Murojaat</a>
        </div>
        <p style={{ fontSize: 14, color: '#b9ad97', marginBottom: 4 }}>
          Murojaat uchun: <a href={CONTACT} target="_blank" rel="noopener noreferrer" style={{ color: '#e7cfa6' }}>@elnox_uz</a>
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 20, color: '#c9a36b' }}>
          <a href={CONTACT} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><FaTelegramPlane /></a>
          <a href={CONTACT} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
        </div>
        <div className="cp">© 2026 baxt.uz — Onlayn to'y taklifnomalari. Barcha huquqlar himoyalangan.</div>
      </footer>
    </div>
  );
}
