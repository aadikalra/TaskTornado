export const AI_PROVIDERS = {
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-oss-20b',
    keysUrl: 'https://openrouter.ai/settings/keys',
    modelsUrl: 'https://openrouter.ai/models',
  },
  together: {
    name: 'Together AI',
    baseUrl: 'https://api.together.ai/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    keysUrl: 'https://api.together.ai/settings/api-keys',
    modelsUrl: 'https://docs.together.ai/docs/serverless-models',
  },
  fireworks: {
    name: 'Fireworks AI',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/gpt-oss-120b',
    keysUrl: 'https://app.fireworks.ai/settings/users/api-keys',
    modelsUrl: 'https://fireworks.ai/models',
  },
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    keysUrl: 'https://console.groq.com/keys',
    modelsUrl: 'https://console.groq.com/docs/models',
  },
} as const;

export type AiProvider = keyof typeof AI_PROVIDERS;
export type AiCredentials = { provider: AiProvider; apiKey: string; model: string };
export type AiConnectionSummary = {
  available: boolean;
  configured: boolean;
  enabled: boolean;
  provider: AiProvider | null;
  model: string;
  keyHint: string;
};

export function isAiProvider(value: unknown): value is AiProvider {
  return typeof value === 'string' && Object.hasOwn(AI_PROVIDERS, value);
}

export function validateAiConnection(provider: unknown, model: unknown, apiKey?: unknown) {
  if (!isAiProvider(provider)) throw new Error('Choose a supported AI provider.');
  if (typeof model !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.:/@-]{0,199}$/.test(model)) {
    throw new Error('Enter a valid model ID from your provider.');
  }
  if (apiKey !== undefined && (typeof apiKey !== 'string' || apiKey.length < 10 || apiKey.length > 512 || /\s/.test(apiKey))) {
    throw new Error('Enter a valid API key without spaces.');
  }
}
