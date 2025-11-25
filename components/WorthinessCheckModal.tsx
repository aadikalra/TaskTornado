'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface WorthinessCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved: () => void;
  gameTitle: string;
}

interface WorthinessResponse {
  worthy: boolean;
  reason?: string;
}

export default function WorthinessCheckModal({ isOpen, onClose, onApproved, gameTitle }: WorthinessCheckModalProps) {
  const [reason, setReason] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<'checking' | 'approved' | 'denied' | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Check for existing block
  useEffect(() => {
    const blocked = localStorage.getItem('gameBlockedUntil');
    if (blocked) {
      const blockedDate = new Date(blocked);
      if (blockedDate > new Date()) {
        setBlockedUntil(blockedDate);
        setTimeLeft(Math.ceil((blockedDate.getTime() - Date.now()) / 1000 / 60));
      } else {
        localStorage.removeItem('gameBlockedUntil');
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (blockedUntil && timeLeft > 0) {
      const timer = setInterval(() => {
        const now = new Date();
        if (blockedUntil > now) {
          setTimeLeft(Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000 / 60));
        } else {
          setBlockedUntil(null);
          setTimeLeft(0);
          localStorage.removeItem('gameBlockedUntil');
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [blockedUntil, timeLeft]);

  const checkWorthiness = async () => {
    if (!reason.trim()) return;

    setIsChecking(true);
    setResult('checking');

    try {
      const response = await fetch('/api/ai/check-worthiness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason.trim(),
          gameTitle,
        }),
      });

      const data: WorthinessResponse = await response.json();

      if (data.worthy) {
        setResult('approved');
        setTimeout(() => {
          onApproved();
          onClose();
          resetForm();
        }, 1500);
      } else {
        setResult('denied');
        // Block for 5 minutes
        const blockUntil = new Date(Date.now() + 5 * 60 * 1000);
        setBlockedUntil(blockUntil);
        localStorage.setItem('gameBlockedUntil', blockUntil.toISOString());
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking worthiness:', error);
      setResult('denied');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
    } finally {
      setIsChecking(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setResult(null);
    setIsChecking(false);
  };

  const handleClose = () => {
    if (isChecking) return;
    onClose();
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              {blockedUntil ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Access Blocked
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You've been deemed unworthy. Try again in {timeLeft} minutes.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                    {result === 'approved' ? (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : result === 'denied' ? (
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    ) : (
                      <Loader2 className={`w-6 h-6 text-blue-600 dark:text-blue-400 ${isChecking ? 'animate-spin' : ''}`} />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {result === 'approved' ? 'Worthy!' : 
                     result === 'denied' ? 'Not Worthy!' : 
                     'Prove Your Worthiness'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result === 'approved' ? 'You may proceed to the game.' :
                     result === 'denied' ? 'The AI has judged you unworthy.' :
                     `Why do you deserve to play ${gameTitle}? Be honest!`}
                  </p>
                </>
              )}
            </div>

            {/* Content */}
            {!blockedUntil && result !== 'approved' && result !== 'denied' && (
              <div className="mb-6">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you should be allowed to play..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  rows={3}
                  disabled={isChecking}
                />
              </div>
            )}

            {/* Actions */}
            {!blockedUntil && (
              <div className="flex gap-3">
                {result !== 'approved' && result !== 'denied' && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      disabled={isChecking}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={checkWorthiness}
                      disabled={!reason.trim() || isChecking}
                      className="flex-1"
                    >
                      {isChecking ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Judging...
                        </>
                      ) : (
                        'Submit for Judgement'
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}

            {blockedUntil && (
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  The AI will remember your attempt. Try being more honest next time.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
