import { PlannerPage, plannerMetadata } from '@/components/PlannerPage';

export const metadata = plannerMetadata('homework');

export default function Page() {
    return <PlannerPage pageId="homework" />;
}
