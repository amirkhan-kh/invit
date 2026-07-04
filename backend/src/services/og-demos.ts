// Portfolio demolar uchun OG (Telegram link-preview) ma'lumoti.
// api/render.ts shu yerdan oladi (demolar DB'da emas — frontend'da).
const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&h=630&fit=crop&q=80`;

export interface OgData {
  husband: string;
  wife: string;
  image: string;
  date: string;
}

export const OG_DEMOS: Record<string, OgData> = {
  farhodshirin: { husband: 'Farhod', wife: 'Shirin', image: img('1519741497674-611481863552'), date: '12.09.2026' },
  azizmalika: { husband: 'Aziz', wife: 'Malika', image: img('1583939003579-730e3918a45a'), date: '03.10.2026' },
  dmitriyanna: { husband: 'Dmitriy', wife: 'Anna', image: img('1537633552985-df8429e8048b'), date: '22.08.2026' },
  jasurnigora: { husband: 'Jasur', wife: 'Nigora', image: img('1460978812857-470ed1c77af0'), date: '15.11.2026' },
  ivanekaterina: { husband: 'Ivan', wife: 'Ekaterina', image: img('1522673607200-164d1b6ce486'), date: '27.09.2026' },
  sardorkamila: { husband: 'Sardor', wife: 'Kamila', image: img('1606216794074-735e91aa2c92'), date: '30.05.2027' },
};
