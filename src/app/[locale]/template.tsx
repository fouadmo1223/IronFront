'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, prefersReducedMotion, EASE } from '@/lib/gsap';

/** Re-mounts on every route change — GSAP gives each page a soft cinematic entrance. */
export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const { gsap } = ensureGsap();
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE.out },
      );
      const fs = window.setTimeout(() => {
        if (getComputedStyle(el).opacity === '0') gsap.set(el, { autoAlpha: 1, y: 0 });
      }, 1800);
      return () => window.clearTimeout(fs);
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="page-enter" style={{ opacity: 0 }}>
      <noscript>
        <style>{`.page-enter{opacity:1!important}`}</style>
      </noscript>
      {children}
    </div>
  );
}
