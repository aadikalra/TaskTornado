'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useClassContext } from '@/context/ClassContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PreferencesSection,
  SectionOrderSection,
  AccessibilitySection,
  DataManagementSection,
  AccountSection
} from '@/components/settings';

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
  const { signOut } = useAuth() || {};
  const [showClassConfirm, setShowClassConfirm] = useState(false);
  const [showHomeworkConfirm, setShowHomeworkConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your data and preferences
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="space-y-6"
        >
          {/* Preferences Section */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Preferences</CardTitle>
              <CardDescription className="text-sm">
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PreferencesSection
                showAIPriority={showAIPriority}
                onToggleAIPriority={handleToggleAIPriority}
                showLevelDisplay={showLevelDisplay}
                onToggleLevelDisplay={handleToggleLevelDisplay}
                showSubjectMastery={showSubjectMastery}
                onToggleSubjectMastery={handleToggleSubjectMastery}
                aiPersonality={aiPersonality}
                onPersonalityChange={handlePersonalityChange}
              />
            </CardContent>
          </Card>

          {/* Section Order */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Section Order</CardTitle>
              <CardDescription className="text-sm">
                Customize the order of sections on your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SectionOrderSection
                sectionOrder={sectionOrder}
                onMoveUp={moveSectionUp}
                onMoveDown={moveSectionDown}
                onOrderChange={handleSectionOrderChange}
              />
            </CardContent>
          </Card>

          {/* Accessibility Section */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Accessibility</CardTitle>
              <CardDescription className="text-sm">
                Customize for better readability and usability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccessibilitySection
                reduceMotion={reduceMotion}
                onToggleReduceMotion={handleToggleReduceMotion}
                useDyslexicFont={useDyslexicFont}
                onToggleDyslexicFont={handleToggleDyslexicFont}
              />
            </CardContent>
          </Card>

          {/* Data Management Section */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Data Management</CardTitle>
              <CardDescription className="text-sm">
                Manage your classes and homework data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataManagementSection
                classes={classes}
                homeworks={homeworks}
                showClassConfirm={showClassConfirm}
                showHomeworkConfirm={showHomeworkConfirm}
                onClearClasses={handleClearClasses}
                onClearHomeworks={handleClearHomeworks}
              />
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Account</CardTitle>
              <CardDescription className="text-sm">
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSection
                isLoggingOut={isLoggingOut}
                showLogoutConfirm={showLogoutConfirm}
                countdown={countdown}
                onSignOut={handleSignOut}
              />
            </CardContent>
          </Card>

          {/* Warning Notice */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Destructive actions cannot be undone
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Make sure you have a backup of any important data before proceeding with delete operations.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}