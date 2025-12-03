'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, AlertTriangle, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useClassContext } from '@/context/ClassContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWideLayout } from '@/hooks/use-wide-layout';
import {
  PreferencesSection,
  SectionOrderSection,
  AccessibilitySection,
  DataManagementSection,
  AccountSection
} from '@/components/settings';
import GoogleClassroomSection from '@/components/settings/GoogleClassroomSection';

// Cookie utilities
const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};


export default function SettingsPage() {
  const { classes, homeworks, clearAllClasses, clearAllHomeworks } = useClassContext();
  const { signOut, full_name, isGoogleUser } = useAuth() || {};
  const [showClassConfirm, setShowClassConfirm] = useState(false);
  const [showHomeworkConfirm, setShowHomeworkConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();
  const { useWideLayout: isWideLayout, toggleWideLayout, getContainerClass } = useWideLayout();

  const [showAIPriority, setShowAIPriority] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showAIPriority');
      return saved !== null ? saved === 'true' : true; // default to true
    }
    return true;
  });

  const handleToggleAIPriority = (checked: boolean) => {
    setShowAIPriority(checked);
    setCookie('showAIPriority', checked.toString());
  };

  const [showLevelDisplay, setShowLevelDisplay] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showLevelDisplay');
      return saved !== null ? saved === 'true' : true; // default to true
    }
    return true;
  });

  const handleToggleLevelDisplay = (checked: boolean) => {
    setShowLevelDisplay(checked);
    setCookie('showLevelDisplay', checked.toString());
  };

  const [showSubjectMastery, setShowSubjectMastery] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showSubjectMastery');
      return saved !== null ? saved === 'true' : true; // default to true
    }
    return true;
  });

  const handleToggleSubjectMastery = (checked: boolean) => {
    setShowSubjectMastery(checked);
    setCookie('showSubjectMastery', checked.toString());
  };

  const [useDyslexicFont, setUseDyslexicFont] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('useDyslexicFont');
      return saved !== null ? saved === 'true' : false; // default to false
    }
    return false;
  });

  const handleToggleDyslexicFont = (checked: boolean) => {
    setUseDyslexicFont(checked);
    setCookie('useDyslexicFont', checked.toString());
  };

  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('reduceMotion');
      return saved !== null ? saved === 'true' : false; // default to false
    }
    return false;
  });

  const handleToggleReduceMotion = (checked: boolean) => {
    setReduceMotion(checked);
    setCookie('reduceMotion', checked.toString());
  };

  // AI Personality setting
  type AIPersonality = 'default' | 'professional' | 'friendly' | 'candid' | 'quirky' | 'efficient' | 'nerdy' | 'cynical';

  const [aiPersonality, setAIPersonality] = useState<AIPersonality>(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('aiPersonality');
      return (saved as AIPersonality) || 'default';
    }
    return 'default';
  });

  const handlePersonalityChange = (value: AIPersonality) => {
    setAIPersonality(value);
    setCookie('aiPersonality', value);
  };

  // Section order management
  type SectionId = 'ai-priority' | 'pinned' | 'classes' | 'tests';

  const defaultSectionOrder: SectionId[] = ['ai-priority', 'pinned', 'classes', 'tests'];

  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('sectionOrder');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Validate that parsed is an array of valid section IDs and contains no duplicates
          if (Array.isArray(parsed) && parsed.length > 0) {
            const validSections = parsed.filter((id): id is SectionId =>
              ['ai-priority', 'pinned', 'classes', 'tests'].includes(id)
            );
            const uniqueSections = [...new Set(validSections)];
            if (uniqueSections.length === validSections.length && validSections.length > 0) {
              return validSections;
            }
          }
        } catch {
          // If parsing fails, return default
        }
      }
    }
    return defaultSectionOrder;
  });

  const handleSectionOrderChange = (newOrder: SectionId[]) => {
    // Validate the new order before setting it
    if (Array.isArray(newOrder) && newOrder.length > 0) {
      const validSections = newOrder.filter((id): id is SectionId =>
        ['ai-priority', 'pinned', 'classes', 'tests'].includes(id)
      );
      const uniqueSections = [...new Set(validSections)];
      if (uniqueSections.length === validSections.length && validSections.length > 0) {
        setSectionOrder(validSections);
        setCookie('sectionOrder', JSON.stringify(validSections));
      }
    }
  };

  const moveSectionUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...sectionOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      handleSectionOrderChange(newOrder);
    }
  };

  const moveSectionDown = (index: number) => {
    if (index < sectionOrder.length - 1) {
      const newOrder = [...sectionOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      handleSectionOrderChange(newOrder);
    }
  };



  // Apply dyslexic font class to body
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (useDyslexicFont) {
        document.body.classList.add('dyslexic-font');
      } else {
        document.body.classList.remove('dyslexic-font');
      }
    }
  }, [useDyslexicFont]);

  // Apply reduce motion class to body
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (reduceMotion) {
        document.body.classList.add('reduce-motion');
      } else {
        document.body.classList.remove('reduce-motion');
      }
    }
  }, [reduceMotion]);

  const handleClearClasses = () => {
    if (showClassConfirm) {
      clearAllClasses();
      setShowClassConfirm(false);
    } else {
      setShowClassConfirm(true);
      setTimeout(() => setShowClassConfirm(false), 5000);
    }
  };

  const handleClearHomeworks = () => {
    if (showHomeworkConfirm) {
      clearAllHomeworks();
      setShowHomeworkConfirm(false);
    } else {
      setShowHomeworkConfirm(true);
      setTimeout(() => setShowHomeworkConfirm(false), 5000);
    }
  };

  const handleSignOut = () => {
    if (showLogoutConfirm) {
      if (signOut) {
        signOut();
      }
      setIsLoggingOut(true);
      let countdownValue = 3;
      const interval = setInterval(() => {
        countdownValue -= 1;
        setCountdown(countdownValue);
        if (countdownValue === 0) {
          clearInterval(interval);
          router.push('/');
        }
      }, 1000);
    } else {
      setShowLogoutConfirm(true);
      setTimeout(() => setShowLogoutConfirm(false), 5000);
    }
  };

  const handleDeleteAccount = async (confirmed: boolean) => {
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // TODO: Implement actual account deletion API call
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear all local data
      clearAllClasses();
      clearAllHomeworks();

      // Sign out and redirect
      if (signOut) {
        signOut();
      }

      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
    }
  };

  // Get user name for delete confirmation
  const userName = full_name || "User"; // Use actual user name or fallback to "User"

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

        {/* Header - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12 lg:mb-16"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Manage your preferences and data
          </p>
        </motion.div>

        {/* Main Content - Mobile Optimized */}
        <div className="space-y-8 sm:space-y-12">
          {/* Google Classroom Section */}
          {isGoogleUser && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GoogleClassroomSection />
            </motion.div>
          )}

          {/* Preferences Section - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Preferences
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Customize your app experience
              </p>
            </div>
            <PreferencesSection
              showAIPriority={showAIPriority}
              onToggleAIPriority={handleToggleAIPriority}
              showLevelDisplay={showLevelDisplay}
              onToggleLevelDisplay={handleToggleLevelDisplay}
              showSubjectMastery={showSubjectMastery}
              onToggleSubjectMastery={handleToggleSubjectMastery}
              aiPersonality={aiPersonality}
              onPersonalityChange={handlePersonalityChange}
              useWideLayout={isWideLayout}
              onToggleWideLayout={toggleWideLayout}
            />
          </motion.div>

          {/* Section Order - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Section Order
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Customize the order of sections on your dashboard
              </p>
            </div>
            <SectionOrderSection
              sectionOrder={sectionOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              onOrderChange={handleSectionOrderChange}
            />
          </motion.div>

          {/* Accessibility Section - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Accessibility
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Customize for better readability and usability
              </p>
            </div>
            <AccessibilitySection
              reduceMotion={reduceMotion}
              onToggleReduceMotion={handleToggleReduceMotion}
              useDyslexicFont={useDyslexicFont}
              onToggleDyslexicFont={handleToggleDyslexicFont}
            />
          </motion.div>

          {/* Data Management Section - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Data Management
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Manage your classes and homework data
              </p>
            </div>
            <DataManagementSection
              classes={classes}
              homeworks={homeworks}
              showClassConfirm={showClassConfirm}
              showHomeworkConfirm={showHomeworkConfirm}
              onClearClasses={handleClearClasses}
              onClearHomeworks={handleClearHomeworks}
            />
          </motion.div>

          {/* Account Section - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Account
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Manage your account settings
              </p>
            </div>
            <AccountSection
              isLoggingOut={isLoggingOut}
              showLogoutConfirm={showLogoutConfirm}
              countdown={countdown}
              onSignOut={handleSignOut}
              showDeleteConfirm={showDeleteConfirm}
              isDeleting={isDeleting}
              onDeleteAccountWithConfirmation={handleDeleteAccount}
              userName={userName}
            />
          </motion.div>

          {/* Warning Notice - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg"
          >
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Destructive actions cannot be undone
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Make sure you have a backup of any important data before proceeding with delete operations.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-12 sm:mt-16 lg:mt-20 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Built for students • Public Beta v2.0.2
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}