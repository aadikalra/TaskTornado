import type { Metadata } from 'next';
import { formatCalendarDate } from '@/lib/dateUtils';
import PublicCalendarClient from './PublicCalendarClient';

export const metadata: Metadata = {
    title: '2026–27 School Events Calendar | TaskTornado',
    description: 'Browse the school events calendar for holidays, breaks, and important dates throughout the 2026–27 school year.',
    alternates: { canonical: '/publiccalendar' },
};

export default function PublicCalendarPage() {
    return <PublicCalendarClient initialDate={formatCalendarDate(new Date())} />;
}
