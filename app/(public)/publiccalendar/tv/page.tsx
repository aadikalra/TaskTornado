import type { Metadata } from 'next';
import { TvCalendar } from '@/components/TvCalendar';

export const metadata: Metadata = {
  title: 'School Calendar TV | TaskTornado',
  description: 'A fullscreen, display-friendly view of the public school calendar.',
};

export default function PublicTvCalendarPage() {
  return <TvCalendar />;
}
