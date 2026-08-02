'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';

export default function ParentalConsentPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [guardianName, setGuardianName] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('loading');

    const response = await fetch('/api/auth/parental-consent/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, guardianName, consent }),
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus('error');
      setMessage(body.error || 'Approval could not be recorded.');
      return;
    }

    setStatus('success');
    setMessage('The student account is approved. They may now sign in.');
  }

  return (
    <main className="min-h-screen bg-[#f7f9f1] px-6 py-24 text-[#275085]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#275085]/10 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Parent or guardian approval</h1>
        <p className="mt-4 text-sm leading-6 text-[#275085]/75">
          TaskTornado is a U.S.-only school organization service for people age
          13 and older. By approving, you confirm that you are the student’s
          parent or legal guardian and permit the student to create and use
          their account. Aurora can send the student’s prompts, recent chat
          context, and limited relevant class, homework, or test information
          to Groq for educational AI responses. Aurora has no web search.
        </p>

        {status === 'success' ? (
          <p className="mt-8 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            {message}
          </p>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold">
              Your full legal name
              <input
                className="mt-2 w-full rounded-xl border border-[#275085]/20 px-4 py-3 font-normal"
                value={guardianName}
                onChange={(event) => setGuardianName(event.target.value)}
                required
              />
            </label>
            <div className="flex items-start gap-3 text-sm leading-6">
              <Checkbox
                id="guardian-consent"
                name="guardian-consent"
                className="mt-1 cursor-pointer rounded-md border-[#275085]/40 data-[state=checked]:border-[#275085] data-[state=checked]:bg-[#275085]"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
                required
              />
              <label className="cursor-pointer" htmlFor="guardian-consent">
                I am the student’s parent or legal guardian, I have reviewed the
                {' '}
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
              <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                {message}
              </p>
            )}
            <button
              className="w-full rounded-xl bg-[#275085] px-5 py-3 font-bold text-white disabled:opacity-50"
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
