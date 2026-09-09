import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping test runner requires the source extension.
import { matchGoogleClassroomCourse, parseGoogleClassroomAssignment, parseGoogleClassroomDueDate } from './google-classroom-import.ts';

const importDate = new Date(2026, 7, 29, 9, 30);

test('parses a Classroom assignment block and ignores surrounding navigation', () => {
  const result = parseGoogleClassroomAssignment([
    'Google Classroom',
    'Classes',
    'Español 2',
    'Sexta Hora',
    'Stream',
    'Classwork',
    'People',
    'Assignment details',
    'assignment',
    'Mi película poster',
    'Bianca Luna',
    'Yesterday',
    '100 points',
    'Due Tomorrow',
    'Create a poster for your película.',
    'Mi película poster template',
    'Google Docs',
    'Your work',
    'Assigned',
    'Class comments',
    'Add class comment',
  ].join('\n'), '', importDate);

  assert.equal(result.recognized, true);
  assert.equal(result.title, 'Mi película poster');
  assert.equal(result.teacher, 'Bianca Luna');
  assert.equal(result.course, 'Español 2');
  assert.equal(result.section, 'Sexta Hora');
  assert.equal(result.points, 100);
  assert.deepEqual(
    result.dueDate && [result.dueDate.getFullYear(), result.dueDate.getMonth(), result.dueDate.getDate()],
    [2026, 7, 30],
  );
  assert.equal(result.description, 'Create a poster for your película.');
  assert.equal(result.status, 'Assigned');
  assert.deepEqual(result.attachments, [{
    name: 'Mi película poster template',
    type: 'google-doc',
  }]);
});

test('extracts safe attachment and source URLs from clipboard HTML', () => {
  const plainText = [
    'Assignment details',
    'assignment',
    'CCC Ambassadors Application',
    'Taunie Womeldorf',
    'Aug 27',
    '100 points',
    'Due Sep 1',
    'Please fill out this application and have it submitted by Sept. 1st.',
    'CCC Ambassadors Application form',
    'Google Forms',
    'Your work',
    'Assigned',
  ].join('\n');
  const html = [
    '<a href="https://classroom.google.com/u/0/h">Home</a>',
    '<a href="https://classroom.google.com/u/0/c/course123/a/assignment456/details">CCC Ambassadors Application</a>',
    '<a href="https://docs.google.com/forms/d/e/form789/viewform?usp=sharing">',
    '<div>CCC Ambassadors Application form</div><div>Google Forms</div></a>',
    '<a href="javascript:alert(1)">Bad link</a>',
  ].join('');

  const result = parseGoogleClassroomAssignment(plainText, html, importDate);

  assert.equal(result.sourceUrl, 'https://classroom.google.com/u/0/c/course123/a/assignment456/details');
  assert.equal(result.description, 'Please fill out this application and have it submitted by Sept. 1st.');
  assert.deepEqual(result.attachments, [{
    name: 'CCC Ambassadors Application form',
    type: 'google-form',
    url: 'https://docs.google.com/forms/d/e/form789/viewform?usp=sharing',
  }]);
});

test('uses plain-text URLs when clipboard HTML is unavailable', () => {
  const result = parseGoogleClassroomAssignment([
    'Assignment details',
    'assignment',
    'Read chapter 4',
    'Alex Teacher',
    'Aug 29',
    'Due Tuesday',
    'Read and annotate the chapter.',
    'Chapter 4',
    'https://drive.google.com/file/d/file123/view',
    'Your work',
    'Assigned',
  ].join('\n'), '', importDate);

  assert.equal(result.title, 'Read chapter 4');
  assert.deepEqual(result.attachments, [{
    name: 'Chapter 4',
    type: 'google-drive',
    url: 'https://drive.google.com/file/d/file123/view',
  }]);
  assert.deepEqual(
    result.dueDate && [result.dueDate.getFullYear(), result.dueDate.getMonth(), result.dueDate.getDate()],
    [2026, 8, 1],
  );
});

test('resolves relative, weekday, short, and explicit due dates', () => {
  const dateParts = (value: Date | undefined) => value && [value.getFullYear(), value.getMonth(), value.getDate()];

  assert.deepEqual(dateParts(parseGoogleClassroomDueDate('Due Tomorrow', importDate)), [2026, 7, 30]);
  assert.deepEqual(dateParts(parseGoogleClassroomDueDate('Tuesday', importDate)), [2026, 8, 1]);
  assert.deepEqual(dateParts(parseGoogleClassroomDueDate('Sep 1, 11:59 PM', importDate)), [2026, 8, 1]);
  assert.deepEqual(dateParts(parseGoogleClassroomDueDate('Jan 3', new Date(2026, 11, 30))), [2027, 0, 3]);
  assert.deepEqual(dateParts(parseGoogleClassroomDueDate('Sep 1, 2027', importDate)), [2027, 8, 1]);
});

test('matches an imported course only when there is a confident existing class match', () => {
  const classes = [
    { id: 'spanish', name: 'Español 2 — Sexta Hora' },
    { id: 'english', name: 'English 9' },
  ];

  assert.equal(matchGoogleClassroomCourse({ course: 'Español 2', section: 'Sexta Hora' }, classes)?.id, 'spanish');
  assert.equal(matchGoogleClassroomCourse({ course: 'Biology', section: undefined }, classes), undefined);
});

test('does not treat arbitrary pasted page text as an assignment', () => {
  const result = parseGoogleClassroomAssignment('Home\nClasses\nCalendar\nSettings', '', importDate);

  assert.equal(result.recognized, false);
  assert.equal(result.title, undefined);
  assert.equal(result.description, undefined);
});

test('does not mistake instructions for a missing teacher or pre-marker metadata for assignment data', () => {
  const result = parseGoogleClassroomAssignment([
    '100 points',
    'Due Today',
    'Assignment details',
    'assignment',
    'Independent reading',
    'Due Tomorrow',
    'Read pages 10–20 and take notes.',
    'Your work',
    'Assigned',
  ].join('\n'), '', importDate);

  assert.equal(result.teacher, undefined);
  assert.equal(result.points, undefined);
  assert.equal(result.dueLabel, 'Tomorrow');
  assert.equal(result.description, 'Read pages 10–20 and take notes.');
});

test('parses the accessibility clipboard order with Assignment details at the end', () => {
  const plainText = [
    'Skip to main content',
    'Classroom',
    'Yearbook',
    'Bring your SD card to class 9/10',
    'Alissa Riggs',
    'Sep 4',
    'Due Sep 10',
    'We will be uploading and reviewing the photos from 9/4 AND we may have some additional photography practice time, so make sure you are prepared! (You are welcome to bring a camera from home as well.)',
    "Don't submit anything on this assignment, just bring the SD card to class :)",
    'Class comments',
    'Your work',
    'Assigned',
    'Work cannot be turned in after the due date',
    'Private comments',
    'Assignment details',
  ].join('\n');
  const html = '<a href="https://classroom.google.com/u/1/h">Classroom</a>'
    + '<a href="https://classroom.google.com/u/1/c/ODcxOTgzNjc5MDgx">Yearbook</a>';

  const result = parseGoogleClassroomAssignment(plainText, html, new Date(2026, 8, 7));

  assert.equal(result.recognized, true);
  assert.equal(result.title, 'Bring your SD card to class 9/10');
  assert.equal(result.teacher, 'Alissa Riggs');
  assert.equal(result.course, 'Yearbook');
  assert.equal(result.dueLabel, 'Sep 10');
  assert.deepEqual(
    result.dueDate && [result.dueDate.getFullYear(), result.dueDate.getMonth(), result.dueDate.getDate()],
    [2026, 8, 10],
  );
  assert.equal(result.description, [
    'We will be uploading and reviewing the photos from 9/4 AND we may have some additional photography practice time, so make sure you are prepared! (You are welcome to bring a camera from home as well.)',
    "Don't submit anything on this assignment, just bring the SD card to class :)",
  ].join('\n'));
  assert.equal(result.status, 'Assigned');
});

test('accepts a Markdown-serialized Classroom assignment paste', () => {
  const result = parseGoogleClassroomAssignment([
    'Skip to main content',
    '# [Classroom](https://classroom.google.com/u/1/h)[Yearbook](https://classroom.google.com/u/1/c/course123)',
    '1.',
    '2.',
    '3.',
    '# Bring your SD card to class 9/10',
    '**Alissa Riggs**',
    '**Sep 4**',
    '**Due Sep 10**',
    'Bring the SD card to class.',
    '## Class comments',
    '## Your work',
    '**Assigned**',
    '## Private comments',
    'Assignment details',
  ].join('\n'), '', new Date(2026, 8, 7));

  assert.equal(result.title, 'Bring your SD card to class 9/10');
  assert.equal(result.teacher, 'Alissa Riggs');
  assert.equal(result.course, 'Yearbook');
  assert.equal(result.dueLabel, 'Sep 10');
  assert.equal(result.description, 'Bring the SD card to class.');
});
