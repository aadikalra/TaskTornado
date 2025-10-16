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

export default function GroupsPage() {
  const router = useRouter();
  const { groups, loading, error, createGroup } = useStudyGroups();
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
          <h1 className="text-3xl font-bold">Study Groups</h1>
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
        <div>
          <h1 className="text-3xl font-bold">Study Groups</h1>
          <p className="text-muted-foreground">
            Join or create a study group to collaborate with classmates
          </p>
        </div>
        
        <Button onClick={showCreateGroupDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Group
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

      {groups.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No study groups yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new study group.</p>
          <div className="mt-6">
            <Button onClick={showCreateGroupDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New Group
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
            <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Create a new study group</h3>
            
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
