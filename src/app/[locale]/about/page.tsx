import { setRequestLocale } from 'next-intl/server';
import { HydrationBoundary } from '@tanstack/react-query';
import { AboutExperience } from '@/components/about/about-experience';
import { dehydrateCms } from '@/lib/cms-server';

export default async function AboutPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const state = await dehydrateCms('about');
  return (
    <HydrationBoundary state={state}>
      <AboutExperience />
    </HydrationBoundary>
  );
}
