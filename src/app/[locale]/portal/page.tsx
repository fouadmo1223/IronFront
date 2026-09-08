'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  Layers,
  Activity,
  CalendarClock,
  CalendarX,
  Footprints,
  Wallet,
  History,
  type LucideIcon,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/lib/auth';
import { useCurrentSubscription, useMyAttendance } from '@/lib/portal-api';
import { Card } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SubscriptionStatusPill } from '@/components/ui/status-pill';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export default function PortalOverviewPage() {
  const t = useTranslations('portal.overview');
  const locale = useLocale();
  const { user } = useAuth();
  const { data: sub, isLoading } = useCurrentSubscription();
  const { data: visits } = useMyAttendance();

  const planName = sub ? (locale === 'ar' ? sub.planNameAr : sub.planNameEn) : null;
  const lastVisit = visits?.[0]?.checkInAt;

  return (
    <div>
      <header className="border-b border-border/60 pb-6">
        <h1 className="display-hero text-3xl sm:text-4xl">
          {t('greeting', { name: user?.firstName ?? '' })}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('memberCode')}:{' '}
          <span className="font-medium text-foreground">{user?.memberCode ?? '—'}</span>
        </p>
      </header>

      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-6 w-32" />
            </Card>
          ))}
        </div>
      ) : sub ? (
        <div className="portal-stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric icon={Layers} label={t('currentPlan')} value={planName ?? '—'} />
          <Metric
            icon={Activity}
            label={t('status')}
            value={<SubscriptionStatusPill status={sub.effectiveStatus} />}
          />
          <Metric
            icon={CalendarClock}
            label={t('daysRemaining')}
            value={String(Math.max(0, sub.daysRemaining))}
          />
          <Metric
            icon={CalendarX}
            label={t('endDate')}
            value={sub.endDate ? formatDate(sub.endDate, locale) : '—'}
          />
          <Metric icon={Footprints} label={t('totalVisits')} value={String(sub.visitsUsed)} />
          <Metric
            icon={Wallet}
            label={t('outstanding')}
            value={formatCurrency(sub.remainingAmount, locale)}
            emphasis={sub.remainingAmount > 0}
          />
          {lastVisit && (
            <Metric
              icon={History}
              label={t('lastCheckIn')}
              value={formatDate(lastVisit, locale)}
            />
          )}
        </div>
      ) : (
        <Card className="mt-8 flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-muted-foreground">No active membership.</p>
          <Link href="/portal/subscribe">
            <Button>{t('renew')}</Button>
          </Link>
        </Card>
      )}

      {sub && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/portal/subscribe" className="sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              {t('renew')}
            </Button>
          </Link>
          <Link href="/portal/qr" className="sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              {t('showQr')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  emphasis,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <Card className="group relative overflow-hidden p-4 transition-colors hover:border-accent/40">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <div
        className={cn(
          'mt-2 font-display text-xl font-bold',
          emphasis && 'text-accent',
        )}
      >
        {value}
      </div>
    </Card>
  );
}
