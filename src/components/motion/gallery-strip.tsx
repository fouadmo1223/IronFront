'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, prefersReducedMotion, armRevealFailsafe, EASE } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * A grid of images that clip-wipe in with a stagger, then drift at three
 * different speeds as the section scrolls past. Figures are pre-hidden by the
 * global `[data-animate]` rule.
 */
export function GalleryStrip({
  images,
  className,
}: {
  images: { src: string; alt?: string }[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const { gsap } = ensureGsap();
      const figs = gsap.utils.toArray<HTMLElement>('[data-fig]', ref.current);
      if (!figs.length) return;

      if (prefersReducedMotion()) {
        gsap.set(figs, { autoAlpha: 1, clipPath: 'inset(0 0 0 0)' });
        return;
      }

      gsap.set(figs, { autoAlpha: 1, clipPath: 'inset(0 0 100% 0)' });
      gsap.to(figs, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.1,
        ease: EASE.out,
        stagger: { each: 0.09, from: 'start' },
        scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
      });

      figs.forEach((fig, i) => {
        const depth = (i % 3) - 1;
        if (!depth) return;
        gsap.fromTo(
          fig,
          { yPercent: 7 * depth },
          {
            yPercent: -7 * depth,
            ease: EASE.none,
            scrollTrigger: {
              trigger: ref.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      });

      return armRevealFailsafe(figs);
    },
    { scope: ref, dependencies: [images.length] },
  );

  return (
    <div ref={ref} className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
      {images.map((im, i) => (
        <figure
          key={i}
          data-fig
          data-animate
          className={cn(
            'overflow-hidden rounded-lg border border-border will-change-transform',
            i % 3 === 1 ? 'aspect-[3/4]' : 'aspect-square',
            i % 4 === 0 && 'sm:mt-8',
            i % 4 === 3 && 'sm:mt-12',
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={im.src}
            alt={im.alt ?? ''}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </figure>
      ))}
    </div>
  );
}
