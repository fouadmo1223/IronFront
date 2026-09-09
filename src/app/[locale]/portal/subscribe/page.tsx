'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Upload } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '@/lib/api';
import {
  useCurrentSubscription,
  usePaymentMethods,
  usePublicPlans,
  type PaymentMethodView,
  type SubscriptionView,
} from '@/lib/portal-api';
import { Card, Field, Input, Textarea } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Skeleton, CardGridSkeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { PlanCard } from '@/components/plan-card';
import { formatCurrency } from '@/lib/utils';

type Step = 'plan' | 'confirm' | 'pay' | 'done';

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-9 w-56" />
          <CardGridSkeleton count={3} />
        </div>
      }
    >
      <SubscribeFlow />
    </Suspense>
  );
}

function SubscribeFlow() {
  const locale = useLocale();
  const t = useTranslations('portal.subscribe');
  const qc = useQueryClient();
  const params = useSearchParams();
  const { data: plans = [] } = usePublicPlans();
  const { data: current, refetch: refetchCurrent } = useCurrentSubscription();
  const { data: methods = [] } = usePaymentMethods();

  const preselect = params.get('plan');
  const [planId, setPlanId] = useState<string | null>(preselect);
  const [subscription, setSubscription] = useState<SubscriptionView | null>(null);
  const [step, setStep] = useState<Step>(preselect ? 'confirm' : 'plan');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  const name = (s: { planNameAr: string; planNameEn: string }) =>
    locale === 'ar' ? s.planNameAr : s.planNameEn;

  // An existing unpaid subscription short-circuits straight to payment.
  const pendingSub = useMemo(() => {
    if (
      current &&
      ['PENDING_PAYMENT', 'PAYMENT_UNDER_REVIEW'].includes(current.status)
    ) {
      return current;
    }
    return null;
  }, [current]);

  const activeSub =
    current && ['ACTIVE', 'EXPIRING_SOON', 'FROZEN'].includes(current.effectiveStatus)
      ? current
      : null;

  const selectedPlan = plans.find((p) => p._id === planId) ?? null;

  const createSubscription = async () => {
    if (!planId) return;
    setCreating(true);
    setError(null);
    try {
      const sub = await unwrap<SubscriptionView>(
        api.post('/subscriptions/me', { planId }),
      );
      setSubscription(sub);
      setStep('pay');
      void refetchCurrent();
      toast.success(locale === 'ar' ? 'تم إنشاء الاشتراك' : 'Subscription created');
    } catch (e) {
      const msg = apiErrorMessage(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  // ── Already has an active membership ──
  if (activeSub && step !== 'done') {
    return (
      <div>
        <h1 className="display-hero text-3xl">{t('title')}</h1>
        <Card className="mt-6 p-6">
          <p className="text-sm text-muted-foreground">
            {t('activeMsg', { plan: name(activeSub), date: activeSub.endDate?.slice(0, 10) ?? '' })}
          </p>
        </Card>
      </div>
    );
  }

  // ── Resume an unpaid subscription ──
  const workingSub = subscription ?? pendingSub;
  if (workingSub && step !== 'done' && (step === 'pay' || pendingSub)) {
    return (
      <PaymentStep
        subscription={workingSub}
        methods={methods}
        onDone={() => {
          setStep('done');
          void qc.invalidateQueries({ queryKey: ['portal'] });
        }}
      />
    );
  }

  if (step === 'done') {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="display-hero mt-4 text-3xl">{t('doneTitle')}</h1>
        <p className="mt-2 text-muted-foreground">{t('doneBody')}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="display-hero text-3xl">{t('title')}</h1>

      {step === 'plan' && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => (
            <PlanCard
              key={p._id}
              plan={p}
              selected={p._id === planId}
              onSelect={() => {
                setPlanId(p._id);
                setStep('confirm');
              }}
            />
          ))}
        </div>
      )}

      {step === 'confirm' && selectedPlan && (
        <Card className="mt-6 max-w-lg p-6">
          <h2 className="font-display text-xl font-bold uppercase">{t('confirmTitle')}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('plan')}</dt>
              <dd className="font-medium">
                {locale === 'ar' ? selectedPlan.nameAr : selectedPlan.nameEn}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('duration')}</dt>
              <dd className="font-medium">{t('days', { n: selectedPlan.durationDays })}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="text-muted-foreground">{t('amountDue')}</dt>
              <dd className="font-display text-lg font-bold text-accent">
                {formatCurrency(selectedPlan.price, locale)}
              </dd>
            </div>
          </dl>
          {error && (
            <p className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setStep('plan')}>
              {t('back')}
            </Button>
            <Button onClick={createSubscription} disabled={creating}>
              {creating ? t('creating') : t('confirm')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function PaymentStep({
  subscription,
  methods,
  onDone,
}: {
  subscription: SubscriptionView;
  methods: PaymentMethodView[];
  onDone: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations('portal.subscribe');
  const toast = useToast();
  const [methodId, setMethodId] = useState<string>(methods[0]?._id ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const method = methods.find((m) => m._id === methodId);
  const due = subscription.remainingAmount > 0 ? subscription.remainingAmount : subscription.finalPrice;

  const [form, setForm] = useState({
    senderName: '',
    senderPhone: '',
    amount: String(due),
    transferDate: new Date().toISOString().slice(0, 10),
    transactionReference: '',
    memberNotes: '',
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!file) {
      const msg = locale === 'ar' ? 'صورة إثبات الدفع مطلوبة.' : 'A payment proof image is required.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('proof', file);
      fd.append('subscriptionId', subscription._id);
      fd.append('paymentMethodId', methodId);
      fd.append('amount', form.amount);
      fd.append('senderName', form.senderName);
      fd.append('senderPhone', form.senderPhone);
      fd.append('transferDate', form.transferDate);
      if (form.transactionReference) fd.append('transactionReference', form.transactionReference);
      if (form.memberNotes) fd.append('memberNotes', form.memberNotes);
      await api.post('/payments/me/submit', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(
        locale === 'ar' ? 'تم إرسال إثبات الدفع للمراجعة' : 'Payment proof submitted for review',
      );
      onDone();
    } catch (e) {
      const msg = apiErrorMessage(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="display-hero text-3xl">{t('payTitle')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {locale === 'ar' ? subscription.planNameAr : subscription.planNameEn} ·{' '}
        <span className="font-semibold text-foreground">{t('payDue', { amount: formatCurrency(due, locale) })}</span>
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('step1')}
          </h2>
          <div className="mt-3 space-y-2">
            {methods.map((m) => (
              <label
                key={m._id}
                className={`block cursor-pointer rounded-md border p-3 text-sm ${
                  methodId === m._id ? 'border-accent bg-accent/5' : 'border-border'
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  className="me-2"
                  checked={methodId === m._id}
                  onChange={() => setMethodId(m._id)}
                />
                {locale === 'ar' ? m.nameAr : m.nameEn}
              </label>
            ))}
          </div>
          {method && (
            <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm">
              {method.accountName && <p>{t('acctName')}: {method.accountName}</p>}
              {method.phoneNumber && (
                <p dir="ltr">{t('acctNumber')}: {method.phoneNumber}</p>
              )}
              {method.accountNumber && (
                <p dir="ltr">{t('acctAccount')}: {method.accountNumber}</p>
              )}
              {method.iban && <p dir="ltr">{t('acctIban')}: {method.iban}</p>}
              {(locale === 'ar' ? method.instructionsAr : method.instructionsEn) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {locale === 'ar' ? method.instructionsAr : method.instructionsEn}
                </p>
              )}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('step2')}
          </h2>
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('senderName')}>
                <Input value={form.senderName} onChange={(e) => set('senderName', e.target.value)} />
              </Field>
              <Field label={t('senderPhone')}>
                <Input dir="ltr" value={form.senderPhone} onChange={(e) => set('senderPhone', e.target.value)} />
              </Field>
              <Field label={t('amount')}>
                <Input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
              </Field>
              <Field label={t('transferDate')}>
                <Input type="date" value={form.transferDate} onChange={(e) => set('transferDate', e.target.value)} />
              </Field>
            </div>
            <Field label={t('reference')}>
              <Input
                value={form.transactionReference}
                onChange={(e) => set('transactionReference', e.target.value)}
              />
            </Field>
            <Field label={t('notes')}>
              <Textarea value={form.memberNotes} onChange={(e) => set('memberNotes', e.target.value)} />
            </Field>
            <Field label={t('proof')}>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-dashed border-input text-sm text-muted-foreground hover:border-accent"
              >
                <Upload className="h-4 w-4" />
                {file ? file.name : t('uploadScreenshot')}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Field>
            {error && (
              <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            <Button className="w-full" size="lg" onClick={submit} disabled={submitting}>
              {submitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
