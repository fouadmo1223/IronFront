import { setRequestLocale } from 'next-intl/server';
import { HomeExperience } from '@/components/home/home-experience';

export default function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <HomeExperience />;
}
