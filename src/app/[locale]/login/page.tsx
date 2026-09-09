'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth';
import { apiErrorMessage, apiErrorKey } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input, Field, Card } from '@/components/ui/field';

type Values = { email: string; password: string };

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const tv = useTranslations('auth.validation');
  const te = useTranslations('apiErrors');
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  const schema = z.object({
    email: z.string().email(tv('emailInvalid')),
    password: z.string().min(1, tv('passwordRequired')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setError(null);
    try {
      await login(v.email, v.password);
      router.push('/portal');
    } catch (e) {
      const key = apiErrorKey(e);
      const m = key ? te(key) : apiErrorMessage(e, t('failed'));
      setError(m);
      toast.error(m);
    }
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md p-8">
        <h1 className="display-hero text-3xl">{t('title')}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Field label={t('email')} error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register('email')} />
          </Field>
          <Field label={t('password')} error={errors.password?.message}>
            <Input type="password" autoComplete="current-password" {...register('password')} />
          </Field>
          {error && (
            <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {t('submit')}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-semibold text-accent">
            {t('createAccount')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
