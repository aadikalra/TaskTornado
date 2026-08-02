const toFiniteNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const roundPercentage = (value: number) => Math.round(value * 10) / 10;

export const getClassGradePercentage = (
  grade: unknown,
  gradeData: unknown,
): number | undefined => {
  const savedGrade = toFiniteNumber(grade);
  if (savedGrade !== undefined) return roundPercentage(savedGrade);

  if (!gradeData || typeof gradeData !== 'object' || Array.isArray(gradeData)) {
    return undefined;
  }

  const calculatedGrade = toFiniteNumber(
    (gradeData as Record<string, unknown>).finalGrade,
  );
  return calculatedGrade === undefined
    ? undefined
    : roundPercentage(calculatedGrade);
};

export const getScorePercentage = (
  score: unknown,
  maxScore: unknown,
): number | undefined => {
  const earned = toFiniteNumber(score);
  const possible = toFiniteNumber(maxScore);
  if (earned === undefined || possible === undefined || possible <= 0) {
    return undefined;
  }

  return roundPercentage((earned / possible) * 100);
};
