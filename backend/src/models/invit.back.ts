import { Schema, model, Document } from 'mongoose';

export interface IInvitation extends Document {
  slug: string;
  templateId: string;
  husband: string;
  wife: string;
  date: string;
  address: string;
  inviteText: string;
  isPaid: boolean;
  price: number;
}

const invitationSchema = new Schema<IInvitation>({
  slug: { type: String, required: true, unique: true },
  templateId: { type: String, default: 'medium' },
  husband: { type: String, required: true },
  wife: { type: String, required: true },
  date: { type: String, required: true },
  address: { type: String, required: true },
  inviteText: { type: String, required: true },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 50000 }
}, { 
  timestamps: true,
  versionKey: false // __v fieldini o'chirib turadi
});

export const Invitation = model<IInvitation>('Invitation', invitationSchema);