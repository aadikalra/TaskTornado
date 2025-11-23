'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountSectionProps {
  isLoggingOut: boolean;
  showLogoutConfirm: boolean;
  countdown: number;
  onSignOut: () => void;
}

export default function AccountSection({
  isLoggingOut,
  showLogoutConfirm,
  countdown,
  onSignOut
}: AccountSectionProps) {
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
    </>
  );
}
