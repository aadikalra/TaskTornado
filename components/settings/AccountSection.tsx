import { LogOut, Trash2, X, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/animate-ui/primitives/buttons/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountSectionProps {
  isLoggingOut: boolean;
  showLogoutConfirm: boolean;
  countdown: number;
  onSignOut: () => void;
  showDeleteConfirm: boolean;
  isDeleting: boolean;
  onDeleteAccountWithConfirmation: (confirmed: boolean) => void;
  userName?: string;
}

export default function AccountSection({
  isLoggingOut,
  showLogoutConfirm,
  countdown,
  onSignOut,
  showDeleteConfirm,
  isDeleting,
  onDeleteAccountWithConfirmation,
  userName = "User"
}: AccountSectionProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
    setConfirmationText('');
  };

  const handleModalConfirm = () => {
    if (confirmationText.trim() === userName.trim()) {
      setDeleteModalOpen(false);
      onDeleteAccountWithConfirmation(true);
    }
  };

  const handleModalCancel = () => {
    setDeleteModalOpen(false);
    setConfirmationText('');
  };

  return (
    <>
      <div className="space-y-1">
        {/* Sign Out */}
        <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
          {isLoggingOut ? (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
                Redirecting in {countdown}...
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <LogOut className="h-[18px] w-[18px] text-sky-500/50" />
                <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
                  Sign Out
                </span>
              </div>
              <Button
                onClick={onSignOut}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${showLogoutConfirm
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20'
                  : 'text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 hover:bg-[#ebf6b5]'
                  }`}
                hoverScale={1.02}
              >
                {showLogoutConfirm ? 'Click to Confirm' : 'Sign Out'}
              </Button>
            </>
          )}
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
          {isDeleting ? (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
                Deleting your account...
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Trash2 className="h-[18px] w-[18px] text-sky-500/50" />
                <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
                  Delete Account
                </span>
              </div>
              <Button
                onClick={handleDeleteClick}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 hover:bg-[#ebf6b5] transition-colors"
                hoverScale={1.02}
              >
                Delete Account
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleModalCancel}
              className="absolute inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-sky-100 dark:border-gray-800 shadow-2xl shadow-sky-500/5 overflow-hidden"
            >
              {/* Danger Strip */}
              <div className="h-1 w-full bg-red-500" />

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <div>
                    <h2 className="text-lg font-bold text-sky-900 dark:text-white">Delete Account</h2>
                    <p className="text-xs text-red-500 font-medium mt-0.5">This action is permanent</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="p-4 bg-red-50/50 dark:bg-red-950/10 rounded-xl border border-red-100 dark:border-red-900/20">
                    <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                      All your classes, homework, and settings will be permanently deleted. This cannot be undone.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-sky-600/50 dark:text-sky-400/50 uppercase tracking-wider">
                      Type &ldquo;{userName}&rdquo; to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={userName}
                      className="w-full px-4 py-3 bg-[#f5f9fc] dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-xl text-sm text-sky-900 dark:text-white placeholder:text-sky-600/25 dark:placeholder:text-sky-400/25 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleModalCancel}
                      className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-sky-600/50 dark:text-sky-400/50 hover:text-sky-900 dark:hover:text-white hover:bg-sky-500/[0.04] transition-colors"
                      hoverScale={1.02}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleModalConfirm}
                      disabled={confirmationText.trim() !== userName.trim() || isDeleting}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${confirmationText.trim() === userName.trim()
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20'
                        : 'bg-sky-100/40 dark:bg-gray-800 text-sky-600/25 dark:text-sky-400/25 cursor-not-allowed'
                        }`}
                      hoverScale={confirmationText.trim() === userName.trim() ? 1.02 : 1}
                    >
                      {isDeleting ? 'Processing...' : 'Delete Permanently'}
                    </Button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleModalCancel}
                className="absolute top-6 right-6 p-1.5 text-sky-600/30 hover:text-sky-900 dark:hover:text-white transition-colors rounded-lg hover:bg-sky-500/[0.04]"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
