'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocale, useTranslations } from 'next-intl';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useSiteContent, resolveSchedule, formatDayRange } from '@/lib/cms';
import { api, apiErrorMessage } from '@/lib/api';
import { Card } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { AnimatedHeading } from '@/components/motion/animated-heading';
import { StaggerGroup } from '@/components/motion/reveal';
import { SectionIndex } from '@/components/home/section-index';
import { useToast } from '@/components/ui/toast';

type Row = { icon: typeof Phone; label: string; value: string; href?: string };

export default function ContactPage() {
  const t = useTranslations('contactPage');
  const th = useTranslations('home.location');
  const wd = useTranslations('weekdays');
  const locale = useLocale();
  const { data: site } = useSiteContent();
  const c = (site?.contact ?? {}) as Record<string, unknown>;
  const schedule = resolveSchedule(site?.hours as Record<string, unknown> | undefined);
  const mapUrl = typeof c.mapUrl === 'string' && c.mapUrl.trim() ? c.mapUrl.trim() : '';

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
          {mapUrl && (
            <a
              data-stagger-item
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <Card className="card-hover flex h-40 items-center justify-center bg-[repeating-linear-gradient(45deg,hsl(var(--muted))_0_10px,transparent_10px_20px)] text-xs font-semibold uppercase tracking-editorial text-muted-foreground">
                {th('directions')}
              </Card>
            </a>
          )}
        </StaggerGroup>
      </div>

      <div className="mx-auto mt-20 w-full max-w-3xl">
        <ContactForm />
      </div>
    </div>
  );
}

function ContactForm() {
  const t = useTranslations('contactPage.form');
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const schema = z.object({
    name: z.string().trim().min(2, t('nameShort')),
    email: z.string().trim().email(t('emailInvalid')),
    phone: z.string().trim().min(6, t('phoneShort')),
    message: z.string().trim().min(5, t('messageShort')).max(4000),
  });
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    try {
      await api.post('/contact-messages', v);
      setSent(true);
      reset();
      toast.success(t('success'));
    } catch (e) {
      toast.error(apiErrorMessage(e, t('error')));
    }
  };

  if (sent) {
    return (
      <Card className="flex items-center gap-4 p-8 sm:p-10">
        <CheckCircle2 className="h-8 w-8 shrink-0 text-accent" />
        <div>
          <p className="font-display text-xl font-semibold">{t('heading')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('success')}</p>
        </div>
      </Card>
    );
  }

  const field =
    'h-12 w-full rounded-lg border border-border bg-background/60 px-4 text-sm outline-none transition-colors focus:border-accent';
  const labelText =
    'mb-1.5 block text-xs font-semibold uppercase tracking-editorial text-muted-foreground';

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border/60 bg-surface px-6 py-5 sm:px-8">
        <h2 className="font-display text-2xl font-semibold">{t('heading')}</h2>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 px-6 py-6 sm:grid-cols-2 sm:px-8 sm:py-8"
      >
        <label className="block">
          <span className={labelText}>{t('name')}</span>
          <input className={field} {...register('name')} />
          {errors.name && <span className="mt-1 block text-xs text-danger">{errors.name.message}</span>}
        </label>
        <label className="block">
          <span className={labelText}>{t('email')}</span>
          <input className={field} dir="ltr" type="email" {...register('email')} />
          {errors.email && (
            <span className="mt-1 block text-xs text-danger">{errors.email.message}</span>
          )}
        </label>
        <label className="block sm:col-span-2">
          <span className={labelText}>{t('phone')}</span>
          <input className={field} dir="ltr" {...register('phone')} />
          {errors.phone && (
            <span className="mt-1 block text-xs text-danger">{errors.phone.message}</span>
          )}
        </label>
        <label className="block sm:col-span-2">
          <span className={labelText}>{t('message')}</span>
          <textarea
            rows={6}
            className="w-full resize-y rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
            {...register('message')}
          />
          {errors.message && (
            <span className="mt-1 block text-xs text-danger">{errors.message.message}</span>
          )}
        </label>
        <div className="sm:col-span-2 sm:flex sm:justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
            <Send className="me-2 h-4 w-4 rtl:rotate-180" />
            {isSubmitting ? t('sending') : t('send')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
