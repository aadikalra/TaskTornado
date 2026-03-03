'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import GuardianAIChat from '@/components/GuardianAIChat';

interface GuardianAIChatWidgetProps {
    studentId: string;
    studentName: string;
}

export default function GuardianAIChatWidget({ studentId, studentName }: GuardianAIChatWidgetProps) {
    const [chatOpen, setChatOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!chatOpen && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 400, damping: 30 }}
                        onClick={() => setChatOpen(true)}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pl-3.5 pr-4.5 py-3 bg-[#275085] rounded-full shadow-[0_8px_30px_rgba(39,80,133,0.3)] hover:shadow-[0_12px_40px_rgba(39,80,133,0.4)] text-white transition-all hover:-translate-y-0.5 active:scale-[0.97]"
                    >
                        <Sparkles className="w-4 h-4 text-sky-200" />
                        <span className="text-[13px] font-bold tracking-tight">Ask AI</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Modal */}
            <GuardianAIChat
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                studentId={studentId}
                studentName={studentName}
            />
        </>
    );
}
