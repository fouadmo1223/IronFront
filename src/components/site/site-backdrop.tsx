'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, prefersReducedMotion } from '@/lib/gsap';

/**
 * Fixed, non-interactive page backdrop shared by every route: a faint editorial
 * grid plus an accent glow that eases toward the cursor (GSAP `quickTo`).
 */
export function SiteBackdrop() {
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = glowRef.current;
      if (!el || prefersReducedMotion()) return;
      const { gsap } = ensureGsap();

      gsap.set(el, {
        xPercent: -50,
        yPercent: -50,
        x: window.innerWidth * 0.72,
        y: window.innerHeight * 0.28,
      });
      const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power2.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power2.out' });

      const onMove = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    { scope: glowRef },
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] [background-size:64px_64px]" />
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[44vh] w-[44vh] rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.16),transparent_70%)] blur-2xl will-change-transform"
      />
    </div>
  );
}
