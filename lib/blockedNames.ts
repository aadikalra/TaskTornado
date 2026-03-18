/**
 * Blocked names list and validation utility.
 * Users with these names (first or last) are not allowed to sign up or log in.
 *
 * Toggle this feature on/off via the NEXT_PUBLIC_RESTRICTED_ACCESS env var.
 * Set to "true" (or leave unset) to enable blocking. Set to "false" to disable.
 */

function isRestrictionEnabled(): boolean {
    return process.env.NEXT_PUBLIC_RESTRICTED_ACCESS !== 'false';
}

const BLOCKED_NAMES = ['zain', 'zane', 'zayn', 'sadiq', 'ritvik', 'vuluvala', 'srinadh', 'yenamandra', 'tanuj', 'gummadi'];

/**
 * Check if a given name contains any blocked name parts.
 * Splits on whitespace and checks each part (case-insensitive).
 */
export function isNameBlocked(name: string): boolean {
    if (!isRestrictionEnabled()) return false;
    const parts = name.trim().toLowerCase().split(/\s+/);
    return parts.some(part => BLOCKED_NAMES.includes(part));
}

/**
 * Check if an email address contains any blocked name parts.
 * Extracts the local part (before @), splits on common separators
 * (dots, underscores, hyphens, plus signs, numbers), and checks each segment.
 */
export function isEmailBlocked(email: string): boolean {
    if (!isRestrictionEnabled()) return false;
    const localPart = email.trim().toLowerCase().split('@')[0] || '';
    // Split on common email separators and digits to isolate name parts
    const segments = localPart.split(/[._\-+0-9]+/).filter(Boolean);
    return segments.some(segment => BLOCKED_NAMES.includes(segment));
}

/**
 * Run both name and email checks. Returns an error message if blocked, or null if allowed.
 */
export function getBlockedError(name: string, email: string): string | null {
    if (!isRestrictionEnabled()) return null;
    if (isNameBlocked(name)) {
        return 'This name is not allowed for registration.';
    }
    if (isEmailBlocked(email)) {
        return 'This email address is not allowed for registration.';
    }
    return null;
}

export const BLOCKED_ERROR_MESSAGE = 'This account is not allowed to access this service.';
