import type { InvitationData } from '../types/invitation.types';

// Portfolio (Mijozlar bo'limi) uchun namuna taklifnomalar.
// Bular baxt.uz/<slug> ko'rinishida ochiladi — haqiqiy taklifnoma kabi ishlaydi,
// lekin API/DB'siz (frontend'da), shuning uchun muddati tugamaydi.
const u = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

export const DEMOS: Record<string, InvitationData> = {
  farhodshirin: {
    slug: 'farhodshirin',
    templateId: 'premium',
    husband: 'Farhod',
    wife: 'Shirin',
    date: '12.09.2026',
    venueName: 'Anhor Lounge',
    address: "Toshkent sh., Beruniy ko'chasi 8A",
    mapLink: 'https://www.google.com/maps/search/?api=1&query=41.325,69.228',
    inviteText:
      "Hayotimizning eng go'zal kunida sizni yonimizda ko'rishni istaymiz. Bu qutlug' onlarni biz bilan birga baham ko'rishingizni chin dildan so'raymiz.",
    footerWish:
      "Sizni samimiyat va iliqlik bilan kutib olamiz. Bu kunimiz siz bilan yanada go'zal bo'ladi.",
    photos: [u('1519741497674-611481863552'), u('1465495976277-4387d4b0b4c6'), u('1511285560929-80b456fea0bc')],
  },

  azizmalika: {
    slug: 'azizmalika',
    templateId: 'medium',
    husband: 'Aziz',
    wife: 'Malika',
    date: '03.10.2026',
    venueName: 'Registon Palace',
    address: "Samarqand sh., Registon ko'chasi 15",
    mapLink: 'https://www.google.com/maps/search/?api=1&query=39.654,66.975',
    inviteText:
      "Ikki qalbning bir bo'lgan kunida sizni to'yimizga taklif qilamiz. Ishtirokingiz biz uchun katta baxt va sharaf.",
    footerWish: "Aziz mehmonlar, sizni kutib qolamiz!",
    photos: [u('1583939003579-730e3918a45a'), u('1522673607200-164d1b6ce486'), u('1519225421980-715cb0215aed')],
  },

  dmitriyanna: {
    slug: 'dmitriyanna',
    templateId: 'premium',
    husband: 'Dmitriy',
    wife: 'Anna',
    date: '22.08.2026',
    venueName: 'Grand Mir Hall',
    address: 'Toshkent sh., Amir Temur 107',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=41.311,69.279',
    inviteText:
      'В самый счастливый день нашей жизни мы будем рады видеть вас рядом. Приглашаем разделить с нами радость этого торжества.',
    footerWish: 'Будем рады видеть вас на нашем празднике!',
    photos: [u('1537633552985-df8429e8048b'), u('1606216794074-735e91aa2c92'), u('1591604466107-ec97de577aff')],
  },

  jasurnigora: {
    slug: 'jasurnigora',
    templateId: 'standard',
    husband: 'Jasur',
    wife: 'Nigora',
    date: '15.11.2026',
    venueName: 'Bogishamol Bazmgoh',
    address: "Farg'ona sh., Mustaqillik ko'chasi 42",
    mapLink: 'https://www.google.com/maps/search/?api=1&query=40.386,71.787',
    inviteText:
      "Sizni farzandlarimizning to'y marosimiga taklif qilamiz. Ishtirokingiz biz uchun katta baxt.",
    footerWish: 'Sizni kutib qolamiz.',
    photos: [u('1460978812857-470ed1c77af0'), u('1519671482749-fd09be7ccebf'), u('1519741497674-611481863552')],
  },

  ivanekaterina: {
    slug: 'ivanekaterina',
    templateId: 'medium',
    husband: 'Ivan',
    wife: 'Ekaterina',
    date: '27.09.2026',
    venueName: 'Chorsu Palace',
    address: 'Toshkent sh., Navoiy 30',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=41.326,69.234',
    inviteText:
      'Приглашаем вас на самое важное событие в нашей жизни. Ваше присутствие сделает этот день по-настоящему незабываемым.',
    footerWish: 'С любовью ждём вас!',
    photos: [u('1522673607200-164d1b6ce486'), u('1465495976277-4387d4b0b4c6'), u('1583939003579-730e3918a45a')],
  },

  sardorkamila: {
    slug: 'sardorkamila',
    templateId: 'premium',
    husband: 'Sardor',
    wife: 'Kamila',
    date: '30.05.2027',
    venueName: 'Lyabi Hovuz Garden',
    address: "Buxoro sh., Bahouddin Naqshband ko'chasi 3",
    mapLink: 'https://www.google.com/maps/search/?api=1&query=39.774,64.418',
    inviteText:
      "Muhabbatimiz mevasi bo'lgan bu qutlug' kunda sizni to'yimizda ko'rishdan baxtiyor bo'lamiz. Marhamat, tashrif buyuring.",
    footerWish: 'Sizni intiqlik bilan kutamiz.',
    photos: [u('1606216794074-735e91aa2c92'), u('1591604466107-ec97de577aff'), u('1537633552985-df8429e8048b')],
  },
};

export function getDemo(slug: string): InvitationData | null {
  return DEMOS[slug] || null;
}

// Portfolio kartalari uchun (Mijozlar bo'limi)
export interface DemoCard {
  slug: string;
  husband: string;
  wife: string;
  date: string;
  templateId: InvitationData['templateId'];
  cover: string;
  city: string;
}

export const DEMO_LIST: DemoCard[] = Object.values(DEMOS).map((d) => ({
  slug: d.slug,
  husband: d.husband,
  wife: d.wife,
  date: d.date,
  templateId: d.templateId,
  cover: d.photos[0],
  city: d.address.split(',')[0],
}));
