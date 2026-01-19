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
      <div className="space-y-3">
        {/* Sign Out Card */}
        <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-zinc-900/50 transition-all hover:bg-red-50/50 dark:hover:bg-red-950/10">
          {isLoggingOut ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              </div>
              <span className="text-sm text-gray-900 dark:text-white font-bold">
                Redirecting in {countdown}...
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-red-50 dark:bg-red-950/30 rounded-xl">
                  <LogOut className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                    Sign Out
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                    Securely sign out of your current session. You can sign back in at any time.
                  </p>
                </div>
              </div>
              <Button
                onClick={onSignOut}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${showLogoutConfirm
                    ? 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 shadow-red-600/20'
                    : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white hover:bg-gray-50'
                  }`}
                hoverScale={1.02}
              >
                {showLogoutConfirm ? 'Click to Confirm' : 'Sign Out'}
              </Button>
            </div>
          )}
        </div>

        {/* Delete Account Card */}
        <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-zinc-900/50 transition-all hover:bg-red-50/50 dark:hover:bg-red-950/10">
          {isDeleting ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              </div>
              <span className="text-sm text-gray-900 dark:text-white font-bold">
                Deleting your account...
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-red-50 dark:bg-red-950/30 rounded-xl">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                    Delete Account
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                    Permanently delete your profile and all stored data. This action is irreversible.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDeleteClick}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                hoverScale={1.02}
              >
                Delete Account
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contemporary Delete Confirmation Modal */}
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
              className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden"
            >
              {/* Brand Strip */}
              <div className="h-1.5 w-full bg-red-500" />

              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Serious Action Required</h2>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mt-1">Permanently Delete Account</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <h4 className="text-[13px] font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Irreversible Process
                    </h4>
                    <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                      You are about to delete your TaskTornado account. All classes, homework, and personal settings will be purged from our servers instantly.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest pl-1">
                        Confirm Identity
                      </label>
                      <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={`Type "${userName}" to confirm`}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-2xl text-[14px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={handleModalCancel}
                      className="flex-1 py-4 px-6 rounded-2xl text-[13px] font-bold text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all"
                      hoverScale={1.02}
                    >
                      Keep Account
                    </Button>
                    <Button
                      onClick={handleModalConfirm}
                      disabled={confirmationText.trim() !== userName.trim() || isDeleting}
                      className={`flex-1 py-4 px-6 rounded-2xl text-[13px] font-bold transition-all shadow-lg ${confirmationText.trim() === userName.trim()
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20'
                          : 'bg-gray-100 dark:bg-zinc-900 text-gray-400 dark:text-zinc-600 cursor-not-allowed uppercase tracking-widest text-[10px]'
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
                className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
