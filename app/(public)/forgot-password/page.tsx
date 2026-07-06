'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { HugeIcon } from '@/lib/huge-icon-map';
import { supabase } from '@/lib/supabase/client';

// TypewriterText matching the design system
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

const getWebmailLink = (emailAddress: string) => {
  const domain = emailAddress.toLowerCase().split('@')[1];
  if (!domain) return null;

  if (domain.includes('gmail.com')) {
    return { name: 'Gmail', url: 'https://mail.google.com' };
  }
  if (domain.includes('yahoo.com')) {
    return { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' };
  }
  if (domain.includes('outlook.com') || domain.includes('hotmail.com') || domain.includes('live.com') || domain.includes('msn.com')) {
    return { name: 'Outlook', url: 'https://outlook.live.com' };
  }
  if (domain.includes('icloud.com')) {
    return { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' };
  }
  return null;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [typingProgress, setTypingProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-fill email from query parameter if available
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      setTypingProgress(28); // skip typewriter animation if prefilled
    } else {
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
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if the user profile exists first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (profileError) {
        throw new Error(profileError.message || 'Error checking for account.');
      }

      if (!profile) {
        setError('No account found with this email address. Please check your spelling or sign up.');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6fae7] via-[#f6fae7] to-[#FCFDF5] dark:from-[#0a0f1d] dark:via-[#090d1a] dark:to-[#03050c] text-[#275085] dark:text-[#a0c3ff] flex flex-col justify-between items-center selection:bg-[#275085] dark:selection:bg-[#a0c3ff] selection:text-white dark:selection:text-[#0a0f1d] font-sans pb-12 pt-20 px-4 md:px-8">
      
      {/* Main Conversation Container */}
      <div ref={containerRef} className="max-w-[600px] w-full flex-1 flex flex-col justify-center space-y-12 py-12">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="forgot-password-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header Title */}
              <div className="pl-6 space-y-1">
                <span className="text-[#275085]/40 dark:text-[#a0c3ff]/40 font-sans text-[11px] uppercase tracking-widest select-none block">
                  Security Check
                </span>
                <h1 className="text-xl font-bold text-[#275085] dark:text-white tracking-tight">
                  <TypewriterText text="Forgot your password?" delay={25} />
                </h1>
              </div>

              {/* Conversational Step */}
              <div className="relative pl-6">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#275085] dark:bg-[#a0c3ff] absolute left-0 top-2 animate-pulse" />
                  <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50 font-sans text-[12px] uppercase tracking-wider select-none">
                    Question 01
                  </span>
                </div>

                <div className="mt-2 space-y-4">
                  <div className="text-[#275085] dark:text-[#a0c3ff]">
                    <span>{"What is your email address?".slice(0, typingProgress)}</span>
                  </div>

                  <form onSubmit={handleSubmit} className="flex max-w-[400px] border-b border-[#275085]/20 dark:border-[#a0c3ff]/20 focus-within:border-[#275085] dark:focus-within:border-[#a0c3ff] transition-all items-center py-1">
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-none text-[15px] font-sans focus:outline-none placeholder:text-[#275085]/30 dark:placeholder:text-[#a0c3ff]/30 py-1 text-[#275085] dark:text-[#a0c3ff]"
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="p-1 hover:text-[#275085] dark:hover:text-[#a0c3ff] text-[#275085]/50 dark:text-[#a0c3ff]/50 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin w-4.5 h-4.5" />
                      ) : (
                        <HugeIcon name="ArrowRight01" size={18} />
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="pl-6">
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 text-xs font-sans text-red-700 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 p-3.5 rounded-2xl backdrop-blur-sm max-w-[400px]"
                  >
                    <div className="w-5 h-5 rounded-full bg-red-100/60 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                      <HugeIcon name="AlertCircle" size={12} className="text-red-600 dark:text-red-400" />
                    </div>
                    <span className="leading-relaxed font-medium">{error}</span>
                  </motion.div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="forgot-password-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="text-center space-y-6 max-w-[400px] mx-auto py-8"
            >
              {/* Checkmark Circle Animation */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, damping: 15, stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-[#275085]/5 dark:bg-[#a0c3ff]/5 flex items-center justify-center border border-[#275085]/10 dark:border-[#a0c3ff]/10"
                >
                  <motion.svg
                    className="w-8 h-8 text-[#275085] dark:text-[#a0c3ff]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                </motion.div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#275085] dark:text-[#a0c3ff] tracking-tight">Check your email</h2>
                <p className="text-sm text-[#275085]/70 dark:text-[#a0c3ff]/70 leading-relaxed font-medium">
                  We sent a secure password reset link to <strong className="text-[#275085] dark:text-white">{email}</strong>. Please check your inbox.
                </p>
              </div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-2 w-full"
              >
                {(() => {
                  const webmailLink = getWebmailLink(email);
                  return (
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                      {webmailLink && (
                        <a
                          href={webmailLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#275085] dark:bg-[#4f8df0] text-white font-sans font-bold text-[14px] hover:bg-[#1e3f6a] dark:hover:bg-[#3b82f6] transition-all rounded-xl active:scale-[0.98] shadow-md shadow-[#275085]/10 dark:shadow-none"
                        >
                          <span>Open {webmailLink.name}</span>
                          <HugeIcon name="ArrowRight01" size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => router.push(`/login?email=${encodeURIComponent(email)}`)}
                        className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 font-sans font-bold text-[14px] transition-all rounded-xl active:scale-[0.98] ${
                          webmailLink
                            ? 'bg-transparent border border-[#275085]/10 dark:border-[#a0c3ff]/10 text-[#275085] dark:text-[#a0c3ff] hover:bg-[#275085]/5 dark:hover:bg-[#a0c3ff]/5'
                            : 'bg-[#275085] dark:bg-[#4f8df0] text-white hover:bg-[#1e3f6a] dark:hover:bg-[#3b82f6] shadow-md shadow-[#275085]/10 dark:shadow-none'
                        }`}
                      >
                        <span>Return to Log In</span>
                        {!webmailLink && <HugeIcon name="ArrowRight01" size={16} />}
                      </button>
                    </div>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer link back to login page */}
      {!success && (
        <div className="max-w-[600px] w-full mt-12 text-center select-none">
          <p className="font-sans text-xs text-[#275085]/50 dark:text-[#a0c3ff]/50">
            Remember your password?{' '}
            <Link href="/login" className="text-[#275085] dark:text-[#4f8df0] hover:underline font-bold">
              Log in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
