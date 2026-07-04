import './Landing.scss';
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

const fmt = (n: number) => n.toLocaleString('ru-RU');

const SPARKS = Array.from({ length: 30 }, (_, i) => ({
  top: (i * 37 + 6) % 96,
  left: (i * 53 + 9) % 98,
  size: 2 + (i % 3),
  delay: (i % 7) * 0.45,
  key: i,
}));

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

function TelegramBtn({ className = 'l-btn l-btn-primary', label = 'Telegram botda yaratish' }: { className?: string; label?: string }) {
  return (
    <a href={BOT} target="_blank" rel="noopener noreferrer" className={className}>
      <FaTelegramPlane /> {label}
    </a>
  );
}

export default function Landing() {
  return (
    <div className="landing">
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
        <TelegramBtn className="l-btn l-btn-primary" label="Boshlash" />
      </nav>

      {/* ===== HERO ===== */}
      <header className="l-hero">
        {SPARKS.map((s) => (
          <span key={s.key} className="l-spark" style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }} />
        ))}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="pretitle">Premium onlayn taklifnomalar</div>
          <h1 className="l-gold-text">Baxtli kuningiz — bitta havolada</h1>
          <p className="sub">
            Animatsiya, musiqa, xarita va countdown bilan bezatilgan zamonaviy to'y taklifnomasi.
            Telegram bot orqali bir necha daqiqada yarating.
          </p>
          <div className="cta-row">
            <TelegramBtn />
            <a href="#namunalar" className="l-btn l-btn-ghost">Namunalarni ko'rish</a>
          </div>
        </div>
      </header>

      {/* ===== AFZALLIKLAR ===== */}
      <section className="l-section">
        <div className="l-eyebrow">Afzalliklar</div>
        <h2 className="l-title">Nega aynan biz?</h2>
        <p className="l-lead">Qog'oz taklifnoma o'rniga — jonli, interaktiv va esda qoladigan raqamli taassurot.</p>
        <div className="l-features">
          {FEATURES.map((f) => (
            <div className="l-feat" key={f.title}>
              <div className="ic">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== JARAYON ===== */}
      <section className="l-section" id="jarayon" style={{ background: '#fff' }}>
        <div className="l-eyebrow">Jarayon</div>
        <h2 className="l-title">Uch oddiy qadam</h2>
        <p className="l-lead">Dizayner ham, dastur ham kerak emas — hammasi Telegram bot ichida.</p>
        <div className="l-steps">
          {STEPS.map((s) => (
            <div className="l-step" key={s.n}>
              <div className="num l-play">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SHABLONLAR ===== */}
      <section className="l-section" id="shablonlar">
        <div className="l-eyebrow">Shablonlar</div>
        <h2 className="l-title">Uch uslub — har didga</h2>
        <p className="l-lead">Har birini jonli ko'rib chiqing va o'zingizga mosini tanlang.</p>
        <div className="l-tpls">
          {TPLS.map((t) => (
            <div className="l-tpl" key={t.id}>
              <div className="cap" style={{ background: t.cap }}>{t.name}</div>
              <div className="body">
                <div className="price l-play">{fmt(t.price)} <small>so'm</small></div>
                <ul>
                  {t.feats.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <a href={`/preview/${t.id}`} className="l-btn l-btn-primary" style={{ marginTop: 'auto' }}>
                  Namunani ko'rish
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== NAMUNALAR / MIJOZLAR ===== */}
      <div className="l-portfolio-wrap" id="namunalar">
        <section className="l-section">
          <div className="l-eyebrow">Mijozlar</div>
          <h2 className="l-title">Biz tayyorlagan taklifnomalar</h2>
          <p className="l-lead">Kartaga bosing (yoki ustiga oling — to'xtaydi) — haqiqiy taklifnoma qanday ko'rinishini jonli sinab ko'ring.</p>
          <div className="l-marquee">
            <div className="l-marquee-track">
              {[...DEMO_LIST, ...DEMO_LIST].map((d, i) => {
                const p = parseWeddingDate(d.date);
                return (
                  <a className="l-card" key={`${d.slug}-${i}`} href={`/preview/${d.templateId}/${d.slug}`}>
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
          <div className="l-eyebrow" style={{ color: '#e7cfa6' }}>Narxlar</div>
          <h2 className="l-title">Bir martalik to'lov</h2>
          <p className="l-lead">Yashirin to'lovlarsiz. Havola doimiy — to'y kunigacha faol turadi.</p>
          <div className="l-prices">
            {TPLS.map((t) => (
              <div className={`l-price${t.id === 'medium' ? ' feat' : ''}`} key={t.id}>
                <div className="tier">{t.name}</div>
                <div className="amt l-play">{fmt(t.price)} <small>so'm</small></div>
                <ul>
                  {t.feats.map((f) => <li key={f}>{f}</li>)}
                  <li>Shaxsiy havola</li>
                </ul>
                <TelegramBtn className="l-btn l-btn-primary" label="Tanlash" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== CTA ===== */}
      <section className="l-cta">
        <h2 className="l-gold-text">Baxtingizni ulashing</h2>
        <p>Bugun o'z to'y taklifnomangizni yarating — bir necha daqiqada tayyor bo'ladi.</p>
        <TelegramBtn />
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="l-footer">
        <div className="brand">baxt.uz</div>
        <div className="fl">
          <a href="#shablonlar">Shablonlar</a>
          <a href="#namunalar">Namunalar</a>
          <a href="#narxlar">Narxlar</a>
          <a href={BOT} target="_blank" rel="noopener noreferrer">Telegram</a>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 20, color: '#c9a36b' }}>
          <a href={BOT} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><FaTelegramPlane /></a>
          <a href={BOT} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
        </div>
        <div className="cp">© 2026 baxt.uz — Onlayn to'y taklifnomalari. Barcha huquqlar himoyalangan.</div>
      </footer>
    </div>
  );
}
