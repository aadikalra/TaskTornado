'use client';

import { Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { useAuth } from '@/context/AuthContext';
import {
  getAgeGroup,
  SUPPORTED_COUNTRY_CODE,
} from '@/lib/legal/eligibility';
import { supabase } from '@/lib/supabase/client';

export default function AccountEligibilityPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    accountType,
    signOut,
  } = useAuth();
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.user_metadata?.date_of_birth || ''
  );
  const [guardianEmail, setGuardianEmail] = useState(
    user?.user_metadata?.guardian_email || ''
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const ageGroup = useMemo(
    () => (dateOfBirth ? getAgeGroup(dateOfBirth) : null),
    [dateOfBirth]
  );
  const isMinor = ageGroup === 'minor';

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, router, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/eligibility/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOfBirth,
          countryCode: SUPPORTED_COUNTRY_CODE,
          guardianEmail: isMinor ? guardianEmail.trim() : undefined,
          termsAccepted,
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          body.error || 'Your account information could not be saved.'
        );
      }

      if (body.requiresParentalConsent) {
        const consentResponse = await fetch(
          '/api/auth/parental-consent/request',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id, email: user?.email }),
          }
        );
        const consentBody = await consentResponse.json().catch(() => ({}));

        if (!consentResponse.ok) {
          throw new Error(
            consentBody.error ||
              'Your parent or guardian approval email could not be sent.'
          );
        }

        await signOut();
        router.replace('/login?approval=sent');
        return;
      }

      await supabase.auth.refreshSession();
      router.replace(
        accountType === 'guardian' ? '/guardian/dashboard' : '/dashboard'
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Your account information could not be saved.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6fae7] dark:bg-[#090d1a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#275085] dark:text-[#a0c3ff]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6fae7] to-[#fcfdf5] px-4 py-24 text-[#275085] dark:from-[#0a0f1d] dark:to-[#03050c] dark:text-[#a0c3ff]">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-[#275085] p-3 text-white dark:bg-[#a0c3ff] dark:text-[#0a0f1d]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-60">
              One-time account update
            </p>
            <h1 className="text-3xl font-black tracking-tight">
              Confirm your eligibility
            </h1>
          </div>
        </div>

        <div className="rounded-3xl border border-[#275085]/15 bg-white/75 p-6 shadow-xl shadow-[#275085]/5 backdrop-blur md:p-8 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="mb-7 text-sm leading-6 opacity-75">
            Your account was created before TaskTornado added its age and
            parental-approval protections. Confirm these details once to keep
            using your existing account.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Date of birth</span>
              <input
                type="date"
                required
                value={dateOfBirth}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="w-full rounded-2xl border border-[#275085]/20 bg-white px-4 py-3 text-base text-[#17365d] outline-none transition focus:border-[#275085] focus:ring-4 focus:ring-[#275085]/10 dark:border-white/15 dark:bg-white/[0.06] dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold">Country</span>
              <select
                value={SUPPORTED_COUNTRY_CODE}
                disabled
                className="w-full rounded-2xl border border-[#275085]/20 bg-[#275085]/5 px-4 py-3 text-base text-[#17365d] opacity-80 dark:border-white/15 dark:bg-white/[0.06] dark:text-white"
              >
                <option value="US">United States</option>
              </select>
              <span className="mt-2 block text-xs opacity-60">
                TaskTornado is currently available only in the United States.
              </span>
            </label>

            {isMinor && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold">
                  Parent or guardian email
                </span>
                <input
                  type="email"
                  required
                  value={guardianEmail}
                  onChange={(event) => setGuardianEmail(event.target.value)}
                  placeholder="parent@example.com"
                  className="w-full rounded-2xl border border-[#275085]/20 bg-white px-4 py-3 text-base text-[#17365d] outline-none transition placeholder:text-[#275085]/35 focus:border-[#275085] focus:ring-4 focus:ring-[#275085]/10 dark:border-white/15 dark:bg-white/[0.06] dark:text-white"
                />
                <span className="mt-2 block text-xs opacity-60">
                  Users ages 13–17 need approval before entering the app.
                </span>
              </label>
            )}

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#275085]/15 p-4 dark:border-white/10">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked === true)
                }
                className="mt-0.5"
                aria-label="Accept the Privacy Policy and Terms"
              />
              <span className="text-sm leading-6">
                I have reviewed and accept the{' '}
                <Link
                  href="/legal/privacy"
                  target="_blank"
                  className="font-bold underline underline-offset-2"
                >
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link
                  href="/legal/terms"
                  target="_blank"
                  className="font-bold underline underline-offset-2"
                >
                  Terms
                </Link>
                .
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !termsAccepted || !dateOfBirth}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#275085] px-5 py-3.5 font-bold text-white transition hover:bg-[#1e3f6a] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#a0c3ff] dark:text-[#0a0f1d]"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Saving…' : 'Continue to TaskTornado'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
