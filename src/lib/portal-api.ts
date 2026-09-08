import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from './api';

export interface SubscriptionView {
  _id: string;
  planNameAr: string;
  planNameEn: string;
  status: string;
  effectiveStatus: string;
  daysRemaining: number;
  startDate: string | null;
  endDate: string | null;
  basePrice: number;
  finalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  freezeDaysUsed: number;
  planFreezeDays: number;
  visitsUsed: number;
  allowedVisits: number;
}

export interface PlanView {
  _id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  durationDays: number;
  allowedVisits: number;
  freezeDays: number;
  featuresAr: string[];
  featuresEn: string[];
  isFeatured: boolean;
}

export interface PaymentView {
  _id: string;
  amount: number;
  expectedAmount: number;
  status: string;
  paymentMethodLabel: string;
  rejectionReason: string;
  receiptNumber: string;
  createdAt: string;
  subscription: { planNameEn: string; planNameAr: string } | string;
}

export interface AttendanceView {
  _id: string;
  checkInAt: string;
  branch?: { nameEn: string; nameAr: string } | null;
  accessStatus: string;
}

export interface NotificationView {
  _id: string;
  type: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaymentMethodView {
  _id: string;
  nameAr: string;
  nameEn: string;
  type: string;
  accountName: string;
  accountNumber: string;
  phoneNumber: string;
  iban: string;
  bankNameAr: string;
  bankNameEn: string;
  instructionsAr: string;
  instructionsEn: string;
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['portal', 'subscription', 'current'],
    queryFn: () => unwrap<SubscriptionView | null>(api.get('/subscriptions/me/current')),
  });
}

export function useSubscriptionHistory() {
  return useQuery({
    queryKey: ['portal', 'subscription', 'history'],
    queryFn: () => unwrap<SubscriptionView[]>(api.get('/subscriptions/me/history')),
  });
}

/** Shown when the API is unreachable so the marketing pages still render. */
export const FALLBACK_PLANS: PlanView[] = [
  {
    _id: 'fallback-monthly',
    nameEn: 'Monthly',
    nameAr: 'شهري',
    descriptionEn: '',
    descriptionAr: '',
    price: 800,
    durationDays: 30,
    allowedVisits: 0,
    freezeDays: 3,
    featuresEn: ['Full gym floor access', 'Locker room', '1 guest pass'],
    featuresAr: ['دخول كامل لصالة التدريب', 'غرفة الخزائن', 'دعوة ضيف واحدة'],
    isFeatured: false,
  },
  {
    _id: 'fallback-quarter',
    nameEn: '3 Months',
    nameAr: '٣ شهور',
    descriptionEn: '',
    descriptionAr: '',
    price: 2100,
    durationDays: 90,
    allowedVisits: 0,
    freezeDays: 10,
    featuresEn: ['Everything in Monthly', 'Free InBody scan', '3 guest passes', '1 PT session'],
    featuresAr: ['كل مزايا الشهري', 'قياس InBody مجاني', '٣ دعوات ضيوف', 'جلسة تدريب خاص'],
    isFeatured: true,
  },
  {
    _id: 'fallback-half',
    nameEn: '6 Months',
    nameAr: '٦ شهور',
    descriptionEn: '',
    descriptionAr: '',
    price: 3600,
    durationDays: 180,
    allowedVisits: 0,
    freezeDays: 21,
    featuresEn: ['Everything in 3 Months', 'Monthly InBody scan', 'Nutrition consult'],
    featuresAr: ['كل مزايا الـ٣ شهور', 'قياس InBody شهري', 'استشارة تغذية'],
    isFeatured: false,
  },
  {
    _id: 'fallback-annual',
    nameEn: 'Annual',
    nameAr: 'سنوي',
    descriptionEn: '',
    descriptionAr: '',
    price: 6000,
    durationDays: 365,
    allowedVisits: 0,
    freezeDays: 45,
    featuresEn: ['Everything in 6 Months', '4 PT sessions', 'Priority class booking'],
    featuresAr: ['كل مزايا الـ٦ شهور', '٤ جلسات تدريب خاص', 'أولوية حجز الحصص'],
    isFeatured: false,
  },
];

export function usePublicPlans() {
  return useQuery({
    queryKey: ['plans', 'public'],
    queryFn: async () => {
      try {
        const plans = await unwrap<PlanView[]>(api.get('/subscription-plans/public'));
        return plans.length ? plans : FALLBACK_PLANS;
      } catch {
        return FALLBACK_PLANS;
      }
    },
    placeholderData: FALLBACK_PLANS,
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: ['portal', 'payments'],
    queryFn: () => unwrap<PaymentView[]>(api.get('/payments/me')),
  });
}

export function useMyAttendance() {
  return useQuery({
    queryKey: ['portal', 'attendance'],
    queryFn: async () => {
      const r = await api.get('/attendance/me', { params: { limit: 50 } });
      return r.data.data as AttendanceView[];
    },
  });
}

export function useMyNotifications() {
  return useQuery({
    queryKey: ['portal', 'notifications'],
    queryFn: async () => {
      const r = await api.get('/notifications', { params: { limit: 50 } });
      return r.data.data as NotificationView[];
    },
  });
}

export function useMyQr() {
  return useQuery({
    queryKey: ['portal', 'qr'],
    queryFn: () =>
      unwrap<{
        qrDataUrl: string;
        token: string;
        isActive: boolean;
        cardCode: string | null;
      }>(api.get('/qr-access/me')),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods', 'active'],
    queryFn: () => unwrap<PaymentMethodView[]>(api.get('/payment-methods/active')),
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['portal', 'profile'],
    queryFn: () => unwrap<Record<string, unknown>>(api.get('/members/me')),
  });
}
