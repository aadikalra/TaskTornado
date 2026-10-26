// One free plan. Legacy cookies and auth metadata cannot raise these limits.
export type PlanTier = 'free';

export function getPlanTier(): PlanTier { return 'free'; }
export function setPlanTier(_tier: PlanTier): void {
    if (typeof document !== 'undefined') document.cookie = 'taskTornadoPlanTier=; Max-Age=0; path=/';
}

export const FREE_LIMITS = {
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
        translationContextExplanation: true,
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
        webSaveFolders: true,
        // Additional feature availability
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
    } as const;
export const TIER_LIMITS = { free: FREE_LIMITS } as const;
export function getCurrentLimits() { return FREE_LIMITS; }
export function getTierLabel(_tier: PlanTier): string { return 'Free'; }
