import { setRequestLocale } from 'next-intl/server';
import { TrainersExperience } from '@/components/trainers/trainers-experience';

export default function TrainersPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <TrainersExperience />;
}
