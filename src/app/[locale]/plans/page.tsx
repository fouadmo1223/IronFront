'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { usePublicPlans } from '@/lib/portal-api';
import { useAuth } from '@/lib/auth';
import { PlanCard } from '@/components/plan-card';
import { AnimatedHeading } from '@/components/motion/animated-heading';
import { Reveal, StaggerGroup } from '@/components/motion/reveal';

export default function PublicPlansPage() {
  const t = useTranslations('plans');
  const router = useRouter();
  const { user } = useAuth();
  const { data: plans = [], isLoading } = usePublicPlans();

  return (
    <div className="container pb-24 pt-32">
      <Reveal dir="up">
        <p className="eyebrow">{t('title')}</p>
      </Reveal>
      <AnimatedHeading text={t('title')} className="display-hero mt-4 text-4xl sm:text-5xl" onScroll={false} />
      <Reveal dir="up" delay={0.1}>
        <p className="mt-4 max-w-xl text-muted-foreground">{t('subtitle')}</p>
      </Reveal>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">…</p>
      ) : (
        <StaggerGroup className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3" amount={0.12}>
          {plans.map((p) => (
            <div key={p._id} data-stagger-item>
              <PlanCard
                plan={p}
                onSelect={() =>
                  router.push(user ? `/portal/subscribe?plan=${p._id}` : '/register')
                }
                ctaLabel={user ? undefined : t('select')}
              />
            </div>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
