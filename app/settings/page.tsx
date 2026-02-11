'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, User, Shield, Zap, Accessibility, Database, Globe, ChevronRight } from 'lucide-react';
import { Facehash } from 'facehash';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useClassContext } from '@/context/ClassContext';
import { useWideLayout } from '@/hooks/use-wide-layout';
import {
  PreferencesSection,
  AccessibilitySection,
  DataManagementSection,
  AccountSection
} from '@/components/settings';
import GoogleClassroomSection from '@/components/settings/GoogleClassroomSection';
import { getFullVersionString } from '@/config/version';
import { useDarkMode } from '@/context/DarkModeContext';
import DotGrid from '../DotGrid';

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

type SettingTab = 'preferences' | 'classroom' | 'accessibility' | 'data' | 'account';

export default function SettingsPage() {
  const { authenticated } = useRequireAuth();
  if (!authenticated) return null;
  const { classes, homeworks, clearAllClasses, clearAllHomeworks } = useClassContext();
  const { signOut, full_name, isGoogleUser } = useAuth() || {};
  const [activeTab, setActiveTab] = useState<SettingTab>('preferences');
  const [showClassConfirm, setShowClassConfirm] = useState(false);
  const [showHomeworkConfirm, setShowHomeworkConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();
  const { isDark } = useDarkMode();
  const { useWideLayout: isWideLayout, toggleWideLayout } = useWideLayout();





  const [useDyslexicFont, setUseDyslexicFont] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('useDyslexicFont');
      return saved !== null ? saved === 'true' : false;
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
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  const handleToggleReduceMotion = (checked: boolean) => {
    setReduceMotion(checked);
    setCookie('reduceMotion', checked.toString());
  };



  const [showTestsInClassCards, setShowTestsInClassCards] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showTestsInClassCards');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const handleToggleTestsInClassCards = (checked: boolean) => {
    setShowTestsInClassCards(checked);
    setCookie('showTestsInClassCards', checked.toString());
  };

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



  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (useDyslexicFont) document.body.classList.add('dyslexic-font');
      else document.body.classList.remove('dyslexic-font');
    }
  }, [useDyslexicFont]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (reduceMotion) document.body.classList.add('reduce-motion');
      else document.body.classList.remove('reduce-motion');
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
      if (signOut) await signOut();
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearAllClasses();
      clearAllHomeworks();
      if (signOut) signOut();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
    }
  };

  const userName = full_name || "User";

  const navigationItems = [
    { id: 'preferences', label: 'Preferences', icon: Zap },
    ...(isGoogleUser ? [{ id: 'classroom', label: 'Google Classroom', icon: Globe }] : []),
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <DotGrid
          dotSize={2}
          gap={30}
          darkMode={isDark}
          className="opacity-[0.15] dark:opacity-[0.05]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 lg:py-12">
        {/* Header Strip */}
        <header className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-full border border-blue-100 dark:border-blue-900/30">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Control Center</span>
            </div>
            <span className="text-[10px] font-bold text-gray-300 dark:text-zinc-700 uppercase tracking-widest">{getFullVersionString().split('-')[0]}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer">
                    <Facehash
                      name={userName}
                      size={56}
                      enableBlink
                      intensity3d="dramatic"
                      showInitial={true}
                      colors={['#3b82f6', '#6366f1', '#8b5cf6', '#0ea5e9', '#14b8a6']}
                      style={{ borderRadius: '50%', flexShrink: 0 }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 shadow-lg"
                >
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Hey, {userName}! 👋
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight"
            >
              Settings
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 mt-4 text-lg max-w-xl leading-relaxed"
          >
            Fine-tune your study experience. These preferences are synced across your devices and applied instantly.
          </motion.p>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Side Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="sticky top-12 flex flex-col gap-1">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as SettingTab)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group
                      ${isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900/50 hover:text-gray-900 dark:hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
                      <span className="text-[14px]">{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div layoutId="activeNav" className="w-1 h-4 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Settings Canvas */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gray-50/50 dark:bg-zinc-900/20 rounded-[32px] p-4 md:p-6 border border-gray-100 dark:border-zinc-800 backdrop-blur-sm"
              >
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Preferences</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Configure your dashboard visibility and AI assistant personality.</p>
                    </div>
                    <PreferencesSection


                      aiPersonality={aiPersonality}
                      onPersonalityChange={handlePersonalityChange}
                      useWideLayout={isWideLayout}
                      onToggleWideLayout={toggleWideLayout}

                      showTestsInClassCards={showTestsInClassCards}
                      onToggleTestsInClassCards={handleToggleTestsInClassCards}
                    />
                  </div>
                )}

                {activeTab === 'classroom' && isGoogleUser && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Google Classroom</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage your linked classroom courses and synchronization settings.</p>
                    </div>
                    <GoogleClassroomSection />
                  </div>
                )}

                {activeTab === 'accessibility' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Accessibility</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tailor the interface to your visual and motor preferences.</p>
                    </div>
                    <AccessibilitySection
                      reduceMotion={reduceMotion}
                      onToggleReduceMotion={handleToggleReduceMotion}
                      useDyslexicFont={useDyslexicFont}
                      onToggleDyslexicFont={handleToggleDyslexicFont}
                    />
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Data Management</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage your local storage and cloud database entries.</p>
                    </div>
                    <DataManagementSection
                      classes={classes}
                      homeworks={homeworks}
                      showClassConfirm={showClassConfirm}
                      showHomeworkConfirm={showHomeworkConfirm}
                      onClearClasses={handleClearClasses}
                      onClearHomeworks={handleClearHomeworks}
                    />
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Account</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile, security settings, and session.</p>
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
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-20 pt-8 border-t border-gray-100 dark:border-zinc-900"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400 dark:text-zinc-500">
              Built for students • Public Beta {getFullVersionString()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}