import { setRequestLocale } from 'next-intl/server';
import { AboutExperience } from '@/components/about/about-experience';

export default function AboutPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <AboutExperience />;
}
