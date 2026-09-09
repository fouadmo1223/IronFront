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
 * Safety net for a reveal that never played. Only rescues elements that are
 * already in / above the viewport — a below-the-fold target is meant to stay
 * hidden until it is scrolled to, and force-showing it would make it re-animate
 * (flash) when its ScrollTrigger later fires.
 */
export function armRevealFailsafe(
  nodes: ArrayLike<Element> | null | undefined,
): () => void {
  const list = nodes ? Array.from(nodes) : [];
  if (!list.length) return () => {};

  const show = (el: Element) => {
    const cs = getComputedStyle(el);
    if (cs.opacity !== '0' && cs.visibility !== 'hidden') return;
    gsap.set(el, { autoAlpha: 1, clearProps: 'transform,filter,clipPath' });
  };

  // Time-based net: rescue anything already in / above the viewport that the
  // scroll reveal never played (stale ScrollTrigger, throttled rAF, etc.).
  const rescue = () => {
    for (const el of list) {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.95) continue;
      show(el);
    }
  };
  const timers = [2400, 5000].map((ms) => window.setTimeout(rescue, ms));

  // Visibility-based net: if an element is actually scrolled into view and is
  // still hidden a beat later, the reveal is broken — just show it. This is the
  // guarantee that content is never permanently invisible.
  let io: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target;
          window.setTimeout(() => show(el), 900);
          io?.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
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
