import { useEffect, useState } from 'react';
import { fetchInvitation, type InvitationResult } from './api/invitation';
import { MediumTemplates, PremiumTemplate, StandardTemplate } from './components/templates';
import type { InvitationData, TemplateId } from './types/invitation.types';
import { makeSampleData } from './preview/sampleData';
import { getDemo } from './preview/demoData';
import Landing from './components/landing/Landing';
import PayApp from './pay/PayApp';
import { resolvePhotos } from './utils/photoUrl';

// URL:
//   /                          -> Landing
//   /pay/<invitationId>        -> Telegram Mini App to'lov
//   /preview/<shablon>         -> namuna
//   /preview/<shablon>/<slug>  -> taklifnoma
//   /<slug>                    -> taklifnoma
type Route =
  | { kind: 'landing' }
  | { kind: 'pay'; invitationId: string }
  | { kind: 'pay_menu' }
  | { kind: 'sample'; template: TemplateId }
  | { kind: 'invitation'; slug: string };

function parseRoute(): Route {
  const parts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parts[0] === 'pay' && (!parts[1] || parts[1] === 'menu')) {
    return { kind: 'pay_menu' };
  }
  if (parts[0] === 'pay' && parts[1]) {
    return { kind: 'pay', invitationId: parts[1] };
  }
  if (parts[0] === 'preview' && ['standard', 'medium', 'premium'].includes(parts[1])) {
    if (parts[2]) return { kind: 'invitation', slug: parts[2] };
    return { kind: 'sample', template: parts[1] as TemplateId };
  }
  if (parts[0]) return { kind: 'invitation', slug: parts[0] };
  return { kind: 'landing' };
}

function withResolvedPhotos(data: InvitationData): InvitationData {
  return { ...data, photos: resolvePhotos(data.photos) };
}

function renderTemplate(data: InvitationData) {
  const d = withResolvedPhotos(data);
  switch (d.templateId) {
    case 'premium':
      return <PremiumTemplate data={d} />;
    case 'standard':
      return <StandardTemplate data={d} />;
    case 'medium':
    default:
      return <MediumTemplates data={d} />;
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
  const demo = slug ? getDemo(slug) : null;
  const [result, setResult] = useState<InvitationResult | null>(null);

  useEffect(() => {
    if (route.kind !== 'invitation' || demo) return;
    if (!slug) return;
    let alive = true;
    fetchInvitation(slug).then((r) => {
      if (alive) setResult(r);
    });
    return () => {
      alive = false;
    };
  }, [slug, route.kind, demo]);

  if (route.kind === 'pay') {
    return <PayApp invitationId={route.invitationId} />;
  }

  if (route.kind === 'pay_menu') {
    return <PayApp invitationId="" mode="menu" />;
  }

  if (route.kind === 'sample') {
    return <div className="invite-shell">{renderTemplate(makeSampleData(route.template))}</div>;
  }

  if (route.kind === 'landing') {
    return <Landing />;
  }

  if (demo) {
    return <div className="invite-shell">{renderTemplate(demo)}</div>;
  }

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
        <p>Bunday taklifnoma mavjud emas yoki havola noto&apos;g&apos;ri.</p>
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
          To&apos;lovni yakunlagach, havola avtomatik ochiladi.
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

  return <div className="invite-shell">{renderTemplate(result.data)}</div>;
}

export default App;
