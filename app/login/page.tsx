'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User, Mail, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { isEmailBlocked, isNameBlocked, BLOCKED_ERROR_MESSAGE } from '@/lib/blockedNames';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { HugeIcon } from '@/lib/huge-icon-map';

// TypewriterText matching the signup page style
const TypewriterText = ({ text, onComplete, delay = 30 }: { text: string; onComplete?: () => void; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return <span className="font-sans text-[15px] tracking-tight">{displayedText}</span>;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const { signIn: login } = useAuth();

  // Form states
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Flow control states
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: Password, 3: Remember & Action
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [typingStep, setTypingStep] = useState(1);
  const [typingProgress, setTypingProgress] = useState(0);

  // Google Verify inline states
  const [isVerifyingGoogle, setIsVerifyingGoogle] = useState(false);
  const [verifyName, setVerifyName] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyHeaderCompleted, setVerifyHeaderCompleted] = useState(false);

  useEffect(() => {
    if (isVerifyingGoogle) {
      setVerifyHeaderCompleted(false);
    }
  }, [isVerifyingGoogle]);

  // Prior Accounts state
  const [priorAccounts, setPriorAccounts] = useState<any[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Typewriter effect for Step 1
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingProgress((prev) => {
        if (prev >= 28) {
          clearInterval(interval);
          return 28;
        }
        return prev + 1;
      });
    }, 35);
    return () => clearInterval(interval);
  }, []);

  // Fetch prior accounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('prior-accounts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPriorAccounts(parsed);
        } catch (e) {
          console.error('Failed to parse prior accounts:', e);
        }
      }
    }
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (containerRef.current) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentStep, typingStep, error]);

  const handlePriorAccountClick = (account: any) => {
    if (account.provider === 'google') {
      setVerifyName(account.full_name);
      setVerifyEmail(account.email);
      proceedWithGoogleSignIn();
    } else {
      setEmail(account.email);
      if (!completedSteps.includes(1)) {
        setCompletedSteps([...completedSteps, 1]);
      }
      setCurrentStep(2);
      setTypingStep(2);
    }
  };

  const removeAccount = (emailToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = priorAccounts.filter(a => a.email !== emailToRemove);
    setPriorAccounts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prior-accounts', JSON.stringify(updated));
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    if (!completedSteps.includes(1)) {
      setCompletedSteps([...completedSteps, 1]);
    }
    setCurrentStep(2);
    setTypingStep(2);
  };



  const handleGoogleSignIn = () => {
    setIsVerifyingGoogle(true);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    if (isNameBlocked(verifyName)) {
      setVerifyError(BLOCKED_ERROR_MESSAGE);
      return;
    }
    if (isEmailBlocked(verifyEmail)) {
      setVerifyError(BLOCKED_ERROR_MESSAGE);
      return;
    }

    setIsVerifyingGoogle(false);
    proceedWithGoogleSignIn();
  };

  const proceedWithGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setError('Failed to initiate Google sign-in. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isEmailBlocked(email)) {
      setError(BLOCKED_ERROR_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      await login(email, password, rememberMe);

      // Check account type for redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', user.id)
          .single();

        if (profile?.account_type === 'guardian') {
          const { data: links } = await supabase
            .from('parent_links')
            .select('id')
            .eq('parent_id', user.id)
            .eq('status', 'active')
            .limit(1);

          router.push(links?.length ? '/guardian/dashboard' : '/guardian/link');
          return;
        }
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStep = (stepNumber: number) => {
    if (loading) return;
    setCurrentStep(stepNumber);
    setError('');
    setCompletedSteps(completedSteps.filter(s => s < stepNumber));
    if (stepNumber === 1) {
      setTypingProgress(28);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6fae7] via-[#f6fae7] to-[#FCFDF5] dark:from-[#0a0f1d] dark:via-[#090d1a] dark:to-[#03050c] text-[#275085] dark:text-[#a0c3ff] flex flex-col justify-between items-center selection:bg-[#275085] dark:selection:bg-[#a0c3ff] selection:text-white dark:selection:text-[#0a0f1d] font-sans pb-12 pt-20 px-4 md:px-8">
      {/* Main Conversation Container */}
      <div ref={containerRef} className="max-w-[600px] w-full flex-1 flex flex-col justify-center space-y-12 py-12">
        
        {/* Quick Login - Prior Accounts List */}
        <AnimatePresence>
          {currentStep === 1 && priorAccounts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 28 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden space-y-3 pl-6"
            >
              <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50 font-sans text-[11px] uppercase tracking-wider select-none block">
                Quick Login
              </span>
              <div className="flex flex-wrap gap-2">
                {priorAccounts.map((account) => (
                  <div
                    key={account.email}
                    onClick={() => handlePriorAccountClick(account)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#275085]/5 dark:bg-[#a0c3ff]/5 hover:bg-[#275085]/10 dark:hover:bg-[#a0c3ff]/10 rounded-full transition-all cursor-pointer select-none group border border-[#275085]/5 dark:border-[#a0c3ff]/5 hover:border-[#275085]/10 dark:hover:border-[#a0c3ff]/10"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#275085] dark:bg-[#a0c3ff] flex items-center justify-center text-white dark:text-[#0a0f1d] text-[9px] font-bold shrink-0 overflow-hidden relative">
                      {account.avatar_url ? (
                        <img src={account.avatar_url} alt={account.full_name} className="object-cover w-full h-full" />
                      ) : (
                        account.full_name[0]
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#275085] dark:text-[#a0c3ff] truncate max-w-[120px]">
                      {account.full_name.split(' ')[0]}
                    </span>
                    {account.provider === 'google' && (
                      <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAccount(account.email, e);
                      }}
                      className="p-0.5 text-[#275085]/30 dark:text-[#a0c3ff]/30 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isVerifyingGoogle ? (
          <motion.div
            key="google-verify-inline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative pl-6 space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#275085] dark:bg-[#a0c3ff] absolute left-0 top-2" />
              <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50 font-sans text-[12px] uppercase tracking-wider select-none">Google verification</span>
            </div>

            <div className="mt-2 space-y-6 max-w-[450px]">
              <div className="text-[#275085] dark:text-[#a0c3ff] space-y-2">
                <h3 className="font-bold text-base">
                  <TypewriterText 
                    text="Verify Identity" 
                    delay={35} 
                    onComplete={() => setVerifyHeaderCompleted(true)} 
                  />
                </h3>
                <p className="text-sm text-[#275085]/70 dark:text-[#a0c3ff]/70 leading-relaxed min-h-[40px]">
                  {verifyHeaderCompleted && (
                    <TypewriterText 
                      text="Please enter your name and email. These must exactly match your Google credentials to continue." 
                      delay={35} 
                    />
                  )}
                </p>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#275085]/60 dark:text-[#a0c3ff]/60 uppercase tracking-normal ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={verifyName}
                    onChange={(e) => setVerifyName(e.target.value)}
                    className="w-full bg-transparent border-b border-[#275085]/20 dark:border-[#a0c3ff]/20 focus:border-[#275085] dark:focus:border-[#a0c3ff] text-[15px] font-sans focus:outline-none py-1.5 text-[#275085] dark:text-[#a0c3ff] placeholder:text-[#275085]/30 dark:placeholder:text-[#a0c3ff]/30"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#275085]/60 dark:text-[#a0c3ff]/60 uppercase tracking-normal ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-[#275085]/20 dark:border-[#a0c3ff]/20 focus:border-[#275085] dark:focus:border-[#a0c3ff] text-[15px] font-sans focus:outline-none py-1.5 text-[#275085] dark:text-[#a0c3ff] placeholder:text-[#275085]/30 dark:placeholder:text-[#a0c3ff]/30"
                  />
                </div>

                {verifyError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-[12px] text-red-600 dark:text-red-400">
                    {verifyError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#275085] dark:bg-[#4f8df0] hover:bg-[#1e3f6a] dark:hover:bg-[#3b82f6] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#275085]/15 dark:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>Continue with Google</span>
                    <HugeIcon name="ArrowRight01" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifyingGoogle(false);
                      setVerifyError('');
                    }}
                    className="py-3 px-4 bg-white dark:bg-[#0e1726] border border-[#275085]/10 dark:border-[#a0c3ff]/10 text-[#275085]/60 dark:text-[#a0c3ff]/60 rounded-xl hover:bg-[#275085]/5 dark:hover:bg-[#a0c3ff]/5 active:scale-[0.98] transition-all text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <>
            {/* STEP 1: Email Input */}
            <div className="relative pl-6">
          {/* Vertical Connecting Line */}
          {completedSteps.includes(1) && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 0.4 }}
              className="absolute left-[3px] top-6 w-[2px] bg-[#275085]/20 dark:bg-[#a0c3ff]/20"
            />
          )}
          
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${completedSteps.includes(1) ? 'bg-[#275085]/40 dark:bg-[#a0c3ff]/40' : 'bg-[#275085] dark:bg-[#a0c3ff] animate-pulse'} absolute left-0 top-2`} />
            <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50 font-sans text-[12px] uppercase tracking-wider select-none">Question 01</span>
          </div>

          <div className="mt-2 font-sans text-[15px] tracking-tight leading-relaxed text-[#275085] dark:text-[#a0c3ff]">
            {emailParam ? (
              currentStep === 1 ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>We sent a verification email to <strong className="text-[#275085] dark:text-white">{email}</strong>. Did you verify it?</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!completedSteps.includes(1)) {
                        setCompletedSteps([...completedSteps, 1]);
                      }
                      setCurrentStep(2);
                      setTypingStep(2);
                    }}
                    className="font-sans text-[15px] text-[#275085] dark:text-[#a0c3ff] font-bold underline underline-offset-4 decoration-2 hover:text-[#1e3f6a] dark:hover:text-blue-300"
                  >
                    Yes, I did!
                  </button>
                  <span className="text-[#275085]/40 dark:text-[#a0c3ff]/40 select-none">or</span>
                  <button
                    type="button"
                    onClick={() => {
                      router.replace('/login');
                      setEmail('');
                    }}
                    className="font-sans text-[15px] text-[#275085]/55 dark:text-[#a0c3ff]/55 hover:text-[#275085] dark:hover:text-white underline hover:underline-offset-4"
                  >
                    Change email
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 font-sans text-[14px]">
                  <span className="text-[#275085] dark:text-[#a0c3ff] font-bold">{email}</span>
                  {completedSteps.includes(1) && (
                    <button
                      type="button"
                      onClick={() => handleEditStep(1)}
                      className="text-xs text-[#275085]/55 dark:text-[#a0c3ff]/55 hover:text-[#275085] dark:hover:text-white underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="text-[#275085] dark:text-[#a0c3ff] flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{"What is your email address?".slice(0, typingProgress)}</span>
                  {typingProgress >= 28 && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span className="text-[#275085]/40 dark:text-[#a0c3ff]/40 text-sm">or</span>
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="font-sans text-[15px] text-[#275085] dark:text-[#a0c3ff] font-bold underline underline-offset-4 decoration-2 hover:text-[#1e3f6a] dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        sign in with Google
                      </button>
                    </motion.div>
                  )}
                </div>

                {currentStep === 1 ? (
                  <form onSubmit={handleEmailSubmit} className="flex max-w-[400px] border-b border-[#275085]/20 dark:border-[#a0c3ff]/20 focus-within:border-[#275085] dark:focus-within:border-[#a0c3ff] transition-all items-center py-1">
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-none text-[15px] font-sans focus:outline-none placeholder:text-[#275085]/30 dark:placeholder:text-[#a0c3ff]/30 py-1 text-[#275085] dark:text-[#a0c3ff]"
                      autoFocus
                    />
                    <button type="submit" className="p-1 hover:text-[#275085] dark:hover:text-[#a0c3ff] text-[#275085]/50 dark:text-[#a0c3ff]/50 transition-colors">
                      <HugeIcon name="ArrowRight01" size={18} />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 font-sans text-[14px]">
                    <span className="text-[#275085] dark:text-[#a0c3ff] font-bold">{email}</span>
                    {completedSteps.includes(1) && (
                      <button
                        type="button"
                        onClick={() => handleEditStep(1)}
                        className="text-xs text-[#275085]/55 dark:text-[#a0c3ff]/55 hover:text-[#275085] dark:hover:text-white underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: Password Input */}
        {currentStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative pl-6"
          >
            {completedSteps.includes(2) && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                transition={{ duration: 0.4 }}
                className="absolute left-[3px] top-6 w-[2px] bg-[#275085]/20 dark:bg-[#a0c3ff]/20"
              />
            )}
            
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${completedSteps.includes(2) ? 'bg-[#275085]/40 dark:bg-[#a0c3ff]/40' : 'bg-[#275085] dark:bg-[#a0c3ff] animate-pulse'} absolute left-0 top-2`} />
              <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50 font-sans text-[12px] uppercase tracking-wider select-none">Question 02</span>
            </div>

            <div className="mt-2 space-y-4">
              <div className="text-[#275085] dark:text-[#a0c3ff] flex justify-between items-center max-w-[400px]">
                {typingStep >= 2 ? (
                  <TypewriterText text="Enter your password." />
                ) : (
                  <span className="font-sans text-[15px] text-[#275085]/50 dark:text-[#a0c3ff]/50">Enter your password.</span>
                )}
                {currentStep === 2 && (
                  <Link
                    href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                    className="text-xs text-[#275085]/60 dark:text-[#a0c3ff]/60 hover:text-[#275085] dark:hover:text-[#a0c3ff] font-bold hover:underline transition-all cursor-pointer"
                  >
                    Forgot?
                  </Link>
                )}
              </div>

              {currentStep === 2 ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!password) return;
                    setCompletedSteps([...completedSteps, 2]);
                    setCurrentStep(3);
                  }}
                  className="flex max-w-[400px] border-b border-[#275085]/20 dark:border-[#a0c3ff]/20 focus-within:border-[#275085] dark:focus-within:border-[#a0c3ff] transition-all items-center py-1"
                >
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-none text-[15px] font-sans focus:outline-none placeholder:text-[#275085]/30 dark:placeholder:text-[#a0c3ff]/30 py-1 text-[#275085] dark:text-[#a0c3ff]"
                    autoFocus
                  />
                  <button type="submit" className="p-1 hover:text-[#275085] dark:hover:text-[#a0c3ff] text-[#275085]/50 dark:text-[#a0c3ff]/50 transition-colors">
                    <HugeIcon name="ArrowRight01" size={18} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3 font-sans text-[14px]">
                  <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50">••••••••</span>
                  {completedSteps.includes(2) && (
                    <button
                      type="button"
                      onClick={() => handleEditStep(2)}
                      className="text-xs text-[#275085]/55 dark:text-[#a0c3ff]/55 hover:text-[#275085] dark:hover:text-white underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Submit and Options */}
        {currentStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative pl-6"
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#275085] dark:bg-[#a0c3ff] absolute left-0 top-2" />
              <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50 font-sans text-[12px] uppercase tracking-wider select-none">Action 03</span>
            </div>

            <div className="mt-2 space-y-6 max-w-[450px]">
              <div className="text-[#275085] dark:text-[#a0c3ff]">
                {typingStep >= 3 ? (
                  <TypewriterText text="Would you like us to remember you?" />
                ) : (
                  <span className="font-sans text-[15px] text-[#275085]/50 dark:text-[#a0c3ff]/50">Would you like us to remember you?</span>
                )}
              </div>

              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <label className="flex items-center gap-3 cursor-pointer py-1 select-none">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-[#275085]/40 dark:border-[#a0c3ff]/40 data-[state=checked]:bg-[#275085] dark:data-[state=checked]:bg-[#4f8df0] data-[state=checked]:border-[#275085] dark:data-[state=checked]:border-[#4f8df0] rounded-md transition-colors cursor-pointer"
                  />
                  <span className="text-xs font-sans text-[#275085]/50 dark:text-[#a0c3ff]/50">
                    Keep me signed in
                  </span>
                </label>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 text-xs font-sans text-red-700 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 p-3.5 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-red-100/60 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                      <HugeIcon name="AlertCircle" size={12} className="text-red-600 dark:text-red-400" />
                    </div>
                    <span className="leading-relaxed font-medium">{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#275085] dark:bg-[#4f8df0] text-white font-sans font-bold text-[14px] hover:bg-[#1e3f6a] dark:hover:bg-[#3b82f6] transition-all rounded-xl active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#275085]/10 dark:shadow-none"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <>
                      <span>Login</span>
                      <HugeIcon name="CheckmarkCircle02" size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
            </>
          )}
      </div>

      {/* Footer Info */}
      <div className="max-w-[600px] w-full mt-12 text-center">
        <p className="font-sans text-xs text-[#275085]/50 dark:text-[#a0c3ff]/50">
          First time here?{' '}
          <Link href="/signup" className="text-[#275085] dark:text-[#4f8df0] hover:underline font-bold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}