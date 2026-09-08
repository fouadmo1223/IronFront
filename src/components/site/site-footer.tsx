'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUp } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { prefersReducedMotion } from '@/lib/gsap';
import { useSiteContent } from '@/lib/cms';
import { LanguageSwitcher } from './language-switcher';

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  const { data: site } = useSiteContent();
  const social = site?.social ?? {};
  const wordmarkRef = useRef<HTMLDivElement>(null);

  // Fill the outline wordmark as it scrolls up through the viewport — plain
  // scroll listener, clip-path via CSS var.
  useEffect(() => {
    const el = wordmarkRef.current;
    const fill = el?.querySelector<HTMLElement>('[data-fill]');
    if (!el || !fill || prefersReducedMotion()) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
      fill.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const columns = [
    {
      title: t('nav.home'),
      links: [
        { href: '/plans', label: t('nav.plans') },
        { href: '/facilities', label: t('nav.facilities') },
        { href: '/trainers', label: t('nav.trainers') },
      ],
    },
    {
      title: t('nav.about'),
      links: [
        { href: '/about', label: t('nav.about') },
        { href: '/contact', label: t('nav.contact') },
        { href: '/login', label: t('nav.portal') },
      ],
    },
  ];

  const socialLinks = Object.entries(social).filter(([, v]) => !!v) as [string, string][];

  return (
    <footer className="relative overflow-hidden border-t border-border/70 bg-surface">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div>
            <p className="font-display text-lg font-bold uppercase tracking-tightest">
              {t('meta.siteName')}
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t('meta.tagline')}</p>
            <p className="mt-4 text-sm text-muted-foreground">{t('footer.address')}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center text-sm text-foreground/80 transition-colors hover:text-accent"
                    >
                      <span className="w-0 overflow-hidden text-accent transition-all duration-300 group-hover:w-4">
                        →
                      </span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        {l.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col items-start gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              Top
            </button>
          </div>
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/60 pt-6 text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
            {socialLinks.map(([k, v]) => (
              <a key={k} href={v} target="_blank" rel="noreferrer" className="hover:text-accent">
                {k}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Oversized wordmark that fills with accent on scroll */}
      <div ref={wordmarkRef} className="relative select-none px-4 pb-6 pt-2" aria-hidden>
        <div className="font-display text-[18vw] font-bold uppercase leading-none tracking-tightest text-transparent [-webkit-text-stroke:1px_hsl(var(--border))]">
          Iron Gym
        </div>
        <div
          data-fill
          className="absolute inset-x-4 bottom-6 top-2 font-display text-[18vw] font-bold uppercase leading-none tracking-tightest text-accent/25"
        >
          Iron Gym
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {t('meta.siteName')}. {t('footer.rights')}
          </span>
          <span>Cairo, Egypt</span>
        </div>
      </div>
    </footer>
  );
}
