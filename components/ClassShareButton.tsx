'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Link2, Loader2, LogOut, Share2, Users, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import type { Class } from '@/context/ClassContext';
import { supabase } from '@/lib/supabase/client';
import { classroomError, classroomMembers, createClassInvite, refreshClassroomData, type ClassroomMember } from '@/lib/classroom';

export function ClassShareButton({ schoolClass, className = '' }: { schoolClass: Class; className?: string }) {
  const { user } = useAuth();
  const owner = schoolClass.user_id === user?.id;
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!open || !schoolClass.is_shared) return;
    let active = true;
    classroomMembers(schoolClass.id).then(result => { if (active) setMembers(result); }).catch(err => { if (active) setError(classroomError(err)); });
    return () => { active = false; };
  }, [open, schoolClass.id, schoolClass.is_shared, schoolClass.member_count]);

  async function copyInvite() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true); setError(''); setMessage(''); setCopied(false);
    try {
      let url = link;
      if (!url || expiresAt <= Date.now()) {
        const invite = await createClassInvite(schoolClass.id);
        url = `${window.location.origin}/join-class?invite=${invite.token}`;
        setLink(url);
        setExpiresAt(new Date(invite.expires_at).getTime());
        setMembers(await classroomMembers(schoolClass.id));
      }
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      } catch {
        setMessage('Your link is ready. Select it below to copy, or press Copy link again.');
        requestAnimationFrame(() => linkInput.current?.select());
      }
    } catch (err) { setError(classroomError(err)); }
    finally { busyRef.current = false; setBusy(false); }
  }

  async function revoke() {
    setBusy(true); setError('');
    try {
      const { error } = await supabase.rpc('classroom_revoke_invites', { p_class_id: schoolClass.id });
      if (error) throw error;
      setLink(''); setCopied(false); setMessage('Previous invite links have been revoked. Current members stay connected.');
    } catch (err) { setError(classroomError(err)); }
    finally { setBusy(false); }
  }

  async function removeMember(userId: string) {
    setBusy(true); setError('');
    try {
      const { error } = await supabase.rpc('classroom_remove_member', { p_class_id: schoolClass.id, p_user_id: userId });
      if (error) throw error;
      setConfirmRemove(null); setLink(''); setCopied(false);
      refreshClassroomData();
      if (userId === user?.id) setOpen(false);
      else { setMembers(await classroomMembers(schoolClass.id)); setMessage('Member removed. Previous invite links have been revoked.'); }
    } catch (err) { setError(classroomError(err)); }
    finally { setBusy(false); }
  }

  return <>
    <button type="button" aria-label={`Share ${schoolClass.name}`} title={`Share ${schoolClass.name}`} disabled={schoolClass.id.startsWith('temp-')}
      onClick={event => { event.stopPropagation(); setOpen(true); if (owner) void copyInvite(); }}
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-gray-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-40 ${className}`}>
      <Share2 size={14} aria-hidden="true" />
    </button>
    <Dialog open={open} onOpenChange={next => { if (!busy) { setOpen(next); setConfirmRemove(null); } }}>
      <DialogContent className="rounded-[28px] border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-0 gap-0 overflow-hidden sm:max-w-md text-sky-900 dark:text-sky-100" onClick={event => event.stopPropagation()}>
        <div className="px-6 pt-6 pb-4">
          <span className="mb-3 grid size-10 place-items-center rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400"><Users size={20} /></span>
          <DialogTitle className="text-lg font-bold pr-6">Share {schoolClass.name}</DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-sky-700/75 dark:text-sky-300/70">One class, shared with your team. Everyone who joins can add and edit homework, subtasks, and test schedules. Completion syncs for everyone. Personal grades stay private.</DialogDescription>
        </div>
        {owner && <div className="px-6 pb-5 space-y-3">
          {link && <div className="flex items-center gap-2 rounded-xl border border-sky-100 dark:border-gray-700 bg-sky-50/40 dark:bg-gray-950/30 px-3">
            <Link2 size={15} className="shrink-0 text-sky-500" />
            <input ref={linkInput} aria-label="Class invite link" value={link} readOnly onFocus={event => event.target.select()} className="min-w-0 flex-1 bg-transparent py-3 text-xs outline-none text-sky-800 dark:text-sky-200" />
          </div>}
          <button type="button" disabled={busy} onClick={copyInvite} className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-full bg-[#ebf6b5]/70 dark:bg-[#ebf6b5]/10 border border-[#d4e88e]/60 dark:border-[#d4e88e]/20 text-sm font-semibold text-sky-800 dark:text-sky-200 hover:bg-[#ebf6b5] dark:hover:bg-[#ebf6b5]/20 disabled:opacity-50">
            {busy ? <Loader2 size={16} className="animate-spin" /> : copied ? <Check size={16} /> : <Copy size={16} />}{busy ? 'Preparing…' : copied ? 'Link copied' : 'Copy invite link'}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-sky-600/75 dark:text-sky-400/75">
            <span>Invite links expire after 7 days.</span>
            {schoolClass.is_shared && <button type="button" disabled={busy} onClick={revoke} className="rounded py-1 hover:underline underline-offset-2">Revoke invite links</button>}
          </div>
        </div>}
        {!owner && <p className="px-6 pb-4 text-xs text-sky-600 dark:text-sky-400">Only the class creator can invite or remove classmates.</p>}
        {members.length > 0 && <div className="border-t border-sky-100 dark:border-gray-800 px-6 py-4">
          <h3 className="mb-2 text-xs font-semibold text-sky-700 dark:text-sky-300">Members · {members.length}</h3>
          <ul className="max-h-48 overflow-y-auto space-y-1">
            {members.map(member => <li key={member.user_id} className="flex items-center gap-2 py-1.5 text-sm">
              <span className="min-w-0 flex-1 truncate">{member.name}{member.user_id === user?.id ? ' (you)' : ''}</span>
              {member.is_owner ? <span className="text-[11px] text-sky-500">Creator</span> : owner && <button type="button" aria-label={`Remove ${member.name}`} disabled={busy} onClick={() => setConfirmRemove(member.user_id)} className="grid size-7 place-items-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"><X size={14} /></button>}
            </li>)}
          </ul>
          {!owner && <button type="button" disabled={busy} onClick={() => setConfirmRemove(user?.id ?? null)} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400"><LogOut size={14} />Leave class</button>}
        </div>}
        {confirmRemove && <div className="mx-6 mb-4 rounded-xl border border-red-100 dark:border-red-900/50 p-3">
          <p className="text-xs leading-5 text-red-700 dark:text-red-300">{confirmRemove === user?.id ? 'Leave this class? Your teammates’ work stays in the class.' : 'Remove this member? They’ll lose access, and existing invite links will be revoked.'}</p>
          <div className="mt-2 flex gap-3 text-xs font-semibold"><button type="button" disabled={busy} onClick={() => removeMember(confirmRemove)} className="text-red-600 dark:text-red-400">{confirmRemove === user?.id ? 'Leave class' : 'Remove member'}</button><button type="button" disabled={busy} onClick={() => setConfirmRemove(null)}>Cancel</button></div>
        </div>}
        {message && <p role="status" className="px-6 pb-4 text-xs leading-5 text-sky-700 dark:text-sky-300">{message}</p>}
        {error && <p role="alert" className="px-6 pb-4 text-xs leading-5 text-red-600 dark:text-red-400">{error}</p>}
      </DialogContent>
    </Dialog>
  </>;
}
