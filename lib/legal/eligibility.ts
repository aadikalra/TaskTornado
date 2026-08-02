export const MINIMUM_AGE = 13;
export const ADULT_AGE = 18;
export const SUPPORTED_COUNTRY_CODE = 'US';
export const CONSENT_VERSION = '2026-07-28-ai';

export type AgeGroup = 'under_13' | 'minor' | 'adult';

export function calculateAge(dateOfBirth: string, now = new Date()): number {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(birthDate.getTime()) || birthDate > now) {
    return -1;
  }

  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const hasNotHadBirthday =
    now.getUTCMonth() < birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() &&
      now.getUTCDate() < birthDate.getUTCDate());

  if (hasNotHadBirthday) age -= 1;
  return age;
}

export function getAgeGroup(dateOfBirth: string): AgeGroup | null {
  const age = calculateAge(dateOfBirth);

  if (age < 0) return null;
  if (age < MINIMUM_AGE) return 'under_13';
  if (age < ADULT_AGE) return 'minor';
  return 'adult';
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
