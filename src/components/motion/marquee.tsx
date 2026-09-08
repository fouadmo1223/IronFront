'use client';

import { cn } from '@/lib/utils';

/**
 * Seamless infinite marquee — pure CSS animation (compositor-driven, reliable).
 * The track holds the item list twice; translating it -50% loops gaplessly.
 * RTL flips the travel direction. Pauses on hover.
 */
export function Marquee({
  items,
  className,
  durationSec = 30,
  reverse = false,
}: {
  items: string[];
  className?: string;
  durationSec?: number;
  reverse?: boolean;
}) {
  const row = (
    <>
      {items.map((it, i) => (
        <span key={i} className="mx-6 inline-flex items-center gap-6 whitespace-nowrap">
          {it}
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
      ))}
    </>
  );

  return (
    <div
      className={cn('group overflow-hidden border-y border-border/60 py-5', className)}
      aria-hidden
    >
      <div
        style={{ ['--marquee-duration' as string]: `${durationSec}s` }}
        className={cn(
          'flex w-max font-display text-3xl font-bold uppercase tracking-tight text-muted-foreground group-hover:[animation-play-state:paused] sm:text-4xl',
          reverse ? 'animate-marquee-rev' : 'animate-marquee',
          'rtl:[animation-direction:reverse]',
        )}
      >
        {row}
        {row}
      </div>
    </div>
  );
}
