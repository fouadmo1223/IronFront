'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ensureGsap, prefersReducedMotion, EASE, isRTL } from '@/lib/gsap';
import { useSectionData, useSectionEnabled, pick } from '@/lib/cms';
import { Button } from '@/components/ui/button';
import { AnimatedHeading } from '@/components/motion/animated-heading';
import { Magnetic } from '@/components/motion/magnetic';

export function Hero() {
  const t = useTranslations('home.hero');
  const ar = useLocale() === 'ar';
  const enabled = useSectionEnabled('home', 'HERO');
  const cms = useSectionData('home', 'HERO');
  const title = pick(ar ? (cms.titleAr as string) : (cms.titleEn as string), t('title'));
  const subtitle = pick(
    ar ? (cms.subtitleAr as string) : (cms.subtitleEn as string),
    t('subtitle'),
  );
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const { gsap } = ensureGsap();
      const el = scope.current;
      if (!el) return;
      const fades = el.querySelectorAll<HTMLElement>('[data-hero-fade]');
      const reduced = prefersReducedMotion();

      // Entrance — plays on mount (always above the fold). Nodes are pre-hidden
      // in CSS; set → to so nothing flashes.
      gsap.set(fades, { autoAlpha: 0, y: reduced ? 0 : 28 });
      gsap.to(fades, {
        autoAlpha: 1,
        y: 0,
        duration: reduced ? 0.4 : 1,
        ease: EASE.out,
        stagger: reduced ? 0.05 : 0.14,
        delay: 0.15,
      });

      // Safety net if the tween never runs.
      const failsafe = window.setTimeout(() => {
        fades.forEach((n) => {
          if (getComputedStyle(n).opacity === '0') gsap.set(n, { autoAlpha: 1, y: 0 });
        });
      }, 2400);

      if (reduced) return () => window.clearTimeout(failsafe);

      // Scrubbed parallax on the copy + the grid layer.
      gsap.to('[data-hero-inner]', {
        yPercent: -14,
        ease: EASE.none,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('[data-hero-grid]', {
        yPercent: 12,
        ease: EASE.none,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });

      // Accent glow eases toward the cursor; rests toward the top corner.
      const glow = el.querySelector<HTMLElement>('[data-hero-glow]');
      if (!glow) return () => window.clearTimeout(failsafe);

      const rest = () => {
        const r = el.getBoundingClientRect();
        return { x: r.width * (isRTL() ? 0.24 : 0.78), y: r.height * 0.2 };
      };
      gsap.set(glow, { xPercent: -50, yPercent: -50, ...rest() });
      const xTo = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power2.out' });
      const yTo = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power2.out' });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo(e.clientX - r.left);
        yTo(e.clientY - r.top);
      };
      const onLeave = () => {
        const p = rest();
        xTo(p.x);
        yTo(p.y);
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        window.clearTimeout(failsafe);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope },
  );

  if (!enabled) return null;

  return (
    <section
      ref={scope}
      className="relative flex min-h-[100svh] items-center overflow-hidden border-b border-border/70"
    >
      <div
        data-hero-glow
        className="pointer-events-none absolute left-0 top-0 h-[52vh] w-[52vh] rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.3),transparent_70%)] blur-2xl will-change-transform"
      />
      <div
        data-hero-grid
        className="pointer-events-none absolute inset-0 -top-[12%] h-[124%] opacity-[0.05] [background-image:linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] [background-size:64px_64px] will-change-transform"
      />

      <div data-hero-inner className="container relative pt-28">
        <p
          data-hero-fade
          className="text-xs font-semibold uppercase tracking-editorial text-muted-foreground"
        >
          {t('eyebrow')}
        </p>
        <AnimatedHeading
          as="h1"
          text={title}
          className="display-hero mt-6 max-w-[16ch] text-[13vw] leading-[1.06] sm:text-7xl sm:leading-[1.05] lg:text-8xl lg:leading-[132px]"
          delay={0.3}
          onScroll={false}
        />
        <p data-hero-fade className="mt-7 max-w-lg text-lg text-muted-foreground">
          {subtitle}
        </p>
        <div data-hero-fade className="mt-10 flex flex-wrap gap-4">
          <Magnetic>
            <Link href="/plans">
              <Button size="lg">{t('primaryCta')}</Button>
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/facilities">
              <Button size="lg" variant="outline">
                {t('secondaryCta')}
              </Button>
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
