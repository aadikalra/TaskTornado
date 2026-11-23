import { PlannerPage, plannerMetadata } from '@/components/PlannerPage';

export const metadata = plannerMetadata('schedule');

export default function Page() {
    return <PlannerPage pageId="schedule" />;
}
