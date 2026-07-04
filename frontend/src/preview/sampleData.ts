import type { InvitationData, TemplateId } from '../types/invitation.types';

// Shablonlarni ko'rib chiqish (va MP4 namuna yozib olish) uchun namuna ma'lumot
export function makeSampleData(templateId: TemplateId): InvitationData {
  return {
    slug: `preview-${templateId}`,
    templateId,
    husband: 'Farhod',
    wife: 'Shirin',
    date: '12.09.2026',
    venueName: 'Anhor Lounge',
    address: "Toshkent sh., Beruniy ko'chasi 8A",
    mapLink: 'https://www.google.com/maps/search/?api=1&query=41.31,69.24',
    inviteText:
      "Oila baxti sari qo'yilgan birinchi qadamda, sizni to'yimizga taklif qilamiz. Sizning ishtirokingiz bizga baxt va fayz olib keladi.",
    footerWish:
      "Siz aziz mehmonlarni samimiyat bilan kutib olamiz. Bu kunimiz siz bilan yanada go'zal bo'ladi.",
    // Namuna rasmlar (bepul placeholder) — chiroyli ko'rinish uchun
    photos: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
    ],
  };
}
