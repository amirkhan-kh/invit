import { useEffect, useState } from 'react';
import { fetchInvitation, type InvitationResult } from './api/invitation';
import { MediumTemplates, PremiumTemplate, StandardTemplate } from './components/templates';
import type { InvitationData, TemplateId } from './types/invitation.types';
import { makeSampleData } from './preview/sampleData';
import { getDemo } from './preview/demoData';
import Landing from './components/landing/Landing';

// URL'ni tahlil qilamiz:
//   /                          -> rasmiy sayt (Landing)
//   /preview/<shablon>         -> shablon namunasi (namuna ma'lumot)
//   /preview/<shablon>/<slug>  -> aniq taklifnoma (masalan /preview/premium/farhodshirin)
//   /<slug>                    -> aniq taklifnoma (qisqa ko'rinish — hali ishlaydi)
type Route =
  | { kind: 'landing' }
  | { kind: 'sample'; template: TemplateId }
  | { kind: 'invitation'; slug: string };

function parseRoute(): Route {
  const parts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parts[0] === 'preview' && ['standard', 'medium', 'premium'].includes(parts[1])) {
    if (parts[2]) return { kind: 'invitation', slug: parts[2] };
    return { kind: 'sample', template: parts[1] as TemplateId };
  }
  if (parts[0]) return { kind: 'invitation', slug: parts[0] };
  return { kind: 'landing' };
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

function App() {
  const route = parseRoute();
  const slug = route.kind === 'invitation' ? route.slug : '';
  // Portfolio (Mijozlar) namuna taklifnomasi — API'siz, doimiy
  const demo = slug ? getDemo(slug) : null;
  const [result, setResult] = useState<InvitationResult | null>(null);

  useEffect(() => {
    if (route.kind !== 'invitation' || demo) return; // sample/landing/demo -> API kerak emas
    if (!slug) return;
    let alive = true;
    fetchInvitation(slug).then((r) => {
      if (alive) setResult(r);
    });
    return () => {
      alive = false;
    };
  }, [slug, route.kind, demo]);

  // Shablon namunasi (/preview/premium)
  if (route.kind === 'sample') {
    return <div className="invite-shell">{renderTemplate(makeSampleData(route.template))}</div>;
  }

  // Bosh sahifa — rasmiy sayt
  if (route.kind === 'landing') {
    return <Landing />;
  }

  // Portfolio namunasi (demo) — haqiqiy taklifnoma ko'rinishida
  if (demo) {
    return <div className="invite-shell">{renderTemplate(demo)}</div>;
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
