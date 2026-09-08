import { setRequestLocale } from 'next-intl/server';
import { FacilitiesExperience } from '@/components/facilities/facilities-experience';

export default function FacilitiesPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <FacilitiesExperience />;
}
