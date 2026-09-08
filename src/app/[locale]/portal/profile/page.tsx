'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { useMyProfile } from '@/lib/portal-api';
import { useAuth } from '@/lib/auth';
import { Card, Field, Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const t = useTranslations('portal.profile');
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useMyProfile();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone });
  }, [user]);

  const emergency =
    (profile?.emergencyContact as { name?: string; phone?: string } | undefined) ?? {};

  const toast = useToast();
  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await api.patch('/members/me', form);
      await qc.invalidateQueries({ queryKey: ['portal', 'profile'] });
      setMsg({ ok: true, text: t('updated') });
      toast.success(t('updated'));
    } catch (e) {
      const m = apiErrorMessage(e);
      setMsg({ ok: false, text: m });
      toast.error(m);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="display-hero text-3xl">{t('title')}</h1>

      <Card className="mt-6 space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('firstName')}>
            <Input
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
          </Field>
          <Field label={t('lastName')}>
            <Input
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </Field>
        </div>
        <Field label={t('phone')}>
          <Input
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </Field>
        <Field label={t('email')}>
          <Input value={user?.email ?? ''} disabled />
        </Field>
        {msg && (
          <p
            className={`rounded-md px-3 py-2 text-sm ${
              msg.ok
                ? 'border border-success/40 bg-success/10 text-success'
                : 'border border-danger/40 bg-danger/10 text-danger'
            }`}
          >
            {msg.text}
          </p>
        )}
        <Button onClick={save} disabled={saving}>
          {saving ? t('saving') : t('save')}
        </Button>
      </Card>

      {(emergency.name || emergency.phone) && (
        <Card className="mt-4 p-6 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('emergencyContact')}
          </p>
          <p className="mt-2">
            {emergency.name} · <span dir="ltr">{emergency.phone}</span>
          </p>
        </Card>
      )}
    </div>
  );
}
