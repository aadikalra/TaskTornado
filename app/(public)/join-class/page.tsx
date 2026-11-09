'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { classroomError, isInviteToken, refreshClassroomData, type InvitePreview } from '@/lib/classroom';

export default function JoinClassPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setToken(new URLSearchParams(window.location.search).get('invite') ?? ''); }, []);
  useEffect(() => {
    if (authLoading) return;
    if (!isInviteToken(token)) { setLoading(false); return; }
    if (!user) { setLoading(false); return; }
    let active = true;
    setLoading(true); setError('');
    supabase.rpc('classroom_preview_invite', { p_token: token }).then(({ data, error }) => {
      if (!active) return;
      if (error) setError(classroomError(error)); else setPreview(data as unknown as InvitePreview);
      setLoading(false);
    });
    return () => { active = false; };
  }, [token, user?.id, authLoading]);
  function continueToAuth() { if (isInviteToken(token)) sessionStorage.setItem('pending-class-invite', token); }
  async function join() {
    if (joining || !preview) return;
    setJoining(true); setError('');
    try {
      const { error } = await supabase.rpc('classroom_join', { p_token: token });
      if (error) throw error;
      sessionStorage.removeItem('pending-class-invite');
      refreshClassroomData();
      router.push('/newhome');
    } catch (err) { setError(classroomError(err)); setJoining(false); }
  }
  return <main className="min-h-[80vh] bg-[#fffaf4] dark:bg-gray-950 px-4 pt-32 pb-12">
    <div className="mx-auto max-w-md rounded-[28px] border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-7 shadow-xl shadow-sky-900/5">
      <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400"><Users size={24} /></span>
      <h1 className="text-2xl font-bold text-sky-900 dark:text-white">{preview ? `Join ${preview.name}` : 'Join a shared class'}</h1>
      {authLoading || loading ? <p role="status" className="mt-5 flex items-center gap-2 text-sm text-sky-600"><Loader2 size={16} className="animate-spin" />Checking invitation…</p> : !isInviteToken(token) ? <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">This invite link is invalid. Ask the class creator for a new link.</p> : !user ? <>
        <p className="mt-4 text-sm leading-6 text-sky-700/75 dark:text-sky-300/70">Sign in to your own account to join. The class will appear alongside your other classes.</p>
        <Link onClick={continueToAuth} href="/login" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#275085] text-sm font-semibold text-white">Sign in to join</Link>
        <Link onClick={continueToAuth} href="/signup" className="mt-3 block text-center text-xs font-semibold text-sky-600 dark:text-sky-400">Create an account</Link>
      </> : preview && <>
        <p className="mt-4 text-sm leading-6 text-sky-700/75 dark:text-sky-300/70">You’ll share homework, subtasks, completion, and test schedules with the team. Personal grades stay private.</p>
        <button type="button" disabled={joining} onClick={join} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#d4e88e]/60 bg-[#ebf6b5]/70 dark:bg-[#ebf6b5]/10 text-sm font-semibold text-sky-800 dark:text-sky-200 disabled:opacity-50">{joining && <Loader2 size={16} className="animate-spin" />}{joining ? 'Joining…' : preview.already_joined ? 'Open class' : 'Join class'}</button>
      </>}
      {error && <p role="alert" className="mt-4 text-sm leading-6 text-red-600 dark:text-red-400">{error}</p>}
      {user && /eligible|eligibility/i.test(error) && <Link href="/account-eligibility" className="mt-3 block text-xs text-sky-600 dark:text-sky-400">Check account eligibility</Link>}
      <Link href="/newhome" className="mt-5 block text-center text-xs font-medium text-sky-600 dark:text-sky-400">Back to homework</Link>
    </div>
  </main>;
}
