'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyGroups } from '@/context/StudyGroupsContext';
import { Input } from '@/components/ui/input';
import { Plus, MessagesSquare, Users, ArrowRight, AlertTriangle, X, Loader2, Link as LinkIcon, Check, Copy, Trash2 } from 'lucide-react';
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
  const { groups, loading, error, createGroup, deleteGroup, schoolWarning, dismissSchoolWarning } = useStudyGroups();
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const { showIntro, dismissIntro } = useRouteIntro('groups');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Delete confirmation state
  const [groupToDelete, setGroupToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Share link modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [newGroupId, setNewGroupId] = useState<string | null>(null);
  const [newGroupDisplayName, setNewGroupDisplayName] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const getInviteUrl = (groupId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/groups/join/${groupId}`;
    }
    return '';
  };

  const handleCopyLink = async () => {
    if (!newGroupId) return;
    const text = getInviteUrl(newGroupId);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-HTTPS or unsupported browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setCreateError('Please enter a group name');
      return;
    }
    setCreateError(null);
    setIsCreating(true);
    try {
      const groupId = await createGroup(newGroupName);
      setNewGroupDisplayName(newGroupName);
      setNewGroupId(groupId);
      setNewGroupName('');
      setShowCreateModal(false);
      // Show the share modal immediately after creation
      setShowShareModal(true);
      setLinkCopied(false);
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
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setGroupToDelete({ id: group.id, name: group.name });
                        }}
                        className="p-1.5 text-sky-400/40 hover:text-red-500 dark:text-sky-500/30 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete group"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <Link href={`/groups/${group.id}`}>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-lg transition-colors">
                          View
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </Link>
                    </div>
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
                className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm z-50"
                onClick={() => setShowCreateModal(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-md relative border border-sky-100 dark:border-gray-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-gray-800 rounded-t-[28px] z-10">
                    <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                      Create Group Chat
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    <form onSubmit={handleCreateGroup} className="space-y-5">
                      <div>
                        <label htmlFor="group-name" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                          Group Name
                        </label>
                        <Input
                          id="group-name"
                          type="text"
                          placeholder="e.g., CS101 Study Group"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          required
                          className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          autoFocus
                        />
                        {createError && (
                          <p className="mt-2 text-xs text-red-500">{createError}</p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          disabled={isCreating}
                          className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreating || !newGroupName.trim()}
                          className="h-10 px-6 flex items-center justify-center gap-2 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

        {/* Share Invite Link Modal — shown immediately after group creation */}
        <AnimatePresence>
          {showShareModal && newGroupId && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm z-50"
                onClick={() => setShowShareModal(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-md relative border border-sky-100 dark:border-gray-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-gray-800 rounded-t-[28px] z-10">
                    <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                      Group Created! 🎉
                    </h2>
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                        className="w-16 h-16 bg-[#ebf6b5]/60 dark:bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#d4e88e]/40"
                      >
                        <Users className="w-7 h-7 text-sky-600 dark:text-sky-400" />
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-sm text-sky-600/60 dark:text-sky-400/60"
                      >
                        <span className="font-semibold text-sky-900 dark:text-white">{newGroupDisplayName}</span> is ready. Share the invite link below to add members.
                      </motion.p>
                    </div>

                    {/* Invite Link */}
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-4"
                    >
                      <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                        Invite Link
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2.5 h-11 px-3.5 bg-[#f5f9fc] dark:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <LinkIcon className="w-4 h-4 text-sky-400 shrink-0" />
                          <span className="text-sm text-sky-800 dark:text-sky-300 truncate select-all">
                            {getInviteUrl(newGroupId)}
                          </span>
                        </div>
                        <button
                          onClick={handleCopyLink}
                          className={`h-11 px-4 flex items-center gap-2 text-[13px] font-semibold rounded-xl transition-all shrink-0 ${linkCopied
                            ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30'
                            : 'text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/15 hover:bg-sky-200 dark:hover:bg-sky-500/25 border border-sky-200 dark:border-sky-500/30'
                            }`}
                        >
                          {linkCopied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="mt-2.5 text-[11px] text-sky-500/40 dark:text-sky-400/30">
                        For privacy, member lists are not shown. Share this link directly with people you want to invite.
                      </p>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="flex items-center justify-end gap-2.5 pt-2"
                    >
                      <button
                        onClick={() => setShowShareModal(false)}
                        className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => {
                          setShowShareModal(false);
                          router.push(`/groups/${newGroupId}`);
                        }}
                        className="h-10 px-6 flex items-center justify-center gap-2 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full transition-colors"
                      >
                        Open Chat
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Delete Group Confirmation Modal */}
        <AnimatePresence>
          {groupToDelete && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm z-50"
                onClick={() => !isDeleting && setGroupToDelete(null)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-sm relative border border-sky-100 dark:border-gray-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-gray-800 rounded-t-[28px] z-10">
                    <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                      Delete Group
                    </h2>
                    <button
                      onClick={() => !isDeleting && setGroupToDelete(null)}
                      className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 rounded-2xl mb-5">
                      <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                          This action cannot be undone
                        </p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80 leading-relaxed">
                          Deleting <span className="font-semibold">&quot;{groupToDelete.name}&quot;</span> will permanently remove all messages, shared links, and members from this group.
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => setGroupToDelete(null)}
                        disabled={isDeleting}
                        className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setIsDeleting(true);
                          try {
                            await deleteGroup(groupToDelete.id);
                            setGroupToDelete(null);
                          } catch (err) {
                            console.error('Error deleting group:', err);
                          } finally {
                            setIsDeleting(false);
                          }
                        }}
                        disabled={isDeleting}
                        className="h-10 px-6 flex items-center justify-center gap-2 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 border border-red-600 rounded-full transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Group
                          </>
                        )}
                      </button>
                    </div>
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
