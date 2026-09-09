'use client';

import { Children, useEffect, useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, prefersReducedMotion, armRevealFailsafe, EASE, DUR, START } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * Last line of defence, entirely outside GSAP. If a `[data-stagger-item]` is
 * scrolled into view and still visually hidden, show it. This survives the
 * `useGSAP` context being reverted (async data → key remount churn), which was
 * stripping the reveal and leaving items stuck at the CSS `opacity: 0`.
 */
function useHardRevealGuard(ref: React.RefObject<HTMLElement>, selector: string) {
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;

    const show = (el: Element, i = 0) => {
      const h = el as HTMLElement;
      const cs = getComputedStyle(h);
      if (cs.opacity !== '0' && cs.visibility !== 'hidden') return;
      // Animate the rescue so a GSAP miss still reads as an intentional reveal.
      h.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1)';
      h.style.transitionDelay = `${Math.min(i, 8) * 0.07}s`;
      h.style.transform = 'translateY(24px)';
      h.style.visibility = 'visible';
      requestAnimationFrame(() => {
        h.style.opacity = '1';
        h.style.transform = 'translateY(0)';
      });
      window.setTimeout(() => {
        h.style.transition = '';
        h.style.transitionDelay = '';
        h.style.transform = '';
      }, 1400);
    };
    const targets = () => {
      const marked = root.querySelectorAll(selector);
      return marked.length ? Array.from(marked) : Array.from(root.children);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).map((e) => e.target);
        if (!hit.length) return;
        const list = targets();
        window.setTimeout(() => hit.forEach((el) => show(el, list.indexOf(el))), 1100);
        hit.forEach((el) => io.unobserve(el));
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    targets().forEach((el) => io.observe(el));

    // Also a plain time sweep for anything already on screen at mount.
    const sweep = () => {
      const list = targets();
      list.forEach((el, i) => {
        if (el.getBoundingClientRect().top < window.innerHeight) show(el, i);
      });
    };
    const t = window.setTimeout(sweep, 3000);

    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  });
}

type Dir = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSET: Record<Dir, (d: number) => { x?: number; y?: number }> = {
  up: (d) => ({ y: d }),
  down: (d) => ({ y: -d }),
  left: (d) => ({ x: d }),
  right: (d) => ({ x: -d }),
  none: () => ({}),
};

/**
 * Cinematic single-element entrance. The node is pre-hidden by the global
 * `[data-animate] { opacity: 0 }` rule, then GSAP reveals it on scroll-in —
 * so there is never a flash of laid-out content, and `once` means it plays
 * exactly once. Reduced-motion just shows it.
 */
export function Reveal({
  children,
  className,
  dir = 'up',
  distance = 70,
  delay = 0,
  blur = false,
  clip = false,
  duration = DUR.base,
}: {
  children: ReactNode;
  className?: string;
  dir?: Dir;
  distance?: number;
  delay?: number;
  blur?: boolean;
  clip?: boolean;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const { gsap } = ensureGsap();
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1, clearProps: 'transform,filter,clipPath' });
        return;
      }

      gsap.set(el, {
        ...OFFSET[dir](distance),
        autoAlpha: 0,
        filter: blur ? 'blur(14px)' : 'none',
        clipPath: clip
          ? dir === 'left'
            ? 'inset(0 100% 0 0)'
            : dir === 'right'
              ? 'inset(0 0 0 100%)'
              : 'inset(0 0 100% 0)'
          : 'none',
      });

      gsap.to(el, {
        x: 0,
        y: 0,
        autoAlpha: 1,
        filter: 'blur(0px)',
        clipPath: 'inset(0 0 0 0)',
        duration,
        delay,
        ease: EASE.out,
        scrollTrigger: { trigger: el, start: START, once: true },
      });

      return armRevealFailsafe([el]);
    },
    { scope: ref, dependencies: [dir, distance, delay, blur, clip, duration] },
  );

  return (
    <div ref={ref} data-animate className={cn(className)}>
      {children}
    </div>
  );
}

/**
 * Staggered entrance for a group. Animates either children marked
 * `[data-stagger-item]` or, if none are marked, the direct element children.
 */
export function StaggerGroup({
  children,
  className,
  amount = 0.12,
  dir = 'up',
  distance = 60,
  start = START,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  dir?: Dir;
  distance?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Re-run the reveal when the child count changes (async data landing) instead
  // of forcing a remount via `key` from the caller — a remount reverts the
  // useGSAP context and can strip the reveal, leaving items stuck hidden.
  const count = Children.toArray(children).length;

  useGSAP(
    () => {
      const { gsap } = ensureGsap();
      const root = ref.current;
      if (!root) return;
      const marked = root.querySelectorAll('[data-stagger-item]');
      const items = marked.length ? marked : (root.children as unknown as NodeListOf<Element>);
      if (!items.length) return;

      if (prefersReducedMotion()) {
        gsap.set(items, { autoAlpha: 1, clearProps: 'transform' });
        return;
      }

      gsap.set(items, { ...OFFSET[dir](distance), autoAlpha: 0 });
      gsap.to(items, {
        x: 0,
        y: 0,
        autoAlpha: 1,
        duration: DUR.base,
        ease: EASE.out,
        stagger: amount,
        scrollTrigger: { trigger: root, start, once: true },
      });

      return armRevealFailsafe(items);
    },
    { scope: ref, dependencies: [amount, dir, distance, start, count] },
  );

  useHardRevealGuard(ref, '[data-stagger-item]');

  return (
    <div ref={ref} data-animate-group className={className}>
      {children}
    </div>
  );
}
