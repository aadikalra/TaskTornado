import type { Metadata } from 'next';
import { LandingSlider } from '@/components/LandingSlider';

export const metadata: Metadata = {
    title: 'TaskTornado for Teachers | Student Organization',
    description: 'Help students stay on top of assignments, due dates, and study plans with TaskTornado, a free student planner and homework tracker.',
    alternates: { canonical: '/teachers' },
};

export default function TeachersPage() {
    return <LandingSlider initialView="teachers" />;
}
