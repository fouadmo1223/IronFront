'use client';

import { useRef, type ElementType } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, hasArabic, prefersReducedMotion, armRevealFailsafe, EASE } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * Editorial headline reveal — word by word (never per character: that breaks
 * Arabic cursive joining). Latin words rise out of a clipped baseline; Arabic
 * words rise + fade with no clip box. Words are pre-hidden by the global
 * `[data-split] [data-word] { opacity: 0 }` rule so nothing flashes.
 */
export function AnimatedHeading({
  as: Tag = 'h2',
  text,
  className,
  delay = 0,
  stagger = 0.08,
  onScroll = true,
}: {
  as?: ElementType;
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  onScroll?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const arabic = hasArabic(text);
  const words = text.split(/(\s+)/);

  useGSAP(
    () => {
      const { gsap } = ensureGsap();
      const units = ref.current?.querySelectorAll<HTMLElement>('[data-word]');
      if (!units || !units.length) return;

      if (prefersReducedMotion()) {
        gsap.set(units, { autoAlpha: 1, yPercent: 0, clearProps: 'transform' });
        return;
      }

      const trigger = onScroll
        ? { scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } }
        : {};

      if (arabic) {
        gsap.set(units, { yPercent: 60, autoAlpha: 0 });
        gsap.to(units, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1,
          ease: EASE.out,
          stagger: Math.max(stagger, 0.09),
          delay,
          ...trigger,
        });
      } else {
        gsap.set(units, { yPercent: 120, autoAlpha: 0 });
        gsap.to(units, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1.15,
          ease: EASE.out,
          stagger,
          delay,
          ...trigger,
        });
      }

      return armRevealFailsafe(units);
    },
    { scope: ref, dependencies: [text, delay, stagger, onScroll] },
  );

  return (
    <Tag ref={ref} data-split className={cn('block', className)} aria-label={text}>
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i} aria-hidden>
            {' '}
          </span>
        ) : arabic ? (
          <span key={i} className="inline-block" aria-hidden>
            <span data-word className="inline-block will-change-transform">
              {w}
            </span>
          </span>
        ) : (
          <span key={i} className="inline-block overflow-hidden pb-[0.14em] align-bottom" aria-hidden>
            <span data-word className="inline-block will-change-transform">
              {w}
            </span>
          </span>
        ),
      )}
    </Tag>
  );
}
