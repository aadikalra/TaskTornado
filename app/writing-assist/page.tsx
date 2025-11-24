'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Zap } from 'lucide-react';

const LexicalEditor = dynamic(
  () => import('@/components/LexicalEditor'), 
  { ssr: false }
);

const WritingAssistPage = () => {
  const [showAlphaModal, setShowAlphaModal] = useState(true);

  useEffect(() => {
    // Check if user has already seen the alpha warning
    const hasSeenWarning = localStorage.getItem('writing-assist-alpha-warning');
    if (hasSeenWarning) {
      setShowAlphaModal(false);
    }
  }, []);

  const handleDismiss = () => {
    setShowAlphaModal(false);
    localStorage.setItem('writing-assist-alpha-warning', 'true');
  };

  return (
    <>
      <AnimatePresence>
        {showAlphaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl"
            >
              {/* Alert Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <div className="relative">
                    <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    <Zap className="h-4 w-4 text-amber-500 dark:text-amber-300 absolute -top-1 -right-1" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🚀 Writing Assist - ALPHA
                </h2>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">Early Access:</strong> This feature is in ALPHA and not finished yet
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">Buggy:</strong> May contain a lot of bugs and unexpected behavior
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">Experimental:</strong> Features may change or be removed
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    💡 <strong>Tip:</strong> Save your work frequently and report any issues you encounter!
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  I Understand - Continue
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Go Back
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LexicalEditor />
    </>
  );
};

export default WritingAssistPage;
