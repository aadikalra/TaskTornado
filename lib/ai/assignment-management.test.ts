import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping runner needs the source extension.
import { executeAssignmentManagement, summarizeAssignmentManagement } from './assignment-management.ts';

const biologyId = '11111111-1111-4111-8111-111111111111';
const englishId = '22222222-2222-4222-8222-222222222222';
const classId = '33333333-3333-4333-8333-333333333333';
const missingId = '44444444-4444-4444-8444-444444444444';
const foreignId = '55555555-5555-4555-8555-555555555555';

function fixture() {
  const writes: Array<{ action: string; id: string; updates?: Record<string, unknown> }> = [];
  return {
    writes,
    dependencies: {
      userId: 'student-1',
      homeworks: [
        { id: biologyId, title: 'Biology lab report', user_id: 'student-1' },
        { id: englishId, title: 'English essay', user_id: 'student-1' },
        { id: foreignId, title: 'Another student’s assignment', user_id: 'student-2' },
      ],
      classIds: [classId],
      updateHomework: async (id: string, updates: Record<string, unknown>) => { writes.push({ action: 'edit', id, updates }); },
      deleteHomework: async (id: string) => { writes.push({ action: 'delete', id }); },
    },
  };
}

test('edits and deletes the exact requested assignments, preserving omitted fields', async () => {
  const { writes, dependencies } = fixture();
  const results = await executeAssignmentManagement({ operations: [
    { action: 'edit', homeworkId: biologyId, updates: { title: 'Final lab report', priority: 'high', description: '', completed: false, classId } },
    { action: 'delete', homeworkId: englishId },
  ] }, dependencies);
  assert.deepEqual(writes, [
    { action: 'edit', id: biologyId, updates: { title: 'Final lab report', priority: 'high', description: '', completed: false, classId } },
    { action: 'delete', id: englishId },
  ]);
  assert.ok(!Object.hasOwn(writes[0].updates!, 'dueDate'));
  assert.ok(results.every((result) => result.status === 'success'));
  assert.match(summarizeAssignmentManagement(results), /Updated “Biology lab report”/);
  assert.match(summarizeAssignmentManagement(results), /Deleted “English essay”/);
});

test('rescheduling preserves the requested calendar day in the student’s timezone', async () => {
  const { writes, dependencies } = fixture();
  await executeAssignmentManagement({ operations: [
    { action: 'edit', homeworkId: biologyId, updates: { dueDate: '2026-10-27' } },
  ] }, dependencies);
  const dueDate = new Date(writes[0].updates!.dueDate as string);
  assert.equal(dueDate.getFullYear(), 2026);
  assert.equal(dueDate.getMonth(), 9);
  assert.equal(dueDate.getDate(), 27);
  assert.equal(dueDate.getHours(), 12);
  assert.deepEqual(Object.keys(writes[0].updates!), ['dueDate']);
});

test('rejects invalid dates, empty edits, extra fields, and duplicate targets before writing', async () => {
  const invalidInputs = [
    { operations: [{ action: 'edit', homeworkId: biologyId, updates: { dueDate: '2026-02-30' } }] },
    { operations: [{ action: 'edit', homeworkId: biologyId, updates: { title: '  ' } }] },
    { operations: [{ action: 'edit', homeworkId: biologyId, updates: {} }] },
    { operations: [{ action: 'edit', homeworkId: biologyId, updates: { user_id: 'student-2' } }] },
    { operations: [{ action: 'delete', homeworkId: 'Biology lab report' }] },
    { operations: [{ action: 'delete', homeworkId: biologyId, updates: { completed: true } }] },
    { operations: [{ action: 'delete', homeworkId: biologyId }, { action: 'delete', homeworkId: biologyId }] },
    { operations: [{ action: 'delete', homeworkId: biologyId }, { action: 'edit', homeworkId: englishId, updates: { dueDate: 'tomorrow' } }] },
  ];
  for (const input of invalidInputs) {
    const { writes, dependencies } = fixture();
    await assert.rejects(executeAssignmentManagement(input, dependencies));
    assert.equal(writes.length, 0);
  }
});

test('missing assignments, other users’ assignments, and unknown classes cannot be modified', async () => {
  const { writes, dependencies } = fixture();
  const results = await executeAssignmentManagement({ operations: [
    { action: 'delete', homeworkId: missingId },
    { action: 'delete', homeworkId: foreignId },
    { action: 'edit', homeworkId: biologyId, updates: { classId: missingId } },
  ] }, dependencies);
  assert.equal(writes.length, 0);
  assert.ok(results.every((result) => result.status === 'error'));
  assert.ok(!summarizeAssignmentManagement(results).includes('Deleted'));
});

test('database failures are reported per assignment while remaining operations can succeed', async () => {
  const { writes, dependencies } = fixture();
  dependencies.updateHomework = async () => { throw new Error('Connection lost. Please try again.'); };
  const results = await executeAssignmentManagement({ operations: [
    { action: 'edit', homeworkId: biologyId, updates: { completed: true } },
    { action: 'delete', homeworkId: englishId },
  ] }, dependencies);
  assert.deepEqual(writes, [{ action: 'delete', id: englishId }]);
  assert.equal(results[0].status, 'error');
  assert.equal(results[1].status, 'success');
  const summary = summarizeAssignmentManagement(results);
  assert.match(summary, /Couldn’t edit “Biology lab report”: Connection lost/);
  assert.match(summary, /Deleted “English essay”/);
  assert.ok(!summary.includes('Updated'));
});
