'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/animate-ui/radix/checkbox';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name);

      // Check if email confirmation is required
      // If so, redirect to a confirmation page or show a message
      setError('');
      setLoading(false);

      // For now, redirect to dashboard (you might want to handle email confirmation differently)
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);

      // Handle specific error cases
      if (err.message?.includes('already exists') || err.message?.includes('already registered')) {
        setError('An account with this email already exists.');
      } else if (err.message?.includes('Password should be at least')) {
        setError('Password must be at least 6 characters long.');
      } else if (err.message?.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else if (err.message?.includes('signup is disabled')) {
        setError('Account registration is currently disabled.');
      } else {
        setError(err.message || 'Failed to create an account.');
      }

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
            Create account
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
            type="text"
            autoComplete="name"
            required
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-0 py-3 bg-transparent border-b border-gray-200 dark:border-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />

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
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-0 py-3 bg-transparent border-b border-gray-200 dark:border-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />

          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-0 py-3 bg-transparent border-b border-gray-200 dark:border-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />

          <label className="flex items-start gap-2 cursor-pointer pt-2">
            <Checkbox 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=unchecked]:border-gray-300 dark:data-[state=unchecked]:border-gray-700 data-[state=unchecked]:border-2 mt-0.5"
            />
            <span className="text-sm text-gray-500 dark:text-gray-500">
              I agree to the{' '}
              <Link href="/terms" className="text-black dark:text-white hover:opacity-60 transition-opacity">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-black dark:text-white hover:opacity-60 transition-opacity">
                Privacy Policy
              </Link>
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-12 text-sm text-gray-400 dark:text-gray-600"
        >
          Already have an account?{' '}
          <Link href="/login" className="text-black dark:text-white hover:opacity-60 transition-opacity">
            Sign in
          </Link>
        </motion.p>
      </div>
    </div>
  );
}