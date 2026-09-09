'use client';

import {
  Children,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, prefersReducedMotion, armRevealFailsafe, EASE, DUR, START } from '@/lib/gsap';
import { cn } from '@/lib/utils';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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
  // Re-init signal: the child keys joined. When async data swaps OR re-keys the
  // items after mount (same count, new DOM nodes — e.g. Stats going from i18n
  // fallback to CMS rows), this changes and the effect re-hides + re-arms the
  // fresh nodes. A plain effect (not useGSAP) is used deliberately — useGSAP's
  // context revert was leaving those new nodes without `gsap.set`, stuck at the
  // CSS `opacity: 0`.
  const sig = Children.toArray(children)
    .map((c) => (typeof c === 'object' && c !== null && 'key' in c ? String(c.key) : ''))
    .join('|');

  useIsoLayoutEffect(() => {
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
    const tween = gsap.to(items, {
      x: 0,
      y: 0,
      autoAlpha: 1,
      duration: DUR.base,
      ease: EASE.out,
      stagger: amount,
      scrollTrigger: { trigger: root, start, once: true },
    });

    const disarm = armRevealFailsafe(items);

    return () => {
      disarm();
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(items, { clearProps: 'opacity,visibility,transform' });
    };
  }, [amount, dir, distance, start, sig]);

  return (
    <div ref={ref} data-animate-group className={className}>
      {children}
    </div>
  );
}
