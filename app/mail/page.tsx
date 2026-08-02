'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCw, Star, Paperclip, ChevronLeft, ExternalLink, LogOut, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

type GmailMessage = {
  id: string;
  threadId: string;
  snippet: string;
  labelIds: string[];
  isUnread: boolean;
  isStarred: boolean;
  internalDate: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  cc: string;
};

type GmailMessageDetail = GmailMessage & {
  bodyHtml: string;
  bodyText: string;
  replyTo: string;
  attachments: { filename: string; mimeType: string; size: number }[];
};

function parseSender(from: string) {
  const match = from.match(/^"?([^"<]*)"?\s*<?([^>]*)>?$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: from, email: from };
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function formatFullDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch { return dateStr; }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function MailPage() {
  const [authStatus, setAuthStatus] = useState<
    'loading' | 'disabled' | 'unauthenticated' | 'authenticated'
  >('loading');
  const [userEmail, setUserEmail] = useState('');
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetail | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check auth status
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/gmail-session');
        const data = await res.json();
        if (data.enabled === false) {
          setAuthStatus('disabled');
        } else if (data.authenticated) {
          setAuthStatus('authenticated');
          setUserEmail(data.user?.email || '');
          fetchMessages();
        } else {
          setAuthStatus('unauthenticated');
        }
      } catch {
        setAuthStatus('unauthenticated');
      }
    })();
  }, []);

  const fetchMessages = useCallback(async (query?: string, pageToken?: string) => {
    setLoadingMessages(true);
    setError('');
    try {
      const params = new URLSearchParams({ maxResults: '25' });
      if (query) params.set('q', query);
      if (pageToken) params.set('pageToken', pageToken);
      const res = await fetch(`/api/gmail/messages?${params}`);
      if (!res.ok) {
        const err = await res.json();
        if (err.needsReauth) { setAuthStatus('unauthenticated'); return; }
        throw new Error(err.error || 'Failed to fetch');
      }
      const data = await res.json();
      setMessages(prev => pageToken ? [...prev, ...data.messages] : data.messages);
      setNextPageToken(data.nextPageToken || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const openMessage = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/gmail/messages/${id}`);
      if (!res.ok) throw new Error('Failed to load');
      setSelectedMessage(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/auth/google-gmail-init');
      const data = await res.json();
      if (data.authUrl) window.location.href = data.authUrl;
    } catch { setError('Failed to start Gmail auth'); }
  };

  const handleDisconnect = async () => {
    await fetch('/api/auth/gmail-session', { method: 'DELETE' });
    setAuthStatus('unauthenticated');
    setMessages([]);
    setSelectedMessage(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages(searchQuery);
  };

  // Unauthenticated — connect screen
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
      </div>
    );
  }

  if (authStatus === 'disabled') {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-50 dark:bg-gray-900 rounded-3xl mb-6 border border-sky-100 dark:border-gray-800">
            <Mail className="h-9 w-9 text-sky-500" />
          </div>
          <h1 className="text-3xl font-bold text-sky-900 dark:text-white mb-3 tracking-tight">
            Gmail connection unavailable
          </h1>
          <p className="text-sky-600/60 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            Google integrations are disabled until the OAuth review and
            production configuration are complete.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-700 dark:text-sky-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-50 dark:bg-gray-900 rounded-3xl mb-6 border border-sky-100 dark:border-gray-800">
            <Mail className="h-9 w-9 text-sky-500" />
          </div>
          <h1 className="text-3xl font-bold text-sky-900 dark:text-white mb-3 tracking-tight">Connect Gmail</h1>
          <p className="text-sky-600/60 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            View your latest emails right inside TaskTornado. We only request read-only access — we'll never send emails on your behalf.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-3 h-12 px-8 text-[14px] font-bold text-white bg-[#275085] hover:bg-[#1d3d66] rounded-full transition-all shadow-lg shadow-[#275085]/30 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Connect Gmail
          </button>
          <div className="mt-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-700 dark:text-sky-400 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Authenticated — inbox view
  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans text-[#111827] dark:text-gray-100">
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sky-500 hover:text-sky-700 dark:text-sky-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-900 dark:text-white">Mail</h1>
              <p className="text-xs text-sky-500/50 dark:text-sky-400/40 font-medium">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchMessages(searchQuery)} disabled={loadingMessages}
              className="h-9 w-9 flex items-center justify-center rounded-full text-sky-500 hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40">
              <RefreshCw className={`h-4 w-4 ${loadingMessages ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleDisconnect}
              className="h-9 px-3.5 flex items-center gap-2 text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Disconnect
            </button>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400/50" />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full h-11 pl-11 pr-4 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl text-sm text-sky-900 dark:text-white placeholder-sky-400/40 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
            />
          </div>
        </form>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Message list or detail */}
        <AnimatePresence mode="wait">
          {selectedMessage ? (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <MessageDetail message={selectedMessage} onBack={() => setSelectedMessage(null)} loading={loadingDetail} iframeRef={iframeRef} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 border border-sky-100 dark:border-gray-800 overflow-hidden">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-sky-500/40">
                    <Mail className="h-8 w-8 mb-3" />
                    <p className="text-sm font-medium">No emails found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-sky-100/50 dark:divide-gray-800/50">
                    {messages.map((msg, idx) => (
                      <MessageRow key={msg.id} message={msg} onClick={() => openMessage(msg.id)} index={idx} />
                    ))}
                  </div>
                )}
              </div>

              {nextPageToken && (
                <div className="flex justify-center mt-4">
                  <button onClick={() => fetchMessages(searchQuery, nextPageToken)} disabled={loadingMessages}
                    className="h-10 px-6 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors disabled:opacity-40 inline-flex items-center gap-2">
                    {loadingMessages ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Load More
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function MessageRow({ message, onClick, index }: { message: GmailMessage; onClick: () => void; index: number }) {
  const sender = parseSender(message.from);
  const initials = sender.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-sky-50/50 dark:hover:bg-gray-800/50 transition-colors ${message.isUnread ? 'bg-sky-50/30 dark:bg-sky-500/5' : ''}`}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${message.isUnread ? 'bg-sky-500 text-white' : 'bg-sky-100 dark:bg-gray-800 text-sky-600 dark:text-sky-400'}`}>
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-[13px] truncate ${message.isUnread ? 'font-bold text-sky-900 dark:text-white' : 'font-medium text-sky-700 dark:text-gray-300'}`}>
            {sender.name || sender.email}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {message.isStarred && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
            <span className="text-[11px] text-sky-500/50 dark:text-sky-400/40 font-medium">{formatDate(message.date)}</span>
          </div>
        </div>
        <p className={`text-[12px] truncate ${message.isUnread ? 'font-semibold text-sky-800 dark:text-gray-200' : 'text-sky-600/60 dark:text-gray-400'}`}>
          {message.subject || '(no subject)'}
        </p>
        <p className="text-[11px] text-sky-500/40 dark:text-sky-400/30 truncate mt-0.5">{message.snippet}</p>
      </div>

      {/* Unread indicator */}
      {message.isUnread && <div className="shrink-0 w-2 h-2 rounded-full bg-sky-500 mt-3.5" />}
    </motion.button>
  );
}

function MessageDetail({ message, onBack, loading, iframeRef }: {
  message: GmailMessageDetail; onBack: () => void; loading: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}) {
  const sender = parseSender(message.from);

  useEffect(() => {
    if (iframeRef.current && message.bodyHtml) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        const sanitized = message.bodyHtml
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/on\w+="[^"]*"/gi, '');
        doc.open();
        doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#1e293b;margin:16px;word-break:break-word;background:transparent}a{color:#0ea5e9}img{max-width:100%;height:auto}@media(prefers-color-scheme:dark){body{color:#e2e8f0}}</style></head><body>${sanitized}</body></html>`);
        doc.close();
        // Auto-resize iframe
        const resize = () => {
          if (iframeRef.current && doc.body) {
            iframeRef.current.style.height = Math.max(doc.body.scrollHeight, 200) + 'px';
          }
        };
        setTimeout(resize, 100);
        setTimeout(resize, 500);
      }
    }
  }, [message.bodyHtml]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-sky-500" /></div>;
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-700 dark:text-sky-400 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Inbox
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 border border-sky-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-sky-100/60 dark:border-gray-800">
          <h2 className="text-xl sm:text-2xl font-bold text-sky-900 dark:text-white tracking-tight mb-4">
            {message.subject || '(no subject)'}
          </h2>
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center text-[12px] font-bold">
              {sender.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-sky-900 dark:text-white">{sender.name}</span>
                <span className="text-[11px] text-sky-500/50 dark:text-sky-400/40 truncate">&lt;{sender.email}&gt;</span>
              </div>
              <p className="text-[11px] text-sky-500/40 dark:text-sky-400/30 mt-0.5">
                to {parseSender(message.to).name || message.to}
                {message.cc && `, cc: ${message.cc}`}
              </p>
              <p className="text-[11px] text-sky-500/40 dark:text-sky-400/30">{formatFullDate(message.date)}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          {message.bodyHtml ? (
            <iframe ref={iframeRef} className="w-full border-0 min-h-[200px]" sandbox="allow-same-origin" title="Email content" />
          ) : (
            <pre className="text-sm text-sky-800/70 dark:text-sky-200/60 whitespace-pre-wrap font-sans leading-relaxed">
              {message.bodyText || message.snippet || 'No content'}
            </pre>
          )}
        </div>

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
              <span className="text-[10px] uppercase font-semibold text-sky-600/30 dark:text-sky-400/30 tracking-wider">
                {message.attachments.length} Attachment{message.attachments.length > 1 ? 's' : ''}
              </span>
              <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
            </div>
            <div className="flex flex-wrap gap-2">
              {message.attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-sky-50/50 dark:bg-gray-800/40 border border-sky-100 dark:border-gray-700/50 rounded-xl">
                  <Paperclip className="h-3.5 w-3.5 text-sky-500" />
                  <span className="text-[11px] font-medium text-sky-700 dark:text-sky-300 truncate max-w-[150px]">{att.filename}</span>
                  <span className="text-[10px] text-sky-500/40">{formatSize(att.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
