import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping runner requires the source extension.
import { freshSubtasks, parseSubtasks, validateSubtasks } from './homework-subtasks.ts';

const steps = [
  { id: 'photos', title: 'Choose photos', completed: true },
  { id: 'captions', title: 'Write captions', completed: false },
];

test('legacy tasks without a checklist load safely', () => {
  for (const value of [null, undefined, {}, '[]']) assert.deepEqual(parseSubtasks(value), []);
});

test('round-trip preserves completion, order and stable identifiers', () => {
  assert.deepEqual(parseSubtasks(JSON.parse(JSON.stringify(steps))), steps);
});

test('blank titles, duplicate IDs and malformed completion cannot be saved', () => {
  assert.throws(() => validateSubtasks([{ ...steps[0], title: ' \n\t ' }]));
  assert.throws(() => validateSubtasks([steps[0], steps[0]]));
  assert.throws(() => validateSubtasks([{ ...steps[0], completed: 'false' as unknown as boolean }]));
  assert.throws(() => validateSubtasks([{ ...steps[0], id: '' }]));
});

test('limits accept their boundaries and reject oversized drafts', () => {
  assert.equal(validateSubtasks([{ ...steps[0], title: 'x'.repeat(200) }])[0].title.length, 200);
  assert.throws(() => validateSubtasks([{ ...steps[0], title: 'x'.repeat(201) }]));
  const many = Array.from({ length: 100 }, (_, i) => ({ id: String(i), title: 'Step', completed: false }));
  assert.equal(validateSubtasks(many).length, 100);
  assert.throws(() => validateSubtasks([...many, { id: 'extra', title: 'Extra', completed: false }]));
});

test('recurring checklists have independent identities and reset completion without mutating the template', () => {
  const first = freshSubtasks(steps);
  const second = freshSubtasks(steps);
  assert.deepEqual(first.map(step => step.title), steps.map(step => step.title));
  assert.ok(first.every(step => !step.completed));
  assert.ok(first.every((step, index) => step.id !== steps[index].id && step.id !== second[index].id));
  first[0].completed = true;
  assert.equal(second[0].completed, false);
  assert.equal(steps[0].completed, true);
});
