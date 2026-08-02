import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping test runner requires the source extension.
import { parseSmartGradeText } from './smart-grade-parser.ts';

const gradebookRow = (category: 'Practice' | 'Assessment', name: string, score: string) =>
    `04/20/2026\t${category}\t${name}\tcollected\tlate\tmissing\texempt from final grade\tabsent\tincomplete\texcluded from final grade\t${score}\tA`;

test('parses the Creative Writing export without turning the -- row date into 4/21', () => {
    const practiceScores = [
        '47.5/50', '27.5/50', '9.5/10', '9.5/10', '9.5/10', '9.5/10',
        '9.5/10', '9.5/10', '9.5/10', '9.5/10', '23.75/25', '0/25',
        '23.75/25', '23.75/25', '19/20', '9.5/10', '23.75/25', '9.5/10',
        '9.5/10', '5.5/10', '9.5/10', '0/25', '0/10', '9.5/10', '9.5/10',
        '7.5/10', '9.5/10', '9.5/10', '9.5/10', '9.5/10', '9.5/10',
        '9.5/10', '9.5/10',
    ];
    const creativeWritingPaste = [
        'Assignments',
        'Due Date\tCategory\tAssignment\tFlags\tScore\tGrade',
        ...practiceScores.map((score, index) => gradebookRow('Practice', `Practice assignment ${index + 1}`, score)),
        '04/21/2026\tPractice\tPeer Review of Video\tcollected\tlate\tmissing\texempt from final grade\tabsent\tincomplete\texcluded from final grade\t--/20\t',
        ...Array.from({ length: 5 }, (_, index) => gradebookRow('Assessment', `Portfolio ${index + 1}`, '47.5/50')),
        'Grade stored on: 06/08/2026',
    ].join('\n');

    const result = parseSmartGradeText(creativeWritingPaste);
    const practice = result.assignments.filter(item => item.category === 'practice');
    const assessments = result.assignments.filter(item => item.category === 'assessment');

    assert.equal(result.skippedUngraded, 1);
    assert.equal(result.assignments.length, 38);
    assert.equal(practice.length, 33);
    assert.equal(assessments.length, 5);
    assert.equal(assessments.reduce((sum, item) => sum + item.pointsEarned, 0), 237.5);
    assert.equal(assessments.reduce((sum, item) => sum + item.pointsPossible, 0), 250);

    const practicePercent =
        practice.reduce((sum, item) => sum + item.pointsEarned, 0) /
        practice.reduce((sum, item) => sum + item.pointsPossible, 0) *
        100;
    const assessmentPercent =
        assessments.reduce((sum, item) => sum + item.pointsEarned, 0) /
        assessments.reduce((sum, item) => sum + item.pointsPossible, 0) *
        100;
    const weightedGrade = practicePercent * 0.2 + assessmentPercent * 0.8;

    assert.equal(Number(weightedGrade.toFixed(1)), 91.7);
    assert.equal(result.assignments.some(item => item.name === 'Assignment' && item.pointsEarned === 4 && item.pointsPossible === 21), false);
});

test('keeps zero scores but skips explicit ungraded placeholders', () => {
    const result = parseSmartGradeText([
        'Practice\tMissing work\t0/25',
        'Practice\tNot graded yet\t--/20',
        'Quiz 1: 18/20',
    ].join('\n'));

    assert.deepEqual(result.assignments.map(({ name, pointsEarned, pointsPossible }) => ({
        name,
        pointsEarned,
        pointsPossible,
    })), [
        { name: 'Missing work', pointsEarned: 0, pointsPossible: 25 },
        { name: 'Quiz 1', pointsEarned: 18, pointsPossible: 20 },
    ]);
    assert.equal(result.skippedUngraded, 1);
});

test('does not parse dates as scores and supports percentages', () => {
    const result = parseSmartGradeText([
        '04/21/2026 Practice Peer Review --/20',
        'Essay draft 92%',
    ].join('\n'));

    assert.deepEqual(result.assignments, [{
        name: 'Essay draft',
        category: 'practice',
        pointsEarned: 92,
        pointsPossible: 100,
    }]);
    assert.equal(result.skippedUngraded, 1);
});

test('replaces original PowerSchool points with parenthetical weighted points', () => {
    const weightedRows = [
        ['Weighted practice 1', '14/15', '28/30', '2'],
        ['Weighted practice 2', '24/24', '12/12', '0.5'],
        ['Weighted practice 3', '14/15', '28/30', '2'],
        ['Weighted practice 4', '13/14', '6.5/7', '0.5'],
        ['Weighted practice 5', '20/20', '40/40', '2'],
        ['Weighted practice 6', '11.4/12', '45.6/48', '4'],
    ].flatMap(([name, originalScore, weightedScore, multiplier]) => [
        gradebookRow('Practice', name, originalScore),
        `(${weightedScore})`,
        `This assignment is weighted x ${multiplier}. With the weighting, the total points possible is ${weightedScore.split('/')[1]}.`,
    ]);

    const result = parseSmartGradeText([
        ...weightedRows,
        gradebookRow('Practice', 'Other practice work', '196.65/242'),
        gradebookRow('Assessment', 'Assessment total', '250/260'),
    ].join('\n'));
    const practice = result.assignments.filter(item => item.category === 'practice');
    const assessments = result.assignments.filter(item => item.category === 'assessment');
    const sum = (items: typeof result.assignments, key: 'pointsEarned' | 'pointsPossible') =>
        items.reduce((total, item) => total + item[key], 0);
    const percentage = (items: typeof result.assignments) =>
        sum(items, 'pointsEarned') / sum(items, 'pointsPossible') * 100;
    const weightedFinal = percentage(practice) * 0.15 + percentage(assessments) * 0.85;

    assert.equal(result.assignments.length, 8);
    assert.equal(sum(practice, 'pointsEarned'), 356.75);
    assert.equal(sum(practice, 'pointsPossible'), 409);
    assert.equal(sum(assessments, 'pointsEarned'), 250);
    assert.equal(sum(assessments, 'pointsPossible'), 260);
    assert.equal(Number(weightedFinal.toFixed(1)), 94.8);
    assert.equal(result.assignments.some(item => item.name === '('), false);
});
