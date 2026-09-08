'use client';

import { useEffect, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  IdCard,
  Layers,
  RefreshCw,
  QrCode,
  Receipt,
  CalendarCheck,
  Bell,
  UserRound,
  LogOut,
} from 'lucide-react';
import { usePathname, Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const NAV: ReadonlyArray<{
  href: string;
  key: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { href: '/portal', key: 'overview', icon: LayoutDashboard, exact: true },
  { href: '/portal/membership', key: 'membership', icon: IdCard },
  { href: '/portal/plans', key: 'plans', icon: Layers },
  { href: '/portal/subscribe', key: 'subscribe', icon: RefreshCw },
  { href: '/portal/qr', key: 'qr', icon: QrCode },
  { href: '/portal/payments', key: 'payments', icon: Receipt },
  { href: '/portal/attendance', key: 'attendance', icon: CalendarCheck },
  { href: '/portal/notifications', key: 'notifications', icon: Bell },
  { href: '/portal/profile', key: 'profile', icon: UserRound },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('portal.nav');
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await logout();
    router.replace('/login');
  };

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="container grid grid-cols-1 gap-6 pb-16 pt-24 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14 lg:pt-[5.5rem] xl:gap-20">
        <div className="hidden gap-2 lg:flex lg:flex-col">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-40" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container grid grid-cols-1 gap-6 pb-16 pt-24 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14 lg:pt-[5.5rem] xl:gap-20">
      <aside
        className={cn(
          'min-w-0',
          // Mobile: sticky edge-to-edge bar tucked under the fixed site header.
          'sticky top-14 z-30 -mx-5 border-b border-border/60 bg-background/90 px-5 py-2 backdrop-blur',
          // Desktop: sidebar column, sits below the header offset.
          'lg:top-[5.5rem] lg:mx-0 lg:h-fit lg:border-0 lg:bg-transparent lg:px-0 lg:py-0',
        )}
      >
        {/* Mobile / tablet: horizontal scroller. Desktop: vertical card. */}
        <nav
          className={cn(
            'flex min-w-0 max-w-full gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            'lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-xl lg:border lg:border-border/70 lg:bg-surface/60 lg:p-2 lg:backdrop-blur',
          )}
        >
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'absolute inset-y-1.5 -start-2 hidden w-1 rounded-full bg-accent transition-opacity lg:block',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    active ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground',
                  )}
                />
                {t(item.key)}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={signOut}
            className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger lg:mt-1 lg:border-t lg:border-border/60 lg:pt-3"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t('signOut')}
          </button>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
