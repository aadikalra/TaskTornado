import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/animate-ui/radix/checkbox';
import { Button } from '@/components/animate-ui/primitives/buttons/button';

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
    await new Promise(resolve => setTimeout(resolve, 800));

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
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-2xl shadow-blue-900/10 border border-gray-100 dark:border-zinc-800"
          >
            {/* Header / Brand Strip */}
            <div className="bg-blue-50 dark:bg-blue-950/20 px-8 py-6 flex items-center justify-between border-b border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    BETA ACCESS
                  </h2>
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    Security & Guidelines
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-4">
                <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  Google sign-in is currently in <span className="text-blue-600 font-bold">private beta</span> testing. Some features may be unstable while we polish the experience.
                </p>
                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800 flex gap-3 italic">
                  <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-gray-500 dark:text-gray-500">
                    "We're actively working on making the storm even stronger. Thank you for helping us test!"
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-4 cursor-pointer group">
                <Checkbox
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked === true)}
                  className="data-[state=checked]:bg-blue-600 rounded-md border-gray-300 dark:border-zinc-700 mt-1 transition-transform group-hover:scale-110"
                />
                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  I understand that this is an experimental feature and I may encounter unexpected behavior during development.
                </span>
              </label>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={!acknowledged || isLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-600/10 transition-all flex items-center justify-center gap-2"
                  hoverScale={1.02}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Enter Beta <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
