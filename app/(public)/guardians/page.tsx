import type { Metadata } from 'next';
import { LandingSlider } from '@/components/LandingSlider';

export const metadata: Metadata = {
    title: 'TaskTornado for Parents & Guardians | Student Planner',
    description: 'Discover how TaskTornado helps students keep track of homework, deadlines, and grades, with parent and guardian approval for AI features.',
    alternates: { canonical: '/guardians' },
};

export default function GuardiansPage() {
    return <LandingSlider initialView="guardians" />;
}
