'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react';
import { useSiteContent, resolveSchedule, formatDayRange } from '@/lib/cms';
import { Card } from '@/components/ui/field';
import { AnimatedHeading } from '@/components/motion/animated-heading';
import { StaggerGroup } from '@/components/motion/reveal';
import { SectionIndex } from '@/components/home/section-index';

type Row = { icon: typeof Phone; label: string; value: string; href?: string };

export default function ContactPage() {
  const t = useTranslations('contactPage');
  const th = useTranslations('home.location');
  const wd = useTranslations('weekdays');
  const locale = useLocale();
  const { data: site } = useSiteContent();
  const c = (site?.contact ?? {}) as Record<string, unknown>;
  const schedule = resolveSchedule(site?.hours as Record<string, unknown> | undefined);

  const phones = (
    Array.isArray(c.phones) ? (c.phones as string[]) : c.phone ? [String(c.phone)] : []
  ).filter(Boolean);
  const address = (locale === 'ar' ? c.addressAr : c.addressEn) as string | undefined;
  const whatsapps = (
    Array.isArray(c.whatsapp) ? (c.whatsapp as string[]) : c.whatsapp ? [String(c.whatsapp)] : []
  ).filter(Boolean);

  const rows: Row[] = [
    ...phones.map((p) => ({
      icon: Phone,
      label: t('phone'),
      value: p,
      href: `tel:${p.replace(/[^\d+]/g, '')}`,
    })),
    ...whatsapps.map((w) => ({
      icon: MessageCircle,
      label: t('whatsapp'),
      value: w,
      href: `https://wa.me/${w.replace(/[^\d]/g, '')}`,
    })),
    ...(c.email
      ? [{ icon: Mail, label: t('email'), value: String(c.email), href: `mailto:${c.email}` }]
      : []),
    ...(address ? [{ icon: MapPin, label: t('address'), value: address }] : []),
  ];

  return (
    <div className="container pb-24 pt-32">
      <SectionIndex index={t('index')} label={t('kicker')} />
      <AnimatedHeading
        as="h1"
        text={t('title')}
        className="display-hero mt-6 max-w-[18ch] text-4xl sm:text-5xl"
        onScroll={false}
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <StaggerGroup className="grid gap-3" amount={0.08}>
          {rows.map((r, i) => (
            <div key={i} data-stagger-item>
              <Card className="card-hover flex items-center gap-4 p-4">
                <r.icon className="h-5 w-5 shrink-0 text-accent" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {r.label}
                  </p>
                  {r.href ? (
                    <a href={r.href} dir="ltr" className="link-underline font-medium hover:text-accent">
                      {r.value}
                    </a>
                  ) : (
                    <p className="font-medium">{r.value}</p>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </StaggerGroup>

        <StaggerGroup className="grid gap-3" amount={0.1}>
          <Card data-stagger-item className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-4 w-4 text-accent" />
              {t('hours')}
            </div>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {(['men', 'women'] as const).map((audience) => {
                const blocks = schedule.filter((b) => b.audience === audience);
                return (
                  <div key={audience}>
                    <p className="text-xs font-semibold uppercase tracking-editorial text-accent">
                      {t(audience)}
                    </p>
                    <dl className="mt-2 space-y-2 text-sm">
                      {blocks.length === 0 && (
                        <p className="text-muted-foreground">{t('closed')}</p>
                      )}
                      {blocks.map((b, i) => (
                        <div
                          key={i}
                          className="flex justify-between gap-3 border-b border-border pb-2 last:border-0"
                        >
                          <dt className="text-muted-foreground">
                            {formatDayRange(b.days, (d) => wd(d))}
                          </dt>
                          <dd className="font-medium" dir="ltr">
                            {b.close ? `${b.open} — ${b.close}` : b.open}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          </Card>
          <a
            data-stagger-item
            href="https://maps.google.com/?q=Downtown+Cairo"
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <Card className="card-hover flex h-40 items-center justify-center bg-[repeating-linear-gradient(45deg,hsl(var(--muted))_0_10px,transparent_10px_20px)] text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
              {th('directions')}
            </Card>
          </a>
        </StaggerGroup>
      </div>
    </div>
  );
}
