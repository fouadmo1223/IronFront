'use client';

import { useMemo, type ReactNode } from 'react';
import {
  NextIntlClientProvider,
  useLocale,
  useMessages,
  type AbstractIntlMessages,
} from 'next-intl';
import { useSiteContent } from '@/lib/cms';

type Dict = Record<string, unknown>;

const isPlainObject = (v: unknown): v is Dict =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Recursively merge `override` onto `base` without mutating either. */
function deepMerge(base: Dict, override: Dict): Dict {
  const out: Dict = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined || value === null || value === '') continue;
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = deepMerge(out[key] as Dict, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Overlays dashboard-authored copy (CMS `site.copy[locale]`) on top of the
 * static next-intl catalog. Every `useTranslations(...)` call below this
 * provider transparently picks up the overrides — no call-site changes.
 * The API is optional: when it is unreachable the catalog is used as-is.
 */
export function CopyProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const base = useMessages() as Dict;
  const { data: site } = useSiteContent();

  const messages = useMemo(() => {
    const override = site?.copy?.[locale as 'en' | 'ar'];
    return isPlainObject(override) ? deepMerge(base, override) : base;
  }, [base, site, locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages as AbstractIntlMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
