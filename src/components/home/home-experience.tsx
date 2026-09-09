'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Dumbbell, HeartPulse, Sparkles, Waves, Quote } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ensureGsap, prefersReducedMotion, refreshScrollTriggerWhenReady, EASE } from '@/lib/gsap';
import { usePublicPlans } from '@/lib/portal-api';
import {
  useSiteContent,
  resolveSchedule,
  formatDayRange,
  useSectionData,
  useSectionEnabled,
  pick,
} from '@/lib/cms';
import { Button } from '@/components/ui/button';
import { AnimatedHeading } from '@/components/motion/animated-heading';
import { Reveal, StaggerGroup } from '@/components/motion/reveal';
import { Marquee } from '@/components/motion/marquee';
import { CountUp } from '@/components/motion/count-up';
import { Parallax, RevealImage } from '@/components/motion/parallax';
import { Magnetic } from '@/components/motion/magnetic';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { ScrubReveal } from '@/components/motion/scrub-reveal';
import { TiltCard } from '@/components/motion/tilt-card';
import { GalleryStrip } from '@/components/motion/gallery-strip';
import { Accordion, type QA } from '@/components/motion/accordion';
import { PlanCard } from '@/components/plan-card';
import { Hero } from './hero';
import { SectionIndex } from './section-index';

import { GYM_IMAGES, GYM_GALLERY } from '@/lib/images';

const IMG = {
  about: GYM_IMAGES.hero,
  trainer: GYM_IMAGES.athleteBack,
  gallery: GYM_GALLERY,
};

export function HomeExperience() {
  useEffect(() => refreshScrollTriggerWhenReady(), []);

  return (
    <>
      <ScrollProgress />
      <Hero />
      <DisciplinesMarquee />
      <Stats />
      <Manifesto />
      <About />
      <NumbersBand />
      <PlansTeaser />
      <Programs />
      <WhyUs />
      <GallerySection />
      <TrainingExperience />
      <Trainers />
      <Testimonials />
      <Faq />
      <CtaBand />
      <Location />
    </>
  );
}

/* ── Disciplines marquee ── */
function DisciplinesMarquee() {
  const t = useTranslations('home');
  const items = t.raw('marquee') as string[];
  return <Marquee items={items} className="bg-surface" />;
}

/* ── 01 · Stats ── */
function Stats() {
  const t = useTranslations('home.stats');
  const ar = useLocale() === 'ar';
  const enabled = useSectionEnabled('home', 'STATS');
  const cms = useSectionData('home', 'STATS');
  const cmsItems = Array.isArray(cms.items) ? (cms.items as Array<Record<string, string>>) : [];

  const fallback: Array<{ value: string; label: string }> = [
    { value: '1,200+', label: t('members') },
    { value: '18', label: t('trainers') },
    { value: '900', label: t('sqm') },
    { value: '119', label: t('hours') },
  ];
  // Index-based keys so the fallback → CMS swap reuses the same DOM nodes
  // rather than unmounting/remounting them.
  const rows = (
    cmsItems.length
      ? cmsItems.map((it) => ({
          value: it.valueEn || it.valueAr || '',
          label: ar ? it.labelAr || it.labelEn || '' : it.labelEn || it.labelAr || '',
        }))
      : fallback
  ).map((r, k) => ({ ...r, k: String(k) }));

  if (!enabled) return null;

  return (
    <section className="border-b border-border/70 bg-surface">
      <div className="container py-14">
        <SectionIndex index="01" />
        <StaggerGroup className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {rows.map((r) => (
            <div key={r.k} data-stagger-item>
              <div className="font-display text-5xl font-bold text-accent lg:text-6xl">
                {r.value}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
                {r.label}
              </div>
            </div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* ── 02 · Manifesto — scrubbed word brighten ── */
function Manifesto() {
  const t = useTranslations('home.manifesto');
  return (
    <section className="border-b border-border/70">
      <div className="container flex min-h-[70vh] flex-col justify-center py-24">
        <SectionIndex index="02" />
        <ScrubReveal
          as="h2"
          text={t('text')}
          className="mt-8 max-w-[24ch] text-4xl sm:text-6xl lg:text-7xl"
        />
      </div>
    </section>
  );
}

/* ── 03 · About ── */
function About() {
  const t = useTranslations('home.about');
  const ar = useLocale() === 'ar';
  const enabled = useSectionEnabled('home', 'ABOUT_PREVIEW');
  const c = useSectionData('home', 'ABOUT_PREVIEW');
  const kicker = pick(ar ? (c.kickerAr as string) : (c.kickerEn as string), t('kicker'));
  const title = pick(ar ? (c.titleAr as string) : (c.titleEn as string), t('title'));
  const body = pick(ar ? (c.bodyAr as string) : (c.bodyEn as string), t('body'));
  const img = pick(c.imageUrl as string, IMG.about);
  if (!enabled) return null;
  return (
    <section className="container grid gap-12 py-24 lg:grid-cols-2 lg:items-center lg:gap-20">
      <Parallax strength={70}>
        <RevealImage src={img} alt="" className="aspect-[4/5] rounded-lg border border-border" />
      </Parallax>
      <div>
        <SectionIndex index="03" label={kicker} />
        <AnimatedHeading text={title} className="display-hero mt-6 text-4xl sm:text-5xl" />
        <Reveal dir="up" delay={0.1}>
          <p className="mt-6 whitespace-pre-line text-muted-foreground">{body}</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
            {t('signature')}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 04 · Numbers band — big kinetic figures ── */
function NumbersBand() {
  const t = useTranslations('home.numbersBand');
  const items = t.raw('items') as Array<{
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
  }>;
  return (
    <section className="border-y border-border/70 bg-accent text-accent-foreground">
      <div className="container py-16">
        <SectionIndex index="04" className="text-accent-foreground/70 [&_span:first-child]:text-accent-foreground" />
        <StaggerGroup className="mt-8 grid gap-8 sm:grid-cols-3" amount={0.12}>
          {items.map((it) => (
            <div key={it.label} data-stagger-item>
              <div className="font-display text-4xl font-bold sm:text-5xl">
                <CountUp value={it.value} prefix={it.prefix} suffix={it.suffix} />
              </div>
              <p className="mt-2 text-sm text-accent-foreground/80">{it.label}</p>
            </div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* ── 05 · Plans teaser ── */
function PlansTeaser() {
  const t = useTranslations('home.plansTeaser');
  const ar = useLocale() === 'ar';
  const enabled = useSectionEnabled('home', 'MEMBERSHIP_PLANS');
  const c = useSectionData('home', 'MEMBERSHIP_PLANS');
  const heading = pick(ar ? (c.titleAr as string) : (c.titleEn as string), t('title'));
  const { data: plans = [] } = usePublicPlans();
  const shown = plans.slice(0, 3);

  // Plans arrive async; on slower (mobile) connections they land after the
  // reveal has been set up against an empty grid, leaving the cards hidden.
  // Recalculate triggers once the data is in.
  useEffect(() => {
    if (!shown.length) return;
    const { ScrollTrigger } = ensureGsap();
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => window.clearTimeout(id);
  }, [shown.length]);

  if (!enabled) return null;

  return (
    <section className="border-b border-border/70 bg-surface">
      <div className="container py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionIndex index="05" label={t('kicker')} />
            <AnimatedHeading
              text={heading}
              className="display-hero mt-6 max-w-[20ch] text-4xl sm:text-5xl"
            />
          </div>
          <ArrowLink href="/plans" label={t('viewAll')} />
        </div>
        <StaggerGroup className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3" amount={0.12}>
          {shown.map((p) => (
            <div
              key={p._id}
              data-stagger-item
              className="transition-transform duration-300 hover:-translate-y-1.5"
            >
              <PlanCard plan={p} />
            </div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* ── 06 · Programs — tilt cards ── */
function Programs() {
  const t = useTranslations('home.programs');
  const items = t.raw('items') as Array<{ title: string; body: string }>;
  const icons = [Dumbbell, HeartPulse, Sparkles, Waves];
  return (
    <section className="container py-24">
      <SectionIndex index="06" label={t('kicker')} />
      <AnimatedHeading text={t('title')} className="display-hero mt-6 text-4xl sm:text-5xl" />
      <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" amount={0.1}>
        {items.map((it, i) => {
          const Icon = icons[i] ?? Dumbbell;
          return (
            <div key={it.title} data-stagger-item>
              <TiltCard className="h-full rounded-lg border border-border bg-surface p-6">
                <Icon className="h-8 w-8 text-accent" />
                <h3 className="mt-5 font-display text-xl font-semibold uppercase">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
              </TiltCard>
            </div>
          );
        })}
      </StaggerGroup>
    </section>
  );
}

/* ── 07 · Why Iron Gym ── */
function WhyUs() {
  const t = useTranslations('home.why');
  const ar = useLocale() === 'ar';
  const enabled = useSectionEnabled('home', 'WHY_US');
  const c = useSectionData('home', 'WHY_US');
  const heading = pick(ar ? (c.titleAr as string) : (c.titleEn as string), t('title'));
  const keys = ['equipment', 'coaching', 'community', 'open'] as const;

  if (!enabled) return null;

  return (
    <section className="border-y border-border/70 bg-surface">
      <div className="container py-24">
        <SectionIndex index="07" label={heading} />
        <StaggerGroup className="mt-10" amount={0.06} start="top 78%">
          {keys.map((k, i) => (
            <div key={k} className="py-8">
              <div data-stagger-item className="mb-8 h-px w-full bg-border" />
              <div className="grid gap-4 md:grid-cols-[80px_1fr_1.2fr] md:items-baseline">
                <span
                  data-stagger-item
                  className="font-display text-3xl font-bold text-accent/70"
                >
                  0{i + 1}
                </span>
                <h3 data-stagger-item className="font-display text-2xl font-semibold uppercase">
                  {t(`items.${k}.title`)}
                </h3>
                <p data-stagger-item className="text-muted-foreground">
                  {t(`items.${k}.body`)}
                </p>
              </div>
            </div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* ── 08 · Gallery — staggered parallax images ── */
function GallerySection() {
  const t = useTranslations('home.gallery');
  return (
    <section className="container py-24">
      <SectionIndex index="08" label={t('kicker')} />
      <AnimatedHeading text={t('title')} className="display-hero mt-6 text-4xl sm:text-5xl" />
      <GalleryStrip className="mt-12" images={IMG.gallery.map((src) => ({ src }))} />
    </section>
  );
}

/* ── 09 · Training experience — scroll-snap carousel ── */
function TrainingExperience() {
  const t = useTranslations('home.experience');
  const ar = useLocale() === 'ar';
  const enabled = useSectionEnabled('home', 'TRAINING_EXPERIENCE');
  const c = useSectionData('home', 'TRAINING_EXPERIENCE');
  const kicker = pick(ar ? (c.kickerAr as string) : (c.kickerEn as string), t('kicker'));
  const title = pick(ar ? (c.titleAr as string) : (c.titleEn as string), t('title'));
  const steps = ['assess', 'program', 'train', 'progress'] as const;

  if (!enabled) return null;

  return (
    <section className="overflow-hidden border-b border-border/70 bg-surface py-16">
      <div className="container">
        <SectionIndex index="09" label={kicker} />
        <AnimatedHeading text={title} className="display-hero mt-6 text-4xl sm:text-5xl" />
        <StaggerGroup
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          amount={0.12}
          start="top 85%"
        >
          {steps.map((s, i) => (
            <article
              key={s}
              data-stagger-item
              className="card-hover group/step flex w-[80%] shrink-0 snap-start flex-col justify-between rounded-lg border border-border bg-background p-8 sm:w-[360px] md:h-[340px] md:w-[420px]"
            >
              <span className="font-display text-6xl font-bold text-accent/25 transition-colors duration-300 group-hover/step:text-accent/70">
                0{i + 1}
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold uppercase">
                  {t(`steps.${s}.title`)}
                </h3>
                <p className="mt-3 text-muted-foreground">{t(`steps.${s}.body`)}</p>
              </div>
            </article>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* ── 10 · Trainers ── */
function Trainers() {
  const t = useTranslations('home.trainers');
  const enabled = useSectionEnabled('home', 'TRAINERS');
  const people = t.raw('people') as Array<{ name: string; spec: string }>;
  if (!enabled) return null;
  return (
    <section className="container py-24">
      <SectionIndex index="10" label={t('kicker')} />
      <AnimatedHeading text={t('title')} className="display-hero mt-6 text-4xl sm:text-5xl" />
      <StaggerGroup
        className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
        amount={0.1}
      >
        {people.map((p) => (
          <figure
            key={p.name}
            data-stagger-item
            className="group relative overflow-hidden bg-background transition-shadow duration-300 hover:z-10 hover:shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.6)]"
          >
            <div className="aspect-[3/4] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMG.trainer}
                alt={p.name}
                className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-background via-background/80 to-transparent p-5 transition-transform duration-300 group-hover:translate-y-0">
              <p className="font-display text-lg font-semibold uppercase">{p.name}</p>
              <p className="text-xs font-semibold uppercase tracking-editorial text-accent">
                {p.spec}
              </p>
            </figcaption>
          </figure>
        ))}
      </StaggerGroup>
    </section>
  );
}

/* ── 11 · Testimonials ── */
function Testimonials() {
  const t = useTranslations('home.testimonials');
  const ar = useLocale() === 'ar';
  const enabled = useSectionEnabled('home', 'TESTIMONIALS');
  const c = useSectionData('home', 'TESTIMONIALS');
  const cmsItems = Array.isArray(c.items) ? (c.items as Array<Record<string, string>>) : [];
  const items: Array<{ quote: string; name: string }> = cmsItems.length
    ? cmsItems.map((it) => ({
        quote: ar ? it.quoteAr || it.quoteEn || '' : it.quoteEn || it.quoteAr || '',
        name: it.nameEn || it.nameAr || '',
      }))
    : (t.raw('items') as Array<{ quote: string; name: string }>);
  const [i, setI] = useState(0);
  const quoteRef = useRef<HTMLQuoteElement>(null);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [items.length]);

  useGSAP(
    () => {
      const el = quoteRef.current;
      if (!el || prefersReducedMotion()) return;
      const { gsap } = ensureGsap();
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE.out },
      );
    },
    { dependencies: [i] },
  );

  if (!enabled) return null;

  return (
    <section className="border-y border-border/70 bg-surface">
      <div className="container py-24">
        <SectionIndex index="11" label={t('kicker')} />
        <div className="relative mt-10 min-h-[220px]">
          <Quote className="h-10 w-10 text-accent/40" />
          <blockquote ref={quoteRef} className="mt-4">
            <p className="font-display text-2xl font-medium leading-snug sm:text-4xl">
              {items[i].quote}
            </p>
            <footer className="mt-6 text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
              {items[i].name}
            </footer>
          </blockquote>
        </div>
        <div className="mt-8 flex gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Testimonial ${idx + 1}`}
              className={`h-1 rounded-full transition-all ${
                idx === i ? 'w-10 bg-accent' : 'w-4 bg-border hover:bg-muted-foreground'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 12 · FAQ ── full-bleed ── */
function Faq() {
  const t = useTranslations('home.faq');
  const ar = useLocale() === 'ar';
  const enabled = useSectionEnabled('home', 'FAQ');
  const c = useSectionData('home', 'FAQ');
  const title = pick(ar ? (c.titleAr as string) : (c.titleEn as string), t('title'));
  const cmsItems = Array.isArray(c.items) ? (c.items as Array<Record<string, string>>) : [];
  const items: QA[] = cmsItems.length
    ? cmsItems.map((it) => ({
        q: ar ? it.questionAr || it.questionEn || '' : it.questionEn || it.questionAr || '',
        a: ar ? it.answerAr || it.answerEn || '' : it.answerEn || it.answerAr || '',
      }))
    : (t.raw('items') as QA[]);
  if (!enabled) return null;
  return (
    <section className="border-y border-border/70 bg-surface">
      <div className="container py-24">
        <SectionIndex index="12" label={t('kicker')} />
        <AnimatedHeading text={title} className="display-hero mt-6 text-4xl sm:text-5xl" />
        <div className="mt-10">
          <Accordion items={items} />
        </div>
      </div>
    </section>
  );
}

/* ── 13 · CTA band ── */
function CtaBand() {
  const t = useTranslations('home.cta');
  const ar = useLocale() === 'ar';
  const enabled = useSectionEnabled('home', 'CTA');
  const cms = useSectionData('home', 'CTA');
  const title = pick(ar ? (cms.titleAr as string) : (cms.titleEn as string), t('title'));
  if (!enabled) return null;
  return (
    <section className="bg-accent text-accent-foreground">
      <div className="container flex flex-col items-start gap-8 py-24 lg:flex-row lg:items-center lg:justify-between">
        <AnimatedHeading
          text={title}
          className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tightest sm:text-6xl lg:max-w-[14ch]"
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

/* ── 14 · Location ── */
function Location() {
  const t = useTranslations('home.location');
  const tc = useTranslations('contactPage');
  const wd = useTranslations('weekdays');
  const ar = useLocale() === 'ar';
  const enabled = useSectionEnabled('home', 'LOCATION');
  const cms = useSectionData('home', 'LOCATION');
  const title = pick(ar ? (cms.titleAr as string) : (cms.titleEn as string), t('title'));
  const { data: site } = useSiteContent();
  const schedule = resolveSchedule(site?.hours as Record<string, unknown> | undefined);
  if (!enabled) return null;
  return (
    <section className="container grid gap-12 py-24 lg:grid-cols-2 lg:gap-16">
      <div>
        <SectionIndex index="14" label={t('kicker')} />
        <AnimatedHeading text={title} className="display-hero mt-6 text-4xl sm:text-5xl" />
        <Reveal dir="up" delay={0.1}>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {(['men', 'women'] as const).map((audience) => {
              const blocks = schedule.filter((b) => b.audience === audience);
              return (
                <dl key={audience} className="space-y-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-editorial text-accent">
                    {tc(audience)}
                  </p>
                  {blocks.length === 0 && (
                    <p className="text-muted-foreground">{tc('closed')}</p>
                  )}
                  {blocks.map((b, i) => (
                    <div
                      key={i}
                      className="flex justify-between gap-3 border-b border-border pb-3 last:border-0"
                    >
                      <dt className="text-muted-foreground">
                        {formatDayRange(b.days, (d) => wd(d))}
                      </dt>
                      <dd className="font-medium" dir="ltr">
                        {b.close ? `${b.open} — ${b.close}` : b.open}
                      </dd>
                    </div>
                  ))}
                </dl>
              );
            })}
          </div>
          <a
            href="https://maps.google.com/?q=Downtown+Cairo"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-editorial text-accent"
          >
            {t('directions')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </a>
        </Reveal>
      </div>
      <RevealImage
        src={GYM_IMAGES.dumbbells}
        alt=""
        className="min-h-[320px] rounded-lg border border-border"
      />
    </section>
  );
}

/* shared */
function ArrowLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-editorial text-accent"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
    </Link>
  );
}
