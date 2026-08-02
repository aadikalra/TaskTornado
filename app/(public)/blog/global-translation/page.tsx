import type { Metadata } from 'next';

import { AIFeaturesUnavailable } from '@/components/AIFeaturesUnavailable';

export const metadata: Metadata = {
  title: 'Translation Roadmap | TaskTornado',
  description:
    'AI-powered translation is planned but unavailable during TaskTornado’s provider and safety review.',
};

export default function GlobalTranslationArticle() {
  return <AIFeaturesUnavailable featureName="AI-powered translation" />;
}
