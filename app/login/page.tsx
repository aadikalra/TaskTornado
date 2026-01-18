'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowRight, Sparkles, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/animate-ui/radix/checkbox';
import { supabase } from '@/lib/supabase/client';
import { BetaPasswordModal } from '@/components/BetaPasswordModal';
import { Button } from '@/components/animate-ui/primitives/buttons/button';
import { useDarkMode } from '@/context/DarkModeContext';
import DotGrid from '../DotGrid';

const TaskTornadoIcon = ({ size = 24, isDarkMode = false }: { size?: number; isDarkMode?: boolean }) => (
  <img
    width={size}
    height={size}
    src={isDarkMode ? "/TaskTornadoDark.svg" : "/TaskTornado.svg"}
    alt="TaskTornado Logo"
    style={{ display: 'block' }}
  />
);

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
    <div className="min-h-screen bg-white dark:bg-black flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left Section: Branding & Immersive Visuals */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-[#F7F7F9] dark:bg-zinc-900/50 relative flex-col p-12 justify-between border-r border-gray-100 dark:border-zinc-800">
        <DotGrid
          dotSize={4}
          gap={20}
          darkMode={isDark}
          className="absolute inset-0 z-0 opacity-40"
          style={{ pointerEvents: 'none' }}
        />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <TaskTornadoIcon size={32} isDarkMode={isDark} />
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">TaskTornado</span>
          </Link>
        </div>

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight"
          >
            Master your <br />
            <span className="text-blue-600">study storm.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 dark:text-gray-400 mt-6 text-lg max-w-sm leading-relaxed"
          >
            Join 50+ students who use AI to stay ahead, organized, and stress-free.
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span>© {new Date().getFullYear()} SchoolOrganizer</span>
          <span className="w-1 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full" />
          <span>v2.4</span>
        </div>
      </div>

      {/* Right Section: Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-24 bg-white dark:bg-black relative">
        {/* Mobile Header Only */}
        <div className="absolute top-8 left-8 md:hidden">
          <TaskTornadoIcon size={32} isDarkMode={isDark} />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
              Sign In
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-[#F7F7F9] dark:bg-zinc-900/50 border border-transparent focus:bg-white dark:focus:bg-black focus:border-blue-600 rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end mr-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider ml-1">
                    Password
                  </label>
                  <Link href="/forgot-password" opacity-50 className="text-[11px] text-blue-600 hover:underline font-bold">
                    Forgot?
                  </Link>
                </div>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-[#F7F7F9] dark:bg-zinc-900/50 border border-transparent focus:bg-white dark:focus:bg-black focus:border-blue-600 rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="data-[state=checked]:bg-blue-600 rounded-md border-gray-200 dark:border-zinc-800"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium select-none">
                Keep me signed in
              </span>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-xs text-red-600 dark:text-red-400 text-center font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-600/10 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Sign In <ArrowRight size={18} /></>}
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-zinc-900"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white dark:bg-black text-gray-400 dark:text-zinc-600 uppercase tracking-widest font-bold">or</span>
            </div>
          </div>

          <Button
            disabled={isGoogleLoading}
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-900 dark:text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-all shadow-sm"
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

          <div className="mt-12 text-center text-[13px]">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              First time here?{' '}
              <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline underline-offset-4 decoration-2">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
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