import type { Metadata } from 'next';

import { AIFeaturesUnavailable } from '@/components/AIFeaturesUnavailable';

export const metadata: Metadata = {
  title: 'Aurora AI Engineering Roadmap | TaskTornado',
  description:
    'Aurora AI is planned but unavailable while TaskTornado completes its provider and safety review.',
};

export default function MakingOfAurora() {
  return <AIFeaturesUnavailable featureName="Aurora AI" />;
}
