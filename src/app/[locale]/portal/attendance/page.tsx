'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMyAttendance } from '@/lib/portal-api';
import { Card } from '@/components/ui/field';
import { RowsSkeleton } from '@/components/ui/skeleton';

export default function PortalAttendancePage() {
  const locale = useLocale();
  const t = useTranslations('portal.attendance');
  const { data = [], isLoading } = useMyAttendance();

  return (
    <div>
      <h1 className="display-hero text-3xl">{t('title')}</h1>

      {isLoading ? (
        <RowsSkeleton />
      ) : data.length === 0 ? (
        <Card className="mt-6 p-6 text-center text-muted-foreground">{t('none')}</Card>
      ) : (
        <div className="portal-fade mt-6 divide-y divide-border rounded-lg border border-border [&>*]:transition-colors [&>*:hover]:bg-muted/40">
          {data.map((a) => (
            <div key={a._id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{new Date(a.checkInAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-GB')}</span>
              <span className="text-muted-foreground">
                {a.branch ? (locale === 'ar' ? a.branch.nameAr : a.branch.nameEn) : ''}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {t('total', { count: data.length })}
      </p>
    </div>
  );
}
