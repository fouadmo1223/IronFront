'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import type { PlanView } from '@/lib/portal-api';

export function PlanCard({
  plan,
  onSelect,
  ctaLabel,
  selected,
}: {
  plan: PlanView;
  onSelect?: (plan: PlanView) => void;
  ctaLabel?: string;
  selected?: boolean;
}) {
  const t = useTranslations('plans');
  const locale = useLocale();
  const name = locale === 'ar' ? plan.nameAr : plan.nameEn;
  const features = locale === 'ar' ? plan.featuresAr : plan.featuresEn;

  return (
    <Card
      className={cn(
        'card-hover group/plan flex flex-col p-6',
        plan.isFeatured && 'border-accent',
        selected && 'ring-2 ring-accent',
      )}
    >
      {plan.isFeatured && (
        <span className="mb-3 inline-flex w-fit rounded bg-accent px-2 py-0.5 text-xs font-bold uppercase text-accent-foreground">
          {t('featured')}
        </span>
      )}
      <h3 className="font-display text-2xl font-bold uppercase">{name}</h3>
      <p className="mt-2">
        <span className="inline-block font-display text-4xl font-bold text-accent transition-transform duration-300 group-hover/plan:scale-105">
          {formatCurrency(plan.price, locale)}
        </span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{t('durationDays', { days: plan.durationDays })}</p>

      <ul className="mt-5 flex-1 space-y-2 text-sm">
        <li className="flex gap-2 text-muted-foreground">
          <Check className="h-4 w-4 shrink-0 text-accent" />
          {plan.allowedVisits ? t('visits', { count: plan.allowedVisits }) : t('unlimitedVisits')}
        </li>
        {plan.freezeDays > 0 && (
          <li className="flex gap-2 text-muted-foreground">
            <Check className="h-4 w-4 shrink-0 text-accent" />
            {t('freezeDays', { days: plan.freezeDays })}
          </li>
        )}
        {features.map((f, i) => (
          <li key={i} className="flex gap-2 text-muted-foreground">
            <Check className="h-4 w-4 shrink-0 text-accent" />
            {f}
          </li>
        ))}
      </ul>

      {onSelect && (
        <Button className="mt-6 w-full" onClick={() => onSelect(plan)} variant={selected ? 'primary' : 'outline'}>
          {ctaLabel ?? t('select')}
        </Button>
      )}
    </Card>
  );
}
