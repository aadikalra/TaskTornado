'use client';

import { LogOut, Trash2, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    return false;
  };

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
    return false;
  };

  const handleCut = (e: React.ClipboardEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <>
      {isLoggingOut ? (
        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-sm text-blue-900 dark:text-blue-100 font-medium">
              Redirecting in {countdown}...
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <LogOut className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Sign Out
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Sign out of your account. You'll need to sign in again to access your data.
              </p>
              <Button
                variant={showLogoutConfirm ? 'destructive' : 'outline'}
                size="sm"
                onClick={onSignOut}
                className="w-full sm:w-auto"
              >
                {showLogoutConfirm ? 'Click to Confirm' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Section */}
      <div className="mt-4 p-4 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20">
        {isDeleting ? (
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-sm text-red-900 dark:text-red-100 font-medium">
              Deleting your account...
            </span>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Delete Account
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              {showDeleteConfirm && (
                <div className="flex items-start gap-2 p-2 bg-red-100 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-800 dark:text-red-200">
                      This will permanently delete:
                    </p>
                    <ul className="text-xs text-red-700 dark:text-red-300 mt-1 list-disc list-inside">
                      <li>All your classes and homework data</li>
                      <li>Your account profile and preferences</li>
                      <li>Any saved study groups or flashcards</li>
                    </ul>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteClick}
                className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300"
              >
                Delete Account
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                    This action cannot be undone
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Deleting your account will permanently remove:
                  </p>
                  <ul className="text-xs text-red-700 dark:text-red-300 mt-1 list-disc list-inside">
                    <li>All your classes and homework data</li>
                    <li>Your account profile and preferences</li>
                    <li>Any saved study groups or flashcards</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Type your full name to confirm:
              </label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={userName}
                className="w-full"
                onPaste={handlePaste}
                onCopy={handleCopy}
                onCut={handleCut}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{userName}</span>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleModalCancel}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleModalConfirm}
                className="flex-1"
                disabled={confirmationText.trim() !== userName.trim() || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
