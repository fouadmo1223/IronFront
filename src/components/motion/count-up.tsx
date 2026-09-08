'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, prefersReducedMotion } from '@/lib/gsap';

/** Counts 0 → value when scrolled into view (GSAP-driven, eased). */
export function CountUp({
  value,
  prefix = '',
  suffix = '',
  duration = 1.8,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => `${prefix}${Math.round(n).toLocaleString('en-US')}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      el.textContent = fmt(value);
      if (prefersReducedMotion()) return;
      const { gsap } = ensureGsap();
      const obj = { n: 0 };
      gsap.to(obj, {
        n: value,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = fmt(obj.n);
        },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    },
    { scope: ref, dependencies: [value, prefix, suffix, duration] },
  );

  return (
    <span ref={ref} className={className}>
      {fmt(value)}
    </span>
  );
}
