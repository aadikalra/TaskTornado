'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowRight, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/animate-ui/primitives/buttons/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDarkMode } from '@/context/DarkModeContext';
import Image from 'next/image';
import { isEmailBlocked, isNameBlocked, BLOCKED_ERROR_MESSAGE } from '@/lib/blockedNames';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyName, setVerifyName] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { signIn: login } = useAuth();
  const { isDark } = useDarkMode();
  const router = useRouter();
  const [priorAccounts, setPriorAccounts] = useState<any[]>([]);

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

  // Check if user is typing
  useEffect(() => {
    const hasInput = email.length > 0 || password.length > 0;
    setIsTyping(hasInput);
  }, [email, password]);

  const handlePriorAccountClick = (account: any) => {
    if (account.provider === 'google') {
      // For Google accounts, pre-fill and proceed
      setVerifyName(account.full_name);
      setVerifyEmail(account.email);
      proceedWithGoogleSignIn();
    } else {
      // For email accounts, fill email and focus password
      setEmail(account.email);
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
      if (passwordInput) passwordInput.focus();
    }
  };

  const removeAccount = (emailToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger login
    const updated = priorAccounts.filter(a => a.email !== emailToRemove);
    setPriorAccounts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prior-accounts', JSON.stringify(updated));
    }
  };

  const handleGoogleSignIn = async () => {
    setShowVerifyModal(true);
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

    // Proceed with Google sign-in after verification
    setShowVerifyModal(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Block restricted emails on regular login too
    if (isEmailBlocked(email)) {
      setError(BLOCKED_ERROR_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      await login(email, password, rememberMe);

      // Check account type to determine redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', user.id)
          .single();

        if (profile?.account_type === 'guardian') {
          // Check if guardian has linked children
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

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first, then click "Forgot?" to receive a reset link.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) throw error;
      setError('Password reset link sent! Please check your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#f6fae7] via-[#f6fae7] to-[#FCFDF5] dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 flex flex-col md:flex-row overflow-hidden font-sans relative">

      {/* ── Ambient glows (matching hero) ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#275085]/[0.04] dark:bg-[#4a9cdb]/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-400/[0.03] dark:bg-violet-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-emerald-400/[0.03] dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* ── Main Layout Wrapper ─────────────────── */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col md:flex-row relative z-10 min-h-screen px-4 sm:px-6 md:px-12 lg:px-16">

        {/* ── Left Section: Branding & Features ─────────────────── */}
        <div className="hidden md:flex flex-1 relative flex-col justify-center pt-8 pr-8 lg:pr-12">
          <div className="relative z-10 flex flex-col gap-6 w-full">
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <h2 className="text-4xl lg:text-[52px] font-bold text-[#275085] dark:text-[#4a9cdb] leading-[1.08] tracking-tight">
                Welcome <span className="text-[#fabc32]">back.</span>
              </h2>
            </motion.div>

            {/* Hero illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="w-full"
            >
              <Image
                src="/signup-hero.png"
                alt="Student using TaskTornado"
                width={800}
                height={800}
                className="w-full h-auto max-h-[55vh] max-w-[480px] object-contain object-left drop-shadow-sm"
                priority
              />
            </motion.div>
          </div>
        </div>

        {/* ── Right Section: Sign In Form ──────────────────────── */}
        <div className="flex-1 flex items-center justify-center md:justify-end py-20 relative">
          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="w-full max-w-[460px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-[#275085]/8 dark:border-[#4a9cdb]/10 rounded-3xl sm:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(39,80,133,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-[#275085] dark:text-[#4a9cdb] tracking-tight">
                Login
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-normal ml-1">
                  Email Address
                </label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/40 dark:text-[#4a9cdb]/40 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                      <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" />
                      <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/8 dark:border-[#4a9cdb]/8 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#275085]/30 dark:focus:border-[#4a9cdb]/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275085]/5 dark:focus:ring-[#4a9cdb]/5 transition-all text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/25 dark:placeholder:text-[#4a9cdb]/25"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-end mr-1">
                  <label className="text-[12px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-normal ml-1">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-[#275085]/60 hover:text-[#275085] dark:text-[#4a9cdb]/60 dark:hover:text-[#4a9cdb] font-bold transition-colors cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/40 dark:text-[#4a9cdb]/40 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round">
    <path d="M4.26781 18.8447C4.49269 20.515 5.87613 21.8235 7.55966 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.879 17.7547 20 16.6376 20 15.5C20 14.3624 19.879 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26781 12.1553C4.12105 13.2453 4 14.3624 4 15.5C4 16.6376 4.12105 17.7547 4.26781 18.8447Z" />
    <path d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9" />
    <path d="M12.125 15.5H12M12.25 15.5C12.25 15.6381 12.1381 15.75 12 15.75C11.8619 15.75 11.75 15.6381 11.75 15.5C11.75 15.3619 11.8619 15.25 12 15.25C12.1381 15.25 12.25 15.3619 12.25 15.5Z" />
    <path d="M8.125 15.5H8M8.25 15.5C8.25 15.6381 8.13807 15.75 8 15.75C7.86193 15.75 7.75 15.6381 7.75 15.5C7.75 15.3619 7.86193 15.25 8 15.25C8.13807 15.25 8.25 15.3619 8.25 15.5Z" />
    <path d="M16.125 15.5H16M16.25 15.5C16.25 15.6381 16.1381 15.75 16 15.75C15.8619 15.75 15.75 15.6381 15.75 15.5C15.75 15.3619 15.8619 15.25 16 15.25C16.1381 15.25 16.25 15.3619 16.25 15.5Z" />
</svg>
                  </div>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/8 dark:border-[#4a9cdb]/8 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#275085]/30 dark:focus:border-[#4a9cdb]/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275085]/5 dark:focus:ring-[#4a9cdb]/5 transition-all text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/25 dark:placeholder:text-[#4a9cdb]/25"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex items-center justify-start gap-3 cursor-pointer py-2 group">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-400 data-[state=checked]:border-emerald-500 dark:data-[state=checked]:border-emerald-400 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] rounded-sm border border-[#275085]/8 dark:border-[#4a9cdb]/8 transition-colors"
                />
                <span className="text-[12px] text-[#275085]/50 dark:text-[#4a9cdb]/50 leading-relaxed font-medium mt-0.5 select-none">
                  Keep me signed in
                </span>
              </label>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-900/20 text-xs text-red-600 dark:text-red-400 text-center font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Prior Accounts (Quick Login) */}
              <AnimatePresence>
                {!isTyping && priorAccounts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <label className="text-[12px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-normal ml-1 mb-2 block">
                      Quick Login
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {priorAccounts.map((account) => (
                        <motion.div
                          key={account.email}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handlePriorAccountClick(account)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handlePriorAccountClick(account)}
                          className="w-full p-2.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-2xl flex items-center gap-3 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group relative overflow-hidden cursor-pointer outline-none focus:ring-2 focus:ring-[#275085]/20 dark:focus:ring-[#4a9cdb]/20"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#275085] to-[#fabc32] dark:from-[#4a9cdb] dark:to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden shadow-sm relative">
                            {account.avatar_url ? (
                              <Image src={account.avatar_url} alt={account.full_name} fill className="object-cover" />
                            ) : (
                              account.full_name[0]
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-[12px] font-bold text-[#275085] dark:text-[#4a9cdb] truncate leading-none mb-1">
                              {account.full_name}
                            </p>
                            <p className="text-[10px] text-[#275085]/40 dark:text-[#4a9cdb]/40 truncate font-medium">
                              {account.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {account.provider === 'google' && (
                              <div className="w-4 h-4 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm border border-[#275085]/5">
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => removeAccount(account.email, e)}
                              className="p-1.5 text-[#275085]/20 dark:text-[#4a9cdb]/20 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors z-20"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit and Google Login - Dynamic Layout */}
            <div className="flex flex-col md:flex-row gap-3">
              <motion.div
                className={isTyping ? "flex-1" : "flex-1"}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                layout
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#4a9cdb] dark:hover:bg-[#3d8bc4] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Login <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round">
    <path d="M8.00002 8C8.00002 7.42459 8.00002 7.17765 8.04465 6.92457C8.21993 5.93047 8.89355 5.09255 9.83302 4.70001C10.0723 4.60003 10.3559 4.53526 10.9232 4.40573L13.6508 3.78286C17.0405 3.00882 18.7353 2.6218 19.8677 3.51317C21 4.40454 21 6.1257 21 9.56803L21 14.432C21 17.8743 21 19.5955 19.8676 20.4868C18.7353 21.3782 17.0405 20.9912 13.6508 20.2171L10.9232 19.5943C10.3559 19.4647 10.0723 19.4 9.833 19.3C8.89353 18.9074 8.21991 18.0695 8.04462 17.0754C8 16.8224 8 16.5754 8 16" />
    <path d="M13 9C13 9 16 11.2095 16 12C16 12.7906 13 15 13 15M15.5 12H3" />
</svg></>}
                </Button>
              </motion.div>
              
              <AnimatePresence>
                {!isTyping && (
                  <motion.div
                    initial={{ opacity: 1, width: 'auto', flex: 1 }}
                    exit={{ opacity: 0, width: 0, flex: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="flex-1 flex gap-2"
                  >
                    <Button
                      disabled={isGoogleLoading}
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="flex-1 py-3 bg-white dark:bg-zinc-900 border border-[#275085]/10 dark:border-[#4a9cdb]/10 text-sm font-bold text-[#275085] dark:text-[#4a9cdb] rounded-2xl flex items-center justify-center hover:bg-[#275085]/[0.03] dark:hover:bg-white/[0.03] shadow-sm"
                      hoverScale={1.01}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </Button>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          disabled={true}
                          type="button"
                          className="flex-1 py-3 bg-white dark:bg-zinc-900 border border-[#275085]/10 dark:border-[#4a9cdb]/10 text-sm font-bold text-[#275085]/30 dark:text-[#4a9cdb]/30 rounded-2xl flex items-center justify-center cursor-not-allowed opacity-50"
                        >
                          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Coming in a future update</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          disabled={true}
                          type="button"
                          className="flex-1 py-3 bg-white dark:bg-zinc-900 border border-[#275085]/10 dark:border-[#4a9cdb]/10 text-sm font-bold text-[#275085]/30 dark:text-[#4a9cdb]/30 rounded-2xl flex items-center justify-center cursor-not-allowed opacity-50"
                        >
                          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.016.026-3.908 1.175-4.953 3.019-2.147 3.721-1.088 9.276 1.519 12.314 1.037 1.264 2.247 2.674 3.831 2.622 1.543-.05 2.123-.988 3.99-.988 1.865 0 2.408.988 4.03.952 1.648-.05 2.706-1.29 3.702-2.571 1.197-1.524 1.676-3.019 1.698-3.099-.04-.014-3.233-1.235-3.258-4.915-.022-3.099 2.525-4.581 2.637-4.657-1.444-2.108-3.682-2.214-4.466-2.261zm3.268-4.336c.832-1.008 1.393-2.415 1.242-3.812-1.2.05-2.647.799-3.511 1.807-.765.896-1.425 2.334-1.247 3.715 1.34.104 2.704-.676 3.516-1.71z"/>
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Coming in a future update</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </form>

            {/* Sign up link */}
            <div className="mt-8 text-center">
              <p className="text-[12px] text-[#275085]/40 dark:text-[#4a9cdb]/40 font-medium">
                First time here?{' '}
                <Link href="/signup" className="text-emerald-500 dark:text-emerald-400 font-bold hover:underline underline-offset-4 decoration-2">
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Identity Verification Modal (before Google sign-in) */}
      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-2xl shadow-blue-900/10 border border-gray-100 dark:border-zinc-800"
            >
              {/* Header */}
              <div className="bg-[#275085]/5 dark:bg-[#4a9cdb]/5 px-8 py-6 flex items-center justify-between border-b border-[#275085]/10 dark:border-[#4a9cdb]/10">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#275085] dark:bg-[#4a9cdb] rounded-2xl shadow-lg shadow-[#275085]/20">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                      Verify Identity
                    </h2>
                    <p className="text-[11px] font-bold text-[#275085] dark:text-[#4a9cdb] uppercase tracking-widest">
                      Before Google Sign-In
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleVerifySubmit} className="p-8 space-y-5">
                <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  Please enter your name and email. <strong className="text-[#275085] dark:text-[#4a9cdb]">These must exactly match your Google account credentials</strong> to continue with sign-in.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-normal ml-1">
                    Full Name
                  </label>
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/30 dark:text-[#4a9cdb]/30 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={verifyName}
                      onChange={(e) => setVerifyName(e.target.value)}
                      placeholder="Enter your full name (must match Google account)"
                      className="w-full pl-12 pr-4 py-3 bg-[#275085]/3 dark:bg-[#4a9cdb]/3 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-2xl text-[13px] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#275085]/20 dark:focus:ring-[#4a9cdb]/20 focus:border-[#275085] dark:focus:border-[#4a9cdb] transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-normal ml-1">
                    Email Address
                  </label>
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/30 dark:text-[#4a9cdb]/30 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={verifyEmail}
                      onChange={(e) => setVerifyEmail(e.target.value)}
                      placeholder="Enter your email (must match Google account)"
                      className="w-full pl-12 pr-4 py-3 bg-[#275085]/3 dark:bg-[#4a9cdb]/3 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-2xl text-[13px] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#275085]/20 dark:focus:ring-[#4a9cdb]/20 focus:border-[#275085] dark:focus:border-[#4a9cdb] transition-all"
                      required
                    />
                  </div>
                </div>

                {verifyError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-[12px] text-red-600 dark:text-red-400">
                    {verifyError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full py-3 bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#4a9cdb] dark:hover:bg-[#3d8bc4] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  Continue with Google <ArrowRight size={16} />
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </TooltipProvider>
  );
}