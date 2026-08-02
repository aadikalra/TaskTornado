import type { Metadata } from 'next';

import { AIFeaturesUnavailable } from '@/components/AIFeaturesUnavailable';

export const metadata: Metadata = {
  title: 'Aurora AI Roadmap | TaskTornado',
  description:
    'Aurora AI is planned but unavailable while TaskTornado completes its provider and safety review.',
};

export default function MeetAuroraArticle() {
  return <AIFeaturesUnavailable featureName="Aurora AI" />;
}
