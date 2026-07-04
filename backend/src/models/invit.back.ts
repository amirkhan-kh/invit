import { Schema, model, Document } from 'mongoose';

export type TemplateId = 'standard' | 'medium' | 'premium';

// Shablon narxlari (so'mda) — yagona manba
export const TEMPLATE_PRICES: Record<TemplateId, number> = {
  standard: 110000,
  medium: 170000,
  premium: 200000,
};

export interface IInvitation extends Document {
  slug: string;
  templateId: TemplateId;

  husband: string;
  wife: string;
  date: string; // "02.04.2026"

  venueName: string;
  address: string;
  mapLink: string;

  inviteText: string;
  footerWish?: string;

  photos: string[]; // 0..3 ta rasm yo'li (/uploads/..)

  isPaid: boolean;
  price: number; // shablon narxi
  amountPaid: number; // jami to'langan summa (qisman to'lovlar yig'indisi)

  telegramUserId: number;
  telegramUsername?: string;
}

const invitationSchema = new Schema<IInvitation>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    templateId: {
      type: String,
      enum: ['standard', 'medium', 'premium'],
      default: 'medium',
    },

    husband: { type: String, required: true },
    wife: { type: String, required: true },
    date: { type: String, required: true },

    venueName: { type: String, default: '' },
    address: { type: String, default: '' },
    mapLink: { type: String, default: '' },

    inviteText: { type: String, default: '' },
    footerWish: { type: String, default: '' },

    photos: {
      type: [String],
      default: [],
      validate: [(arr: string[]) => arr.length <= 3, 'Ko\'pi bilan 3 ta rasm'],
    },

    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: TEMPLATE_PRICES.medium },
    amountPaid: { type: Number, default: 0 },

    telegramUserId: { type: Number, required: true, index: true },
    telegramUsername: { type: String, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Invitation = model<IInvitation>('Invitation', invitationSchema);
