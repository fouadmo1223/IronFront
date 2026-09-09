import { setRequestLocale } from 'next-intl/server';
import { HydrationBoundary } from '@tanstack/react-query';
import { TrainersExperience } from '@/components/trainers/trainers-experience';
import { dehydrateCms } from '@/lib/cms-server';

export default async function TrainersPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const state = await dehydrateCms('trainers');
  return (
    <HydrationBoundary state={state}>
      <TrainersExperience />
    </HydrationBoundary>
  );
}
