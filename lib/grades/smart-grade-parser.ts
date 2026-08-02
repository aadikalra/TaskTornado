export interface ParsedGradeAssignment {
    name: string;
    category: 'practice' | 'assessment';
    pointsEarned: number;
    pointsPossible: number;
}

export interface SmartGradeParseResult {
    assignments: ParsedGradeAssignment[];
    skippedUngraded: number;
}

const DATE_AT_START = /^\s*\d{1,2}\/\d{1,2}\/\d{2,4}\b/;
const UNGRADED_SCORE = /(?:--+|—|–|n\/a)\s*(?:\/|\\over|out\s+of)\s*\d+(?:\.\d+)?/i;
const SCORE_CELL = /^\s*(--+|—|–|n\/a|\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:\/|\\over|out\s+of)\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*$/i;
const SCORE_RATIO = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:\/|\\over|out\s+of)\s*(\d+(?:,\d{3})*(?:\.\d+)?)/gi;
const PERCENT_SCORE = /(\d+(?:\.\d+)?)\s*%(?:\s+[A-FI][+-]?)?\s*$/i;
const PARENTHETICAL_WEIGHTED_SCORE = /^\(\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:\/|\\over|out\s+of)\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*\)$/i;
const WEIGHTING_NOTICE = /\bassignment\s+is\s+weighted\b/i;

const toNumber = (value: string) => Number(value.replaceAll(',', ''));

const inferCategory = (
    explicitCategory: string | undefined,
    assignmentName: string,
): 'practice' | 'assessment' => {
    const normalizedCategory = explicitCategory?.trim().toLowerCase() || '';

    if (/(assessment|test|exam|quiz)/.test(normalizedCategory)) return 'assessment';
    if (/(practice|homework|classwork|daily)/.test(normalizedCategory)) return 'practice';

    return /(test|exam|quiz|midterm|final|assessment|project|paper|portfolio|beta)\b/i.test(assignmentName)
        ? 'assessment'
        : 'practice';
};

const cleanAssignmentName = (rawName: string) => {
    const cleaned = rawName
        .replace(DATE_AT_START, '')
        .replace(/^[\s\t|,:;-]+/, '')
        .replace(/^(?:practice|assessment|homework|classwork)\b[\s\t|,:;-]+/i, '')
        .replace(/^(?:[#*•-]\s*|\d+[.)]\s*)+/, '')
        .replace(/[\s\t|,:;=\-]+$/, '')
        .trim();

    return cleaned || 'Assignment';
};

const isDateFragment = (line: string, start: number, matchedText: string) => {
    const before = start > 0 ? line[start - 1] : '';
    const after = line[start + matchedText.length] || '';
    return before === '/' || after === '/';
};

/**
 * Parses pasted gradebook rows without treating dates or ungraded placeholders
 * as assignment scores. Structured tab-separated exports are preferred; loose
 * score-list parsing is used only for non-tabular input.
 */
export const parseSmartGradeText = (text: string): SmartGradeParseResult => {
    const assignments: ParsedGradeAssignment[] = [];
    let skippedUngraded = 0;
    let pendingStructuredAssignmentIndex: number | null = null;

    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
        const line = lines[lineIndex];

        if (pendingStructuredAssignmentIndex !== null) {
            const weightedScore = line.match(PARENTHETICAL_WEIGHTED_SCORE);
            const weightingNotice = lines[lineIndex + 1] || '';

            if (weightedScore && WEIGHTING_NOTICE.test(weightingNotice)) {
                const pointsEarned = toNumber(weightedScore[1]);
                const pointsPossible = toNumber(weightedScore[2]);

                if (Number.isFinite(pointsEarned) && Number.isFinite(pointsPossible) && pointsPossible > 0) {
                    assignments[pendingStructuredAssignmentIndex] = {
                        ...assignments[pendingStructuredAssignmentIndex],
                        pointsEarned,
                        pointsPossible,
                    };
                }

                pendingStructuredAssignmentIndex = null;
                lineIndex += 1;
                continue;
            }

            pendingStructuredAssignmentIndex = null;
        }

        if (/^(assignments?|due\s*date\b|grade\s+stored\b)/i.test(line)) continue;
        if (WEIGHTING_NOTICE.test(line)) continue;

        const columns = line.split('\t').map(column => column.trim());
        const isStructuredGradebookRow = columns.length >= 4 && DATE_AT_START.test(columns[0]);

        if (isStructuredGradebookRow) {
            const name = cleanAssignmentName(columns[2] || '');
            const scoreCell = columns
                .slice(3)
                .map(column => ({ column, match: column.match(SCORE_CELL) }))
                .find(candidate => candidate.match);

            // A recognized gradebook row should never fall through to loose
            // parsing, where its due date could be mistaken for a score.
            if (!scoreCell?.match) continue;

            const earnedValue = scoreCell.match[1];
            if (/^(?:--+|—|–|n\/a)$/i.test(earnedValue)) {
                skippedUngraded += 1;
                continue;
            }

            const pointsEarned = toNumber(earnedValue);
            const pointsPossible = toNumber(scoreCell.match[2]);
            if (!Number.isFinite(pointsEarned) || !Number.isFinite(pointsPossible) || pointsPossible <= 0) continue;

            assignments.push({
                name,
                category: inferCategory(columns[1], name),
                pointsEarned,
                pointsPossible,
            });
            pendingStructuredAssignmentIndex = assignments.length - 1;
            continue;
        }

        if (UNGRADED_SCORE.test(line)) {
            skippedUngraded += 1;
            continue;
        }

        const scoreMatches = [...line.matchAll(SCORE_RATIO)]
            .filter(match => !isDateFragment(line, match.index ?? 0, match[0]));
        const scoreMatch = scoreMatches.at(-1);

        if (scoreMatch) {
            const scoreStart = scoreMatch.index ?? 0;
            const name = cleanAssignmentName(line.slice(0, scoreStart));
            const pointsEarned = toNumber(scoreMatch[1]);
            const pointsPossible = toNumber(scoreMatch[2]);

            if (Number.isFinite(pointsEarned) && Number.isFinite(pointsPossible) && pointsPossible > 0) {
                assignments.push({
                    name,
                    category: inferCategory(undefined, name),
                    pointsEarned,
                    pointsPossible,
                });
            }
            continue;
        }

        const percentMatch = line.match(PERCENT_SCORE);
        if (percentMatch && percentMatch.index !== undefined) {
            const name = cleanAssignmentName(line.slice(0, percentMatch.index));
            const pointsEarned = toNumber(percentMatch[1]);

            if (Number.isFinite(pointsEarned)) {
                assignments.push({
                    name,
                    category: inferCategory(undefined, name),
                    pointsEarned,
                    pointsPossible: 100,
                });
            }
        }
    }

    return { assignments, skippedUngraded };
};
