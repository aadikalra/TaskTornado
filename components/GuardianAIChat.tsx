'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, Loader2, Sparkles } from 'lucide-react';
import { Markdown } from './markdown';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

interface GuardianAIChatProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
}

export default function GuardianAIChat({ isOpen, onClose, studentId, studentName }: GuardianAIChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const firstName = studentName.split(' ')[0];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || isStreaming) return;

        const userMessage: Message = { role: 'user', content: text };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsStreaming(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const res = await fetch('/api/guardian/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages, studentId }),
            });

            if (!res.ok) {
                const err = await res.json();
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: err.error || 'Something went wrong.' };
                    return updated;
                });
                setIsStreaming(false);
                return;
            }

            const reader = res.body?.getReader();
            if (!reader) { setIsStreaming(false); return; }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.response) {
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = {
                                        ...updated[updated.length - 1],
                                        content: updated[updated.length - 1].content + data.response,
                                    };
                                    return updated;
                                });
                            }
                        } catch { /* skip */ }
                    }
                }
            }
        } catch {
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: 'Connection failed. Please try again.' };
                return updated;
            });
        } finally {
            setIsStreaming(false);
        }
    }, [input, isStreaming, messages, studentId]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const suggestions = [
        `How is ${firstName} doing?`,
        'Any overdue work?',
        'Upcoming tests?',
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-sky-950/20 dark:bg-black/40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="fixed z-[61] inset-x-3 bottom-3 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[400px] flex flex-col bg-[#fffaf4] dark:bg-gray-950 border border-sky-200/50 dark:border-gray-800 rounded-[28px] shadow-[0_24px_80px_rgba(56,189,248,0.12)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)] overflow-hidden"
                        style={{ maxHeight: 'min(620px, calc(100vh - 1.5rem))' }}
                    >
                        {/* Header — minimal */}
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-xl bg-sky-500/[0.08] dark:bg-sky-500/[0.12] flex items-center justify-center">
                                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                                </div>
                                <span className="text-[14px] font-bold text-sky-800 dark:text-sky-200 tracking-tight">
                                    About {firstName}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-7 h-7 rounded-xl flex items-center justify-center text-sky-400/30 hover:text-sky-500 hover:bg-sky-500/[0.05] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="h-px bg-sky-100/50 dark:bg-gray-800/60 mx-4" />

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 min-h-[260px]">
                            {/* Empty state */}
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center pt-10 pb-4 text-center">
                                    <p className="text-[22px] font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-1.5">
                                        👋
                                    </p>
                                    <p className="text-[13px] text-sky-800/35 dark:text-sky-300/35 font-medium max-w-[240px] leading-relaxed">
                                        Ask anything about {firstName}&apos;s classes, homework, or tests.
                                    </p>

                                    {/* Suggestion chips */}
                                    <div className="flex flex-wrap gap-1.5 justify-center mt-5">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setInput(s); inputRef.current?.focus(); }}
                                                className="px-3 py-1.5 text-[11px] font-semibold text-sky-500/70 dark:text-sky-400/60 bg-sky-500/[0.05] dark:bg-sky-500/[0.07] rounded-full hover:bg-sky-500/[0.1] transition-colors"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="max-w-[85%] px-4 py-2.5 bg-sky-500 text-white rounded-[20px] rounded-br-lg text-[13.5px] leading-[1.65]">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="max-w-[85%] text-[13.5px] leading-[1.65] text-sky-900/80 dark:text-sky-100/80">
                                            {msg.content ? (
                                                <Markdown className="prose-sm prose-sky dark:prose-invert prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:text-sky-800 dark:prose-headings:text-sky-200 prose-strong:text-sky-900 dark:prose-strong:text-sky-100 prose-headings:text-[15px] prose-headings:mt-3 prose-headings:mb-1.5">
                                                    {msg.content}
                                                </Markdown>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-sky-400/40">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span className="text-[12px] font-medium">Thinking</span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-4 pb-4 pt-2">
                            <div className="flex items-end gap-2 bg-white dark:bg-zinc-900 border border-sky-100/70 dark:border-gray-800 rounded-2xl pl-4 pr-2 py-2 focus-within:border-sky-300/60 dark:focus-within:border-sky-500/25 transition-colors shadow-sm">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask a question..."
                                    rows={1}
                                    className="flex-1 bg-transparent text-[13.5px] text-sky-900 dark:text-sky-100 placeholder:text-sky-300/30 dark:placeholder:text-sky-500/25 resize-none outline-none max-h-[100px] py-0.5 leading-[1.5]"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isStreaming}
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${input.trim() && !isStreaming
                                        ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                                        : 'bg-sky-500/[0.06] text-sky-300/30 dark:text-sky-500/20'
                                        }`}
                                >
                                    {isStreaming ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <ArrowUp className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
