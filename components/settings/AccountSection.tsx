import { LogOut, Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
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
        <div className="flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50">
          {isLoggingOut ? (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
                Redirecting in {countdown}...
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <LogOut className="h-[18px] w-[18px] text-rose-500/70" />
                <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
                  Sign Out
                </span>
              </div>
              <Button
                onClick={onSignOut}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${showLogoutConfirm
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                hoverScale={1.02}
              >
                {showLogoutConfirm ? 'Click to Confirm' : 'Sign Out'}
              </Button>
            </>
          )}
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50">
          {isDeleting ? (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
                Deleting your account...
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Trash2 className="h-[18px] w-[18px] text-rose-500/70" />
                <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
                  Delete Account
                </span>
              </div>
              <Button
                onClick={handleDeleteClick}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
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
              className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
            >
              {/* Brand Strip */}
              <div className="h-1 w-full bg-red-500" />

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Account</h2>
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
                    <label className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                      Type &ldquo;{userName}&rdquo; to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={userName}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleModalCancel}
                      className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                      hoverScale={1.02}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleModalConfirm}
                      disabled={confirmationText.trim() !== userName.trim() || isDeleting}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${confirmationText.trim() === userName.trim()
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-100 dark:bg-zinc-900 text-gray-300 dark:text-zinc-700 cursor-not-allowed'
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
                className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
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
