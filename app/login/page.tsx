'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { supabase } from '@/lib/supabase/client';
import { BetaPasswordModal } from '@/components/BetaPasswordModal';
import { Button } from '@/components/animate-ui/primitives/buttons/button';
import { useDarkMode } from '@/context/DarkModeContext';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [betaAccessGranted, setBetaAccessGranted] = useState(false);
  const { signIn: login } = useAuth();
  const { isDark } = useDarkMode();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    if (!betaAccessGranted) {
      setShowBetaModal(true);
      return;
    }

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

  const handleBetaSuccess = () => {
    setBetaAccessGranted(true);
    handleGoogleSignIn();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
      console.error('Login error:', err);
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
                Welcome <span className="text-emerald-500">back.</span>
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
                <label className="text-[11px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.1em] ml-1">
                  Email Address
                </label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/30 dark:text-[#4a9cdb]/30 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/8 dark:border-[#4a9cdb]/8 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#275085]/30 dark:focus:border-[#4a9cdb]/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275085]/5 dark:focus:ring-[#4a9cdb]/5 transition-all text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/25 dark:placeholder:text-[#4a9cdb]/25"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-end mr-1">
                  <label className="text-[11px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.1em] ml-1">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[11px] text-[#275085] dark:text-[#4a9cdb] hover:underline font-bold opacity-60">
                    Forgot?
                  </Link>
                </div>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/30 dark:text-[#4a9cdb]/30 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/8 dark:border-[#4a9cdb]/8 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#275085]/30 dark:focus:border-[#4a9cdb]/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275085]/5 dark:focus:ring-[#4a9cdb]/5 transition-all text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/25 dark:placeholder:text-[#4a9cdb]/25"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex items-center justify-start gap-3 cursor-pointer py-2 group">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-400 data-[state=checked]:border-emerald-500 dark:data-[state=checked]:border-emerald-400 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] rounded-md border border-[#275085]/8 dark:border-[#4a9cdb]/8 transition-colors"
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

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#4a9cdb] dark:hover:bg-[#3d8bc4] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Login <ArrowRight size={16} /></>}
              </Button>
            </form>

            {/* OR Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#275085]/10 dark:border-[#4a9cdb]/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-4 bg-white/80 dark:bg-zinc-900/80 text-[#275085]/40 dark:text-[#4a9cdb]/40 uppercase tracking-widest font-bold backdrop-blur-xl">or</span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              disabled={isGoogleLoading}
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-4 bg-white dark:bg-zinc-900 border border-[#275085]/10 dark:border-[#4a9cdb]/10 text-sm font-bold text-[#275085] dark:text-[#4a9cdb] rounded-2xl flex items-center justify-center gap-3 hover:bg-[#275085]/[0.03] dark:hover:bg-white/[0.03] transition-all shadow-sm"
              hoverScale={1.01}
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isGoogleLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Continue with Google"}
            </Button>

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

      {/* Beta Password Modal */}
      <BetaPasswordModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        onSuccess={handleBetaSuccess}
      />
    </div>
  );
}