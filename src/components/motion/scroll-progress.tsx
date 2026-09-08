'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap } from '@/lib/gsap';

/** Slim accent bar tracking page scroll — GSAP ScrollTrigger, scrubbed. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = bar.current;
      if (!el) return;
      const { gsap } = ensureGsap();
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        },
      );
    },
    { scope: bar },
  );

  return (
    <div
      ref={bar}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-accent rtl:origin-right"
      aria-hidden
    />
  );
}
