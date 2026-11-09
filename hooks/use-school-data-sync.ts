'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

/** Realtime invalidates snapshots; refetches always apply current membership/RLS. */
export function useSchoolDataSync(table: 'classes' | 'homework' | 'tests', userId: string | undefined, enabled: boolean, refresh: () => Promise<void>) {
  useEffect(() => {
    if (!userId || !enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let active = true;
    let inFlight = false;
    let queued = false;
    const run = async () => {
      if (!active) return;
      if (inFlight) { queued = true; return; }
      inFlight = true;
      try { await refresh(); }
      finally {
        inFlight = false;
        if (active && queued) { queued = false; schedule(); }
      }
    };
    const schedule = () => {
      if (!active) return;
      clearTimeout(timer);
      timer = setTimeout(() => { if (active) void run(); }, 150);
    };
    const visibleRefresh = () => { if (document.visibilityState === 'visible') schedule(); };
    void run();
    const channel = supabase.channel(`school-${table}-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classroom_revisions' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classroom_members', filter: `user_id=eq.${userId}` }, schedule)
      .subscribe(status => { if (status === 'SUBSCRIBED') schedule(); });
    // Also reconcile after disconnects and membership revocation, when RLS may
    // correctly stop delivering the removed member's Realtime events.
    const poll = setInterval(visibleRefresh, 15_000);
    document.addEventListener('visibilitychange', visibleRefresh);
    window.addEventListener('online', schedule);
    window.addEventListener('classroom-refresh', schedule);
    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', visibleRefresh);
      window.removeEventListener('online', schedule);
      window.removeEventListener('classroom-refresh', schedule);
      void supabase.removeChannel(channel);
    };
  }, [table, userId, enabled, refresh]);
}
