export type AiAction =
  | 'quick'
  | 'tutor'
  | 'bulk_generation'
  | 'guardian'
  | 'translation'
  | 'grader'
  | 'copilot';

export type ServerPlanTier = 'free' | 'pro' | 'family';

export const AI_PLAN_LIMITS = {
  free: {
    quick: 20,
    tutor: 8,
    bulk_generation: 3,
    guardian: 0,
    translation: 20,
    grader: 8,
    copilot: 20,
    combined: 25,
  },
  pro: {
    quick: 25,
    tutor: 10,
    bulk_generation: 5,
    guardian: 0,
    translation: 30,
    grader: 10,
    copilot: 25,
    combined: 30,
  },
  family: {
    quick: 50,
    tutor: 20,
    bulk_generation: 10,
    guardian: 10,
    translation: 50,
    grader: 20,
    copilot: 50,
    combined: 60,
  },
} as const;

export const AI_MODEL_ROUTES: Record<AiAction, readonly string[]> = {
  quick: [
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'qwen/qwen3.6-27b',
  ],
  tutor: [
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'qwen/qwen3.6-27b',
    'llama-3.1-8b-instant',
  ],
  bulk_generation: [
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'qwen/qwen3.6-27b',
  ],
  guardian: [
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b',
    'llama-3.1-8b-instant',
  ],
  translation: [
    'qwen/qwen3.6-27b',
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
  ],
  grader: [
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'qwen/qwen3.6-27b',
  ],
  copilot: [
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
    'qwen/qwen3.6-27b',
  ],
};

export const AI_OUTPUT_LIMITS: Record<AiAction, number> = {
  quick: 3500,
  tutor: 3500,
  bulk_generation: 3500,
  guardian: 3500,
  translation: 3500,
  grader: 3500,
  copilot: 3500,
};

export function getAiActionForRequestedModel(model: unknown): AiAction {
  if (model === 'bulk_generation') {
    return 'bulk_generation';
  }

  if (
    model === 'tutor' ||
    model === 'gemini-2.5-flash-lite' ||
    model === 'gpt-oss:20b-cloud' ||
    model === 'openai/gpt-oss-20b'
  ) {
    return 'tutor';
  }

  return 'quick';
}
