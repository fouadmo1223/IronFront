'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { AnimatedHeading } from '@/components/motion/animated-heading';
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/motion/magnetic';

/** Shared accent CTA band. `ns` is a translations namespace with title/body/button. */
export function MarketingCta({ ns }: { ns: string }) {
  const t = useTranslations(ns);
  return (
    <section className="bg-accent text-accent-foreground">
      <div className="container flex flex-col items-start gap-8 py-24 lg:flex-row lg:items-center lg:justify-between">
        <AnimatedHeading
          text={t('title')}
          className="font-display text-4xl font-bold uppercase leading-[0.98] tracking-tightest sm:text-6xl lg:max-w-[14ch]"
        />
        <div>
          <Reveal dir="up">
            <p className="mb-6 max-w-sm text-accent-foreground/80">{t('body')}</p>
          </Reveal>
          <Magnetic>
            <Link href="/register">
              <button className="inline-flex h-14 items-center gap-2 bg-background px-8 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-background/90">
                {t('button')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
