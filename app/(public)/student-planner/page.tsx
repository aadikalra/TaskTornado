import { PlannerPage, plannerMetadata } from '@/components/PlannerPage';

export const metadata = plannerMetadata('student');

export default function Page() {
    return <PlannerPage pageId="student" />;
}
