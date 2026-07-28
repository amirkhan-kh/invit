import { useCallback, useRef, type MouseEvent } from 'react';
import './Landing.scss';
import Reveal from '../../shared/Reveal';
import PageLoader from '../../shared/PageLoader';
import { FloatingHearts, MotionSparks } from '../../shared/FloatingDecor';
import Parallax from '../../shared/Parallax';
import { DEMO_LIST } from '../../preview/demoData';
import { parseWeddingDate } from '../../types/invitation.types';
import {
  HiOutlineMusicNote,
  HiOutlineSparkles,
  HiOutlineLocationMarker,
  HiOutlineDeviceMobile,
  HiOutlineLink,
  HiOutlineLightningBolt,
  HiOutlineHeart,
  HiOutlinePhotograph,
} from 'react-icons/hi';
import { FaTelegramPlane, FaInstagram } from 'react-icons/fa';

const BOT = 'https://t.me/ceremony_invit_bot';
const CONTACT = 'https://t.me/elnox_uz';

const FEATURES = [
  {
    icon: <HiOutlineMusicNote />,
    title: 'Fon musiqasi',
    text: 'Har bir taklifnoma yumshoq, nafis kuy bilan ochiladi — mehmonlaringiz birinchi soniyadan his qiladi.',
    span: 'wide' as const,
    tone: 'rose',
  },
  {
    icon: <HiOutlineSparkles />,
    title: 'Jonli animatsiyalar',
    text: "Silliq o'tishlar, kapalaklar va oltin zarrachalar.",
    span: 'normal' as const,
    tone: 'gold',
  },
  {
    icon: <HiOutlineLocationMarker />,
    title: 'Xarita & taymer',
    text: "To'y joyi xaritada, kunlarni sanovchi countdown.",
    span: 'normal' as const,
    tone: 'emerald',
  },
  {
    icon: <HiOutlineDeviceMobile />,
    title: 'Mobil uchun ideal',
    text: "Telefonda mukammal — mehmon istagan joyda ochadi.",
    span: 'normal' as const,
    tone: 'gold',
  },
  {
    icon: <HiOutlineLink />,
    title: 'Bitta havola',
    text: 'Telegram, Instagram, WhatsApp — hammasi bitta link.',
    span: 'normal' as const,
    tone: 'rose',
  },
  {
    icon: <HiOutlineLightningBolt />,
    title: 'Tez tayyor',
    text: 'Bir necha daqiqada tayyor va darhol faol.',
    span: 'normal' as const,
    tone: 'emerald',
  },
  {
    icon: <HiOutlinePhotograph />,
    title: 'Shaxsiy galereya',
    text: "Sevgi tarixingizni rasmlar bilan jonlantiring — premium taassurot.",
    span: 'wide' as const,
    tone: 'gold',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Botga yozing',
    text: 'Telegram botimizda /start bosib, yoqqan shablonni tanlaysiz.',
  },
  {
    n: '02',
    title: "Ma'lumot kiriting",
    text: 'Ismlar, sana, manzil, taklif matni va rasmlarni yuborasiz.',
  },
  {
    n: '03',
    title: 'Havolangizni oling',
    text: "To'lovdan so'ng shaxsiy havola tayyor — mehmonlarga ulashing.",
  },
];

const LOVE_WORDS = ['Sevgi', 'Baxt', 'Muhabbat', 'Oilaviy', 'Abadiy', 'Baxtiyor'];

function TelegramBtn({
  className = 'l-btn l-btn-primary mx-press',
  label = 'Telegram botda yaratish',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a href={BOT} target="_blank" rel="noopener noreferrer" className={className}>
      <FaTelegramPlane /> {label}
    </a>
  );
}

function SectionHead({
  eyebrow,
  title,
  lead,
  light,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  light?: boolean;
}) {
  return (
    <Reveal variant="blur">
      <div className="l-eyebrow" style={light ? { color: '#e7cfa6' } : undefined}>
        {eyebrow}
      </div>
      <div className="mx-love-divider" aria-hidden>
        <span>♥</span>
      </div>
      <h2 className="l-title" style={light ? { color: '#f5efe3' } : undefined}>
        {title}
      </h2>
      <p className="l-lead" style={light ? { color: '#c3baa9' } : undefined}>
        {lead}
      </p>
    </Reveal>
  );
}

function BentoCard({
  feature,
  delay,
  variant,
}: {
  feature: (typeof FEATURES)[number];
  delay: number;
  variant: 'blur' | 'left' | 'right';
}) {
  const cardRef = useRef<HTMLElement>(null);

  const onMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);

  return (
    <Reveal variant={variant} delay={delay}>
      <article
        ref={cardRef}
        onMouseMove={onMove}
        className={`l-bento-card l-bento-card--${feature.span} l-bento-card--${feature.tone} mx-hover-lift`}
      >
        <div className="l-bento-shine" aria-hidden />
        <div className="l-bento-ring" aria-hidden />
        <div className="ic mx-icon-pop">{feature.icon}</div>
        <h3>{feature.title}</h3>
        <p>{feature.text}</p>
        <span className="l-bento-heart" aria-hidden>
          ♥
        </span>
      </article>
    </Reveal>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <PageLoader label="baxt.uz" minMs={650} />

      {/* ===== NAV ===== */}
      <nav className="l-nav">
        <a href="/" className="brand l-script">
          baxt.uz
          <small>TO&apos;Y TAKLIFNOMALARI</small>
        </a>
        <div className="links">
          <a href="#afzalliklar">Afzalliklar</a>
          <a href="#jarayon">Jarayon</a>
          <a href="#namunalar">Namunalar</a>
        </div>
        <TelegramBtn className="l-btn l-btn-primary mx-press l-nav-cta" label="Boshlash" />
      </nav>

      {/* ===== HERO ===== */}
      <header className="l-hero">
        <div className="l-hero-mesh" aria-hidden />
        <div className="l-hero-orb l-hero-orb--a" aria-hidden />
        <div className="l-hero-orb l-hero-orb--b" aria-hidden />
        <div className="l-hero-orb l-hero-orb--c" aria-hidden />
        <MotionSparks count={48} />
        <FloatingHearts count={14} />
        <div className="l-hero-glow mx-ambient-glow" aria-hidden />
        <div className="l-hero-vignette" aria-hidden />
        <Parallax strength={0.12} className="l-hero-content">
          <div className="l-hero-badge">
            <HiOutlineHeart /> Premium onlayn taklifnomalar
          </div>
          <div className="pretitle">Sevgi · Baxt · Abadiyat</div>
          <h1 className="mx-shimmer-text">Baxtli kuningiz — bitta havolada</h1>
          <p className="sub">
            Animatsiya, musiqa, xarita va countdown bilan bezatilgan zamonaviy to&apos;y
            taklifnomasi. Telegram bot orqali bir necha daqiqada yarating.
          </p>
          <div className="cta-row">
            <TelegramBtn />
            <a href="#namunalar" className="l-btn l-btn-ghost mx-press">
              Namunalarni ko&apos;rish
            </a>
          </div>
          <div className="l-hero-scroll" aria-hidden>
            <span>Scroll</span>
            <i />
          </div>
        </Parallax>
      </header>

      {/* ===== LOVE MARQUEE ===== */}
      <div className="l-love-strip" aria-hidden>
        <div className="l-love-strip-track">
          {[...LOVE_WORDS, ...LOVE_WORDS, ...LOVE_WORDS, ...LOVE_WORDS].map((w, i) => (
            <span key={`${w}-${i}`}>
              {w} <em>♥</em>
            </span>
          ))}
        </div>
      </div>

      {/* ===== AFZALLIKLAR — bento / spotlight ===== */}
      <section className="l-section l-features-section" id="afzalliklar">
        <div className="l-features-bg" aria-hidden>
          <span className="l-blob l-blob--1" />
          <span className="l-blob l-blob--2" />
        </div>
        <SectionHead
          eyebrow="Afzalliklar"
          title="Nega aynan biz?"
          lead="Qog'oz taklifnoma o'rniga — jonli, interaktiv va esda qoladigan raqamli taassurot."
        />
        <div className="l-bento">
          {FEATURES.map((f, i) => (
            <BentoCard
              key={f.title}
              feature={f}
              delay={(i % 4) * 90}
              variant={i % 3 === 0 ? 'blur' : i % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      </section>

      {/* ===== ROMANTIC QUOTE BAND ===== */}
      <section className="l-quote-band">
        <MotionSparks count={16} />
        <FloatingHearts count={6} />
        <Reveal variant="zoom">
          <p className="l-quote-script l-script">
            &ldquo;Sevgi — ikki yurakning bir nafasda urishi&rdquo;
          </p>
          <p className="l-quote-sub">Har bir taklifnoma — yangi oilaning boshlanishi</p>
        </Reveal>
      </section>

      {/* ===== JARAYON — cinematic steps ===== */}
      <section className="l-section l-process" id="jarayon">
        <SectionHead
          eyebrow="Jarayon"
          title="Uch oddiy qadam"
          lead="Dizayner ham, dastur ham kerak emas — hammasi Telegram bot ichida."
        />
        <div className="l-journey">
          <div className="l-journey-line" aria-hidden>
            <span className="l-journey-glow" />
          </div>
          {STEPS.map((s, i) => (
            <Reveal key={s.n} variant="3d" delay={i * 140}>
              <div className="l-journey-step">
                <div className="l-journey-node">
                  <span className="l-journey-num l-play">{s.n}</span>
                  <span className="l-journey-pulse" aria-hidden />
                </div>
                <div className="l-journey-card">
                  <div className="l-journey-ornament" aria-hidden />
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal variant="up" delay={200}>
          <div className="l-process-cta">
            <TelegramBtn label="Hozir boshlash" />
          </div>
        </Reveal>
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
                  <a
                    className="l-card mx-hover-lift"
                    key={`${d.slug}-${i}`}
                    href={`/preview/${d.templateId}/${d.slug}`}
                  >
                    <div className="ph" style={{ backgroundImage: `url(${d.cover})` }} />
                    <div className="veil" />
                    <div className="l-card-frame" aria-hidden />
                    <span className="badge">{d.templateId}</span>
                    <div className="info">
                      <div className="names l-script">
                        {d.husband} <span className="amp">&</span> {d.wife}
                      </div>
                      <div className="meta">
                        {p.monthName ? `${p.monthName} ${p.year}` : d.date} · {d.city}
                      </div>
                      <span className="open">Ochish →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ===== CTA ===== */}
      <section className="l-cta">
        <div className="l-cta-mesh" aria-hidden />
        <MotionSparks count={28} />
        <FloatingHearts count={10} />
        <Reveal variant="zoom">
          <div className="mx-love-divider" style={{ color: '#e7cfa6' }} aria-hidden>
            <span>♥</span>
          </div>
          <h2 className="mx-shimmer-text">Baxtingizni ulashing</h2>
          <p>
            Bugun o&apos;z to&apos;y taklifnomangizni yarating — bir necha daqiqada tayyor
            bo&apos;ladi. Sevgi, muhabbat va baxt — bitta nafis havolada.
          </p>
          <TelegramBtn />
        </Reveal>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="l-footer">
        <div className="brand">baxt.uz</div>
        <div className="fl">
          <a href="#afzalliklar">Afzalliklar</a>
          <a href="#jarayon">Jarayon</a>
          <a href="#namunalar">Namunalar</a>
          <a href={CONTACT} target="_blank" rel="noopener noreferrer">
            Murojaat
          </a>
        </div>
        <p className="l-footer-contact">
          Murojaat uchun:{' '}
          <a href={CONTACT} target="_blank" rel="noopener noreferrer">
            @elnox_uz
          </a>
        </p>
        <div className="l-footer-socials">
          <a href={CONTACT} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <FaTelegramPlane />
          </a>
          <a href={CONTACT} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
        </div>
        <div className="cp">
          © 2026 baxt.uz — Onlayn to&apos;y taklifnomalari. Barcha huquqlar himoyalangan.
        </div>
      </footer>
    </div>
  );
}
