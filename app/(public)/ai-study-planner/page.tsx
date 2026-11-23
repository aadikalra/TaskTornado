import { PlannerPage, plannerMetadata } from '@/components/PlannerPage';

export const metadata = plannerMetadata('ai');

export default function Page() {
    return <PlannerPage pageId="ai" />;
}
