'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Trash2, BookOpen, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClassContext } from '@/context/ClassContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DangerZoneItem = ({
  title,
  description,
  buttonText,
  confirmText,
  onConfirm,
  isConfirming,
  count,
  countLabel,
  icon: Icon,
  variant = 'destructive'
}: {
  title: string;
  description: string;
  buttonText: string;
  confirmText: string;
  onConfirm: () => void;
  isConfirming: boolean;
  count: number;
  countLabel: string;
  icon: React.ElementType;
  variant?: 'destructive' | 'warning';
}) => (
  <div className={`p-4 rounded-lg border transition-colors ${
    variant === 'destructive' 
      ? 'border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20' 
      : 'border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20'
  }`}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`h-4 w-4 flex-shrink-0 ${
            variant === 'destructive' 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`} />
          <h3 className={`text-sm font-semibold ${
            variant === 'destructive' 
              ? 'text-red-900 dark:text-red-100' 
              : 'text-blue-900 dark:text-blue-100'
          }`}>
            {title}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {count} {count === 1 ? countLabel : `${countLabel}s`}
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {description}
        </p>
        <Button
          variant={isConfirming ? 'destructive' : 'outline'}
          size="sm"
          onClick={onConfirm}
          className="w-full sm:w-auto"
        >
          {isConfirming ? confirmText : buttonText}
        </Button>
      </div>
    </div>
  </div>
);

export default function SettingsPage() {
  const { classes, homeworks, clearAllClasses, clearAllHomeworks } = useClassContext();
  const { signOut } = useAuth() || {};
  const [showClassConfirm, setShowClassConfirm] = useState(false);
  const [showHomeworkConfirm, setShowHomeworkConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  const handleClearClasses = () => {
    if (showClassConfirm) {
      clearAllClasses();
      setShowClassConfirm(false);
    } else {
      setShowClassConfirm(true);
      setTimeout(() => setShowClassConfirm(false), 5000);
    }
  };

  const handleClearHomeworks = () => {
    if (showHomeworkConfirm) {
      clearAllHomeworks();
      setShowHomeworkConfirm(false);
    } else {
      setShowHomeworkConfirm(true);
      setTimeout(() => setShowHomeworkConfirm(false), 5000);
    }
  };

  const handleSignOut = () => {
    if (showLogoutConfirm) {
      if (signOut) {
        signOut();
      }
      setIsLoggingOut(true);
      let countdownValue = 3;
      const interval = setInterval(() => {
        countdownValue -= 1;
        setCountdown(countdownValue);
        if (countdownValue === 0) {
          clearInterval(interval);
          router.push('/');
        }
      }, 1000);
    } else {
      setShowLogoutConfirm(true);
      setTimeout(() => setShowLogoutConfirm(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your data and preferences
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Data Management Section */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Data Management</CardTitle>
              <CardDescription className="text-sm">
                Manage your classes and homework data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <DangerZoneItem
                title="Delete All Classes"
                description="Permanently delete all classes and associated homework"
                buttonText="Delete All Classes"
                confirmText="Click to Confirm"
                onConfirm={handleClearClasses}
                isConfirming={showClassConfirm}
                count={classes.length}
                countLabel="class"
                icon={BookOpen}
                variant="destructive"
              />

              <DangerZoneItem
                title="Delete All Homework"
                description="Permanently delete all homework assignments"
                buttonText="Delete All Homework"
                confirmText="Click to Confirm"
                onConfirm={handleClearHomeworks}
                isConfirming={showHomeworkConfirm}
                count={homeworks.length}
                countLabel="assignment"
                icon={Trash2}
                variant="destructive"
              />
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Account</CardTitle>
              <CardDescription className="text-sm">
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        onClick={handleSignOut}
                        className="w-full sm:w-auto"
                      >
                        {showLogoutConfirm ? 'Click to Confirm' : 'Sign Out'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warning Notice */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Destructive actions cannot be undone
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Make sure you have a backup of any important data before proceeding with delete operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}