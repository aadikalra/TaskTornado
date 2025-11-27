import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/animate-ui/radix/checkbox';

type AlphaPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const BetaPasswordModal = ({ isOpen, onClose, onSuccess }: AlphaPasswordModalProps) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acknowledged) return;

    setIsLoading(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    onSuccess();
    handleClose();
    setIsLoading(false);
  };

  const handleClose = () => {
    setAcknowledged(false);
    setIsLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white dark:bg-black w-full max-w-sm relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-normal text-black dark:text-white">
                    ALPHA Access
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Unstable feature ahead
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Google sign-in is currently in alpha testing.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This feature is <span className="font-medium text-black dark:text-white">not stable</span> and probably will contain errors.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox 
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
                  className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=unchecked]:border-gray-300 dark:data-[state=unchecked]:border-gray-700 data-[state=unchecked]:border-2 mt-0.5"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I understand this is an ALPHA feature and probably will contain errors, bugs, or instability. I acknowledge that this feature is not yet ready for production use.
                </span>
              </label>

              <button
                type="submit"
                disabled={!acknowledged || isLoading}
                className="w-full py-3 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Accessing...</span>
                  </div>
                ) : (
                  'Access ALPHA Feature'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
