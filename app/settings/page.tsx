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
import { getFullVersionString } from '@/config/version';

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
      return saved !== null ? saved === 'true' : false; // default to false
    }
    return false;
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

  const [useNaturalLanguageDates, setUseNaturalLanguageDates] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('useNaturalLanguageDates');
      return saved !== null ? saved === 'true' : false; // default to false
    }
    return false;
  });

  const handleToggleNaturalLanguageDates = (checked: boolean) => {
    setUseNaturalLanguageDates(checked);
    setCookie('useNaturalLanguageDates', checked.toString());
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

  const handleSignOut = async () => {
    if (showLogoutConfirm) {
      setIsLoggingOut(true);

      // Sign out first
      if (signOut) {
        await signOut();
      }

      // Then show countdown and redirect
      let countdownValue = 3;
      const interval = setInterval(() => {
        countdownValue -= 1;
        setCountdown(countdownValue);
        if (countdownValue === 0) {
          clearInterval(interval);
          router.push('/login');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-7xl mx-auto">

        {/* Header - Minimalist */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
            Settings
          </h1>
        </motion.div>

        {/* Main Content - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left Column */}
          <div className="space-y-8">
            {/* Google Classroom Section */}
            {isGoogleUser && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GoogleClassroomSection />
              </motion.div>
            )}

            {/* Preferences Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Preferences
              </h2>
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
                useNaturalLanguageDates={useNaturalLanguageDates}
                onToggleNaturalLanguageDates={handleToggleNaturalLanguageDates}
              />
            </motion.div>

            {/* Section Order */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Section Order
              </h2>
              <SectionOrderSection
                sectionOrder={sectionOrder}
                onMoveUp={moveSectionUp}
                onMoveDown={moveSectionDown}
                onOrderChange={handleSectionOrderChange}
              />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Accessibility Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Accessibility
              </h2>
              <AccessibilitySection
                reduceMotion={reduceMotion}
                onToggleReduceMotion={handleToggleReduceMotion}
                useDyslexicFont={useDyslexicFont}
                onToggleDyslexicFont={handleToggleDyslexicFont}
              />
            </motion.div>

            {/* Data Management Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Data Management
              </h2>
              <DataManagementSection
                classes={classes}
                homeworks={homeworks}
                showClassConfirm={showClassConfirm}
                showHomeworkConfirm={showHomeworkConfirm}
                onClearClasses={handleClearClasses}
                onClearHomeworks={handleClearHomeworks}
              />
            </motion.div>

            {/* Account Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Account
              </h2>
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
          </div>
        </div>

        {/* Warning Notice - Minimalist */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-start gap-3 p-4 bg-yellow-50/50 dark:bg-yellow-950/10 rounded-xl"
        >
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100">
              Destructive actions cannot be undone
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
              Make sure you have a backup of any important data.
            </p>
          </div>
        </motion.div>

        {/* Footer - Minimalist */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Built for students • Public Beta {getFullVersionString()}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}