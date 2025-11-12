'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyGroups } from '@/context/StudyGroupsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MessageSquare, Users, Link as LinkIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SplittingText } from '@/components/animate-ui/primitives/texts/splitting';

export default function GroupsPage() {
  const router = useRouter();
  const { groups, loading, error, createGroup, schoolWarning, dismissSchoolWarning } = useStudyGroups();
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Group Chats</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Group
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="relative text-left">
          <SplittingText
            text={'Group Chats'}
            aria-hidden="true"
            className="block text-4xl font-semibold text-neutral-200 dark:text-neutral-800"
            style={{ fontFamily: 'var(--font-header)' }}
            disableAnimation
          />
          <SplittingText
            text={'Group Chats'}
            className="block text-4xl font-semibold absolute inset-0"
            style={{ fontFamily: 'var(--font-header)' }}
            type="chars"
            alternateColors={['#ef4444', '#10b981']} // Red and Green colors
            inView
            initial={{ y: 0, opacity: 0, x: 0, filter: 'blur(10px)' }}
            animate={{ y: 0, opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <p className="text-muted-foreground">
            Join or create a group chat to collaborate with classmates
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            showCreateGroupDialog();
          }}
          className="border-2 border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white hover:scale-105 rounded-xl h-10 px-5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> New Group
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* School Warning Banner - Only for Group Chats */}
      {schoolWarning?.showWarning && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {schoolWarning.message}
                </p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={dismissSchoolWarning}
                className="inline-flex text-yellow-400 hover:text-yellow-600 dark:text-yellow-500 dark:hover:text-yellow-300"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No group chats yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new group chat.</p>
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                showCreateGroupDialog();
              }}
              className="border-2 border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white hover:scale-105 rounded-xl h-10 px-5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> New Group
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{group.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{group.member_count || 0} members</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{group.messagesCount || 0} messages</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/groups/${group.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Group <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Dialog */}
      <dialog id="create-group-dialog" className="relative z-50">
        <div className="fixed inset-0 bg-black/50" onClick={closeCreateGroupDialog} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Create a new group chat</h3>

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
          </div>
        </div>
      </dialog>
    </div>
  );
}
