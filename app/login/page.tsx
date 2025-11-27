'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/animate-ui/radix/checkbox';
import { supabase } from '@/lib/supabase/client';
import { BetaPasswordModal } from '@/components/BetaPasswordModal';
import { useWideLayout } from '@/hooks/use-wide-layout';

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
  const router = useRouter();
  const { getContainerClass } = useWideLayout();

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
    // Proceed with Google sign-in after successful beta access
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
      setError('Failed to log in. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <h1 className="text-2xl font-normal text-black dark:text-white tracking-tight">
            Sign in
          </h1>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="email"
            autoComplete="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-0 py-3 bg-transparent border-b border-gray-200 dark:border-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />

          <input
            type="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-0 py-3 bg-transparent border-b border-gray-200 dark:border-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <Checkbox 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=unchecked]:border-gray-300 dark:data-[state=unchecked]:border-gray-700 data-[state=unchecked]:border-2"
            />
            <span className="text-sm text-gray-500 dark:text-gray-500">
              Remember me
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-3 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4 mx-auto" />
            ) : (
              'Continue'
            )}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <button
            disabled={isGoogleLoading}
            type="button"
            onClick={handleGoogleSignIn}
            aria-label="Continue with Google (alpha)"
            className="relative w-full py-3 border border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <span className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 bg-black dark:bg-white text-white dark:text-black">
              ALPHA
            </span>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGoogleLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              'Google'
            )}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-12 text-sm text-gray-400 dark:text-gray-600"
        >
          No account?{' '}
          <Link href="/signup" className="text-black dark:text-white hover:opacity-60 transition-opacity">
            Create one
          </Link>
        </motion.p>
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