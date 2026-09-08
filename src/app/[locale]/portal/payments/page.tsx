'use client';

import { useLocale } from 'next-intl';
import { useMyPayments } from '@/lib/portal-api';
import { Card } from '@/components/ui/field';
import { PaymentStatusPill } from '@/components/ui/status-pill';
import { ListSkeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PortalPaymentsPage() {
  const locale = useLocale();
  const { data = [], isLoading } = useMyPayments();

  return (
    <div>
      <h1 className="display-hero text-3xl">Payments</h1>

      {isLoading ? (
        <ListSkeleton />
      ) : data.length === 0 ? (
        <Card className="mt-6 p-6 text-center text-muted-foreground">No payments yet.</Card>
      ) : (
        <div className="portal-stagger mt-6 space-y-2">
          {data.map((p) => (
            <Card key={p._id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    {typeof p.subscription === 'object'
                      ? locale === 'ar'
                        ? p.subscription.planNameAr
                        : p.subscription.planNameEn
                      : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.createdAt, locale)} · {p.paymentMethodLabel}
                  </p>
                </div>
                <div className="text-end">
                  <p className="font-display font-bold">{formatCurrency(p.amount, locale)}</p>
                  <PaymentStatusPill status={p.status} />
                </div>
              </div>
              {p.status === 'REJECTED' && p.rejectionReason && (
                <p className="mt-2 rounded-md bg-danger/10 px-2 py-1 text-xs text-danger">
                  {p.rejectionReason}
                </p>
              )}
              {p.receiptNumber && (
                <p className="mt-2 text-xs text-muted-foreground">Receipt: {p.receiptNumber}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
