'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: 'ar' | 'en') => {
    if (next !== locale) router.replace(pathname, { locale: next });
  };

  return (
    <div className={cn('flex items-center gap-1 text-xs font-semibold uppercase', className)}>
      <button
        onClick={() => switchTo('ar')}
        className={cn('px-1.5 py-1 transition-colors', locale === 'ar' ? 'text-accent' : 'text-muted-foreground hover:text-foreground')}
      >
        ع
      </button>
      <span className="text-border">/</span>
      <button
        onClick={() => switchTo('en')}
        className={cn('px-1.5 py-1 transition-colors', locale === 'en' ? 'text-accent' : 'text-muted-foreground hover:text-foreground')}
      >
        EN
      </button>
    </div>
  );
}
