'use client';

import { useLocale } from 'next-intl';
import type { CmsSection } from '@/lib/cms';

function pick(data: Record<string, unknown>, base: string, locale: string): string {
  const key = `${base}${locale === 'ar' ? 'Ar' : 'En'}`;
  return (data[key] as string) ?? (data[base] as string) ?? '';
}

export function CmsSections({ sections }: { sections: CmsSection[] }) {
  const locale = useLocale();
  return (
    <>
      {sections
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order)
        .map((s) => (
          <SectionBlock key={s.key} section={s} locale={locale} />
        ))}
    </>
  );
}

function SectionBlock({ section, locale }: { section: CmsSection; locale: string }) {
  const d = section.data ?? {};

  switch (section.type) {
    case 'HERO':
      return (
        <section className="border-b border-border/70">
          <div className="container py-20 lg:py-28">
            <h1 className="display-hero text-4xl sm:text-5xl lg:text-6xl">
              {pick(d, 'title', locale)}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              {pick(d, 'subtitle', locale)}
            </p>
          </div>
        </section>
      );

    case 'STATS': {
      const items = (d.items as Array<Record<string, string>>) ?? [];
      return (
        <section className="border-b border-border/70 bg-surface">
          <div className="container grid grid-cols-2 gap-px lg:grid-cols-4">
            {items.map((it, i) => (
              <div key={i} className="bg-surface px-2 py-10 text-center">
                <div className="font-display text-4xl font-bold text-accent">
                  {it.valueEn ?? it.value}
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
                  {locale === 'ar' ? (it.labelAr ?? it.labelEn) : it.labelEn}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'RICH_TEXT':
    case 'ABOUT_PREVIEW':
    case 'TRAINING_EXPERIENCE':
      return (
        <section className="container py-16">
          {pick(d, 'title', locale) && (
            <h2 className="display-hero text-3xl">{pick(d, 'title', locale)}</h2>
          )}
          <p className="mt-4 max-w-2xl whitespace-pre-line text-muted-foreground">
            {pick(d, 'body', locale)}
          </p>
        </section>
      );

    case 'WHY_US':
    case 'FACILITIES':
    case 'TRAINERS':
    case 'TESTIMONIALS': {
      const items = (d.items as Array<Record<string, string>>) ?? [];
      return (
        <section className="container py-16">
          {pick(d, 'title', locale) && (
            <h2 className="display-hero text-3xl">{pick(d, 'title', locale)}</h2>
          )}
          <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-3">
            {items.map((it, i) => (
              <div key={i} className="bg-background p-6">
                {it.imageUrl && (
                  <img src={it.imageUrl} alt="" className="mb-4 h-40 w-full rounded object-cover" />
                )}
                <h3 className="font-display text-lg font-semibold uppercase">
                  {locale === 'ar' ? (it.titleAr ?? it.titleEn) : it.titleEn}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {locale === 'ar' ? (it.bodyAr ?? it.bodyEn) : it.bodyEn}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'FAQ': {
      const items = (d.items as Array<Record<string, string>>) ?? [];
      return (
        <section className="container py-16">
          <h2 className="display-hero text-3xl">{pick(d, 'title', locale) || 'FAQ'}</h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {items.map((it, i) => (
              <details key={i} className="group py-4">
                <summary className="cursor-pointer font-medium">
                  {locale === 'ar' ? (it.qAr ?? it.qEn) : it.qEn}
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">
                  {locale === 'ar' ? (it.aAr ?? it.aEn) : it.aEn}
                </p>
              </details>
            ))}
          </div>
        </section>
      );
    }

    case 'CTA':
      return (
        <section className="border-t border-border/70 bg-surface">
          <div className="container py-16">
            <h2 className="display-hero text-3xl">{pick(d, 'title', locale)}</h2>
            <p className="mt-3 text-muted-foreground">{pick(d, 'body', locale)}</p>
          </div>
        </section>
      );

    default:
      return null;
  }
}
