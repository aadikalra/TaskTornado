'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { HugeIcon } from '@/lib/huge-icon-map';

type LookupState =
  | { state: 'loading' }
  | { state: 'invalid'; message: string }
  | { state: 'already_approved'; studentEmail: string | null; studentName: string | null }
  | { state: 'pending'; studentEmail: string | null; studentName: string | null };

export default function ParentalConsentPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [lookup, setLookup] = useState<LookupState>(() =>
    token
      ? { state: 'loading' }
      : { state: 'invalid', message: 'This approval link is missing or invalid.' }
  );
  const [guardianName, setGuardianName] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLookup({ state: 'invalid', message: 'This approval link is missing or invalid.' });
      return;
    }

    let cancelled = false;
    setLookup({ state: 'loading' });

    fetch(`/api/auth/parental-consent/approve?token=${encodeURIComponent(token)}`, {
      cache: 'no-store',
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || body.status === 'invalid') {
          setLookup({
            state: 'invalid',
            message: body.error || 'This approval link is invalid or has expired.',
          });
          return;
        }
        if (body.status === 'approved') {
          setLookup({
            state: 'already_approved',
            studentEmail: body.studentEmail || null,
            studentName: body.studentName || null,
          });
          return;
        }
        setLookup({
          state: 'pending',
          studentEmail: body.studentEmail || null,
          studentName: body.studentName || null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLookup({
          state: 'invalid',
          message: 'Approval details could not be loaded. Please refresh and try again.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/parental-consent/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, guardianName, consent }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus('error');
        setMessage(body.error || 'Approval could not be recorded.');
        return;
      }

      setStatus('success');
      setMessage('The student account is approved. They may now sign in.');
    } catch {
      setStatus('error');
      setMessage('Approval could not be recorded. Please try again.');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6fae7] via-[#f6fae7] to-[#FCFDF5] dark:from-[#0a0f1d] dark:via-[#090d1a] dark:to-[#03050c] px-6 py-24 text-[#275085] dark:text-[#a0c3ff]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#275085]/12 dark:border-white/10 bg-white/95 dark:bg-[#0f172a]/90 p-8 shadow-xl shadow-[#275085]/5 dark:shadow-black/40 backdrop-blur">
        <h1 className="text-3xl font-bold tracking-tight">Parent or guardian approval</h1>
        <p className="mt-4 text-sm leading-6 text-[#275085]/75 dark:text-[#a0c3ff]/75">
          TaskTornado is a U.S.-only school organization service for people age
          13 and older. By approving, you confirm that you are the student’s
          parent or legal guardian and permit the student to create and use
          their account. Aurora can send the student’s prompts, recent chat
          context, and limited relevant class, homework, or test information
          to Groq for educational AI responses. Aurora has no web search.
        </p>

        {lookup.state === 'loading' ? (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#275085]/10 dark:border-white/10 bg-[#275085]/[0.03] dark:bg-white/[0.03] p-4 text-sm">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>Loading approval request…</span>
          </div>
        ) : lookup.state === 'invalid' ? (
          <div className="mt-8 space-y-4">
            <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-700 dark:text-red-300">
              {lookup.message}
            </div>
            <p className="text-xs text-[#275085]/65 dark:text-[#a0c3ff]/65">
              Ask the student to sign in at TaskTornado to send a fresh approval email.
            </p>
          </div>
        ) : lookup.state === 'already_approved' ? (
          <div className="mt-8 space-y-5">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
              <p className="font-semibold">This student account is already approved.</p>
              {(lookup.studentName || lookup.studentEmail) && (
                <p className="mt-1 opacity-85">
                  Student: {lookup.studentName ? `${lookup.studentName} ` : ''}
                  {lookup.studentEmail ? `(${lookup.studentEmail})` : ''}
                </p>
              )}
            </div>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#275085] dark:bg-[#4f8df0] px-5 py-3 font-bold text-white transition hover:bg-[#1e3f6a] dark:hover:bg-[#3b82f6]"
            >
              <span>Go to Sign In</span>
              <HugeIcon name="ArrowRight01" size={16} />
            </Link>
          </div>
        ) : status === 'success' ? (
          <div className="mt-8 space-y-5">
            <div role="status" className="rounded-2xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-4 text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {message}
            </div>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#275085] dark:bg-[#4f8df0] px-5 py-3 font-bold text-white transition hover:bg-[#1e3f6a] dark:hover:bg-[#3b82f6]"
            >
              <span>Continue to Sign In</span>
              <HugeIcon name="ArrowRight01" size={16} />
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {(lookup.studentName || lookup.studentEmail) && (
              <div className="rounded-2xl border border-[#275085]/12 dark:border-[#a0c3ff]/15 bg-[#275085]/[0.04] dark:bg-[#a0c3ff]/[0.06] px-4 py-3 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#275085]/60 dark:text-[#a0c3ff]/60">
                  Student account
                </p>
                <p className="mt-0.5 font-semibold text-[#275085] dark:text-white">
                  {lookup.studentName || lookup.studentEmail}
                </p>
                {lookup.studentName && lookup.studentEmail && (
                  <p className="text-xs text-[#275085]/70 dark:text-[#a0c3ff]/70">
                    {lookup.studentEmail}
                  </p>
                )}
              </div>
            )}

            <label className="block text-sm font-semibold">
              Your full legal name
              <input
                className="mt-2 w-full rounded-xl border border-[#275085]/20 dark:border-[#a0c3ff]/20 bg-white dark:bg-[#0d1526] px-4 py-3 font-normal text-[#275085] dark:text-[#a0c3ff] placeholder:text-[#275085]/40 dark:placeholder:text-[#a0c3ff]/40 focus:outline-none focus-visible:border-[#275085] dark:focus-visible:border-[#a0c3ff] focus-visible:ring-2 focus-visible:ring-[#275085]/20 dark:focus-visible:ring-[#a0c3ff]/25"
                value={guardianName}
                onChange={(event) => setGuardianName(event.target.value)}
                placeholder="Jane Doe"
                required
              />
            </label>
            <div className="flex items-start gap-3 text-sm leading-6">
              <Checkbox
                id="guardian-consent"
                name="guardian-consent"
                className="mt-1 cursor-pointer rounded-md border-[#275085]/40 dark:border-[#a0c3ff]/40 data-[state=checked]:border-[#275085] data-[state=checked]:bg-[#275085] data-[state=checked]:text-white dark:data-[state=checked]:border-[#4f8df0] dark:data-[state=checked]:bg-[#4f8df0]"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
                required
              />
              <label className="cursor-pointer select-none" htmlFor="guardian-consent">
                I am the student’s parent or legal guardian, I have reviewed the{' '}
                <Link className="font-semibold underline" href="/legal/privacy">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link className="font-semibold underline" href="/legal/terms">
                  Terms
                </Link>
                , including the disclosed use of Groq for Aurora, and I approve
                this account.
              </label>
            </div>
            {status === 'error' && (
              <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-300">
                {message}
              </p>
            )}
            <button
              className="w-full rounded-xl bg-[#275085] dark:bg-[#4f8df0] px-5 py-3 font-bold text-white transition hover:bg-[#1e3f6a] dark:hover:bg-[#3b82f6] disabled:opacity-50"
              disabled={
                status === 'loading' ||
                !token ||
                !guardianName.trim() ||
                !consent
              }
              type="submit"
            >
              {status === 'loading' ? 'Recording approval…' : 'Approve account'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
