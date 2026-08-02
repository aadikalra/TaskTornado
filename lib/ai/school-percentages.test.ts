import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping test runner requires the source extension.
import { getClassGradePercentage, getScorePercentage } from './school-percentages.ts';

test('uses a saved class grade percentage, including zero', () => {
  assert.equal(getClassGradePercentage(94.815, null), 94.8);
  assert.equal(getClassGradePercentage(0, null), 0);
});

test('falls back to the calculated percentage in grade data', () => {
  assert.equal(getClassGradePercentage(null, { finalGrade: 91.74 }), 91.7);
  assert.equal(getClassGradePercentage(null, {}), undefined);
});

test('calculates a test percentage only from a complete valid score', () => {
  assert.equal(getScorePercentage(47.5, 50), 95);
  assert.equal(getScorePercentage(null, 50), undefined);
  assert.equal(getScorePercentage(10, 0), undefined);
});
