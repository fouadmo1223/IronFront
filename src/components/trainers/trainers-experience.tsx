'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { refreshScrollTriggerWhenReady } from '@/lib/gsap';
import { AnimatedHeading } from '@/components/motion/animated-heading';
import { Reveal, StaggerGroup } from '@/components/motion/reveal';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { SectionIndex } from '@/components/home/section-index';
import { MarketingCta } from '@/components/pages/marketing-cta';

import { GYM_IMAGES } from '@/lib/images';

const PORTRAIT = GYM_IMAGES.athleteBack;

export function TrainersExperience() {
  useEffect(() => refreshScrollTriggerWhenReady(), []);
  const t = useTranslations('trainersPage');
  const people = t.raw('roster.people') as Array<{ name: string; spec: string; bio: string }>;
  const steps = t.raw('method.steps') as Array<{ title: string; body: string }>;

  return (
    <>
      <ScrollProgress />

      <section className="border-b border-border/70">
        <div className="container pb-24 pt-36">
          <SectionIndex index={t('intro.index')} label={t('intro.kicker')} />
          <AnimatedHeading
            as="h1"
            text={t('intro.title')}
            className="display-hero mt-6 max-w-[16ch] text-5xl sm:text-6xl"
            onScroll={false}
          />
          <Reveal dir="up" delay={0.1}>
            <p className="mt-8 max-w-xl text-muted-foreground">{t('intro.body')}</p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border/70 bg-surface">
        <div className="container py-24">
          <SectionIndex index={t('roster.index')} label={t('roster.kicker')} />
          <AnimatedHeading text={t('roster.title')} className="display-hero mt-6 text-4xl sm:text-5xl" />
          <StaggerGroup
            className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-px sm:border sm:border-border sm:bg-border lg:grid-cols-3"
            amount={0.09}
          >
            {people.map((p) => (
              <figure
                key={p.name}
                data-stagger-item
                className="group relative bg-background transition-shadow duration-300 hover:z-10 hover:shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.6)]"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={PORTRAIT}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <figcaption className="p-5">
                  <p className="font-display text-lg font-semibold uppercase">{p.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-editorial text-accent">
                    {p.spec}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{p.bio}</p>
                </figcaption>
              </figure>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="container py-24">
        <SectionIndex index={t('method.index')} label={t('method.kicker')} />
        <AnimatedHeading text={t('method.title')} className="display-hero mt-6 text-4xl sm:text-5xl" />
        <StaggerGroup className="mt-12 grid gap-4 md:grid-cols-3" amount={0.12}>
          {steps.map((s, i) => (
            <div
              key={s.title}
              data-stagger-item
              className="card-hover rounded-lg border border-border bg-surface p-7"
            >
              <span className="font-display text-5xl font-bold text-accent/25">0{i + 1}</span>
              <h3 className="mt-4 font-display text-xl font-semibold uppercase">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </StaggerGroup>
      </section>

      <MarketingCta ns="trainersPage.cta" />
    </>
  );
}
