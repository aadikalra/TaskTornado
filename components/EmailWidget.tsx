'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RefreshCw, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { HugeIcon } from '@/lib/huge-icon-map';

type GmailMessage = {
  id: string;
  from: string;
  subject: string;
  date: string;
  isUnread: boolean;
  snippet?: string;
};

type EmailDetails = {
  id: string;
  subject: string;
  from: string;
  date: string;
  bodyHtml?: string;
  bodyText?: string;
  snippet: string;
};

function parseSender(from: string) {
  const match = from.match(/^"?([^"<]*)"?\s*<?([^>]*)>?$/);
  if (match) return match[1].trim() || match[2].trim();
  return from;
}

export const EmailWidget = () => {
  const [messages, setMessages] = React.useState<GmailMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);

  // Modal State
  const [selectedEmail, setSelectedEmail] = React.useState<EmailDetails | null>(null);
  const [fetchingDetail, setFetchingDetail] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  
  // Inline Summary State
  const [inboxSummary, setInboxSummary] = React.useState<string | null>(null);
  const [isSummarizingInbox, setIsSummarizingInbox] = React.useState(false);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    setMounted(true);
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const sessionRes = await fetch('/api/auth/gmail-session');
      const sessionData = await sessionRes.json();
      
      if (!sessionData.authenticated) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      
      setAuthenticated(true);
      const res = await fetch('/api/gmail/messages?maxResults=16');
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      setMessages(data.messages || []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const summarizeInbox = async () => {
    if (isSummarizingInbox) return;
    
    setIsSummarizingInbox(true);
    setInboxSummary('');
    
    // Skip the first one as requested, take the next 15
    const emailsToSummarize = messages.slice(1, 16);
    
    if (emailsToSummarize.length === 0) {
      setInboxSummary("No emails found to summarize.");
      setIsSummarizingInbox(false);
      return;
    }

    const emailListStr = emailsToSummarize.map((m, i) => 
      `${i + 1}. From: ${m.from} | Subject: ${m.subject} | Snippet: ${m.snippet?.slice(0, 100)}`
    ).join('\n');

    const prompt = `Summarize these latest emails in 1-2 very short sentences max. Respond ONLY with the summary. Focus on the most important task or update.

Emails:
${emailListStr}`;

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          action: 'generate'
        })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.response) {
                fullText += data.response;
                setInboxSummary(fullText);
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.error('Inbox Summarization failed:', err);
      setInboxSummary('Failed to generate inbox summary.');
    } finally {
      setIsSummarizingInbox(false);
    }
  };

  const openEmail = async (id: string) => {
    setFetchingDetail(true);
    setIsModalOpen(true);
    setSelectedEmail(null); 
    try {
      const res = await fetch(`/api/gmail/messages/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSelectedEmail(data);
      
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isUnread: false } : m));
    } catch (err) {
      console.error('Failed to fetch email details:', err);
    } finally {
      setFetchingDetail(false);
    }
  };

  // Sync iframe content
  React.useEffect(() => {
    if (isModalOpen && selectedEmail?.bodyHtml && iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
            const sanitized = selectedEmail.bodyHtml
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/on\w+="[^"]*"/gi, '');
            doc.open();
            doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#1e293b;margin:0;word-break:break-word;background:transparent}a{color:#0ea5e9}img{max-width:100%;height:auto}@media(prefers-color-scheme:dark){body{color:#cbd5e1}}</style></head><body>${sanitized}</body></html>`);
            doc.close();
            
            const resize = () => {
                if (iframeRef.current && doc.body) {
                    iframeRef.current.style.height = Math.max(doc.body.scrollHeight, 200) + 'px';
                }
            };
            setTimeout(resize, 100);
            setTimeout(resize, 500);
        }
    }
  }, [isModalOpen, selectedEmail]);

  const unreadCount = messages.filter(m => m.isUnread).length;
  // Display only 4 emails in the list, skipping the first one
  const displayMessages = messages.slice(1, 5);

  const ModalContainer = () => {
    if (!mounted) return null;

    return createPortal(
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-lg overflow-hidden border border-sky-100 dark:border-gray-800 flex flex-col max-h-[85vh]"
            >
              <div className="p-6 sm:p-7 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/60 dark:bg-blue-500/10 text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                    <HugeIcon name="MailSend01" size={12} className="h-3 w-3" />
                    Email Detail
                  </span>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-full text-blue-400/30 hover:text-blue-900 dark:hover:text-white hover:bg-blue-500/[0.06] transition-colors"
                  >
                    <HugeIcon name="Cancel01" size={16} className="h-4 w-4" />
                  </button>
                </div>

                {fetchingDetail ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500/40" />
                    <p className="text-xs font-bold text-blue-700/40 dark:text-blue-400/40 uppercase tracking-widest">Fetching Content...</p>
                  </div>
                ) : selectedEmail ? (
                  <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-thin scrollbar-thumb-blue-100 dark:scrollbar-thumb-gray-800">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-blue-900 dark:text-white mb-2 leading-tight">
                        {selectedEmail.subject || '(No Subject)'}
                      </h2>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-blue-600/60 dark:text-blue-400/50 font-medium">
                        <p>From: <span className="text-blue-900/80 dark:text-blue-100/80">{selectedEmail.from}</span></p>
                        <p>{new Date(selectedEmail.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>

                    <div className="h-px bg-blue-100/50 dark:bg-gray-800" />

                    <div className="min-h-[200px]">
                      {selectedEmail.bodyHtml ? (
                        <iframe ref={iframeRef} className="w-full border-0" sandbox="allow-same-origin" title="Email content" />
                      ) : (
                        <pre className="text-sm text-blue-900/70 dark:text-blue-100/60 leading-relaxed whitespace-pre-wrap font-sans">
                          {selectedEmail.bodyText || selectedEmail.snippet || 'No content available.'}
                        </pre>
                      )}
                    </div>
                  </div>
                ) : null}
                
                <div className="pt-6 mt-4 border-t border-blue-100/60 dark:border-gray-800 flex justify-end">
                   <Link href="/mail" onClick={() => setIsModalOpen(false)}>
                      <button className="h-10 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                         View in Mail App
                      </button>
                   </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  if (!authenticated && !loading) {
      return (
          <div className="w-full h-full bg-[#f5f9fc] dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-sm overflow-hidden group relative p-5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/5 flex items-center justify-center border border-blue-500/10 group-hover:scale-110 transition-transform">
                  <HugeIcon name="MailSend01" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                  <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1">Gmail Inbox</h3>
                  <p className="text-[10px] text-blue-600/50 dark:text-blue-400/40 font-medium max-w-[150px] mx-auto uppercase tracking-wider">Connect your email to see a summary</p>
              </div>
              <Link href="/mail" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition-all uppercase tracking-wider">
                  Connect Gmail
              </Link>
          </div>
      );
  }

  return (
    <>
      <div className="w-full h-full bg-[#f5f9fc] dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-sm overflow-hidden group relative flex flex-col">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Inbox</h2>
          </div>
          <div className="flex items-center gap-2">
              <button 
                  onClick={fetchEmails} 
                  disabled={loading}
                  className="p-1.5 hover:bg-blue-700/10 dark:hover:bg-blue-400/10 rounded-full transition-colors disabled:opacity-40"
              >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-700 dark:text-blue-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5 relative z-10 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-gray-700">
          {/* Smart Summary Top Slot (Replaces First Row) */}
          <div className="px-1 mb-1">
             <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl overflow-hidden min-h-[64px] transition-all">
                {inboxSummary ? (
                   <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                         <div className="flex items-center gap-1.5">
                            <HugeIcon name="Security01" size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Smart Briefing</span>
                         </div>
                         <button 
                           onClick={() => setInboxSummary(null)}
                           className="text-[10px] font-bold text-emerald-600/40 hover:text-emerald-600 transition-colors uppercase"
                         >
                           Reset
                         </button>
                      </div>
                      <p className="text-[11px] text-emerald-900/70 dark:text-emerald-100/60 leading-tight italic line-clamp-3">
                         {inboxSummary}
                      </p>
                   </div>
                ) : (
                   <button 
                      onClick={summarizeInbox}
                      disabled={isSummarizingInbox || loading}
                      className="w-full h-16 flex flex-col items-center justify-center gap-1 hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10 transition-colors group/summary"
                   >
                      {isSummarizingInbox ? (
                         <>
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Summarizing 15 Emails...</span>
                         </>
                      ) : (
                         <>
                            <HugeIcon name="Security01" size={18} className="text-emerald-500 group-hover/summary:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Generate Smart Summary</span>
                         </>
                      )}
                   </button>
                )}
             </div>
          </div>

          {loading && displayMessages.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500/40" />
            </div>
          ) : error ? (
            <div className="py-20 text-center px-4">
              <p className="text-xs font-bold text-red-500/50 uppercase tracking-wider">Failed to load emails</p>
            </div>
          ) : (
            displayMessages.map((msg) => (
              <button 
                key={msg.id}
                onClick={() => openEmail(msg.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-700/5 dark:hover:bg-blue-400/5 transition-all group/item text-left"
              >
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${msg.isUnread ? 'bg-blue-500/10' : 'bg-blue-500/5'}`}>
                  <Mail className={`w-3.5 h-3.5 ${msg.isUnread ? 'text-blue-600 dark:text-blue-400' : 'text-blue-700/30 dark:text-blue-400/20'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <p className={`text-sm truncate leading-tight ${msg.isUnread ? 'font-bold text-blue-900 dark:text-blue-100' : 'font-semibold text-blue-900/60 dark:text-blue-100/40'}`}>
                      {parseSender(msg.from)}
                    </p>
                    <span className={`text-[10px] font-medium shrink-0 ${msg.isUnread ? 'text-blue-600 dark:text-blue-400' : 'text-blue-700/30 dark:text-blue-400/20'}`}>
                      {new Date(msg.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate leading-tight mt-0.5 ${msg.isUnread ? 'text-blue-600 dark:text-blue-400' : 'text-blue-700/30 dark:text-blue-400/20'}`}>
                    {msg.subject || '(no subject)'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 mt-auto">
          <Link href="/mail" className="text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors group/link uppercase tracking-widest">
            Open Full Mail
            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
      <ModalContainer />
    </>
  );
};
