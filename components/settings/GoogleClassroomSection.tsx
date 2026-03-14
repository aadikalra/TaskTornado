'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { BetaPasswordModal } from '@/components/BetaPasswordModal';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';
import { useUpgrade } from '@/context/UpgradeContext';

// Simple Google icon component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

interface ClassroomAuthStatus {
  isAuthorized: boolean;
  needsAuthorization: boolean;
  lastSync?: string;
  coursesCount?: number;
}

export default function GoogleClassroomSection() {
  const { user, isGoogleUser } = useAuth();
  const searchParams = useSearchParams();
  const { handlePlanLimitError } = useUpgrade();
  const [authStatus, setAuthStatus] = useState<ClassroomAuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUnsyncing, setIsUnsyncing] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [betaAccessGranted, setBetaAccessGranted] = useState(false);

  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const reason = searchParams.get('reason');

  useEffect(() => {
    if (user && isGoogleUser) {
      checkAuthStatus();
    } else {
      setAuthStatus(null);
      setIsLoading(false);
    }
  }, [user, isGoogleUser]);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const getCookie = (name: string) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
      };

      const classroomAuthCookie = getCookie('classroom-auth');

      if (classroomAuthCookie) {
        try {
          const response = await fetch('/api/classroom/debug-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id }),
          });

          if (response.ok) {
            const data = await response.json();
            setAuthStatus({
              isAuthorized: true,
              needsAuthorization: false,
              coursesCount: data.coursesCount,
              lastSync: new Date().toLocaleString(),
            });
            return;
          }
        } catch (apiError) {
          console.warn('Classroom validation failed:', apiError);
        }
      }

      setAuthStatus({
        isAuthorized: false,
        needsAuthorization: true,
      });

    } catch (error) {
      console.error('Error checking Classroom auth:', error);
      setAuthStatus({ isAuthorized: false, needsAuthorization: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorize = async () => {
    // ─── Plan tier: Google Classroom sync is Pro+ only ─────────────
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    if (!limits.googleClassroomSync) {
      try {
        throw new Error('PLAN_LIMIT:Google Classroom sync is a Pro feature — upgrade to connect your classes.');
      } catch (err: any) {
        handlePlanLimitError(err);
        return;
      }
    }

    if (!betaAccessGranted) {
      setShowBetaModal(true);
      return;
    }
    setIsAuthorizing(true);
    try {
      const response = await fetch('/api/auth/google-classroom-init');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to get auth URL');
      window.location.href = data.authUrl;
    } catch (error: any) {
      if (!handlePlanLimitError(error)) {
        console.error('Error initiating Classroom auth:', error);
      }
      setIsAuthorizing(false);
    }
  };

  const handleBetaSuccess = () => {
    setBetaAccessGranted(true);
    handleAuthorize();
  };

  const handleUnsync = async () => {
    setIsUnsyncing(true);
    try {
      document.cookie = 'classroom-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setAuthStatus({ isAuthorized: false, needsAuthorization: true });
    } catch (error) {
      console.error('Error unsyncing Classroom:', error);
    } finally {
      setIsUnsyncing(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/classroom/debug-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setAuthStatus(prev => ({
          ...prev!,
          coursesCount: data.coursesCount,
          lastSync: new Date().toLocaleString(),
        }));
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!user || !isGoogleUser) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {success === 'classroom_authorized' && (
          <div className="flex items-center gap-3 p-3 bg-[#ebf6b5]/30 dark:bg-[#ebf6b5]/5 rounded-xl border border-[#d4e88e]/50 dark:border-[#d4e88e]/20">
            <CheckCircle className="h-4 w-4 text-sky-500 shrink-0" />
            <p className="text-sm font-medium text-sky-900 dark:text-sky-100">Connected successfully</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-3 bg-red-50/50 dark:bg-red-950/10 rounded-xl border border-red-200/50 dark:border-red-900/30">
            <XCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Connection failed</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-start py-8">
            <div className="flex items-center gap-2 text-sky-600/40">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Authenticating...</span>
            </div>
          </div>
        ) : authStatus?.isAuthorized ? (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl border border-sky-100 dark:border-gray-800">
                <p className="text-[10px] font-semibold text-sky-600/40 dark:text-sky-400/40 uppercase tracking-wider mb-1">Courses</p>
                <p className="text-2xl font-bold text-sky-900 dark:text-white">{authStatus.coursesCount || 0}</p>
              </div>
              <div className="p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl border border-sky-100 dark:border-gray-800">
                <p className="text-[10px] font-semibold text-sky-600/40 dark:text-sky-400/40 uppercase tracking-wider mb-1">Last Sync</p>
                <p className="text-sm font-bold text-sky-900 dark:text-white">{authStatus.lastSync?.split(',')[0] || 'Recently'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center px-4 py-2.5 bg-[#ebf6b5]/60 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 text-sky-900 dark:text-sky-100 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing' : 'Sync'}
              </button>

              <button
                onClick={handleUnsync}
                disabled={isUnsyncing}
                className="flex items-center px-4 py-2.5 bg-white/40 dark:bg-gray-900/40 text-sky-900 dark:text-sky-100 border border-sky-100 dark:border-gray-700 rounded-xl text-sm font-semibold hover:bg-sky-500/[0.04] transition-colors disabled:opacity-50"
              >
                Disconnect
              </button>

              <button
                onClick={() => window.open('https://classroom.google.com', '_blank')}
                className="flex items-center px-4 py-2.5 text-sky-600/40 dark:text-sky-400/40 hover:text-sky-900 dark:hover:text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 py-2">
              <AlertCircle className="h-4 w-4 text-sky-500/40 shrink-0" />
              <span className="text-sm text-sky-600/50 dark:text-sky-400/50">Link your Google Classroom to sync classes automatically.</span>
            </div>

            {/* Connect Button */}
            <button
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              className="w-full px-4 py-3 bg-[#ebf6b5]/60 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 text-sky-900 dark:text-sky-100 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAuthorizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <GoogleIcon className="h-4 w-4" />
                  Connect Google Workspace
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <BetaPasswordModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        onSuccess={handleBetaSuccess}
      />
    </div>
  );
}
