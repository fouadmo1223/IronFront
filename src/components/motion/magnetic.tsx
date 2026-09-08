'use client';

import { useRef, type ReactNode } from 'react';
import { ensureGsap, prefersReducedMotion } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/** Wraps an interactive element so it drifts toward the cursor on hover. */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    gsap.to(el, { x, y, duration: 0.5, ease: 'power3.out' });
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    const { gsap } = ensureGsap();
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn('inline-block will-change-transform', className)}
    >
      {children}
    </span>
  );
}
