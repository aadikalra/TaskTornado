'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AiConnectionSummary } from '@/lib/ai/providers';

export const AI_CONNECTION_EVENT = 'aiConnectionChanged';
const CHANGE_KEY = 'tasktornado-ai-settings-changed';

export function notifyAiConnectionChanged() {
  window.dispatchEvent(new Event(AI_CONNECTION_EVENT));
  // Only a timestamp crosses tabs; API keys never enter browser storage.
  try { localStorage.setItem(CHANGE_KEY, String(Date.now())); } catch { /* Storage may be disabled. */ }
}

export function useAiConnection() {
  const [connection, setConnection] = useState<AiConnectionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/settings', { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not load AI settings.');
      setConnection(body);
      setError('');
    } catch (error) {
      setError((error as Error).message);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void refresh();
    const changed = () => { void refresh(); };
    const storage = (event: StorageEvent) => { if (event.key === CHANGE_KEY) changed(); };
    window.addEventListener(AI_CONNECTION_EVENT, changed);
    window.addEventListener('focus', changed);
    window.addEventListener('storage', storage);
    return () => {
      window.removeEventListener(AI_CONNECTION_EVENT, changed);
      window.removeEventListener('focus', changed);
      window.removeEventListener('storage', storage);
    };
  }, [refresh]);
  return { connection, loading, error, refresh, usingOwnKey: Boolean(connection?.enabled && connection.configured) };
}
