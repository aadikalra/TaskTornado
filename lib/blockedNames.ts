/**
 * Do not ship personal names or email addresses in the browser bundle.
 * Account-level abuse controls belong in authenticated, server-side systems.
 */
export function isNameBlocked(_name: string): boolean {
    return false;
}

export function isEmailBlocked(_email: string): boolean {
    return false;
}

/**
 * Run both name and email checks. Returns an error message if blocked, or null if allowed.
 */
export function getBlockedError(name: string, email: string): string | null {
    if (isNameBlocked(name)) {
        return 'This name is not allowed for registration.';
    }
    if (isEmailBlocked(email)) {
        return 'This email address is not allowed for registration.';
    }
    return null;
}

export const BLOCKED_ERROR_MESSAGE = 'This account is not allowed to access this service.';
