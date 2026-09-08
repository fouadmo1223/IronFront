import { cn } from '@/lib/utils';

/** Editorial corner marker: "01 / Membership". */
export function SectionIndex({
  index,
  label,
  className,
}: {
  index: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-xs font-semibold uppercase tracking-editorial text-muted-foreground',
        className,
      )}
    >
      <span className="text-accent">{index}</span>
      <span className="h-px w-8 bg-border" />
      {label && <span>{label}</span>}
    </div>
  );
}
