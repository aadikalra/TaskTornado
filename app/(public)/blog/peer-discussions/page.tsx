import type { Metadata } from 'next';

import { SocialFeaturesUnavailable } from '@/components/SocialFeaturesUnavailable';

export const metadata: Metadata = {
  title: 'Discussion Forums Unavailable | TaskTornado',
  description:
    'TaskTornado discussion forums are disabled while safety and moderation controls are developed.',
};

export default function PeerDiscussionsArticle() {
  return <SocialFeaturesUnavailable />;
}
