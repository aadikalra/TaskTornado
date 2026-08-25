'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Zap, Accessibility, Database, Globe, Users, Lock, Shield, ArrowUp } from 'lucide-react';
import { Facehash } from 'facehash';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext } from '@/context/HomeworkContext';
import {
  PreferencesSection,
  AccessibilitySection,
  DataManagementSection,
  AccountSection
} from '@/components/settings';
import GoogleClassroomSection from '@/components/settings/GoogleClassroomSection';
import GuardianAccessSettings from '@/components/settings/GuardianAccessSettings';
import { getFullVersionString } from '@/config/version';
import { useDarkMode } from '@/context/DarkModeContext';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';

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

type SettingTab = 'preferences' | 'guardian' | 'classroom' | 'accessibility' | 'data' | 'account';

export default function SettingsPage() {
  const { authenticated } = useRequireAuth();
  if (!authenticated) return null;
  const { classes, clearAllClasses } = useClassContext();
  const { homeworks, clearAllHomeworks } = useHomeworkContext();
  const { signOut, full_name, isGuardian } = useAuth() || {};
  const [activeTab, setActiveTab] = useState<SettingTab>(isGuardian ? 'accessibility' : 'preferences');
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

  const [showCalendarWidget, setShowCalendarWidget] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('showCalendarWidget');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const handleToggleCalendarWidget = (checked: boolean) => {
    setShowCalendarWidget(checked);
    setCookie('showCalendarWidget', checked.toString());
  };

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
      return saved !== null ? saved === 'true' : false;
    }
    return false;
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

  const [advancedAIMode, setAdvancedAIMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookie('advancedAIMode');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  const handleToggleAdvancedAIMode = (checked: boolean) => {
    setAdvancedAIMode(checked);
    setCookie('advancedAIMode', checked.toString());
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
    const sections = isGuardian
      ? ['accessibility', 'account']
      : ['preferences', 'guardian', 'classroom', 'accessibility', 'data', 'account'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isGuardian]);

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
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete account');
      }

      clearAllClasses();
      clearAllHomeworks();
      if (signOut) await signOut();
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(error.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const userName = full_name || "User";

  const navigationItems = isGuardian
    ? [
      { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
      { id: 'account', label: 'Account', icon: User },
    ]
    : [
      { id: 'preferences', label: 'Preferences', icon: Zap },
      { id: 'guardian', label: 'Guardian Access', icon: Users },
      { id: 'classroom', label: 'Google Classroom', icon: Globe },
      { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
      { id: 'data', label: 'Data', icon: Database },
      { id: 'account', label: 'Account', icon: User },
    ];

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans selection:bg-sky-100 dark:selection:bg-sky-900/40 relative">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
        {/* Header */}
        <header className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-5"
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
                  className="bg-white/90 dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg"
                >
                  <p className="text-sm font-medium text-sky-900 dark:text-white">
                    Hey, {userName}! 👋
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div>
              <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 tracking-tight leading-[1.08]">
                Settings
              </h1>
              <p className="text-xs font-medium text-sky-600/30 dark:text-sky-400/30 mt-1">
                {getFullVersionString().split('-')[0]}
              </p>
            </div>
          </motion.div>
        </header>

        {/* Navigation Chips */}
        <div className="sticky top-0 z-50 py-3 border-b border-sky-100/60 dark:border-gray-800/50 mb-12 -mx-6 px-6 sm:-mx-10 sm:px-10 md:-mx-16 md:px-16">
          <div className="overflow-x-auto no-scrollbar">
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
                      flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap text-[13px] font-semibold
                      ${isActive
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                        : 'text-sky-600/40 dark:text-sky-400/40 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-500/[0.04]'}
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

        <main className="pb-24">
          {/* Preferences (students only) */}
          {!isGuardian && (
            <section id="preferences" className="scroll-mt-24 mb-20">
              <h2 className="text-2xl lg:text-3xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-6">
                Preferences
              </h2>
              <PreferencesSection
                aiPersonality={aiPersonality}
                onPersonalityChange={handlePersonalityChange}
                useWideLayout={isWideLayout}
                onToggleWideLayout={toggleWideLayout}
                showCalendarWidget={showCalendarWidget}
                onToggleCalendarWidget={handleToggleCalendarWidget}
                showTestsInClassCards={showTestsInClassCards}
                onToggleTestsInClassCards={handleToggleTestsInClassCards}
                advancedAIMode={advancedAIMode}
                onToggleAdvancedAIMode={handleToggleAdvancedAIMode}
              />
              <div className="mt-20 border-b border-sky-100 dark:border-gray-800" />
            </section>
          )}

          {/* Guardian Access (students only, Family tier) */}
          {!isGuardian && (() => {
            const tier = getPlanTier();
            const limits = TIER_LIMITS[tier];
            const hasGuardianAccess = limits.guardianDashboard;

            return (
              <section id="guardian" className="scroll-mt-24 mb-20">
                <h2 className="text-2xl lg:text-3xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-6">
                  Guardian Access
                </h2>
                {hasGuardianAccess ? (
                  <GuardianAccessSettings />
                ) : (
                  <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-500/15 dark:to-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Lock className="w-7 h-7 text-sky-500 dark:text-sky-400" />
                    </div>
                    <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-2">
                      Guardian Access is a Family feature
                    </h3>
                    <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-6 max-w-md mx-auto">
                      Let a parent or guardian monitor your progress with a secure invite code. They can view your classes, homework, and test data — nothing else.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-lg mx-auto">
                      <div className="flex items-center gap-2.5 p-3 bg-sky-50/60 dark:bg-sky-500/[0.06] rounded-xl">
                        <Shield className="w-4 h-4 text-sky-500 shrink-0" />
                        <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Secure invite codes</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 bg-sky-50/60 dark:bg-sky-500/[0.06] rounded-xl">
                        <Users className="w-4 h-4 text-sky-500 shrink-0" />
                        <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Up to 4 children</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 bg-sky-50/60 dark:bg-sky-500/[0.06] rounded-xl">
                        <Lock className="w-4 h-4 text-sky-500 shrink-0" />
                        <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Read-only access</span>
                      </div>
                    </div>
                    <a
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-full transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                      Upgrade to Family
                    </a>
                    <p className="text-[11px] text-sky-500/30 dark:text-sky-400/20 mt-3">
                      Guardian Access requires the Family plan.
                    </p>
                  </div>
                )}
                <div className="mt-20 border-b border-sky-100 dark:border-gray-800" />
              </section>
            );
          })()}

          {/* Google Classroom (students only) */}
          {!isGuardian && (
            <section id="classroom" className="scroll-mt-24 mb-20">
              <h2 className="text-2xl lg:text-3xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-6">
                Google Classroom
              </h2>
              <GoogleClassroomSection />
              <div className="mt-20 border-b border-sky-100 dark:border-gray-800" />
            </section>
          )}

          {/* Accessibility */}
          <section id="accessibility" className="scroll-mt-24 mb-20">
            <h2 className="text-2xl lg:text-3xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-6">
              Accessibility
            </h2>
            <AccessibilitySection
              reduceMotion={reduceMotion}
              onToggleReduceMotion={handleToggleReduceMotion}
              useDyslexicFont={useDyslexicFont}
              onToggleDyslexicFont={handleToggleDyslexicFont}
            />
            <div className="mt-20 border-b border-sky-100 dark:border-gray-800" />
          </section>

          {/* Data Management (students only) */}
          {!isGuardian && (
            <section id="data" className="scroll-mt-24 mb-20">
              <h2 className="text-2xl lg:text-3xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-6">
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
              <div className="mt-20 border-b border-sky-100 dark:border-gray-800" />
            </section>
          )}

          {/* Account */}
          <section id="account" className="scroll-mt-24">
            <h2 className="text-2xl lg:text-3xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-6">
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
          </section>
        </main>

        {/* Footer */}
        <div className="pt-8 border-t border-sky-100 dark:border-gray-800">
          <p className="text-xs text-sky-600/30 dark:text-sky-400/30">
            {isGuardian ? 'Guardian Account' : 'Built for students'} • Public Beta {getFullVersionString()}
          </p>
        </div>
      </div>
    </div>
  );
}
