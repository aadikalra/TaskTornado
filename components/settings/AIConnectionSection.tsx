'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { AI_PROVIDERS, type AiProvider } from '@/lib/ai/providers';
import { AI_PLAN_LIMITS } from '@/lib/ai/config';
import { notifyAiConnectionChanged, useAiConnection } from '@/hooks/use-ai-connection';

export default function AIConnectionSection() {
  const { connection, loading, error: loadError, refresh } = useAiConnection();
  const [provider, setProvider] = useState<AiProvider>('openrouter');
  const [model, setModel] = useState<string>(AI_PROVIDERS.openrouter.defaultModel);
  const [apiKey, setApiKey] = useState('');
  const [edited, setEdited] = useState(false);
  const [showPersonal, setShowPersonal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!connection || edited) return;
    setShowPersonal(connection.enabled);
    if (connection.provider) {
      setProvider(connection.provider);
      setModel(connection.model);
    }
  }, [connection, edited]);

  async function update(body?: Record<string, unknown>, remove = false) {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/ai/settings', {
        method: remove ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save your connection.');
      setApiKey('');
      setEdited(false);
      setMessage(remove ? 'API key removed. Free AI is active.' : result.enabled ? 'Your own key is active.' : 'Free AI is active. Your saved key is kept for later.');
      await refresh();
      notifyAiConnectionChanged();
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }

  async function testConnection() {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/ai/settings/test', { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Connection test failed.');
      setMessage('Connection successful. Your model responded.');
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }

  const inputClass = 'w-full rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 dark:border-sky-800 dark:bg-gray-900 dark:text-sky-100';
  const buttonClass = 'rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';
  return (
    <div className="space-y-6 text-sky-900 dark:text-sky-100">
      <p className="max-w-2xl text-sm leading-relaxed text-sky-700/75 dark:text-sky-300/75">
        TaskTornado has one free plan. Use the included AI allowance, or connect your own provider at any time.
        Your own key bypasses daily AI quotas; your provider&apos;s charges and rate limits apply. Assignment and storage limits stay the same.
      </p>
      {loading ? <p role="status" className="text-sm">Loading AI settings…</p> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="AI source">
            <button type="button" aria-pressed={!showPersonal} disabled={busy}
              onClick={() => { setShowPersonal(false); if (connection?.enabled) void update({ enabled: false }); }}
              className={`rounded-2xl border p-4 text-left ${!showPersonal ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40' : 'border-sky-100 dark:border-sky-900'}`}>
              <span className="block font-semibold">Free AI</span>
              <span className="mt-1 block text-xs leading-relaxed opacity-70">{AI_PLAN_LIMITS.free.quick} Quick, {AI_PLAN_LIMITS.free.tutor} Deep, and {AI_PLAN_LIMITS.free.combined} shared AI actions per day.</span>
            </button>
            <button type="button" aria-pressed={showPersonal} disabled={busy || !connection?.available}
              onClick={() => { setShowPersonal(true); if (!connection?.configured) setEdited(true); if (connection?.configured && !connection.enabled) void update({ enabled: true }); }}
              className={`rounded-2xl border p-4 text-left disabled:opacity-50 ${showPersonal ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40' : 'border-sky-100 dark:border-sky-900'}`}>
              <span className="flex items-center gap-2 font-semibold"><KeyRound className="h-4 w-4" /> Bring your own key</span>
              <span className="mt-1 block text-xs leading-relaxed opacity-70">OpenRouter, Together AI, Fireworks AI, or Groq. Choose your model.</span>
            </button>
          </div>
          {!connection?.available && !loadError && <p className="text-sm text-amber-700 dark:text-amber-300">Personal AI connections are not configured on this server yet. Free AI is still available.</p>}
          {(showPersonal || connection?.configured) && (
            <form className="space-y-4 rounded-2xl border border-sky-100 p-5 dark:border-sky-900" onSubmit={(event) => {
              event.preventDefault(); void update({ provider, model, ...(apiKey ? { apiKey } : {}), enabled: true });
            }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium">Provider
                  <select value={provider} disabled={busy} className={inputClass} onChange={(event) => {
                    const value = event.target.value as AiProvider;
                    setEdited(true); setProvider(value); setModel(AI_PROVIDERS[value].defaultModel); setApiKey(''); setMessage('');
                  }}>
                    {Object.entries(AI_PROVIDERS).map(([id, value]) => <option key={id} value={id}>{value.name}</option>)}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm font-medium">Model ID
                  <input value={model} onChange={(event) => { setEdited(true); setModel(event.target.value); }} required maxLength={200} disabled={busy} className={inputClass} autoCapitalize="none" spellCheck={false} />
                </label>
              </div>
              <label className="block space-y-1.5 text-sm font-medium">API key
                <input type="password" value={apiKey} onChange={(event) => { setEdited(true); setApiKey(event.target.value); }} disabled={busy}
                  required={!connection?.configured || provider !== connection.provider} maxLength={512} autoComplete="off" autoCapitalize="none" spellCheck={false}
                  placeholder={connection?.configured && provider === connection.provider ? `Saved key ending ${connection.keyHint} · leave blank to keep` : 'Paste your provider API key'} className={inputClass} />
              </label>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium">
                <a href={AI_PROVIDERS[provider].keysUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline dark:text-sky-400">Get a {AI_PROVIDERS[provider].name} key ↗</a>
                <a href={AI_PROVIDERS[provider].modelsUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline dark:text-sky-400">Browse models ↗</a>
              </div>
              <p className="text-xs leading-relaxed opacity-65">Choose a chat model with tool calling and JSON support. Your key is encrypted on our server and is never shown again. AI messages and relevant school context are sent to your chosen provider. Ramblr uses your key with Groq; other providers use the free speech allowance.</p>
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={busy || !connection?.available} className={`${buttonClass} bg-sky-500 text-white hover:bg-sky-600`}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Saving" /> : 'Save and use my key'}</button>
                {connection?.configured && <button type="button" disabled={busy} onClick={() => void update(undefined, true)} className={`${buttonClass} text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30`}>Remove key</button>}
                {connection?.enabled && <button type="button" disabled={busy || edited} onClick={() => void testConnection()} className={`${buttonClass} bg-sky-50 dark:bg-sky-950/50`}>Test saved connection</button>}
              </div>
              {connection?.enabled && <p className="text-xs opacity-60">Testing sends one short request using your saved settings; provider charges may apply.</p>}
            </form>
          )}
        </>
      )}
      {(error || loadError) && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error || loadError}</p>}
      {message && <p role="status" className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" />{message}</p>}
    </div>
  );
}
