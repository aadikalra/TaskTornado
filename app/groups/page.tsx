'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyGroups } from '@/context/StudyGroupsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MessageSquare, Users, Link as LinkIcon, ArrowRight, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';

export default function GroupsPage() {
  const router = useRouter();
  const { groups, loading, error, createGroup, schoolWarning, dismissSchoolWarning } = useStudyGroups();
  const { getContainerClass } = useWideLayout();
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const { showIntro, dismissIntro } = useRouteIntro('groups');

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
    } catch (err) {
      console.error('Error creating group:', err);
      setCreateError('Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className={getContainerClass() + ' py-16'}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
              Group Chats
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Join or create a group chat to collaborate with classmates
            </p>
          </motion.div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-800 pb-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Helper function to show the dialog with proper type assertion
  const showCreateGroupDialog = () => {
    const dialog = document.getElementById('create-group-dialog') as HTMLDialogElement | null;
    if (dialog) {
      (dialog as HTMLDialogElement).showModal();
    }
  };

  // Helper function to close the dialog with proper type assertion
  const closeCreateGroupDialog = () => {
    const dialog = document.getElementById('create-group-dialog') as HTMLDialogElement | null;
    if (dialog) {
      dialog.close();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className={getContainerClass() + ' py-16'}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
                Group Chats
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Join or create a group chat to collaborate with classmates
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                showCreateGroupDialog();
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Group
            </Button>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Error loading groups
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* School Warning */}
        {schoolWarning?.showWarning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  School Notice
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {schoolWarning.message}
                </p>
              </div>
              <button
                onClick={dismissSchoolWarning}
                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* Groups Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {groups.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No group chats yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Get started by creating a new group chat.
              </p>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  showCreateGroupDialog();
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{group.member_count || 0} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{group.messagesCount || 0} messages</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/groups/${group.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        View Group
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built for students • Public Beta v2.0.3
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Create Group Dialog */}
      <dialog id="create-group-dialog" className="relative z-50">
        <div className="fixed inset-0 bg-black/50" onClick={closeCreateGroupDialog} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            <h3 className="mb-6 text-xl font-medium text-gray-900 dark:text-white">Create a new group chat</h3>

            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Group Name
                </label>
                <Input
                  id="group-name"
                  type="text"
                  placeholder="e.g., CS101 Study Group"
                  className="w-full dark:text-gray-300"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
                {createError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{createError}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeCreateGroupDialog}
                  disabled={isCreating}
                  className="px-4 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !newGroupName.trim()}
                  className="px-4"
                >
                  {isCreating ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : 'Create Group'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </dialog>

      {/* Route Intro Popup */}
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
