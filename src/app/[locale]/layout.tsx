import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from '@/components/providers';
import { CopyProvider } from '@/components/site/copy-provider';
import { SiteBackdrop } from '@/components/site/site-backdrop';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { routing, LOCALE_DIRECTION, type AppLocale } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const name = t('siteName');
  const tagline = t('tagline');
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}`]),
  );
  return {
    title: { default: `${name} — ${tagline}`, template: `%s · ${name}` },
    description: tagline,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: { ...languages, 'x-default': `${SITE_URL}/${routing.defaultLocale}` },
    },
    openGraph: {
      type: 'website',
      siteName: name,
      title: `${name} — ${tagline}`,
      description: tagline,
      url: `${SITE_URL}/${locale}`,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — ${tagline}`,
      description: tagline,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!routing.locales.includes(locale as AppLocale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = LOCALE_DIRECTION[locale as AppLocale];

  return (
    <html lang={locale} dir={dir} className="theme-dark">
      <body className="min-h-dvh bg-background text-foreground">
        <noscript>
          <style>{`[data-animate],[data-stagger-item],[data-split] [data-word],[data-hero-fade]{opacity:1!important}`}</style>
        </noscript>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <CopyProvider>
              <SiteBackdrop />
              <div className="flex min-h-dvh flex-col">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </div>
            </CopyProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
