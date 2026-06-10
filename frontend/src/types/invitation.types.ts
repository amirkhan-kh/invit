export interface InvitationData {
  id: string;
  slug: string; // URL uchun (ali-aziza)
  husband: string;
  wife: string;
  dateWedding: string;
  address: string;
  inviteText?: string;
  footerWish?: string;
  hwPhotos?: string[];
  weddingHallPhoto?: string[];
  templateId: 'standard' | 'medium' | 'premium'; // Faqat shu variantlar bo'lishi shart
}
export interface TemplateProps {
  data: InvitationData;
}