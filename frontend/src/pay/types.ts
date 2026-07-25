export type PayMethodId = 'uzcard' | 'humo' | 'bankomat' | 'international';

export interface PayMethod {
  id: string;
  label: string;
  subtitle: string;
  enabled: boolean;
  soon?: boolean;
}

export interface PaySession {
  invitationId: string;
  slug: string;
  templateId: string;
  templateLabel: string;
  husband: string;
  wife: string;
  productKind: string;
  productTitle: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  paymentStatus: string;
  paymentMethod: string;
  expiresAt: string | null;
  remainingSeconds: number;
  methods: PayMethod[];
  card: null | {
    method: string;
    label: string;
    number: string;
    numberDisplay: string;
    holder: string;
  };
  rules: string[];
  invitationUrl: string | null;
  payUrl: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: { id: number; username?: string; first_name?: string };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          enable: () => void;
          disable: () => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
        themeParams?: Record<string, string>;
        colorScheme?: 'light' | 'dark';
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        openTelegramLink?: (url: string) => void;
        openLink?: (url: string) => void;
      };
    };
  }
}
