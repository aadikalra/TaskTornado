'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudyGroups } from '@/context/StudyGroupsContext';
import { supabase } from '@/lib/supabase/client';
import { Loader2, ArrowLeft, CheckCircle, XCircle, Users, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUpgrade } from '@/context/UpgradeContext';

const BackgroundOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
    <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
  </div>
);

export default function JoinGroupPage() {
  const { inviteId } = useParams() as { inviteId: string };
  const router = useRouter();
  const { joinGroup, groups } = useStudyGroups();
  const { handlePlanLimitError } = useUpgrade();

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_member'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Check if user is already a member of the group and if the group exists
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // First check if the group exists
        const { data: group, error: groupError } = await supabase
          .from('study_groups')
          .select('id')
          .eq('id', inviteId)
          .single();

        if (groupError || !group) {
          setStatus('error');
          setError('Group not found or you do not have permission to view it');
          return;
        }

        // Then check if user is already a member
        const { data: membership, error: membershipError } = await supabase
          .from('study_group_members')
          .select('group_id')
          .eq('user_id', user.id)
          .eq('group_id', inviteId)
          .maybeSingle();

        if (membershipError) {
          console.error('Membership check error:', membershipError);
          // Continue anyway - we'll try to join the group
        }

        if (membership) {
          setStatus('already_member');
        } else {
          // If not a member, attempt to join automatically
          setStatus('loading');
          await handleJoinGroup();
        }
      } catch (err) {
        console.error('Error in membership check:', err);
        setStatus('error');
        setError('Failed to process group join request');
      }
    };

    checkMembership();
  }, [inviteId]);

  const handleJoinGroup = async () => {
    if (!inviteId) return;

    setIsJoining(true);
    setError(null);

    try {
      await joinGroup(inviteId as string);
      setStatus('success');

      // Redirect to the group after a short delay
      setTimeout(() => {
        router.push(`/groups/${inviteId}`);
      }, 1500);
    } catch (err: any) {
      if (!handlePlanLimitError(err)) {
        console.error('Error joining group:', err);
        setStatus('error');
        setError('Failed to join group. The invite link may be invalid or expired.');
      }
    } finally {
      setIsJoining(false);
    }
  };

  // ── Loading ──
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
              <Loader2 className="h-9 w-9 text-sky-500/50 dark:text-sky-400/50 animate-spin" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
              Loading Group
            </h1>
            <p className="text-sm text-sky-600/50 dark:text-sky-400/50 font-medium">
              Checking group information...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Already a member ──
  if (status === 'already_member') {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-6"
            >
              <Users className="h-9 w-9 text-emerald-500 dark:text-emerald-400" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-bold text-sky-900 dark:text-white tracking-tight mb-2">
              Already a Member
            </h1>
            <p className="text-sm text-sky-600/50 dark:text-sky-400/50 font-medium mb-8 max-w-xs">
              You&apos;re already a member of this group chat. Jump right in!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href={`/groups/${inviteId}`}
                className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-all hover:shadow-md w-full sm:w-auto"
              >
                Go to Group
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/groups"
                className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 rounded-xl transition-colors w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Groups
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl border border-red-200 dark:border-red-500/20 flex items-center justify-center mb-6"
            >
              <XCircle className="h-9 w-9 text-red-500 dark:text-red-400" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-bold text-sky-900 dark:text-white tracking-tight mb-2">
              Something Went Wrong
            </h1>
            <p className="text-sm text-sky-600/50 dark:text-sky-400/50 font-medium mb-8 max-w-xs">
              {error || 'An error occurred while processing your request.'}
            </p>

            <Link
              href="/groups"
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 border border-sky-200 dark:border-gray-800 rounded-xl transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-9 w-9 text-emerald-500 dark:text-emerald-400" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-bold text-sky-900 dark:text-white tracking-tight mb-2">
              Joined Successfully!
            </h1>
            <p className="text-sm text-sky-600/50 dark:text-sky-400/50 font-medium mb-8 max-w-xs">
              You&apos;ve been added to the group chat. Redirecting you now...
            </p>

            <div className="flex items-center gap-2 px-4 py-2 bg-[#f5f9fc] dark:bg-gray-900 rounded-full border border-sky-100 dark:border-gray-800">
              <Loader2 className="h-3.5 w-3.5 text-sky-500 animate-spin" />
              <span className="text-xs font-medium text-sky-600/60 dark:text-sky-400/60">Redirecting...</span>
            </div>

            <Link
              href={`/groups/${inviteId}`}
              className="mt-4 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-all hover:shadow-md"
            >
              Go to Group Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Default join group view ──
  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
      <BackgroundOrbs />
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16 flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-sky-50 dark:bg-sky-500/10 rounded-3xl border border-sky-200 dark:border-sky-500/20 flex items-center justify-center mb-6"
          >
            <Sparkles className="h-9 w-9 text-sky-500 dark:text-sky-400" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-sky-900 dark:text-white tracking-tight mb-2">
            Join Study Group
          </h1>
          <p className="text-sm text-sky-600/50 dark:text-sky-400/50 font-medium mb-8 max-w-xs">
            You&apos;ve been invited to join a group chat. Click below to join!
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleJoinGroup}
              disabled={isJoining}
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Join Group
                </>
              )}
            </button>
            <Link
              href="/groups"
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 rounded-xl transition-colors w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
