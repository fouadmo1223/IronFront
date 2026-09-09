'use client';

import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useCmsReady, useSectionData, pick } from '@/lib/cms';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ensureGsap, prefersReducedMotion, refreshScrollTriggerWhenReady } from '@/lib/gsap';
import { AnimatedHeading } from '@/components/motion/animated-heading';
import { Reveal, StaggerGroup } from '@/components/motion/reveal';
import { CountUp } from '@/components/motion/count-up';
import { Parallax, RevealImage } from '@/components/motion/parallax';
import { ScrubReveal } from '@/components/motion/scrub-reveal';
import { TiltCard } from '@/components/motion/tilt-card';
import { Magnetic } from '@/components/motion/magnetic';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { SectionIndex } from '@/components/home/section-index';

import { GYM_IMAGES } from '@/lib/images';

const IMG = {
  portrait: GYM_IMAGES.athleteBack,
  ethos: GYM_IMAGES.barbell,
};

export function AboutExperience() {
  useEffect(() => refreshScrollTriggerWhenReady(), []);
  return (
    <>
      <ScrollProgress />
      <Intro />
      <Timeline />
      <Values />
      <Numbers />
      <Ethos />
      <Cta />
    </>
  );
}

/* ── 01 · Intro ── */
function Intro() {
  const t = useTranslations('aboutPage.intro');
  const ar = useLocale() === 'ar';
  const ready = useCmsReady('about');
  const c = useSectionData('about', 'RICH_TEXT');
  const kicker = pick(ar ? (c.kickerAr as string) : (c.kickerEn as string), t('kicker'));
  const title = pick(ar ? (c.titleAr as string) : (c.titleEn as string), t('title'));
  const body = pick(ar ? (c.bodyAr as string) : (c.bodyEn as string), t('body'));

  // Hold the section back until the CMS request settles, so the editor's copy
  // is what renders first — no flash of the i18n fallback then a swap.
  if (!ready) {
    return (
      <section className="border-b border-border/70">
        <div className="container pb-24 pt-36">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-12 w-3/4 max-w-xl animate-pulse rounded bg-muted" />
          <div className="mt-8 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-2/3 max-w-xl animate-pulse rounded bg-muted" />
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border/70">
      <div className="container grid gap-12 pb-24 pt-36 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <SectionIndex index={t('index')} label={kicker} />
          <AnimatedHeading
            as="h1"
            text={title}
            className="display-hero mt-6 text-5xl sm:text-6xl"
            onScroll={false}
          />
          <Reveal dir="up" delay={0.1}>
            <p className="mt-8 max-w-xl whitespace-pre-line text-muted-foreground">{body}</p>
          </Reveal>
        </div>
        <Parallax strength={60}>
          <RevealImage
            src={IMG.portrait}
            alt=""
            className="aspect-[4/5] rounded-lg border border-border"
          />
        </Parallax>
      </div>
    </section>
  );
}

/* ── 02 · Timeline — scrubbed progress line ── */
function Timeline() {
  const t = useTranslations('aboutPage.timeline');
  const items = t.raw('items') as Array<{ year: string; title: string; body: string }>;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const { gsap } = ensureGsap();
      const root = ref.current;
      if (!root) return;

      const milestones = root.querySelectorAll('[data-milestone]');
      gsap.set(milestones, { autoAlpha: 0, y: 48 });
      gsap.to(milestones, {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.14,
        scrollTrigger: { trigger: root.querySelector('[data-track]'), start: 'top 78%', once: true },
      });
      gsap.fromTo(
        root.querySelector('[data-line-fill]'),
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: 'top center',
          ease: 'none',
          scrollTrigger: {
            trigger: root.querySelector('[data-track]'),
            start: 'top 70%',
            end: 'bottom 70%',
            scrub: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [items.length] },
  );

  return (
    <section
      ref={ref}
      className="border-b border-border/70 bg-surface px-5 py-24 sm:px-10 lg:px-16"
    >
      <SectionIndex index={t('index')} label={t('kicker')} />
      <AnimatedHeading text={t('title')} className="display-hero mt-6 text-4xl sm:text-5xl lg:text-6xl" />
      <div data-track className="relative mt-16 ps-10">
        <span className="absolute inset-y-0 start-0 w-0.5 bg-border" />
        <span
          data-line-fill
          className="absolute inset-y-0 start-0 w-0.5 origin-top scale-y-0 bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.6)]"
        />
        <div className="space-y-16">
          {items.map((m) => (
            <div
              key={m.year}
              data-milestone
              data-animate
              className="group grid gap-2 md:grid-cols-[160px_1fr] md:items-start"
            >
              <span className="absolute -start-10 mt-2 h-3.5 w-3.5 -translate-x-[7px] rounded-full border-2 border-accent bg-background transition-transform duration-300 group-hover:scale-125 rtl:translate-x-[7px]" />
              <div className="font-display text-4xl font-bold text-accent sm:text-5xl">{m.year}</div>
              <div>
                <h3 className="font-display text-xl font-semibold uppercase sm:text-2xl">
                  {m.title}
                </h3>
                <p className="mt-2 max-w-2xl text-muted-foreground">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 03 · Values — tilt cards ── */
function Values() {
  const t = useTranslations('aboutPage.values');
  const items = t.raw('items') as Array<{ title: string; body: string }>;
  return (
    <section className="container py-24">
      <SectionIndex index={t('index')} label={t('kicker')} />
      <AnimatedHeading text={t('title')} className="display-hero mt-6 text-4xl sm:text-5xl" />
      <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2" amount={0.1}>
        {items.map((it, i) => (
          <div key={it.title} data-stagger-item>
            <TiltCard className="h-full rounded-lg border border-border bg-surface p-7" max={6}>
              <span className="font-display text-5xl font-bold text-accent/20">0{i + 1}</span>
              <h3 className="mt-4 font-display text-xl font-semibold uppercase">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
            </TiltCard>
          </div>
        ))}
      </StaggerGroup>
    </section>
  );
}

/* ── 04 · By the numbers ── */
function Numbers() {
  const t = useTranslations('aboutPage.numbers');
  const items = t.raw('items') as Array<{ value: number; suffix?: string; label: string }>;
  return (
    <section className="border-y border-border/70 bg-surface">
      <div className="container py-16">
        <SectionIndex index={t('index')} label={t('kicker')} />
        <StaggerGroup className="mt-8 grid grid-cols-2 gap-8 lg:grid-cols-4" amount={0.1}>
          {items.map((it) => (
            <div key={it.label} data-stagger-item>
              <div className="font-display text-4xl font-bold text-accent lg:text-5xl">
                <CountUp value={it.value} suffix={it.suffix} />
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
                {it.label}
              </p>
            </div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* ── 05 · Ethos — scrubbed quote over image ── */
function Ethos() {
  const t = useTranslations('aboutPage.ethos');
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const { gsap } = ensureGsap();
      gsap.fromTo(
        ref.current?.querySelector('[data-bg]') ?? null,
        { yPercent: -8, scale: 1.15 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div
        data-bg
        style={{
          background: `linear-gradient(hsl(var(--background)/0.4),hsl(var(--background))),url('${IMG.ethos}') center/cover`,
        }}
        className="absolute inset-0 -z-10 opacity-25"
      />
      <div className="container py-32">
        <SectionIndex index={t('index')} label={t('kicker')} />
        <ScrubReveal
          as="blockquote"
          text={t('quote')}
          className="mt-8 max-w-[26ch] text-3xl sm:text-5xl"
        />
        <p className="mt-8 text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
          {t('attribution')}
        </p>
      </div>
    </section>
  );
}

/* ── 06 · CTA ── */
function Cta() {
  const t = useTranslations('aboutPage.cta');
  return (
    <section className="bg-accent text-accent-foreground">
      <div className="container flex flex-col items-start gap-8 py-24 lg:flex-row lg:items-center lg:justify-between">
        <AnimatedHeading
          text={t('title')}
          className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tightest sm:text-6xl lg:max-w-[12ch]"
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
