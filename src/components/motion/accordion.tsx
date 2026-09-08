'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Plus } from 'lucide-react';
import { ensureGsap, prefersReducedMotion, EASE } from '@/lib/gsap';
import { StaggerGroup } from './reveal';

export interface QA {
  q: string;
  a: string;
}

function Row({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const icon = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const p = panel.current;
      if (!p) return;
      const { gsap } = ensureGsap();
      const reduced = prefersReducedMotion();
      gsap.to(p, {
        height: isOpen ? 'auto' : 0,
        autoAlpha: isOpen ? 1 : 0,
        duration: reduced ? 0 : 0.42,
        ease: EASE.inOut,
      });
      if (icon.current) {
        gsap.to(icon.current, { rotate: isOpen ? 45 : 0, duration: reduced ? 0 : 0.3, ease: EASE.out });
      }
    },
    { dependencies: [isOpen] },
  );

  return (
    <div data-stagger-item>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-start"
        aria-expanded={isOpen}
      >
        <span className="font-display text-lg font-semibold uppercase">{q}</span>
        <span ref={icon} className="shrink-0 text-accent">
          <Plus className="h-5 w-5" />
        </span>
      </button>
      <div ref={panel} className="h-0 overflow-hidden opacity-0">
        <p className="pb-5 text-muted-foreground">{a}</p>
      </div>
    </div>
  );
}

/** Animated FAQ accordion — rows reveal on scroll, panels height-animate open (GSAP). */
export function Accordion({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <StaggerGroup className="divide-y divide-border border-y border-border" amount={0.08}>
      {items.map((it, i) => (
        <Row
          key={i}
          q={it.q}
          a={it.a}
          isOpen={open === i}
          onToggle={() => setOpen(open === i ? null : i)}
        />
      ))}
    </StaggerGroup>
  );
}
