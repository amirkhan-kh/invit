import { useEffect, useState } from 'react';
import { fetchInvitation, type InvitationResult } from './api/invitation';
import { MediumTemplates, PremiumTemplate, StandardTemplate } from './components/templates';
import type { InvitationData, TemplateId } from './types/invitation.types';
import { makeSampleData } from './preview/sampleData';

// URL'dan slug ni olamiz: baxt.uz/farhodshirin -> "farhodshirin"
function getSlug(): string {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  return path.split('/')[0] || '';
}

function renderTemplate(data: InvitationData) {
  switch (data.templateId) {
    case 'premium':
      return <PremiumTemplate data={data} />;
    case 'standard':
      return <StandardTemplate data={data} />;
    case 'medium':
    default:
      return <MediumTemplates data={data} />;
  }
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="invite-shell grid place-content-center text-center px-8 gap-4 text-[#4a4a4a]">
      {children}
    </div>
  );
}

// /preview/premium -> shablonni namuna ma'lumot bilan ko'rsatadi (API'siz)
function getPreview(): TemplateId | null {
  const m = window.location.pathname.match(/^\/preview\/(standard|medium|premium)/);
  return m ? (m[1] as TemplateId) : null;
}

function App() {
  const preview = getPreview();
  const slug = getSlug();
  const [result, setResult] = useState<InvitationResult | null>(null);

  useEffect(() => {
    if (preview) return; // preview rejimida API chaqirmaymiz
    if (!slug) {
      setResult({ status: 'error', message: 'landing' });
      return;
    }
    let alive = true;
    fetchInvitation(slug).then((r) => {
      if (alive) setResult(r);
    });
    return () => {
      alive = false;
    };
  }, [slug, preview]);

  // Preview rejimi — shablonni namuna ma'lumot bilan ko'rsatamiz
  if (preview) {
    return <div className="invite-shell">{renderTemplate(makeSampleData(preview))}</div>;
  }

  // Yuklanmoqda
  if (!result) {
    return (
      <Centered>
        <div className="font-script text-4xl text-[#c9a36b]">Taklifnoma</div>
        <div className="animate-pulse text-sm tracking-widest uppercase">Yuklanmoqda...</div>
      </Centered>
    );
  }

  // Bosh sahifa (slug yo'q)
  if (result.status === 'error' && result.message === 'landing') {
    return (
      <Centered>
        <div className="font-script text-5xl text-[#c9a36b]">baxt.uz</div>
        <p className="text-lg">Onlayn to'y taklifnomalari</p>
        <p className="text-sm text-gray-500">
          O'z taklifnomangizni yaratish uchun Telegram botimizga o'ting.
        </p>
        <a
          href="https://t.me/"
          className="mt-2 inline-block rounded-full bg-[#c9a36b] px-6 py-2 text-white"
        >
          Telegram bot
        </a>
      </Centered>
    );
  }

  if (result.status === 'notfound') {
    return (
      <Centered>
        <div className="font-script text-4xl text-[#c9a36b]">Topilmadi</div>
        <p>Bunday taklifnoma mavjud emas yoki havola noto'g'ri.</p>
      </Centered>
    );
  }

  if (result.status === 'unpaid') {
    return (
      <Centered>
        <div className="font-script text-4xl text-[#c9a36b]">
          {result.husband && result.wife ? `${result.husband} & ${result.wife}` : 'Taklifnoma'}
        </div>
        <p>Bu taklifnoma hali faollashtirilmagan.</p>
        <p className="text-sm text-gray-500">
          To'lovni yakunlagach, havola avtomatik ochiladi.
        </p>
      </Centered>
    );
  }

  if (result.status === 'error') {
    return (
      <Centered>
        <div className="font-script text-4xl text-[#c9a36b]">Xatolik</div>
        <p className="text-sm text-gray-500">{result.message}</p>
      </Centered>
    );
  }

  // Muvaffaqiyat — shablonni ko'rsatamiz
  return <div className="invite-shell">{renderTemplate(result.data)}</div>;
}

export default App;
