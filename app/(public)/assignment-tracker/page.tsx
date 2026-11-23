import { PlannerPage, plannerMetadata } from '@/components/PlannerPage';

export const metadata = plannerMetadata('assignments');

export default function Page() {
    return <PlannerPage pageId="assignments" />;
}
