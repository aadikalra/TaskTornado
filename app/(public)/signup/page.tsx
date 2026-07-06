'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { HugeIcon } from '@/lib/huge-icon-map';
import { getBlockedError } from '@/lib/blockedNames';
import confetti from 'canvas-confetti';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import Image from 'next/image';

// Typing effect component using the signature sans font
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

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  // Form states
  const [accountType, setAccountType] = useState<'student' | 'guardian' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Flow control states
  const [typingProgress, setTypingProgress] = useState(0);

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

  const [currentStep, setCurrentStep] = useState(1); // 1: Type, 2: Email, 3: Password, 4: ConfirmPassword, 5: Name, 6: Terms/Submit
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [typingStep, setTypingStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversational flow
  useEffect(() => {
    if (containerRef.current) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentStep, typingStep, error]);

  const handleSelectAccountType = (type: 'student' | 'guardian') => {
    if (loading) return;
    setAccountType(type);
    if (!completedSteps.includes(1)) {
      setCompletedSteps([...completedSteps, 1]);
    }
    setCurrentStep(2);
    setTypingStep(2);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    if (!completedSteps.includes(2)) {
      setCompletedSteps([...completedSteps, 2]);
    }
    setCurrentStep(3);
    setTypingStep(3);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    if (!completedSteps.includes(3)) {
      setCompletedSteps([...completedSteps, 3]);
    }
    setCurrentStep(4);
    setTypingStep(4);
  };

  const handleConfirmPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    if (!completedSteps.includes(4)) {
      setCompletedSteps([...completedSteps, 4]);
    }
    setCurrentStep(5);
    setTypingStep(5);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    
    // Check restricted names and emails
    const blockedError = getBlockedError(name, email);
    if (blockedError) {
      setError(blockedError);
      return;
    }

    setError('');
    if (!completedSteps.includes(5)) {
      setCompletedSteps([...completedSteps, 5]);
    }
    setCurrentStep(6);
    setTypingStep(6);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('You must accept the terms & privacy policy.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, name, accountType || 'student');
      
      setIsCompleted(true);
      
      // Trigger brand-colored confetti
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#275085', '#165df9', '#fabc32', '#a5b4fc']
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  // Jump back to edit a step
  const handleEditStep = (stepNumber: number) => {
    if (loading) return;
    setCurrentStep(stepNumber);
    setError('');
    // Remove completed steps subsequent to the edited step
    setCompletedSteps(completedSteps.filter(s => s < stepNumber));
    if (stepNumber === 1) {
      setTypingProgress(28); // skip typing animation when editing
    }
  };

  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleContinueToLogin = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      router.push(`/login?email=${encodeURIComponent(email)}`);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6fae7] via-[#f6fae7] to-[#FCFDF5] dark:from-[#0a0f1d] dark:via-[#090d1a] dark:to-[#03050c] text-[#275085] dark:text-[#a0c3ff] flex flex-col justify-center selection:bg-[#275085] dark:selection:bg-[#a0c3ff] selection:text-white dark:selection:text-[#0a0f1d] font-sans pb-12 pt-20 px-4 md:px-8">
      <div className="flex-1 w-full max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
        
        {/* Left Section: Hero illustration */}
        <div className="hidden md:flex flex-1 flex-col items-start justify-center pr-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full max-w-[480px]"
          >
            <Image
              src="/signup-hero.png"
              alt="Student using TaskTornado"
              width={800}
              height={800}
              className="w-full h-auto max-h-[55vh] object-contain object-left drop-shadow-sm"
              priority
            />
          </motion.div>
        </div>

        {/* Right Section: Form Container */}
        <div className="flex-1 max-w-[500px] w-full flex flex-col justify-center space-y-8">
          {/* Main Conversation Container */}
          <div ref={containerRef} className="w-full flex-1 flex flex-col justify-center py-12">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key="signup-steps"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="space-y-12 w-full"
            >
              {/* STEP 1: Account Type Selection */}
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
                  <span>{"Are you a ".slice(0, typingProgress)}</span>
                  {typingProgress >= 10 && (
                    <button
                      type="button"
                      onClick={() => handleSelectAccountType('student')}
                      className={`font-sans text-[15px] transition-all hover:text-[#275085] dark:hover:text-white ${
                        accountType === 'student'
                          ? 'text-[#275085] dark:text-white font-bold underline underline-offset-4 decoration-2'
                          : 'text-[#275085]/50 dark:text-[#a0c3ff]/50 hover:underline hover:underline-offset-4'
                      }`}
                    >
                      {"student".slice(0, typingProgress - 10)}
                    </button>
                  )}
                  <span>{" or ".slice(0, Math.max(0, typingProgress - 17))}</span>
                  {typingProgress >= 21 && (
                    <button
                      type="button"
                      onClick={() => handleSelectAccountType('guardian')}
                      className={`font-sans text-[15px] transition-all hover:text-[#275085] dark:hover:text-white ${
                        accountType === 'guardian'
                          ? 'text-[#275085] dark:text-white font-bold underline underline-offset-4 decoration-2'
                          : 'text-[#275085]/50 dark:text-[#a0c3ff]/50 hover:underline hover:underline-offset-4'
                      }`}
                    >
                      {"parent".slice(0, typingProgress - 21)}
                    </button>
                  )}
                  <span>{"?".slice(0, Math.max(0, typingProgress - 27))}</span>

                  {completedSteps.includes(1) && currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => handleEditStep(1)}
                      className="text-xs font-sans text-[#275085]/55 dark:text-[#a0c3ff]/55 hover:text-[#275085] dark:hover:text-white underline ml-4"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* STEP 2: Email Address */}
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
                    <div className="text-[#275085] dark:text-[#a0c3ff]">
                      {typingStep >= 2 ? (
                        <TypewriterText text="What is your email address?" />
                      ) : (
                        <span className="font-sans text-[15px] text-[#275085]/50 dark:text-[#a0c3ff]/50">What is your email address?</span>
                      )}
                    </div>

                    {currentStep === 2 ? (
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

              {/* STEP 3: Password */}
              {currentStep >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative pl-6"
                >
                  {completedSteps.includes(3) && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.4 }}
                      className="absolute left-[3px] top-6 w-[2px] bg-[#275085]/20 dark:bg-[#a0c3ff]/20"
                    />
                  )}
                  
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${completedSteps.includes(3) ? 'bg-[#275085]/40 dark:bg-[#a0c3ff]/40' : 'bg-[#275085] dark:bg-[#a0c3ff] animate-pulse'} absolute left-0 top-2`} />
                    <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50 font-sans text-[12px] uppercase tracking-wider select-none">Question 03</span>
                  </div>

                  <div className="mt-2 space-y-4">
                    <div className="text-[#275085] dark:text-[#a0c3ff]">
                      {typingStep >= 3 ? (
                        <TypewriterText text="Choose a secure password (min 6 characters)." />
                      ) : (
                        <span className="font-sans text-[15px] text-[#275085]/50 dark:text-[#a0c3ff]/50">Choose a secure password (min 6 characters).</span>
                      )}
                    </div>

                    {currentStep === 3 ? (
                      <form onSubmit={handlePasswordSubmit} className="flex max-w-[400px] border-b border-[#275085]/20 dark:border-[#a0c3ff]/20 focus-within:border-[#275085] dark:focus-within:border-[#a0c3ff] transition-all items-center py-1">
                        <input
                          type="password"
                          required
                          minLength={6}
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
                        {completedSteps.includes(3) && (
                          <button
                            type="button"
                            onClick={() => handleEditStep(3)}
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

              {/* STEP 4: Confirm Password */}
              {currentStep >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative pl-6"
                >
                  {completedSteps.includes(4) && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.4 }}
                      className="absolute left-[3px] top-6 w-[2px] bg-[#275085]/20 dark:bg-[#a0c3ff]/20"
                    />
                  )}
                  
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${completedSteps.includes(4) ? 'bg-[#275085]/40 dark:bg-[#a0c3ff]/40' : 'bg-[#275085] dark:bg-[#a0c3ff] animate-pulse'} absolute left-0 top-2`} />
                    <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50 font-sans text-[12px] uppercase tracking-wider select-none">Question 04</span>
                  </div>

                  <div className="mt-2 space-y-4">
                    <div className="text-[#275085] dark:text-[#a0c3ff]">
                      {typingStep >= 4 ? (
                        <TypewriterText text="Confirm your password." />
                      ) : (
                        <span className="font-sans text-[15px] text-[#275085]/50 dark:text-[#a0c3ff]/50">Confirm your password.</span>
                      )}
                    </div>

                    {currentStep === 4 ? (
                      <form onSubmit={handleConfirmPasswordSubmit} className="flex max-w-[400px] border-b border-[#275085]/20 dark:border-[#a0c3ff]/20 focus-within:border-[#275085] dark:focus-within:border-[#a0c3ff] transition-all items-center py-1">
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {completedSteps.includes(4) && (
                          <button
                            type="button"
                            onClick={() => handleEditStep(4)}
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

              {/* STEP 5: Full Name */}
              {currentStep >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative pl-6"
                >
                  {completedSteps.includes(5) && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.4 }}
                      className="absolute left-[3px] top-6 w-[2px] bg-[#275085]/20 dark:bg-[#a0c3ff]/20"
                    />
                  )}
                  
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${completedSteps.includes(5) ? 'bg-[#275085]/40 dark:bg-[#a0c3ff]/40' : 'bg-[#275085] dark:bg-[#a0c3ff] animate-pulse'} absolute left-0 top-2`} />
                    <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50 font-sans text-[12px] uppercase tracking-wider select-none">Question 05</span>
                  </div>

                  <div className="mt-2 space-y-4">
                    <div className="text-[#275085] dark:text-[#a0c3ff]">
                      {typingStep >= 5 ? (
                        <TypewriterText text="Finally, what is your full name?" />
                      ) : (
                        <span className="font-sans text-[15px] text-[#275085]/50 dark:text-[#a0c3ff]/50">Finally, what is your full name?</span>
                      )}
                    </div>

                    {currentStep === 5 ? (
                      <form onSubmit={handleNameSubmit} className="flex max-w-[400px] border-b border-[#275085]/20 dark:border-[#a0c3ff]/20 focus-within:border-[#275085] dark:focus-within:border-[#a0c3ff] transition-all items-center py-1">
                        <input
                          type="text"
                          required
                          placeholder="Alex Johnson"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-transparent border-none text-[15px] font-sans focus:outline-none placeholder:text-[#275085]/30 dark:placeholder:text-[#a0c3ff]/30 py-1 text-[#275085] dark:text-[#a0c3ff]"
                          autoFocus
                        />
                        <button type="submit" className="p-1 hover:text-[#275085] dark:hover:text-[#a0c3ff] text-[#275085]/50 dark:text-[#a0c3ff]/50 transition-colors">
                          <HugeIcon name="ArrowRight01" size={18} />
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-3 font-sans text-[14px]">
                        <span className="text-[#275085] dark:text-[#a0c3ff] font-bold">{name}</span>
                        {completedSteps.includes(5) && (
                          <button
                            type="button"
                            onClick={() => handleEditStep(5)}
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

              {/* STEP 6: Terms and Complete */}
              {currentStep >= 6 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative pl-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#275085] dark:bg-[#a0c3ff] absolute left-0 top-2" />
                    <span className="text-[#275085]/50 dark:text-[#a0c3ff]/50 font-sans text-[12px] uppercase tracking-wider select-none">Question 06</span>
                  </div>

                  <div className="mt-2 space-y-4">
                    <div className="text-[#275085] dark:text-[#a0c3ff]">
                      {typingStep >= 6 ? (
                        <TypewriterText text="Do you agree to our Terms of Service & Privacy Policy?" />
                      ) : (
                        <span className="font-sans text-[15px] text-[#275085]/50 dark:text-[#a0c3ff]/50">Do you agree to our Terms of Service & Privacy Policy?</span>
                      )}
                    </div>

                    <form onSubmit={handleFinalSubmit} className="space-y-6 max-w-[450px]">
                      <label className="flex items-center gap-3 cursor-pointer py-1 select-none">
                        <Checkbox
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                          className="border-[#275085]/40 dark:border-[#a0c3ff]/40 data-[state=checked]:bg-[#275085] dark:data-[state=checked]:bg-[#4f8df0] data-[state=checked]:border-[#275085] dark:data-[state=checked]:border-[#4f8df0] rounded-md transition-colors cursor-pointer"
                        />
                        <span className="text-xs font-sans text-[#275085]/50 dark:text-[#a0c3ff]/50">
                          I agree to the{' '}
                          <Link href="/terms" className="text-[#275085] dark:text-[#4f8df0] hover:underline font-bold">
                            Terms
                          </Link>{' '}
                          &{' '}
                          <Link href="/privacy" className="text-[#275085] dark:text-[#4f8df0] hover:underline font-bold">
                            Privacy
                          </Link>
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
                            <span>Complete Registration</span>
                            <HugeIcon name="CheckmarkCircle02" size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : !isRedirecting ? (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center text-center space-y-6 py-12 w-full"
            >
              <div className="w-16 h-16 bg-[#275085]/10 dark:bg-[#a0c3ff]/10 rounded-full flex items-center justify-center text-[#275085] dark:text-[#a0c3ff]">
                <HugeIcon name="CheckmarkCircle02" size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-[#275085] dark:text-[#a0c3ff]">Check your inbox</h2>
                <p className="text-sm text-[#275085]/70 dark:text-[#a0c3ff]/70 max-w-[400px] leading-relaxed">
                  We sent a confirmation link to <span className="font-bold text-[#275085] dark:text-white">{email}</span>. Click the link to complete your registration.
                </p>
              </div>
              {(() => {
                const webmailLink = getWebmailLink(email);
                return (
                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-[340px]">
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
                      type="button"
                      onClick={handleContinueToLogin}
                      className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 font-sans font-bold text-[14px] transition-all rounded-xl active:scale-[0.98] ${
                        webmailLink
                          ? 'bg-transparent border border-[#275085]/10 dark:border-[#a0c3ff]/10 text-[#275085] dark:text-[#a0c3ff] hover:bg-[#275085]/5 dark:hover:bg-[#a0c3ff]/5'
                          : 'bg-[#275085] dark:bg-[#4f8df0] text-white hover:bg-[#1e3f6a] dark:hover:bg-[#3b82f6] shadow-md shadow-[#275085]/10 dark:shadow-none'
                      }`}
                    >
                      <span>Continue to Log In</span>
                      {!webmailLink && <HugeIcon name="ArrowRight01" size={16} />}
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          ) : null}
        </AnimatePresence>
          </div>

          {/* Footer Info */}
          <div className="w-full text-center">
            <p className="font-sans text-xs text-[#275085]/50 dark:text-[#a0c3ff]/50">
              Already have an account?{' '}
              <Link href="/login" className="text-[#275085] dark:text-[#4f8df0] hover:underline font-bold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}