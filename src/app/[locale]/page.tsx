import { setRequestLocale } from 'next-intl/server';
import { HydrationBoundary } from '@tanstack/react-query';
import { HomeExperience } from '@/components/home/home-experience';
import { dehydrateCms } from '@/lib/cms-server';

export default async function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const state = await dehydrateCms('home', { site: true });
  return (
    <HydrationBoundary state={state}>
      <HomeExperience />
    </HydrationBoundary>
  );
}
