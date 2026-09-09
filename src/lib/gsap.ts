'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

let registered = false;

/** Register GSAP plugins once, on the client only. */
export function ensureGsap() {
  if (typeof window !== 'undefined' && !registered) {
    gsap.registerPlugin(useGSAP, ScrollTrigger);
    gsap.defaults({ ease: 'power4.out' });
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  return { gsap, ScrollTrigger, useGSAP };
}

export { gsap, ScrollTrigger, useGSAP };

/* ------------------------------------------------------------------ *
 * Shared motion language — one place, used by every primitive.
 * Feel: bold & cinematic (longer eases, generous travel).
 * ------------------------------------------------------------------ */
export const EASE = {
  out: 'expo.out',
  soft: 'power3.out',
  inOut: 'power2.inOut',
  none: 'none',
} as const;

export const DUR = {
  fast: 0.6,
  base: 1,
  slow: 1.3,
} as const;

/** Where a section starts revealing relative to the viewport. */
export const START = 'top 82%';

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function isRTL() {
  return typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
}

/** True when the string contains Arabic-script characters (cursive joining must be preserved). */
export function hasArabic(text: string) {
  return /[؀-ۿݐ-ݿࢠ-ࣿ]/.test(text);
}

/**
 * The single safety net for a reveal that never played — used by both `Reveal`
 * and `StaggerGroup`. Two triggers:
 *
 *  - a time sweep at 2.4s / 5s for anything already in / above the viewport
 *    (stale ScrollTrigger, throttled rAF on load);
 *  - an IntersectionObserver for elements scrolled into view later and still
 *    hidden — the guarantee that content is never permanently invisible.
 *
 * The rescue animates to the resolved state (and `clearProps` afterwards), so it
 * also unwinds any `y` / `blur` / `clipPath` the never-run reveal left behind and
 * still reads as an intentional entrance rather than a pop. Every timer it
 * schedules is tracked and cleared on teardown.
 */
export function armRevealFailsafe(
  nodes: ArrayLike<Element> | null | undefined,
): () => void {
  const list = nodes ? Array.from(nodes) : [];
  if (!list.length) return () => {};

  const done = new WeakSet<Element>();
  const show = (el: Element) => {
    if (done.has(el)) return;
    const cs = getComputedStyle(el);
    if (cs.opacity !== '0' && cs.visibility !== 'hidden') return;
    done.add(el);
    // Make it visible synchronously — this survives a throttled/dead rAF ticker
    // (hidden tab, low-power) where a tween would never advance.
    gsap.set(el, { autoAlpha: 1, x: 0, y: 0, clearProps: 'transform,filter,clipPath' });
    // Cosmetic entrance only if the ticker is actually running. immediateRender:
    // false means a stalled ticker never re-applies the from-state, so the
    // element cannot get stuck hidden again.
    gsap.from(el, {
      autoAlpha: 0,
      y: 16,
      duration: 0.45,
      ease: 'power2.out',
      immediateRender: false,
    });
  };

  const timers: number[] = [];

  const rescue = () => {
    for (const el of list) {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.95) continue;
      show(el);
    }
  };
  timers.push(window.setTimeout(rescue, 2400), window.setTimeout(rescue, 5000));

  let io: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io?.unobserve(e.target);
          timers.push(window.setTimeout(() => show(e.target), 900));
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    list.forEach((el) => io?.observe(el));
  }

  return () => {
    timers.forEach(window.clearTimeout);
    io?.disconnect();
  };
}

/**
 * Recalculate every ScrollTrigger once the layout has really settled — after
 * mount, on window load, once webfonts resolve, and one delayed pass. Call once
 * from the top of each long page.
 */
export function refreshScrollTriggerWhenReady(): () => void {
  const run = () => ScrollTrigger.refresh();
  const timers = [180, 600, 1500].map((ms) => window.setTimeout(run, ms));
  window.addEventListener('load', run);
  if (typeof document !== 'undefined' && 'fonts' in document) {
    document.fonts.ready.then(run).catch(() => {});
  }
  return () => {
    timers.forEach(window.clearTimeout);
    window.removeEventListener('load', run);
  };
}
