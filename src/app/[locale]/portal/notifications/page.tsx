'use client';

import { useLocale } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMyNotifications } from '@/lib/portal-api';
import { Card } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { ListSkeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export default function PortalNotificationsPage() {
  const locale = useLocale();
  const qc = useQueryClient();
  const { data = [], isLoading } = useMyNotifications();

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    void qc.invalidateQueries({ queryKey: ['portal', 'notifications'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display-hero text-3xl">Notifications</h1>
        {data.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={markAll}>
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : data.length === 0 ? (
        <Card className="mt-6 p-6 text-center text-muted-foreground">Nothing here yet.</Card>
      ) : (
        <div className="portal-stagger mt-6 space-y-2">
          {data.map((n) => (
            <Card key={n._id} className={`p-4 ${n.isRead ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {locale === 'ar' ? n.titleAr : n.titleEn}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {locale === 'ar' ? n.messageAr : n.messageEn}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(n.createdAt, locale)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
