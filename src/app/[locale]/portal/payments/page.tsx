'use client';

import { useLocale, useTranslations } from 'next-intl';
import { XCircle, Ban } from 'lucide-react';
import { useMyPayments } from '@/lib/portal-api';
import { Card } from '@/components/ui/field';
import { PaymentStatusPill } from '@/components/ui/status-pill';
import { ListSkeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PortalPaymentsPage() {
  const locale = useLocale();
  const ar = locale === 'ar';
  const t = useTranslations('portal.payments');
  const { data = [], isLoading } = useMyPayments();

  return (
    <div>
      <h1 className="display-hero text-3xl">{t('title')}</h1>

      {isLoading ? (
        <ListSkeleton />
      ) : data.length === 0 ? (
        <Card className="mt-6 p-6 text-center text-muted-foreground">{t('none')}</Card>
      ) : (
        <div className="portal-stagger mt-6 space-y-2">
          {data.map((p) => {
            const planName =
              typeof p.subscription === 'object'
                ? ar
                  ? p.subscription.planNameAr
                  : p.subscription.planNameEn
                : '—';
            const rejected = p.status === 'REJECTED';
            const cancelled = p.status === 'CANCELLED';

            return (
              <Card key={p._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{planName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.createdAt, locale)} · {p.paymentMethodLabel}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="font-display font-bold">{formatCurrency(p.amount, locale)}</p>
                    <PaymentStatusPill status={p.status} />
                  </div>
                </div>

                {(rejected || cancelled) && (
                  <div className="mt-3 rounded-md border border-danger/40 bg-danger/10 p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-danger">
                      {rejected ? <XCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      {rejected ? t('rejected') : t('cancelled')}
                    </p>
                    {p.rejectionReason && (
                      <p className="mt-1.5 text-sm text-foreground">
                        <span className="text-muted-foreground">{t('reason')}</span>
                        {p.rejectionReason}
                      </p>
                    )}
                    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <dt>{t('amountSent')}</dt>
                        <dd dir="ltr">{formatCurrency(p.amount, locale)}</dd>
                      </div>
                      {p.expectedAmount > 0 && (
                        <div className="flex justify-between">
                          <dt>{t('amountDue')}</dt>
                          <dd dir="ltr">{formatCurrency(p.expectedAmount, locale)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt>{t('method')}</dt>
                        <dd>{p.paymentMethodLabel}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>{t('date')}</dt>
                        <dd dir="ltr">{formatDate(p.createdAt, locale)}</dd>
                      </div>
                    </dl>
                    {rejected && (
                      <p className="mt-2 text-xs text-muted-foreground">{t('resubmit')}</p>
                    )}
                  </div>
                )}

                {p.receiptNumber && !rejected && !cancelled && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t('receipt')}
                    {p.receiptNumber}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
