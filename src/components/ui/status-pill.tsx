import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const TONE: Record<string, string> = {
  ACTIVE: 'bg-success/15 text-success',
  EXPIRING_SOON: 'bg-warning/15 text-warning',
  EXPIRED: 'bg-danger/15 text-danger',
  FROZEN: 'bg-sky-500/15 text-sky-400',
  CANCELLED: 'bg-muted text-muted-foreground',
  PENDING_PAYMENT: 'bg-warning/15 text-warning',
  PAYMENT_UNDER_REVIEW: 'bg-sky-500/15 text-sky-400',
  APPROVED: 'bg-success/15 text-success',
  UNDER_REVIEW: 'bg-sky-500/15 text-sky-400',
  REJECTED: 'bg-danger/15 text-danger',
  FAKE: 'bg-danger/15 text-danger',
  REFUNDED: 'bg-muted text-muted-foreground',
  REFUND_REQUESTED: 'bg-warning/15 text-warning',
  PENDING: 'bg-warning/15 text-warning',
};

function Pill({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide',
        TONE[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {label}
    </span>
  );
}

export function SubscriptionStatusPill({ status }: { status: string }) {
  const t = useTranslations('subscriptionStatus');
  const label = t.has(status) ? t(status) : status.replaceAll('_', ' ');
  return <Pill status={status} label={label} />;
}

export function PaymentStatusPill({ status }: { status: string }) {
  const t = useTranslations('paymentStatus');
  const label = t.has(status) ? t(status) : status.replaceAll('_', ' ');
  return <Pill status={status} label={label} />;
}
