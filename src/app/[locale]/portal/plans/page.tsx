'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { usePublicPlans } from '@/lib/portal-api';
import { PlanCard } from '@/components/plan-card';
import { CardGridSkeleton } from '@/components/ui/skeleton';

export default function PortalPlansPage() {
  const t = useTranslations('plans');
  const router = useRouter();
  const { data: plans = [], isLoading } = usePublicPlans();

  return (
    <div>
      <h1 className="display-hero text-3xl">{t('title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : (
        <div className="portal-stagger mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => (
            <PlanCard
              key={p._id}
              plan={p}
              onSelect={() => router.push(`/portal/subscribe?plan=${p._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
