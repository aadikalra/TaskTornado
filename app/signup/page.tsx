'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/animate-ui/radix/checkbox';
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

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { signUp } = useAuth();
  const { isDark } = useDarkMode();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      await signUp(email, password, name);
      router.push('/dashboard');
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
            Start your <br />
            <span className="text-blue-600">adventure here.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 dark:text-gray-400 mt-6 text-lg max-w-sm leading-relaxed"
          >
            Create an account to unlock personalized AI focus tools and seamless organization.
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span>© {new Date().getFullYear()} SchoolOrganizer</span>
          <span className="w-1 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full" />
          <span>v2.4</span>
        </div>
      </div>

      {/* Right Section: Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-24 bg-white dark:bg-black relative overflow-y-auto">
        {/* Mobile Header Only */}
        <div className="absolute top-8 left-8 md:hidden">
          <TaskTornadoIcon size={32} isDarkMode={isDark} />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[440px] py-12"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Join TaskTornado and master your workload.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-[#F7F7F9] dark:bg-zinc-900/50 border border-transparent focus:bg-white dark:focus:bg-black focus:border-blue-600 rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>

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
                    required
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-[#F7F7F9] dark:bg-zinc-900/50 border border-transparent focus:bg-white dark:focus:bg-black focus:border-blue-600 rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider ml-1">
                    Password
                  </label>
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-[#F7F7F9] dark:bg-zinc-900/50 border border-transparent focus:bg-white dark:focus:bg-black focus:border-blue-600 rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider ml-1">
                    Confirm
                  </label>
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <ShieldCheck size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-[#F7F7F9] dark:bg-zinc-900/50 border border-transparent focus:bg-white dark:focus:bg-black focus:border-blue-600 rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer py-2 group">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="data-[state=checked]:bg-blue-600 rounded-md border-gray-200 dark:border-zinc-800 mt-1"
              />
              <span className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                I agree to the <Link href="/terms" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Terms</Link> and <Link href="/privacy" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Privacy Policy</Link>.
              </span>
            </label>

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
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Create Account <ArrowRight size={18} /></>}
            </Button>
          </form>

          <div className="mt-12 text-center text-[13px]">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline underline-offset-4 decoration-2">
                Sign in instead
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}