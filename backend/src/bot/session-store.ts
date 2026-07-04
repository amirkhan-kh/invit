import mongoose from 'mongoose';

// Bot sessiyasini MongoDB'da saqlaymiz. Serverless (Vercel) da har xabar alohida
// funksiya chaqiruvi — xotira saqlanmaydi, shuning uchun ko'p bosqichli ssenariy
// (WizardScene) uchun sessiya doimiy bazada bo'lishi SHART.
//
// Mongoose model o'rniga to'g'ridan-to'g'ri native collection ishlatamiz (tur muammosiz).
function coll() {
  return mongoose.connection.collection('botsessions');
}

// Telegraf session() uchun store interfeysi: get / set / delete
export const mongoSessionStore = {
  async get(key: string): Promise<any | undefined> {
    const doc = await coll().findOne({ _id: key as any });
    return doc ? (doc as any).data : undefined;
  },
  async set(key: string, value: any): Promise<void> {
    await coll().updateOne({ _id: key as any }, { $set: { data: value } }, { upsert: true });
  },
  async delete(key: string): Promise<void> {
    await coll().deleteOne({ _id: key as any });
  },
};
