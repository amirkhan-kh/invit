import { Schema, model, Document } from 'mongoose';

export type TemplateId = 'standard' | 'medium' | 'premium';

// Shablon narxlari (so'mda) — yagona manba
export const TEMPLATE_PRICES: Record<TemplateId, number> = {
  standard: 110000,
  medium: 150000,
  premium: 2000,
};

/** Karta o'tkazma to'lov holati */
export type PaymentStatus =
  | 'unpaid'
  | 'awaiting_transfer'
  | 'pending_review'
  | 'paid'
  | 'expired'
  | 'cancelled';

export type PaymentMethod = 'uzcard' | 'humo' | 'bankomat' | 'international' | '';

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

  photos: string[]; // 0..3 ta — /api/photo/<id>

  isPaid: boolean;
  price: number;
  amountPaid: number;

  // --- Karta o'tkazma to'lov (Verion-style) ---
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentAmount: number; // ushbu sessiya summasi (odatda price)
  paymentExpiresAt?: Date | null;
  paymentDeclaredAt?: Date | null;
  paymentConfirmedAt?: Date | null;
  paymentConfirmedBy?: string;
  paymentNote?: string;

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
      validate: [(arr: string[]) => arr.length <= 3, "Ko'pi bilan 3 ta rasm"],
    },

    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: TEMPLATE_PRICES.medium },
    amountPaid: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'awaiting_transfer', 'pending_review', 'paid', 'expired', 'cancelled'],
      default: 'unpaid',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['uzcard', 'humo', 'bankomat', 'international', ''],
      default: '',
    },
    paymentAmount: { type: Number, default: 0 },
    paymentExpiresAt: { type: Date, default: null },
    paymentDeclaredAt: { type: Date, default: null },
    paymentConfirmedAt: { type: Date, default: null },
    paymentConfirmedBy: { type: String, default: '' },
    paymentNote: { type: String, default: '' },

    telegramUserId: { type: Number, required: true, index: true },
    telegramUsername: { type: String, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Invitation = model<IInvitation>('Invitation', invitationSchema);
