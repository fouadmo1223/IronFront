import { setRequestLocale } from 'next-intl/server';
import { HydrationBoundary } from '@tanstack/react-query';
import { FacilitiesExperience } from '@/components/facilities/facilities-experience';
import { dehydrateCms } from '@/lib/cms-server';

export default async function FacilitiesPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const state = await dehydrateCms('facilities');
  return (
    <HydrationBoundary state={state}>
      <FacilitiesExperience />
    </HydrationBoundary>
  );
}
