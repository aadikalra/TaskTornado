'use client';

import React from 'react';
import { PlateEditor } from '@/components/editor/plate-editor';
import { GraderSidebar } from '@/components/grader/GraderSidebar';
import { motion } from 'framer-motion';
import { usePlateEditor } from 'platejs/react';
import { EditorKit } from '@/components/editor/editor-kit';

const initialEditorValue = [{ type: 'p', children: [{ text: '' }] }];
const STORAGE_KEY = 'plate-editor-content';

export default function GraderPage() {
  const [initialValue] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved content', e);
        }
      }
    }
    return initialEditorValue;
  });

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen bg-[#f8fbfd] dark:bg-[#0a0a0a] overflow-hidden pt-20 md:pt-24 pb-20 md:pb-6 px-0 md:px-2">
      {/* Editor Pane */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex-1 overflow-hidden flex flex-col h-full bg-white dark:bg-[#0f0f0f] md:m-4 rounded-2xl border-t md:border border-sky-100 dark:border-white/5 shadow-xl relative"
      >

        <div className="flex-1 overflow-y-auto relative z-0">
          <PlateEditor editor={editor} />
        </div>
      </motion.div>

      {/* AI Sidebar Pane */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        className="hidden md:flex w-[400px] flex-shrink-0 flex-col h-full bg-white dark:bg-[#0f0f0f] m-4 ml-0 rounded-2xl border border-sky-100 dark:border-white/5 shadow-xl overflow-hidden relative z-10"
      >
        <GraderSidebar editor={editor} />
      </motion.div>
    </div>
  );
}
