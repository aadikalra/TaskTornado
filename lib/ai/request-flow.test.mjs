import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';
import { z } from 'zod';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// Execute the real server modules with isolated auth/database/provider boundaries.
// No test uses account credentials, external AI requests, or a live database.
async function loadServerModule(path, mocks) {
  const cache = new Map();
  async function dependency(specifier, parent = root) {
    if (mocks[specifier]) {
      const exports = mocks[specifier];
      const module = new SyntheticModule(Object.keys(exports), function () {
        for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
      });
      return module;
    }
    if (specifier.startsWith('node:')) {
      const exports = await import(specifier);
      return new SyntheticModule(Object.keys(exports), function () {
        for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
      });
    }
    let file = specifier.startsWith('@/') ? resolve(root, specifier.slice(2)) : resolve(parent, specifier);
    if (!file.endsWith('.ts')) file += '.ts';
    if (cache.has(file)) return cache.get(file);
    const source = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText;
    const module = new SourceTextModule(source, { identifier: file });
    cache.set(file, module);
    await module.link((child) => dependency(child, dirname(file)));
    return module;
  }
  const module = await dependency(`@/${path}`);
  await module.evaluate();
  return module.namespace;
}

const eligible = { ok: true, user: { id: 'student-1', app_metadata: { plan_tier: 'family' } }, accessToken: 'session-token' };
const credentials = { provider: 'openrouter', model: 'chosen-model', apiKey: 'personal-secret' };
const request = () => new Request('https://tasktornado.test/api/ai', { method: 'POST' });

async function authorizer({ own = false, denied = false, burstDenied = false, brokenKey = false } = {}) {
  const calls = [];
  const module = await loadServerModule('lib/ai/http.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/api/request-guard': { guardAiRequest: async () => denied ? { ok: false, response: Response.json({ error: 'Unauthorized' }, { status: 401 }) } : eligible },
    '@/lib/ai/byok': { getAiConnection: async (_userId, purpose) => {
      calls.push(['connection', purpose]);
      if (brokenKey) throw new Error('Save your key again.');
      return { credentials: own ? credentials : undefined };
    } },
    '@/lib/ai/provider-client': { ProviderRequestError: class extends Error {} },
    '@/lib/ai/quota': {
      reserveAiBurst: async () => { calls.push(['burst']); return { allowed: !burstDenied, source: 'database', reason: 'Too many requests.' }; },
      reserveAiQuota: async (...args) => { calls.push(['quota', ...args]); return { allowed: true, source: 'database' }; },
      recordAiUsage: async (...args) => { calls.push(['record', ...args]); },
    },
  });
  return { module, calls };
}

test('personal-key requests bypass daily quota and hosted metrics but retain burst limits', async () => {
  const { module, calls } = await authorizer({ own: true });
  const access = await module.authorizeAiAction(request(), 'quick');
  assert.equal(access.ok, true);
  assert.equal(access.credentials.apiKey, credentials.apiKey);
  assert.equal(access.quota.source, 'personal-key');
  await module.recordRequestAiUsage(access, 'quick', 'chosen-model', 10, 20);
  assert.ok(calls.some(([name]) => name === 'burst'));
  assert.ok(!calls.some(([name]) => name === 'quota' || name === 'record'));
});

test('hosted requests always use free limits even with legacy paid metadata', async () => {
  const { module, calls } = await authorizer();
  const access = await module.authorizeAiAction(request(), 'tutor');
  assert.equal(access.tier, 'free');
  assert.equal(access.credentials, undefined);
  assert.deepEqual(calls.find(([name]) => name === 'quota'), ['quota', 'student-1', 'tutor', 'free', 'session-token']);
  await module.recordRequestAiUsage(access, 'tutor', 'hosted-model', 10, 20);
  assert.deepEqual(calls.find(([name]) => name === 'record'), ['record', 'tutor', 'hosted-model', 10, 20, 'session-token']);
});

test('personal keys cannot bypass authentication or burst limits', async () => {
  for (const options of [{ own: true, denied: true }, { own: true, burstDenied: true }]) {
    const { module, calls } = await authorizer(options);
    const access = await module.authorizeAiAction(request(), 'quick');
    assert.equal(access.ok, false);
    assert.equal(access.response.status, options.denied ? 401 : 429);
    assert.ok(!calls.some(([name]) => name === 'quota'));
    if (options.denied) assert.equal(calls.length, 0);
  }
});

test('unreadable personal keys fail without reserving free capacity', async () => {
  const { module, calls } = await authorizer({ brokenKey: true });
  const access = await module.authorizeAiAction(request(), 'quick');
  assert.equal(access.response.status, 503);
  assert.ok(!calls.some(([name]) => name === 'quota' || name === 'burst'));
});

test('speech authorization selects the transcription connection separately', async () => {
  const { module, calls } = await authorizer({ own: true });
  await module.authorizeAiAction(request(), 'quick', 'transcription');
  assert.deepEqual(calls[0], ['connection', 'transcription']);
});

async function settingsFixture() {
  let row = null;
  const writes = [];
  const owners = [];
  const admin = { from: () => ({
    select() { return this; },
    eq(_field, id) { owners.push(id); return this; },
    maybeSingle: async () => ({ data: row, error: null }),
    upsert: async (value) => { row = value; writes.push(value); return { error: null }; },
    update: (value) => ({ eq: async (_field, id) => { owners.push(id); row = { ...row, ...value }; return { error: null }; } }),
    delete: () => ({ eq: async (_field, id) => { owners.push(id); row = null; return { error: null }; } }),
  }) };
  const mocks = {
    'next/server': { NextResponse: Response },
    '@/lib/api/request-guard': { guardAuthenticatedRequest: async () => eligible },
    '@/lib/supabase/admin': { supabaseAdmin: admin },
  };
  const module = await loadServerModule('app/api/ai/settings/route.ts', mocks);
  const connection = await loadServerModule('lib/ai/byok.ts', mocks);
  return { module, connection, writes, owners };
}

function settingsRequest(method, body, origin) {
  return new Request('https://tasktornado.test/api/ai/settings', {
    method,
    headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

test('saving, toggling, and deleting a connection never returns secrets and always uses the authenticated account', async () => {
  const previous = process.env.AI_KEY_ENCRYPTION_KEY;
  process.env.AI_KEY_ENCRYPTION_KEY = 'b'.repeat(64);
  try {
    const { module, connection, writes, owners } = await settingsFixture();
    const save = await module.PUT(settingsRequest('PUT', {
      user_id: 'another-account', provider: 'groq', model: 'llama-3.3-70b-versatile', apiKey: 'personal-test-secret', enabled: true,
    }));
    assert.equal(save.status, 200);
    const savedText = await save.text();
    assert.ok(!savedText.includes('personal-test-secret'));
    assert.ok(!savedText.includes('encrypted_key'));
    assert.equal(writes[0].user_id, 'student-1');
    assert.ok(!writes[0].encrypted_key.includes('personal-test-secret'));
    assert.equal((await connection.getAiConnection('student-1')).credentials.apiKey, 'personal-test-secret');
    const read = await module.GET(settingsRequest('GET'));
    assert.ok(!(await read.text()).includes('personal-test-secret'));
    await module.PUT(settingsRequest('PUT', { enabled: false }));
    assert.equal((await connection.getAiConnection('student-1')).credentials, undefined);
    await module.PUT(settingsRequest('PUT', { enabled: true }));
    assert.equal((await connection.getAiConnection('student-1')).credentials.apiKey, 'personal-test-secret');
    await module.DELETE(settingsRequest('DELETE'));
    assert.equal((await connection.getAiConnection('student-1')).credentials, undefined);
    assert.ok(owners.every((id) => id === 'student-1'));
  } finally {
    if (previous === undefined) delete process.env.AI_KEY_ENCRYPTION_KEY;
    else process.env.AI_KEY_ENCRYPTION_KEY = previous;
  }
});

test('settings reject cross-origin writes, invalid bodies, and a provider change without a new key', async () => {
  const previous = process.env.AI_KEY_ENCRYPTION_KEY;
  process.env.AI_KEY_ENCRYPTION_KEY = 'b'.repeat(64);
  try {
    const { module } = await settingsFixture();
    assert.equal((await module.PUT(settingsRequest('PUT', {}, 'https://attacker.test'))).status, 403);
    assert.equal((await module.DELETE(settingsRequest('DELETE', undefined, 'https://attacker.test'))).status, 403);
    assert.equal((await module.PUT(settingsRequest('PUT', null))).status, 400);
    assert.equal((await module.PUT(settingsRequest('PUT', { enabled: true }))).status, 400);
    assert.equal((await module.PUT(settingsRequest('PUT', { provider: 'groq', model: 'model', apiKey: 'valid-test-key', enabled: true }))).status, 200);
    assert.equal((await module.PUT(settingsRequest('PUT', { provider: 'openrouter', model: 'model', enabled: true }))).status, 400);
    const raw = new Request('https://tasktornado.test/api/ai/settings', { method: 'PUT', body: '{invalid' });
    assert.equal((await module.PUT(raw)).status, 400);
  } finally {
    if (previous === undefined) delete process.env.AI_KEY_ENCRYPTION_KEY;
    else process.env.AI_KEY_ENCRYPTION_KEY = previous;
  }
});

test('non-Groq connections use hosted speech, and users can disable BYOK after losing the encryption secret', async () => {
  const previous = process.env.AI_KEY_ENCRYPTION_KEY;
  process.env.AI_KEY_ENCRYPTION_KEY = 'b'.repeat(64);
  try {
    const { module, connection } = await settingsFixture();
    await module.PUT(settingsRequest('PUT', { provider: 'openrouter', model: 'model', apiKey: 'valid-test-key', enabled: true }));
    assert.equal((await connection.getAiConnection('student-1', 'transcription')).credentials, undefined);
    delete process.env.AI_KEY_ENCRYPTION_KEY;
    assert.equal((await module.PUT(settingsRequest('PUT', { enabled: false }))).status, 200);
  } finally {
    if (previous === undefined) delete process.env.AI_KEY_ENCRYPTION_KEY;
    else process.env.AI_KEY_ENCRYPTION_KEY = previous;
  }
});

test('connection tests reject foreign origins and use the saved personal key with the shared burst limit', async () => {
  let calls = 0;
  let bursts = 0;
  const module = await loadServerModule('app/api/ai/settings/test/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/api/request-guard': { guardAuthenticatedRequest: async () => eligible },
    '@/lib/ai/byok': { getAiConnection: async () => ({ credentials }) },
    '@/lib/ai/quota': { reserveAiBurst: async () => { bursts++; return { allowed: true }; } },
    '@/lib/ai/provider-client': {
      ProviderRequestError: class extends Error {},
      completeWithPersonalKey: async (options) => { calls++; assert.equal(options.credentials.apiKey, 'personal-secret'); },
    },
  });
  const foreign = new Request('https://tasktornado.test/api/ai/settings/test', { method: 'POST', headers: { Origin: 'https://attacker.test' } });
  assert.equal((await module.POST(foreign)).status, 403);
  assert.equal(calls, 0);
  const valid = new Request('https://tasktornado.test/api/ai/settings/test', { method: 'POST' });
  assert.equal((await module.POST(valid)).status, 200);
  assert.equal(calls, 1);
  assert.equal(bursts, 1);
});

function toolCall(name, args, id = name) {
  return { id, type: 'function', function: { name, arguments: JSON.stringify(args) } };
}

async function chatFixture(messages, respond) {
  const calls = [];
  let reads = 0;
  const module = await loadServerModule('app/api/ai/route.ts', {
    'next/server': { NextResponse: Response },
    'zod': { z },
    '@/lib/ai/groq': {
      GroqRequestError: class extends Error {},
      normalizeGroqMessages: (items, prompt) => items || [{ role: 'user', content: prompt }],
      checkTeenSafety: async () => ({ safe: true }),
      completeWithFallback: async (options) => {
        calls.push(options);
        return { model: 'test-model', content: '', toolCalls: [], usage: {}, ...await respond(options, calls.length) };
      },
    },
    '@/lib/ai/http': {
      authorizeAiAction: async () => eligible,
      recordRequestAiUsage: async () => {},
      aiProviderErrorResponse: () => null,
      createSseResponse: (events) => new Response(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('')),
      textEvents: (content) => [{ response: content, done: false }, { done: true }],
    },
    '@/lib/ai/school-data': { getBoundedSchoolData: async () => {
      reads++;
      return JSON.stringify({ classes: [{ name: 'Biology' }, { name: 'English' }], homework: [], tests: [] });
    } },
    '@/lib/supabase/server': { createClient: async () => ({ from: () => ({ select() { return this; }, eq() { return this; }, limit: async () => ({ data: [{ name: 'Biology' }, { name: 'English' }] }) }) }) },
  });
  const response = await module.POST(new Request('https://tasktornado.test/api/ai', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }),
  }));
  const body = await response.text();
  const events = response.ok ? body.split('\n\n').filter(Boolean).map((line) => JSON.parse(line.slice('data: '.length))) : [];
  return { response, body, events, calls, reads, content: events.map((event) => event.response || '').join('') };
}

test('greetings get a natural text response without exposing clarification or action tools', async () => {
  for (const content of ['hi', 'Hey, Aurora! 👋', 'thank you']) {
    const result = await chatFixture([{ role: 'user', content }], async (options) => {
      assert.equal(options.tools, undefined);
      assert.equal(options.toolChoice, 'none');
      return { content: 'Hi!' };
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.content, 'Hi!');
    assert.ok(!result.events.some((event) => event.toolCall));
  }
});

test('an unsolicited greeting menu is rejected even if the model invents a tool call', async () => {
  const result = await chatFixture([{ role: 'user', content: 'hi' }], async (_options, step) => step === 1 ? {
    toolCalls: [toolCall('ask_user_question', { question: 'Hi! How can I help you today?', options: ['Add homework', 'Add a test'], missing_detail: 'Choose a task.' })],
  } : { content: 'Hey!' });
  assert.equal(result.content, 'Hey!');
  assert.equal(result.calls.length, 2);
  assert.ok(!result.events.some((event) => event.toolCall === 'ask_user_question'));
  assert.ok(!result.body.includes('study summary'));
});

test('a generic action menu is rejected for an answerable explanation request', async () => {
  const result = await chatFixture([{ role: 'user', content: 'Explain photosynthesis' }], async (options, step) => {
    if (step === 1) return { toolCalls: [toolCall('ask_user_question', { question: 'What would you like to do?', options: ['Add homework', 'Plan a study session'], missing_detail: 'Choose an activity.' })] };
    assert.ok(!options.tools?.some((tool) => tool.function.name === 'ask_user_question'));
    return { content: 'Photosynthesis converts light energy into chemical energy.' };
  });
  assert.ok(result.content.startsWith('Photosynthesis'));
  assert.ok(!result.events.some((event) => event.toolCall === 'ask_user_question'));
});

test('genuine missing-class clarification is shown once and saved as the assistant text', async () => {
  const result = await chatFixture([{ role: 'user', content: 'Add my chapter 5 worksheet' }], async () => ({
    toolCalls: [toolCall('ask_user_question', {
      question: 'Which class is the chapter 5 worksheet for?', options: ['Biology', 'English'],
      missing_detail: 'The worksheet has no class, and the student has multiple enrolled classes.',
    })],
  }));
  assert.equal(result.calls.length, 1);
  assert.equal(result.content, 'Which class is the chapter 5 worksheet for?');
  assert.equal(result.events.filter((event) => event.toolCall === 'ask_user_question').length, 1);
  assert.ok(!result.body.includes('study summary'));
});

test('a short clarification answer uses the preceding question to complete the task', async () => {
  const result = await chatFixture([
    { role: 'user', content: 'Add my chapter 5 worksheet' },
    { role: 'assistant', content: 'Which class is the chapter 5 worksheet for?' },
    { role: 'user', content: 'Biology' },
  ], async (options) => {
    assert.ok(options.tools?.some((tool) => tool.function.name === 'add_homework'));
    assert.ok(options.messages.some((message) => message.content === 'Which class is the chapter 5 worksheet for?'));
    return { toolCalls: [toolCall('add_homework', { title: 'Chapter 5 worksheet', className: 'Biology' })] };
  });
  assert.equal(result.calls.length, 1);
  assert.ok(result.events.some((event) => event.toolCall === 'add_homework'));
  assert.ok(!result.events.some((event) => event.toolCall === 'ask_user_question'));
});

test('available school data is retrieved before asking a clarification', async () => {
  const result = await chatFixture([{ role: 'user', content: 'What classes am I enrolled in?' }], async (_options, step) => step === 1 ? {
    toolCalls: [
      toolCall('get_school_data', {}),
      toolCall('ask_user_question', { question: 'Which class do you mean?', options: ['Biology', 'English'], missing_detail: 'The class name is missing.' }),
    ],
  } : { content: 'You are enrolled in Biology and English.' });
  assert.equal(result.reads, 1);
  assert.equal(result.content, 'You are enrolled in Biology and English.');
  assert.ok(!result.events.some((event) => event.toolCall === 'ask_user_question'));
});

test('a complete action takes precedence over an optional preference question', async () => {
  const result = await chatFixture([{ role: 'user', content: 'Make flashcards about photosynthesis' }], async () => ({
    toolCalls: [
      toolCall('ask_user_question', { question: 'What difficulty would you prefer?', options: ['Easy', 'Hard'], missing_detail: 'Difficulty preference.' }),
      toolCall('start_flashcards', { topic: 'Photosynthesis', flashcards: [{ front: 'What is chlorophyll?', back: 'A pigment that absorbs light.' }] }),
    ],
  }));
  assert.equal(result.calls.length, 1);
  assert.ok(result.events.some((event) => event.toolCall === 'start_flashcards'));
  assert.ok(!result.events.some((event) => event.toolCall === 'ask_user_question'));
  assert.equal(result.content, 'Your flashcards are ready.');
});

test('empty responses report a failure instead of claiming a study summary exists', async () => {
  const result = await chatFixture([{ role: 'user', content: 'Explain gravity' }], async () => ({}));
  assert.equal(result.response.status, 502);
  assert.ok(!result.body.includes('study summary'));
});

test('assignment management can follow a targeted school lookup and is prepared without claiming persistence', async () => {
  const homeworkId = '11111111-1111-4111-8111-111111111111';
  const operations = [{ action: 'edit', homeworkId, updates: { dueDate: '2026-10-27', priority: 'high' } }];
  const result = await chatFixture([{ role: 'user', content: 'Move my Biology lab report to Tuesday and mark it high priority' }], async (options, step) => {
    assert.ok(options.tools?.some((tool) => tool.function.name === 'manage_assignments'));
    if (step === 1) return { toolCalls: [toolCall('get_school_data', { homeworkSearch: 'lab report' })] };
    return { content: 'I already updated it!', toolCalls: [toolCall('manage_assignments', { operations }, 'manage-1')] };
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.reads, 1);
  assert.equal(result.calls.length, 2);
  assert.deepEqual(result.events.find((item) => item.toolCall === 'get_school_data').toolArgs, { homeworkSearch: 'lab report' });
  const event = result.events.find((item) => item.toolCall === 'manage_assignments');
  assert.equal(event.toolCallId, 'manage-1');
  assert.deepEqual(event.toolArgs, { operations });
  assert.equal(result.content, 'Updating your assignments…');
  assert.ok(!result.body.includes('I already updated it!'));
});

test('multiple assignment-management calls retain distinct identities', async () => {
  const result = await chatFixture([{ role: 'user', content: 'Delete my Biology lab report and mark my English essay complete' }], async () => ({
    toolCalls: [
      toolCall('manage_assignments', { operations: [{ action: 'delete', homeworkId: '11111111-1111-4111-8111-111111111111' }] }, 'delete-1'),
      toolCall('manage_assignments', { operations: [{ action: 'edit', homeworkId: '22222222-2222-4222-8222-222222222222', updates: { completed: true } }] }, 'edit-1'),
    ],
  }));
  assert.deepEqual(result.events.filter((event) => event.toolCall === 'manage_assignments').map((event) => event.toolCallId), ['delete-1', 'edit-1']);
});

test('invalid assignment mutations are rejected instead of being passed to the app', async () => {
  const result = await chatFixture([{ role: 'user', content: 'Change my Biology homework deadline' }], async (_options, step) => step === 1 ? {
    toolCalls: [toolCall('manage_assignments', { operations: [{ action: 'edit', homeworkId: '11111111-1111-4111-8111-111111111111', updates: { dueDate: '2026-02-30' } }] })],
  } : { content: 'What date should I move it to?' });
  assert.equal(result.response.status, 200);
  assert.ok(!result.events.some((event) => event.toolCall === 'manage_assignments'));
  assert.equal(result.content, 'What date should I move it to?');
});

test('targeted assignment lookups keep user scoping and return stable assignment/class IDs', async () => {
  const filters = [];
  const classId = '33333333-3333-4333-8333-333333333333';
  const homeworkId = '11111111-1111-4111-8111-111111111111';
  const rows = {
    classes: [{ id: classId, name: 'Biology' }],
    homework: [{ id: homeworkId, title: 'Lab_100% report', class_id: classId, due_date: '2026-10-27', description: 'Review the results.', completed: false, priority: 'high' }],
    tests: [],
  };
  const module = await loadServerModule('lib/ai/school-data.ts', {
    '@/lib/supabase/server': { createClient: async (token) => {
      assert.equal(token, 'session-token');
      return { from: (table) => ({
        select() { return this; },
        eq(column, value) { filters.push([table, column, value]); return this; },
        ilike(column, value) { filters.push([table, column, value]); return this; },
        order() { return this; },
        limit: async () => ({ data: rows[table] }),
      }) };
    } },
    '@/lib/ai/school-percentages': { getClassGradePercentage: () => undefined, getScorePercentage: () => undefined },
  });
  const data = JSON.parse(await module.getBoundedSchoolData('student-1', 'session-token', 'Lab_100%'));
  assert.deepEqual(filters, [
    ['homework', 'user_id', 'student-1'],
    ['homework', 'title', '%Lab\\_100\\%%'],
    ['classes', 'user_id', 'student-1'],
    ['tests', 'user_id', 'student-1'],
  ]);
  assert.equal(data.homework[0].id, homeworkId);
  assert.equal(data.homework[0].classId, classId);
  assert.equal(data.classes[0].id, classId);
  assert.equal(data.homework[0].description, 'Review the results.');
});
