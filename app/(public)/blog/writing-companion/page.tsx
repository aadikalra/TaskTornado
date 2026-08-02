import type { Metadata } from 'next';

import { AIFeaturesUnavailable } from '@/components/AIFeaturesUnavailable';

export const metadata: Metadata = {
  title: 'AI Writing Assistant Roadmap | TaskTornado',
  description:
    'AI writing assistance is planned but unavailable during TaskTornado’s provider and safety review.',
};

export default function WritingCompanionArticle() {
  return <AIFeaturesUnavailable featureName="AI writing assistance" />;
}
