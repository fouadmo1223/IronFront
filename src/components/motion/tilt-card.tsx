'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, prefersReducedMotion } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/** Pointer-reactive 3D tilt with a moving sheen — GSAP `quickTo`, no rAF-hide risk. */
export function TiltCard({
  children,
  className,
  max = 10,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const { gsap } = ensureGsap();

      gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      const sx = sheen.current
        ? gsap.quickTo(sheen.current, 'xPercent', { duration: 0.5, ease: 'power3.out' })
        : null;

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        rx((0.5 - py) * max * 2);
        ry((px - 0.5) * max * 2);
        sx?.(px * 100 - 50);
      };
      const onLeave = () => {
        gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: ref, dependencies: [max] },
  );

  return (
    <div
      ref={ref}
      className={cn(
        'group/tilt relative overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-accent/60 hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.35),0_28px_60px_-28px_hsl(var(--accent)/0.4)]',
        className,
      )}
    >
      {children}
      <span
        ref={sheen}
        aria-hidden
        className="pointer-events-none absolute -top-1/2 left-1/2 h-[200%] w-24 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,hsl(var(--accent)/0.12),transparent)] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
      />
    </div>
  );
}
