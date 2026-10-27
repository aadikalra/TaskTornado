import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping runner requires the source extension.
import { AI_PROVIDERS, isAiProvider, validateAiConnection } from './providers.ts';
// @ts-expect-error Node's type-stripping runner requires the source extension.
import { encryptAiKey, decryptAiKey, hasAiKeyEncryption } from './key-encryption.ts';
// @ts-expect-error Node's type-stripping runner requires the source extension.
import { completeWithPersonalKey, ProviderRequestError } from './provider-client.ts';
// @ts-expect-error Node's type-stripping runner requires the source extension.
import { FREE_LIMITS, getPlanTier } from '../planTier.ts';
import type { AiProvider } from './providers';

test('keys are encrypted with random IVs and bound to an account and provider', () => {
  const previous = process.env.AI_KEY_ENCRYPTION_KEY;
  process.env.AI_KEY_ENCRYPTION_KEY = 'a'.repeat(64);
  try {
    const first = encryptAiKey('personal-secret-key', 'student-1:groq');
    const second = encryptAiKey('personal-secret-key', 'student-1:groq');
    assert.notEqual(first, second);
    assert.ok(!first.includes('personal-secret-key'));
    assert.equal(decryptAiKey(first, 'student-1:groq'), 'personal-secret-key');
    assert.throws(() => decryptAiKey(first, 'student-2:groq'));
    assert.throws(() => decryptAiKey(first, 'student-1:openrouter'));
    const parts = first.split('.');
    parts[3] = Buffer.from('tampered').toString('base64');
    assert.throws(() => decryptAiKey(parts.join('.'), 'student-1:groq'));
  } finally {
    if (previous === undefined) delete process.env.AI_KEY_ENCRYPTION_KEY;
    else process.env.AI_KEY_ENCRYPTION_KEY = previous;
  }
});

test('missing or malformed encryption secrets fail closed', () => {
  const previous = process.env.AI_KEY_ENCRYPTION_KEY;
  try {
    for (const invalid of ['', 'short', 'z'.repeat(64)]) {
      process.env.AI_KEY_ENCRYPTION_KEY = invalid;
      assert.equal(hasAiKeyEncryption(), false);
      assert.throws(() => encryptAiKey('secret', 'account:groq'), /not configured/);
    }
  } finally {
    if (previous === undefined) delete process.env.AI_KEY_ENCRYPTION_KEY;
    else process.env.AI_KEY_ENCRYPTION_KEY = previous;
  }
});

test('connection validation rejects arbitrary hosts, inherited provider names, and malformed inputs', () => {
  assert.equal(isAiProvider('__proto__'), false);
  assert.equal(isAiProvider('https://attacker.example'), false);
  assert.throws(() => validateAiConnection('custom', 'model', 'valid-secret-key'));
  assert.throws(() => validateAiConnection('groq', 'model\ninjection', 'valid-secret-key'));
  assert.throws(() => validateAiConnection('groq', 'model', 'key with spaces'));
  assert.throws(() => validateAiConnection('groq', 'model', 'short'));
  validateAiConnection('openrouter', 'openai/gpt-oss-20b:free', 'valid-secret-key');
});

for (const provider of Object.keys(AI_PROVIDERS) as AiProvider[]) {
  test(`${provider} sends the personal key and selected model only to its fixed provider`, async () => {
    let requests = 0;
    const result = await completeWithPersonalKey({
      credentials: { provider, apiKey: 'personal-secret-key', model: AI_PROVIDERS[provider].defaultModel },
      messages: [{ role: 'user', content: 'Explain gravity.' }],
      tools: [{ type: 'function', function: { name: 'get_school_data', description: 'Read school data', parameters: { type: 'object', properties: {} } } }],
      jsonMode: true,
    }, async (url, request) => {
      requests++;
      assert.equal(url, `${AI_PROVIDERS[provider].baseUrl}/chat/completions`);
      assert.equal((request?.headers as Record<string, string>).Authorization, 'Bearer personal-secret-key');
      assert.equal(request?.redirect, 'error');
      assert.equal(request?.cache, 'no-store');
      const body = JSON.parse(request?.body as string);
      assert.equal(body.model, AI_PROVIDERS[provider].defaultModel);
      assert.equal(body.tools[0].function.name, 'get_school_data');
      assert.equal(body.response_format.type, 'json_object');
      assert.equal(body[provider === 'groq' ? 'max_completion_tokens' : 'max_tokens'], 3500);
      return Response.json({ choices: [{ message: { content: null, tool_calls: [{ id: 'call-1', type: 'function', function: { name: 'get_school_data', arguments: '{}' } }] } }], usage: { total_tokens: 12 } });
    });
    assert.equal(requests, 1);
    assert.equal(result.toolCalls[0].function.name, 'get_school_data');
    assert.equal(result.usage.total_tokens, 12);
  });
}

test('provider errors are sanitized and never retry with a hosted key', async () => {
  for (const status of [400, 401, 402, 403, 404, 422, 429, 500]) {
    let requests = 0;
    await assert.rejects(completeWithPersonalKey({
      credentials: { provider: 'groq', apiKey: 'private-key', model: 'user-model' },
      messages: [{ role: 'user', content: 'private-prompt' }],
    }, async () => {
      requests++;
      return Response.json({ error: { message: 'private-key private-prompt' } }, { status });
    }), (error: unknown) => {
      assert.ok(error instanceof ProviderRequestError);
      assert.ok(!error.message.includes('private-key'));
      assert.ok(!error.message.includes('private-prompt'));
      return true;
    });
    assert.equal(requests, 1);
  }
});

test('malformed provider responses fail clearly', async () => {
  await assert.rejects(completeWithPersonalKey({
    credentials: { provider: 'openrouter', apiKey: 'private-key', model: 'model' },
    messages: [],
  }, async () => Response.json({ choices: [] })), /invalid response/);
});

test('legacy paid cookies cannot change the free plan or storage limits', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { cookie: 'taskTornadoPlanTier=family' } });
  try {
    assert.equal(getPlanTier(), 'free');
    assert.equal(FREE_LIMITS.homeworkEntries, 20);
    assert.equal(FREE_LIMITS.activeTests, 10);
    assert.equal(FREE_LIMITS.flashcardStorage, 20);
    assert.equal(FREE_LIMITS.webSaves, 5);
    assert.equal(FREE_LIMITS.translationsPerDay, 5);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});
