'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyGroups } from '@/context/StudyGroupsContext';
import { Input } from '@/components/ui/input';
import { Plus, MessagesSquare, Users, ArrowRight, AlertTriangle, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { useRequireAuth } from '@/hooks/use-require-auth';

const BackgroundOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
    <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
  </div>
);

export default function GroupsPage() {
  const { authenticated } = useRequireAuth();
  if (!authenticated) return null;
  const router = useRouter();
  const { groups, loading, error, createGroup, schoolWarning, dismissSchoolWarning } = useStudyGroups();
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const { showIntro, dismissIntro } = useRouteIntro('groups');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setCreateError('Please enter a group name');
      return;
    }
    setCreateError(null);
    setIsCreating(true);
    try {
      await createGroup(newGroupName);
      setNewGroupName('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating group:', err);
      setCreateError('Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
            Group Chats
          </h1>
          <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium mb-8">
            Collaborate with classmates in real-time
          </p>
          <div className="space-y-0">
            {[1, 2, 3].map(i => (
              <div key={i} className="border-b border-sky-100 dark:border-gray-800 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-sky-100 rounded-lg mb-2 animate-pulse" />
                    <div className="h-3 w-48 bg-sky-50 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
      <BackgroundOrbs />
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
                Group Chats
              </h1>
              <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium">
                {groups.length} group{groups.length !== 1 ? 's' : ''} · Collaborate with classmates in real-time
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Group
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800 dark:text-red-300">Error loading groups</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* School Warning */}
        {schoolWarning?.showWarning && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">School Notice</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{schoolWarning.message}</p>
              </div>
              <button
                onClick={dismissSchoolWarning}
                className="p-1 rounded-lg text-amber-500/50 hover:text-amber-600 hover:bg-amber-500/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Groups List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
                <MessagesSquare className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
              </div>
              <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-2">
                No Group Chats Yet
              </h3>
              <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-8 max-w-sm text-center">
                Create a group to start collaborating with your classmates
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Group
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {groups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.03 }}
                  className="group border-b border-sky-100 dark:border-gray-800 py-5 first:pt-0 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-sky-100 dark:bg-sky-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <MessagesSquare className="h-4.5 w-4.5 text-sky-500 dark:text-sky-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-sky-900 dark:text-white truncate mb-1">
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-sky-600/60 dark:text-sky-400/60">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {group.member_count || 0} member{(group.member_count || 0) !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessagesSquare className="h-3.5 w-3.5" />
                            {group.messagesCount || 0} message{(group.messagesCount || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/groups/${group.id}`}>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-lg transition-colors">
                        View
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Group Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                onClick={() => setShowCreateModal(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-sky-100 dark:border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                        Create Group Chat
                      </h2>
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="p-1.5 rounded-lg text-sky-500/40 hover:text-sky-600 hover:bg-sky-500/5 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateGroup} className="space-y-4">
                      <div>
                        <label htmlFor="group-name" className="block text-xs font-bold text-sky-500/50 dark:text-sky-400/50 mb-2 uppercase tracking-wider">
                          Group Name
                        </label>
                        <Input
                          id="group-name"
                          type="text"
                          placeholder="e.g., CS101 Study Group"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          required
                          className="border-sky-100 dark:border-gray-700 bg-[#f5f9fc] dark:bg-gray-900 text-sky-900 dark:text-white rounded-xl focus:border-sky-500 dark:focus:border-sky-400"
                          autoFocus
                        />
                        {createError && (
                          <p className="mt-2 text-xs text-red-500">{createError}</p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          disabled={isCreating}
                          className="px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreating || !newGroupName.trim()}
                          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors disabled:opacity-50"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Group'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      <RouteIntroPopup
        isOpen={showIntro}
        onClose={dismissIntro}
        title="Welcome to Group Chats!"
        description="Collaborate with classmates in real-time group conversations"
        icon={<Users className="h-6 w-6" />}
        features={[
          'Create or join group chats for your classes',
          'Collaborate with classmates in real-time',
          'Share notes, resources, and study tips',
          'Stay organized with multiple group conversations',
        ]}
      />
    </div>
  );
}
