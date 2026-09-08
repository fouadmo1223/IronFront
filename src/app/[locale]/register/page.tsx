'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth';
import { apiErrorMessage } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input, Field, Card } from '@/components/ui/field';

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tv = useTranslations('auth.validation');
  const { register: registerAccount } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  const schema = z.object({
    firstName: z.string().min(2, tv('nameShort')),
    lastName: z.string().min(2, tv('nameShort')),
    email: z.string().email(tv('emailInvalid')),
    phone: z.string().min(6, tv('phoneShort')),
    password: z
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, tv('passwordWeak')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setError(null);
    try {
      await registerAccount(v);
      router.push('/portal');
    } catch (e) {
      const m = apiErrorMessage(e, t('failed'));
      setError(m);
      toast.error(m);
    }
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md p-8">
        <h1 className="display-hero text-3xl">{t('title')}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('firstName')} error={errors.firstName?.message}>
              <Input {...register('firstName')} />
            </Field>
            <Field label={t('lastName')} error={errors.lastName?.message}>
              <Input {...register('lastName')} />
            </Field>
          </div>
          <Field label={t('email')} error={errors.email?.message}>
            <Input type="email" {...register('email')} />
          </Field>
          <Field label={t('phone')} error={errors.phone?.message}>
            <Input dir="ltr" {...register('phone')} />
          </Field>
          <Field label={t('password')} error={errors.password?.message}>
            <Input type="password" {...register('password')} />
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
          {t('haveAccount')}{' '}
          <Link href="/login" className="font-semibold text-accent">
            {t('toLogin')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
