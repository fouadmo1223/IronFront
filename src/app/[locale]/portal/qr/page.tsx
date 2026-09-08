'use client';

import { useMyQr } from '@/lib/portal-api';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';

export default function QrPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useMyQr();

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="display-hero text-3xl">My QR</h1>
      <p className="mt-1 text-sm text-muted-foreground">Show this at reception to check in.</p>

      <Card className="mt-6 p-8">
        {isLoading && (
          <div className="flex flex-col items-center">
            <Skeleton className="h-64 w-64 rounded-lg" />
            <Skeleton className="mt-4 h-5 w-32" />
          </div>
        )}
        {isError && <p className="text-sm text-danger">QR is not available on your account.</p>}
        {data && (
          <>
            <img
              src={data.qrDataUrl}
              alt="Member QR"
              className="mx-auto w-64 rounded-lg bg-white p-3"
            />
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Enter this code at reception
            </p>
            <p className="mt-1 select-all font-display text-2xl font-bold tracking-[0.2em]">
              {data.cardCode ?? user?.memberCode}
            </p>
            {!data.isActive && (
              <p className="mt-2 text-xs text-warning">This QR is currently disabled.</p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
