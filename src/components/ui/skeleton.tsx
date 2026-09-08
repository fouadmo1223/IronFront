import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/field';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted/70', className)} aria-hidden />;
}

/** Stack of card-shaped rows — payments, notifications, history. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="mt-6 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="flex items-start justify-between gap-3 p-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </Card>
      ))}
    </div>
  );
}

/** Compact divided rows — attendance log. */
export function RowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="mt-6 divide-y divide-border rounded-lg border border-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Responsive grid of card blocks — plans. */
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="space-y-3 p-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="mt-2 h-11 w-full" />
        </Card>
      ))}
    </div>
  );
}

/** One large detail panel — membership summary. */
export function PanelSkeleton() {
  return (
    <Card className="mt-6 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}
