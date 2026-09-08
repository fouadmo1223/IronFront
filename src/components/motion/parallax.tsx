'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, prefersReducedMotion, armRevealFailsafe, EASE } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/** Scrubbed vertical parallax. Never hides content — only offsets it. */
export function Parallax({
  children,
  strength = 90,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const { gsap } = ensureGsap();
      gsap.fromTo(
        ref.current,
        { yPercent: -strength / 12 },
        {
          yPercent: strength / 12,
          ease: EASE.none,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [strength] },
  );

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}

/**
 * Image that reveals with a cinematic clip-path wipe + slow scale-settle when
 * scrolled into view. Pre-hidden by the global `[data-animate]` rule.
 */
export function RevealImage({
  src,
  alt,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const { gsap } = ensureGsap();
      const wrap = ref.current;
      const img = imgRef.current;
      if (!wrap) return;

      if (prefersReducedMotion()) {
        gsap.set(wrap, { autoAlpha: 1, clipPath: 'inset(0 0 0 0)' });
        return;
      }

      gsap.set(wrap, { autoAlpha: 1, clipPath: 'inset(0 0 100% 0)' });
      if (img) gsap.set(img, { scale: 1.25 });

      const tl = gsap.timeline({
        defaults: { ease: EASE.out },
        scrollTrigger: { trigger: wrap, start: 'top 85%', once: true },
      });
      tl.to(wrap, { clipPath: 'inset(0 0 0% 0)', duration: 1.2 });
      if (img) tl.to(img, { scale: 1, duration: 1.6 }, 0);

      return armRevealFailsafe([wrap]);
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-animate className={cn('overflow-hidden', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        className={cn('h-full w-full object-cover will-change-transform', imgClassName)}
      />
    </div>
  );
}
