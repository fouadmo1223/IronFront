'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { refreshScrollTriggerWhenReady } from '@/lib/gsap';
import { AnimatedHeading } from '@/components/motion/animated-heading';
import { Reveal, StaggerGroup } from '@/components/motion/reveal';
import { CountUp } from '@/components/motion/count-up';
import { GalleryStrip } from '@/components/motion/gallery-strip';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { SectionIndex } from '@/components/home/section-index';
import { MarketingCta } from '@/components/pages/marketing-cta';
import { GYM_GALLERY } from '@/lib/images';

const GALLERY = GYM_GALLERY;

export function FacilitiesExperience() {
  useEffect(() => refreshScrollTriggerWhenReady(), []);
  const t = useTranslations('facilitiesPage');
  const areas = t.raw('areas.items') as Array<{ title: string; body: string }>;
  const spec = t.raw('spec.items') as Array<{ value: number; suffix?: string; label: string }>;

  return (
    <>
      <ScrollProgress />

      <section className="border-b border-border/70">
        <div className="container pb-24 pt-36">
          <SectionIndex index={t('intro.index')} label={t('intro.kicker')} />
          <AnimatedHeading
            as="h1"
            text={t('intro.title')}
            className="display-hero mt-6 max-w-[18ch] text-5xl sm:text-6xl"
            onScroll={false}
          />
          <Reveal dir="up" delay={0.1}>
            <p className="mt-8 max-w-xl text-muted-foreground">{t('intro.body')}</p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border/70 bg-surface">
        <div className="container py-24">
          <SectionIndex index={t('areas.index')} label={t('areas.kicker')} />
          <AnimatedHeading text={t('areas.title')} className="display-hero mt-6 text-4xl sm:text-5xl" />
          <StaggerGroup
            className="mt-12 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3"
            amount={0.08}
          >
            {areas.map((a) => (
              <div
                key={a.title}
                data-stagger-item
                className="group bg-background p-7 transition-colors duration-300 hover:bg-surface-raised"
              >
                <h3 className="font-display text-lg font-semibold uppercase transition-colors group-hover:text-accent">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="border-b border-border/70 bg-accent text-accent-foreground">
        <div className="container py-16">
          <SectionIndex
            index={t('spec.index')}
            label={t('spec.kicker')}
            className="[&_span:first-child]:text-accent-foreground text-accent-foreground/70"
          />
          <StaggerGroup className="mt-8 grid grid-cols-2 gap-8 lg:grid-cols-4" amount={0.1}>
            {spec.map((s) => (
              <div key={s.label} data-stagger-item>
                <div className="font-display text-4xl font-bold sm:text-5xl">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-sm text-accent-foreground/80">{s.label}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="container py-24">
        <SectionIndex index={t('gallery.index')} label={t('gallery.kicker')} />
        <AnimatedHeading text={t('gallery.title')} className="display-hero mt-6 text-4xl sm:text-5xl" />
        <GalleryStrip className="mt-12" images={GALLERY.map((src) => ({ src }))} />
      </section>

      <MarketingCta ns="facilitiesPage.cta" />
    </>
  );
}
