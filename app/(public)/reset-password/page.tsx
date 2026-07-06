'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/animate-ui/primitives/buttons/button';
import { useDarkMode } from '@/context/DarkModeContext';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isDark } = useDarkMode();

  // Verify that the user is actually authenticated/has a session (redirected from recovery link)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expired or invalid. Please request a new password reset link.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6fae7] via-[#f6fae7] to-[#FCFDF5] dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 flex flex-col justify-center items-center overflow-hidden font-sans relative px-4">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#275085]/[0.04] dark:bg-[#4a9cdb]/[0.06] rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-[#275085]/8 dark:border-[#4a9cdb]/10 rounded-[32px] p-8 shadow-[0_20px_60px_rgba(39,80,133,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#275085] dark:text-[#4a9cdb] tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-[#275085]/55 dark:text-[#4a9cdb]/55 mt-2">
            Enter your new secure password below
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center space-y-4"
          >
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            <h2 className="text-lg font-bold text-[#275085] dark:text-[#4a9cdb]">Password Updated!</h2>
            <p className="text-xs text-[#275085]/50 dark:text-[#4a9cdb]/50">
              Your password has been reset successfully. Redirecting you to the dashboard...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-normal ml-1">
                New Password
              </label>
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/40 dark:text-[#4a9cdb]/40 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/8 dark:border-[#4a9cdb]/8 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#275085]/30 dark:focus:border-[#4a9cdb]/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275085]/5 dark:focus:ring-[#4a9cdb]/5 transition-all text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/25 dark:placeholder:text-[#4a9cdb]/25"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-normal ml-1">
                Confirm Password
              </label>
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#275085]/40 dark:text-[#4a9cdb]/40 group-focus-within:text-[#275085] dark:group-focus-within:text-[#4a9cdb] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] border border-[#275085]/8 dark:border-[#4a9cdb]/8 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#275085]/30 dark:focus:border-[#4a9cdb]/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275085]/5 dark:focus:ring-[#4a9cdb]/5 transition-all text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/25 dark:placeholder:text-[#4a9cdb]/25"
                />
              </div>
            </div>

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

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#4a9cdb] dark:hover:bg-[#3d8bc4] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Update Password'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
