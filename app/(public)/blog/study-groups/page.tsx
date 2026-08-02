import type { Metadata } from 'next';

import { SocialFeaturesUnavailable } from '@/components/SocialFeaturesUnavailable';

export const metadata: Metadata = {
  title: 'Study Groups Unavailable | TaskTornado',
  description:
    'TaskTornado study groups are disabled while safety and moderation controls are developed.',
};

export default function StudyGroupsArticle() {
  return <SocialFeaturesUnavailable />;
}
