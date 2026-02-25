'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudyGroups } from '@/context/StudyGroupsContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CheckCircle, XCircle, Users } from 'lucide-react';
import Link from 'next/link';

export default function JoinGroupPage() {
  const { inviteId } = useParams() as { inviteId: string };
  const router = useRouter();
  const { joinGroup, groups } = useStudyGroups();
  
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
    } catch (err) {
      console.error('Error joining group:', err);
      setStatus('error');
      setError('Failed to join group. The invite link may be invalid or expired.');
    } finally {
      setIsJoining(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md">
        <div className="text-center space-y-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Loading Group</h1>
            <p className="text-muted-foreground">Checking group information...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (status === 'already_member') {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md">
        <div className="text-center space-y-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Already a Member</h1>
            <p className="text-muted-foreground">
              You're already a member of this group chat.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button asChild>
              <Link href={`/groups/${inviteId}`}>
                Go to Group
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/groups">
                Back to Groups
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md">
        <div className="text-center space-y-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground">
              {error || 'An error occurred while processing your request.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button variant="outline" asChild>
              <Link href="/groups">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Groups
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md">
        <div className="text-center space-y-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Joined Successfully!</h1>
            <p className="text-muted-foreground">
              You've been added to the group chat. Redirecting you now...
            </p>
          </div>
          <div className="pt-4">
            <Button asChild>
              <Link href={`/groups/${inviteId}`}>
                Go to Group Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Default join group view
  return (
    <div className="container mx-auto py-12 px-4 max-w-md">
      <div className="text-center space-y-6">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Join Study Group</h1>
          <p className="text-muted-foreground">
            You've been invited to join a group chat. Click the button below to join!
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-4">
          <Button 
            onClick={handleJoinGroup}
            disabled={isJoining}
            className="w-full"
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : 'Join Group'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/groups">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
