'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowRight, User, ShieldCheck, GraduationCap, Users, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { Button } from '@/components/animate-ui/primitives/buttons/button';
import { useDarkMode } from '@/context/DarkModeContext';
import Image from 'next/image';
import { getBlockedError } from '@/lib/blockedNames';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [accountType, setAccountType] = useState<'student' | 'guardian'>('student');
  const [guardianHover, setGuardianHover] = useState(false);
  const { signUp } = useAuth();
  const { isDark } = useDarkMode();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Block restricted names and emails
    const blockedError = getBlockedError(name, email);
    if (blockedError) {
      setError(blockedError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name, accountType);
      // After signup, Supabase requires email confirmation.
      // Redirect to login — the login page will route guardians correctly after they log in.
      router.push('/login');
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message?.includes('already exists')) {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'Failed to create an account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
                Welcome <span className="text-emerald-500">aboard.</span>
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

        {/* ── Right Section: Sign Up Form ──────────────────────── */}
        <div className="flex-1 flex items-center justify-center md:justify-end py-20 relative">
          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="w-full max-w-[460px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-[#275085]/8 dark:border-[#4a9cdb]/10 rounded-3xl sm:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(39,80,133,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
          >

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-[#275085] dark:text-[#4a9cdb] tracking-tight">
                Signup
              </h1>
            </div>

            {/* Account Type Selector */}
            <div className="relative mb-6">
              <div className="flex items-center gap-1.5 ml-1 mb-2">
                <label className="text-[11px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.1em]">
                  I am a
                </label>
                <div
                  className="relative"
                  onMouseEnter={() => setGuardianHover(true)}
                  onMouseLeave={() => setGuardianHover(false)}
                >
                  <HelpCircle size={13} className="text-[#275085]/30 dark:text-[#4a9cdb]/30 hover:text-[#275085]/60 dark:hover:text-[#4a9cdb]/60 transition-colors cursor-help" />

                  {/* Floating info card */}
                  <AnimatePresence>
                    {guardianHover && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[260px] z-50 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-[#275085]/10 dark:border-[#4a9cdb]/10 shadow-xl shadow-[#275085]/8 dark:shadow-black/30"
                      >
                        {/* Arrow */}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-zinc-900 border-l border-t border-[#275085]/10 dark:border-[#4a9cdb]/10" />

                        <p className="text-[11px] font-bold text-[#275085] dark:text-[#4a9cdb] mb-2 leading-snug">
                          What&apos;s the difference?
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[10.5px] text-[#275085]/60 dark:text-[#4a9cdb]/60 leading-relaxed">
                            <span className="font-bold text-[#275085]/80 dark:text-[#4a9cdb]/80">Student</span> — Full access: add homework, use tools, track your own progress.
                          </p>
                          <p className="text-[10.5px] text-[#275085]/60 dark:text-[#4a9cdb]/60 leading-relaxed">
                            <span className="font-bold text-[#275085]/80 dark:text-[#4a9cdb]/80">Guardian</span> — Monitor only: view grades, progress, and activity of a linked student.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="relative flex p-1 bg-[#275085]/[0.04] dark:bg-[#4a9cdb]/[0.04] border border-[#275085]/8 dark:border-[#4a9cdb]/8 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setAccountType('student')}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors duration-300 ${accountType === 'student'
                    ? 'text-[#275085] dark:text-[#4a9cdb]'
                    : 'text-[#275085]/40 dark:text-[#4a9cdb]/40 hover:text-[#275085]/60 dark:hover:text-[#4a9cdb]/60'
                    }`}
                >
                  <GraduationCap size={16} />
                  Student
                  {accountType === 'student' && (
                    <motion.div
                      layoutId="account-type-pill"
                      className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-[#275085]/8 dark:border-[#4a9cdb]/10"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('guardian')}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors duration-300 ${accountType === 'guardian'
                    ? 'text-[#275085] dark:text-[#4a9cdb]'
                    : 'text-[#275085]/40 dark:text-[#4a9cdb]/40 hover:text-[#275085]/60 dark:hover:text-[#4a9cdb]/60'
                    }`}
                >
                  <Users size={16} />
                  Guardian
                  {accountType === 'guardian' && (
                    <motion.div
                      layoutId="account-type-pill"
                      className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-[#275085]/8 dark:border-[#4a9cdb]/10"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.1em] ml-1">
                  Full Name
                </label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/30 dark:text-[#4a9cdb]/30 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/8 dark:border-[#4a9cdb]/8 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#275085]/30 dark:focus:border-[#4a9cdb]/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275085]/5 dark:focus:ring-[#4a9cdb]/5 transition-all text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/25 dark:placeholder:text-[#4a9cdb]/25"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.1em] ml-1">
                  Email Address
                </label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/30 dark:text-[#4a9cdb]/30 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/8 dark:border-[#4a9cdb]/8 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#275085]/30 dark:focus:border-[#4a9cdb]/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275085]/5 dark:focus:ring-[#4a9cdb]/5 transition-all text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/25 dark:placeholder:text-[#4a9cdb]/25"
                  />
                </div>
              </div>

              {/* Password row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.1em] ml-1">
                    Password
                  </label>
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/30 dark:text-[#4a9cdb]/30 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/8 dark:border-[#4a9cdb]/8 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#275085]/30 dark:focus:border-[#4a9cdb]/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275085]/5 dark:focus:ring-[#4a9cdb]/5 transition-all text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/25 dark:placeholder:text-[#4a9cdb]/25"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.1em] ml-1">
                    Confirm
                  </label>
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/30 dark:text-[#4a9cdb]/30 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                      <ShieldCheck size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/8 dark:border-[#4a9cdb]/8 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#275085]/30 dark:focus:border-[#4a9cdb]/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275085]/5 dark:focus:ring-[#4a9cdb]/5 transition-all text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/25 dark:placeholder:text-[#4a9cdb]/25"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-center justify-start gap-3 cursor-pointer py-1 group">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-400 data-[state=checked]:border-emerald-500 dark:data-[state=checked]:border-emerald-400 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] rounded-md border border-[#275085]/8 dark:border-[#4a9cdb]/8 transition-colors"
                />
                <span className="text-[12px] text-[#275085]/50 dark:text-[#4a9cdb]/50 leading-relaxed font-medium mt-0.5">
                  I agree to the <Link href="/terms" className="text-emerald-500 dark:text-emerald-400 font-bold hover:underline">Terms</Link> and <Link href="/privacy" className="text-emerald-500 dark:text-emerald-400 font-bold hover:underline">Privacy Policy</Link>.
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

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#4a9cdb] dark:hover:bg-[#3d8bc4] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Signup <ArrowRight size={16} /></>}
              </Button>
            </form>

            {/* Sign in link */}
            <div className="mt-8 text-center">
              <p className="text-[12px] text-[#275085]/40 dark:text-[#4a9cdb]/40 font-medium">
                Already have an account?{' '}
                <Link href="/login" className="text-emerald-500 dark:text-emerald-400 font-bold hover:underline underline-offset-4 decoration-2">
                  Sign in instead
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
