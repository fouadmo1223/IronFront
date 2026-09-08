'use client';

import { useRef, type ElementType, type Ref } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, hasArabic, prefersReducedMotion, armRevealFailsafe, EASE } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * A long statement whose words write on — dim → bright — tied to scroll
 * position across the section (scrubbed). Words are pre-hidden by the global
 * `[data-split] [data-word]` rule. Reduced-motion shows it whole.
 */
export function ScrubReveal({
  text,
  className,
  as: Tag = 'p',
}: {
  text: string;
  className?: string;
  as?: ElementType;
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

      gsap.set(units, { autoAlpha: 0.12, yPercent: arabic ? 30 : 60 });
      gsap.to(units, {
        autoAlpha: 1,
        yPercent: 0,
        ease: EASE.none,
        stagger: 0.4,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 78%',
          end: 'bottom 60%',
          scrub: 0.6,
        },
      });

      return armRevealFailsafe(units);
    },
    { scope: ref, dependencies: [text] },
  );

  return (
    <Tag
      ref={ref as Ref<HTMLQuoteElement>}
      data-split
      className={cn(
        'font-display font-semibold uppercase',
        arabic ? 'leading-[1.4]' : 'leading-[1.08]',
        className,
      )}
    >
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i}> </span>
        ) : (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <span data-word className="inline-block will-change-transform">
              {w}
            </span>
          </span>
        ),
      )}
    </Tag>
  );
}
