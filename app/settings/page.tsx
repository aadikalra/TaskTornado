'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Zap, Accessibility, Database, Globe } from 'lucide-react';
import { Facehash } from 'facehash';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-150px 0px -60% 0px',
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id as SettingTab);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const sections = ['preferences', 'classroom', 'accessibility', 'data', 'account'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isGoogleUser]);

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
                      name={userName.split(' ')[0]}
                      size={56}
                      enableBlink
                      intensity3d="dramatic"
                      showInitial={true}
                      colors={['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#f97316', '#64748b']}
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

        </header>

        {/* Top Navigation Chips */}
        <div className="sticky top-0 z-50 py-3 -mx-4 px-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-zinc-900/50 mb-10">
          <div className="max-w-3xl mx-auto overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-2 min-w-max">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      const element = document.getElementById(item.id);
                      if (element) {
                        const yOffset = -80;
                        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                      setActiveTab(item.id as SettingTab);
                    }}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap text-[13px] font-medium
                      ${isActive
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900/50'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <main className="max-w-3xl mx-auto w-full pb-24">
          {/* Preferences */}
          <section id="preferences" className="scroll-mt-24 mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
            </div>
            <PreferencesSection
              aiPersonality={aiPersonality}
              onPersonalityChange={handlePersonalityChange}
              useWideLayout={isWideLayout}
              onToggleWideLayout={toggleWideLayout}
              showTestsInClassCards={showTestsInClassCards}
              onToggleTestsInClassCards={handleToggleTestsInClassCards}
            />
            <div className="mt-16 border-b border-gray-100 dark:border-zinc-800/60" />
          </section>

          {/* Google Classroom */}
          {isGoogleUser && (
            <section id="classroom" className="scroll-mt-24 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Google Classroom</h2>
              </div>
              <GoogleClassroomSection />
              <div className="mt-16 border-b border-gray-100 dark:border-zinc-800/60" />
            </section>
          )}

          {/* Accessibility */}
          <section id="accessibility" className="scroll-mt-24 mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Accessibility className="h-5 w-5 text-violet-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Accessibility</h2>
            </div>
            <AccessibilitySection
              reduceMotion={reduceMotion}
              onToggleReduceMotion={handleToggleReduceMotion}
              useDyslexicFont={useDyslexicFont}
              onToggleDyslexicFont={handleToggleDyslexicFont}
            />
            <div className="mt-16 border-b border-gray-100 dark:border-zinc-800/60" />
          </section>

          {/* Data Management */}
          <section id="data" className="scroll-mt-24 mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Management</h2>
            </div>
            <DataManagementSection
              classes={classes}
              homeworks={homeworks}
              showClassConfirm={showClassConfirm}
              showHomeworkConfirm={showHomeworkConfirm}
              onClearClasses={handleClearClasses}
              onClearHomeworks={handleClearHomeworks}
            />
            <div className="mt-16 border-b border-gray-100 dark:border-zinc-800/60" />
          </section>

          {/* Account */}
          <section id="account" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h2>
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
          </section>
        </main>

        <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-zinc-900">
          <p className="text-sm text-gray-400 dark:text-zinc-500">
            Built for students • Public Beta {getFullVersionString()}
          </p>
        </div>
      </div>
    </div>
  );
}