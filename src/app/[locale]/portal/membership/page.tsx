'use client';

import { useLocale } from 'next-intl';
import { useCurrentSubscription, useSubscriptionHistory } from '@/lib/portal-api';
import { Card } from '@/components/ui/field';
import { SubscriptionStatusPill } from '@/components/ui/status-pill';
import { PanelSkeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function MembershipPage() {
  const locale = useLocale();
  const { data: sub, isLoading } = useCurrentSubscription();
  const { data: history = [] } = useSubscriptionHistory();
  const name = (s: { planNameAr: string; planNameEn: string }) =>
    locale === 'ar' ? s.planNameAr : s.planNameEn;

  return (
    <div>
      <h1 className="display-hero text-3xl">My membership</h1>

      {isLoading ? (
        <PanelSkeleton />
      ) : sub ? (
        <Card className="mt-6 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-2xl font-bold uppercase">{name(sub)}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(sub.finalPrice, locale)}
              </p>
            </div>
            <SubscriptionStatusPill status={sub.effectiveStatus} />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Row label="Start" value={sub.startDate ? formatDate(sub.startDate, locale) : '—'} />
            <Row label="End" value={sub.endDate ? formatDate(sub.endDate, locale) : '—'} />
            <Row label="Days left" value={String(Math.max(0, sub.daysRemaining))} />
            <Row label="Paid" value={formatCurrency(sub.paidAmount, locale)} />
            <Row label="Remaining" value={formatCurrency(sub.remainingAmount, locale)} />
            <Row
              label="Freeze days"
              value={`${sub.freezeDaysUsed} / ${sub.planFreezeDays}`}
            />
            <Row
              label="Visits"
              value={sub.allowedVisits ? `${sub.visitsUsed} / ${sub.allowedVisits}` : String(sub.visitsUsed)}
            />
          </dl>
        </Card>
      ) : (
        <Card className="mt-6 p-6 text-center text-muted-foreground">No active membership.</Card>
      )}

      <h2 className="mt-10 font-display text-xl font-bold uppercase">History</h2>
      <div className="portal-stagger mt-4 space-y-2">
        {history.map((s) => (
          <Card key={s._id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{name(s)}</p>
              <p className="text-xs text-muted-foreground">
                {s.startDate ? formatDate(s.startDate, locale) : '—'} —{' '}
                {s.endDate ? formatDate(s.endDate, locale) : '—'}
              </p>
            </div>
            <div className="text-end">
              <SubscriptionStatusPill status={s.effectiveStatus ?? s.status} />
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCurrency(s.finalPrice, locale)}
              </p>
            </div>
          </Card>
        ))}
        {history.length === 0 && (
          <p className="text-sm text-muted-foreground">No history yet.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
