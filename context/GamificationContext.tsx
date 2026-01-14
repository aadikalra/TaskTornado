'use client';

import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Homework, Class } from './ClassContext';

export type UserLevel = 'Student' | 'Scholar' | 'Expert' | 'Master';

export interface SubjectMastery {
  classId: string;
  className: string;
  completedAssignments: number;
  totalAssignments: number;
  masteryLevel: number; // 0-100 percentage
  xpEarned: number;
}

export interface GamificationData {
  totalXP: number;
  currentLevel: UserLevel;
  levelProgress: number; // 0-100 percentage to next level
  subjectMastery: Record<string, SubjectMastery>;
  achievements: string[];
  lastUpdated: string;
}

interface GamificationContextType {
  data: GamificationData;
  addXP: (amount: number, classId?: string, className?: string) => void;
  getLevelInfo: (level?: UserLevel) => { name: UserLevel; minXP: number; maxXP: number };
  getSubjectMastery: (classId: string) => SubjectMastery | null;
  refreshData: () => void;
}

const GamificationContext = React.createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = React.useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

// XP requirements for each level
const LEVEL_REQUIREMENTS: Record<UserLevel, { minXP: number; maxXP: number }> = {
  Student: { minXP: 0, maxXP: 100 },
  Scholar: { minXP: 100, maxXP: 300 },
  Expert: { minXP: 300, maxXP: 600 },
  Master: { minXP: 600, maxXP: Infinity },
};

// XP rewards for different actions
const XP_REWARDS = {
  COMPLETE_ASSIGNMENT: 25,
  COMPLETE_HIGH_PRIORITY: 35,
  COMPLETE_EARLY: 15, // Bonus for completing before due date
  STUDY_STREAK: 10, // Per day in streak
};

interface GamificationProviderProps {
  children: React.ReactNode;
  homeworks?: Homework[];
  classes?: Class[];
}

export const GamificationProvider = ({ children, homeworks = [], classes = [] }: GamificationProviderProps) => {
  // Always call hooks first, before any early returns
  const [data, setData] = React.useState<GamificationData>({
    totalXP: 0,
    currentLevel: 'Student',
    levelProgress: 0,
    subjectMastery: {},
    achievements: [],
    lastUpdated: new Date().toISOString(),
  });

  // Load data from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('school-organizer-gamification');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setData(parsedData);
      } catch (error) {
        console.error('Failed to load gamification data:', error);
      }
    }
  }, []);

  const recalculateSubjectMastery = React.useCallback(() => {
    if (homeworks.length === 0 || classes.length === 0) return;

    const classMap = new Map(classes.map(cls => [cls.id, cls.name]));
    const subjectStats = new Map<string, { completed: number; total: number; xpEarned: number }>();

    // Calculate stats for each class
    homeworks.forEach(hw => {
      if (!hw.classId) return; // Skip if no classId

      const className = classMap.get(hw.classId) || 'Unknown Class';
      const current = subjectStats.get(hw.classId) || { completed: 0, total: 0, xpEarned: 0 };

      current.total += 1;
      if (hw.completed) {
        current.completed += 1;
        // Calculate XP earned (simplified - would need more data in real implementation)
        current.xpEarned += 25; // Base XP per completion
      }

      subjectStats.set(hw.classId, current);
    });

    // Update state with calculated mastery
    setData(prev => {
      const newSubjectMastery: Record<string, SubjectMastery> = {};

      subjectStats.forEach((stats, classId) => {
        const className = classMap.get(classId) || 'Unknown Class';
        const masteryLevel = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

        newSubjectMastery[classId] = {
          classId,
          className,
          completedAssignments: stats.completed,
          totalAssignments: stats.total,
          masteryLevel,
          xpEarned: stats.xpEarned,
        };
      });

      return {
        ...prev,
        subjectMastery: newSubjectMastery,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, [homeworks, classes]);

  // Recalculate mastery when homeworks or classes change
  React.useEffect(() => {
    recalculateSubjectMastery();
  }, [recalculateSubjectMastery]);

  const getLevelInfo = React.useCallback((level?: UserLevel) => {
    const targetLevel = level || data.currentLevel;
    return {
      name: targetLevel,
      ...LEVEL_REQUIREMENTS[targetLevel],
    };
  }, [data.currentLevel]);

  const calculateLevel = React.useCallback((xp: number): { level: UserLevel; progress: number } => {
    if (xp >= LEVEL_REQUIREMENTS.Master.minXP) {
      return { level: 'Master', progress: 100 };
    } else if (xp >= LEVEL_REQUIREMENTS.Expert.minXP) {
      const levelInfo = LEVEL_REQUIREMENTS.Expert;
      const progress = ((xp - levelInfo.minXP) / (levelInfo.maxXP - levelInfo.minXP)) * 100;
      return { level: 'Expert', progress: Math.min(progress, 100) };
    } else if (xp >= LEVEL_REQUIREMENTS.Scholar.minXP) {
      const levelInfo = LEVEL_REQUIREMENTS.Scholar;
      const progress = ((xp - levelInfo.minXP) / (levelInfo.maxXP - levelInfo.minXP)) * 100;
      return { level: 'Scholar', progress: Math.min(progress, 100) };
    } else {
      const levelInfo = LEVEL_REQUIREMENTS.Student;
      const progress = Math.min((xp / levelInfo.maxXP) * 100, 100);
      return { level: 'Student', progress };
    }
  }, []);

  const recalculateTotalXP = React.useCallback(() => {
    if (homeworks.length === 0) return;

    let totalEarnedXP = 0;

    homeworks.forEach(hw => {
      if (hw.completed) {
        // Base XP for completion
        let xpReward = 25;

        // Bonus for high priority
        if (hw.priority === 'high') {
          xpReward += 10;
        }

        // For now, let's skip the early completion bonus since date handling might be complex
        // TODO: Add back early completion bonus when date handling is confirmed working

        totalEarnedXP += xpReward;
      }
    });

    // Update level based on total earned XP
    const { level: newLevel, progress: newProgress } = calculateLevel(totalEarnedXP);

    setData(prev => ({
      ...prev,
      totalXP: totalEarnedXP,
      currentLevel: newLevel,
      levelProgress: newProgress,
      lastUpdated: new Date().toISOString(),
    }));
  }, [homeworks, calculateLevel]);

  // Recalculate total XP when homeworks change or component mounts
  React.useEffect(() => {
    if (homeworks.length > 0) {
      recalculateTotalXP();
    }
  }, [recalculateTotalXP, homeworks.length]);

  const updateSubjectMastery = React.useCallback((
    classId: string,
    className: string,
    completedCount: number,
    totalCount: number,
    additionalXP: number
  ) => {
    const masteryPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    setData(prev => ({
      ...prev,
      subjectMastery: {
        ...prev.subjectMastery,
        [classId]: {
          classId,
          className,
          completedAssignments: completedCount,
          totalAssignments: totalCount,
          masteryLevel: masteryPercentage,
          xpEarned: (prev.subjectMastery[classId]?.xpEarned || 0) + additionalXP,
        },
      },
    }));
  }, []);

  const addXP = React.useCallback((amount: number, classId?: string, className?: string) => {
    setData(prev => {
      const newTotalXP = prev.totalXP + amount;
      const { level: newLevel, progress: newProgress } = calculateLevel(newTotalXP);

      // Check for level up
      const leveledUp = newLevel !== prev.currentLevel;

      let newData = {
        ...prev,
        totalXP: newTotalXP,
        currentLevel: newLevel,
        levelProgress: newProgress,
        lastUpdated: new Date().toISOString(),
      };

      // Add achievement for level up
      if (leveledUp) {
        newData.achievements = [...prev.achievements, `Level up to ${newLevel}!`];
      }

      return newData;
    });

    // Update subject mastery if class info provided
    if (classId && className) {
      // Note: This would need actual homework data to calculate properly
      // For now, we'll increment the counters
      updateSubjectMastery(classId, className, 1, 1, amount);
    }
  }, [calculateLevel, updateSubjectMastery]);

  const getSubjectMastery = React.useCallback((classId: string) => {
    return data.subjectMastery[classId] || null;
  }, [data.subjectMastery]);

  const refreshData = React.useCallback(() => {
    // This would recalculate all mastery data based on current homework state
    // For now, it's a placeholder for future enhancement
    setData(prev => ({ ...prev, lastUpdated: new Date().toISOString() }));
  }, []);

  const value: GamificationContextType = {
    data,
    addXP,
    getLevelInfo,
    getSubjectMastery,
    refreshData,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
