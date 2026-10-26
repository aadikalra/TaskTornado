// @ts-expect-error Node's type-stripping test runner requires the source extension.
import { AI_PROVIDERS } from './providers.ts';
import type { AiCredentials } from './providers';
import type { GroqCompletion, GroqMessage, GroqTool } from './groq';

export class ProviderRequestError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ProviderRequestError';
    this.status = status;
  }
}

export async function completeWithPersonalKey(options: {
  credentials: AiCredentials;
  messages: GroqMessage[];
  tools?: GroqTool[];
  toolChoice?: 'auto' | 'none';
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  signal?: AbortSignal;
}, fetcher: typeof fetch = fetch): Promise<GroqCompletion> {
  const { credentials } = options;
  const provider = AI_PROVIDERS[credentials.provider];
  // Fixed HTTPS origins prevent credentials being sent to arbitrary hosts.
  const response = await fetcher(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    redirect: 'error',
    headers: { Authorization: `Bearer ${credentials.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: credentials.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.4,
      ...(credentials.provider === 'groq'
        ? { max_completion_tokens: options.maxTokens ?? 3500 }
        : { max_tokens: options.maxTokens ?? 3500 }),
      ...(options.tools?.length ? { tools: options.tools, tool_choice: options.toolChoice ?? 'auto' } : { tool_choice: 'none' }),
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      ...(credentials.provider === 'openrouter' ? { provider: { require_parameters: true } } : {}),
    }),
    cache: 'no-store',
    signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(60_000)]) : AbortSignal.timeout(60_000),
  });
  // Provider errors may echo credentials or prompts: never forward their bodies.
  if (!response.ok) {
    const message = response.status === 401 || response.status === 403
      ? `${provider.name} rejected your API key. Update it in AI settings.`
      : response.status === 402
        ? `${provider.name} needs credits. Check your provider account.`
        : response.status === 429
          ? `${provider.name} is rate limiting your key. Try again shortly.`
          : response.status === 400 || response.status === 404 || response.status === 422
            ? `${provider.name} could not use this model. Check the model ID and its tool-calling support in AI settings.`
            : `${provider.name} is temporarily unavailable. Your free allowance was not used.`;
    throw new ProviderRequestError(message, response.status >= 500 ? 502 : response.status);
  }
  const result = await response.json().catch(() => null);
  const message = result?.choices?.[0]?.message;
  if (!message || (typeof message.content !== 'string' && !Array.isArray(message.tool_calls))) {
    throw new ProviderRequestError(`${provider.name} returned an invalid response. Try another model.`, 502);
  }
  return {
    content: typeof message.content === 'string' ? message.content : '',
    model: typeof result.model === 'string' ? result.model : credentials.model,
    toolCalls: Array.isArray(message.tool_calls) ? message.tool_calls : [],
    usage: result.usage || {},
  };
}
