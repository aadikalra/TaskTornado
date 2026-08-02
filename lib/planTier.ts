// ─── Plan Tier System ────────────────────────────────────────────────────────────
// Temporary cookie-based tier switcher for testing rate limits.
// Once Stripe is integrated, this will be replaced by actual subscription lookups.

export type PlanTier = 'free' | 'pro' | 'family';

const COOKIE_KEY = 'taskTornadoPlanTier';

// ─── Cookie helpers ──────────────────────────────────────────────────────────────

function setCookie(name: string, value: string, days: number = 365) {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// ─── Public API ──────────────────────────────────────────────────────────────────

/** Read the current plan tier from the cookie. Defaults to 'free'. */
export function getPlanTier(): PlanTier {
    const stored = getCookie(COOKIE_KEY);
    if (stored === 'pro' || stored === 'family') return stored;
    return 'free';
}

/** Write the plan tier to the cookie. */
export function setPlanTier(tier: PlanTier): void {
    setCookie(COOKIE_KEY, tier);
}

// ─── Tier Limits ─────────────────────────────────────────────────────────────────
// Centralised limits object so every feature reads from a single source of truth.

export const TIER_LIMITS = {
    free: {
        // Core
        homeworkEntries: 20,
        activeTests: 5,
        flashcardStorage: 20,
        // AI
        aiQuickPerDay: 20,
        aiDeepPerDay: 8,
        aiCloudPerDay: 0,
        aiQuizGenPerDay: 3,
        aiFlashcardGenPerDay: 3,
        aiQuizGenPerWeek: Infinity,
        aiFlashcardGenPerWeek: Infinity,
        // Translation
        translationsPerDay: 5,
        translationMaxChars: 1000,
        translationContextExplanation: false,
        // Community
        discussionBoardsJoin: 2,
        discussionPostsPerDay: 2,
        discussionRepliesPerDay: 5,
        canCreateBoards: false,
        studyGroupsJoin: 1,
        studyGroupMessagesPerDay: 10,
        canCreateStudyGroups: false,
        studyGroupMemberCap: 5,
        studyGroupFileSharing: false,
        webSaves: 5,
        webSaveFolders: false,
        // Premium
        googleClassroomSync: false,
        writingAssist: false,
        guardianDashboard: false,
        guardianAIChatPerDay: 0,
        multiChildAccounts: 0,
        weeklyEmailReports: false,
        ads: true,
        smartScheduling: false,
        studyTimerAnalytics: false,
        smartAlerts: false,
    },
    pro: {
        homeworkEntries: Infinity,
        activeTests: Infinity,
        flashcardStorage: Infinity,
        aiQuickPerDay: 25,
        aiDeepPerDay: 10,
        aiCloudPerDay: 0,
        aiQuizGenPerDay: 5,
        aiFlashcardGenPerDay: 5,
        aiQuizGenPerWeek: Infinity,
        aiFlashcardGenPerWeek: Infinity,
        translationsPerDay: 30,
        translationMaxChars: 5000,
        translationContextExplanation: true,
        discussionBoardsJoin: Infinity,
        discussionPostsPerDay: Infinity,
        discussionRepliesPerDay: Infinity,
        canCreateBoards: true,
        studyGroupsJoin: Infinity,
        studyGroupMessagesPerDay: Infinity,
        canCreateStudyGroups: true,
        studyGroupMemberCap: 25,
        studyGroupFileSharing: true,
        webSaves: Infinity,
        webSaveFolders: true,
        googleClassroomSync: true,
        writingAssist: false,
        guardianDashboard: false,
        guardianAIChatPerDay: 0,
        multiChildAccounts: 0,
        weeklyEmailReports: false,
        ads: false,
        smartScheduling: true,
        studyTimerAnalytics: true,
        smartAlerts: true,
    },
    family: {
        homeworkEntries: Infinity,
        activeTests: Infinity,
        flashcardStorage: Infinity,
        aiQuickPerDay: 50,
        aiDeepPerDay: 20,
        aiCloudPerDay: 0,
        aiQuizGenPerDay: 10,
        aiFlashcardGenPerDay: 10,
        aiQuizGenPerWeek: Infinity,
        aiFlashcardGenPerWeek: Infinity,
        translationsPerDay: Infinity,
        translationMaxChars: 10000,
        translationContextExplanation: true,
        discussionBoardsJoin: Infinity,
        discussionPostsPerDay: Infinity,
        discussionRepliesPerDay: Infinity,
        canCreateBoards: true,
        studyGroupsJoin: Infinity,
        studyGroupMessagesPerDay: Infinity,
        canCreateStudyGroups: true,
        studyGroupMemberCap: 50,
        studyGroupFileSharing: true,
        webSaves: Infinity,
        webSaveFolders: true,
        googleClassroomSync: true,
        writingAssist: true,
        guardianDashboard: true,
        guardianAIChatPerDay: 10,
        multiChildAccounts: 4,
        weeklyEmailReports: true,
        ads: false,
        smartScheduling: true,
        studyTimerAnalytics: true,
        smartAlerts: true,
    },
} as const;

/** Get the limits for the current tier (reads cookie). */
export function getCurrentLimits() {
    return TIER_LIMITS[getPlanTier()];
}

/** Human-readable tier label */
export function getTierLabel(tier: PlanTier): string {
    switch (tier) {
        case 'free': return 'Free';
        case 'pro': return 'Pro';
        case 'family': return 'Family';
    }
}
