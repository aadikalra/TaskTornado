'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isInviteToken } from '@/lib/classroom';

/** Preserve the invitation across the existing login/signup/eligibility flow. */
export function PendingClassInvite() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) return;
    const token = sessionStorage.getItem('pending-class-invite');
    sessionStorage.removeItem('pending-class-invite');
    if (isInviteToken(token)) router.replace(`/join-class?invite=${token}`);
  }, [user?.id, router]);
  return null;
}
