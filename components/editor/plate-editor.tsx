'use client';

import * as React from 'react';

import { normalizeNodeId } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { TooltipProvider } from '@/components/ui/tooltip';

export function PlateEditor() {
  const STORAGE_KEY = 'plate-editor-content';

  // Load saved content from localStorage or use default value
  const [initialValue] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log('[Auto-save] Loaded saved content from localStorage');
          return parsed;
        } catch (e) {
          console.error('[Auto-save] Failed to parse saved content:', e);
        }
      }
    }
    return value;
  });

  // Ref to store the save timeout
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue,
  });

  // Handle editor changes
  const handleChange = React.useCallback((newValue: any) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 2 seconds
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
        console.log('[Auto-save] Content saved to localStorage');
      } catch (e) {
        console.error('[Auto-save] Failed to save:', e);
      }
    }, 2000);
  }, []);

  return (
    <TooltipProvider>
      <Plate editor={editor} onChange={({ value }) => handleChange(value)}>
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>

        <SettingsDialog />
      </Plate>
    </TooltipProvider>
  );
}

const value = normalizeNodeId([
  {
    children: [{ text: 'Biology 101 - Cell Structure Notes' }],
    type: 'h1',
  },
  {
    children: [
      { text: 'Chapter 3: The Cell - Study Guide for Midterm Exam' },
    ],
    type: 'p',
  },

  // AI-Powered Study Features
  {
    children: [{ text: 'AI-Powered Study Tools' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Enhance your learning with built-in AI assistance. Press ' },
      { kbd: true, text: '⌘+J' },
      { text: ' or ' },
      { kbd: true, text: 'Space' },
      { text: ' in an empty line to:' },
    ],
    type: 'p',
  },
  {
    children: [
      { text: 'Summarize complex topics and create study guides' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: 'Improve your essay writing and fix grammar mistakes' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: 'Generate practice questions from your notes' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },

  // Main Content
  {
    children: [{ text: 'Key Concepts' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'The cell is the ' },
      { bold: true, text: 'basic unit of life' },
      { text: '. All living organisms are composed of one or more cells, and all cells arise from ' },
      { italic: true, text: 'pre-existing cells' },
      { text: ' through cell division.' },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            text: 'Important: This concept will definitely be on the exam! Make sure to understand the difference between prokaryotic and eukaryotic cells.',
          },
        ],
        type: 'p',
      },
    ],
    type: 'blockquote',
  },

  // Study Checklist
  {
    children: [{ text: 'Study Checklist for Exam' }],
    type: 'h3',
  },
  {
    children: [
      { text: 'Review cell membrane structure and function' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: 'Understand mitochondria and ATP production' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: 'Memorize organelle functions (use flashcards!)' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: 'Practice drawing and labeling cell diagrams' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },

  // Comparison Table
  {
    children: [{ text: 'Cell Types Comparison' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'Understanding the differences between cell types is crucial for the exam.',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            children: [
              { children: [{ bold: true, text: 'Feature' }], type: 'p' },
            ],
            type: 'th',
          },
          {
            children: [
              { children: [{ bold: true, text: 'Prokaryotic' }], type: 'p' },
            ],
            type: 'th',
          },
          {
            children: [
              { children: [{ bold: true, text: 'Eukaryotic' }], type: 'p' },
            ],
            type: 'th',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Nucleus' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'No nucleus' }], type: 'p' },
            ],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Has nucleus' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Size' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: '0.1-5 μm' }], type: 'p' },
            ],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: '10-100 μm' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Organelles' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Few organelles' }], type: 'p' },
            ],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Many organelles' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Examples' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Bacteria' }], type: 'p' },
            ],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Animals, Plants, Fungi' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
    ],
    type: 'table',
  },

  // Code/Formula Section
  {
    children: [{ text: 'Important Formulas' }],
    type: 'h3',
  },
  {
    children: [
      { text: 'Cellular respiration equation (memorize this!):' },
    ],
    type: 'p',
  },
  {
    children: [
      { children: [{ text: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP' }], type: 'code_line' },
      { children: [{ text: '' }], type: 'code_line' },
      { children: [{ text: 'Glucose + Oxygen → Carbon Dioxide + Water + Energy' }], type: 'code_line' },
    ],
    lang: 'text',
    type: 'code_block',
  },

  // Collaborative Study Notes
  {
    children: [{ text: 'Group Study Notes' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Collaborate with classmates using ' },
      {
        suggestion: true,
        suggestion_playground1: {
          id: 'playground1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'sarah',
        },
        text: 'suggestions',
      },
      { text: ' to add or edit content. Leave ' },
      {
        children: [
          { comment: true, comment_discussion1: true, text: 'comments' },
        ],
        type: 'a',
        url: '#',
      },
      {
        comment: true,
        comment_discussion1: true,
        text: ' to ask questions',
      },
      { text: ' or clarify concepts with your study group.' },
    ],
    type: 'p',
  },

  // Rich Content Features
  {
    children: [{ text: 'Study Resources' }],
    type: 'h3',
  },
  {
    children: [
      { text: 'Add ' },
      { bold: true, text: 'diagrams' },
      { text: ', ' },
      { italic: true, text: 'lecture slides' },
      { text: ', and ' },
      { code: true, text: 'formulas' },
      { text: ' to your notes. Use ' },
      { kbd: true, text: '/' },
      { text: ' to quickly insert images, tables, or code blocks.' },
    ],
    type: 'p',
  },

  // Image Example
  {
    children: [{ text: 'Visual Learning' }],
    type: 'h3',
  },
  {
    children: [
      { text: 'Embed diagrams, charts, and reference images directly in your notes for better understanding.' },
    ],
    type: 'p',
  },
  {
    attributes: { align: 'center' },
    caption: [
      {
        children: [{ text: 'Add labeled diagrams to visualize complex concepts' }],
        type: 'p',
      },
    ],
    children: [{ text: '' }],
    type: 'img',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
    width: '75%',
  },

  // Study Tips
  {
    children: [{ text: 'Study Tips' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Review notes within 24 hours of class' },
    ],
    indent: 1,
    listStyleType: 'decimal',
    type: 'p',
  },
  {
    children: [
      { text: 'Create flashcards for key terms and concepts' },
    ],
    indent: 1,
    listStyleType: 'decimal',
    type: 'p',
  },
  {
    children: [
      { text: 'Form study groups to discuss difficult topics' },
    ],
    indent: 1,
    listStyleType: 'decimal',
    type: 'p',
  },
  {
    children: [
      { text: 'Practice with past exam questions' },
    ],
    indent: 1,
    listStyleType: 'decimal',
    type: 'p',
  },

  // Attachments
  {
    children: [{ text: 'Lecture Materials' }],
    type: 'h3',
  },
  {
    children: [{ text: 'Attach lecture slides, PDFs, and other study materials:' }],
    type: 'p',
  },
  {
    children: [{ text: '' }],
    isUpload: true,
    name: 'Chapter_3_Lecture_Slides.pdf',
    type: 'file',
    url: 'https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf',
  },

  // Table of Contents
  {
    children: [{ text: 'Quick Navigation' }],
    type: 'h3',
  },
  {
    children: [{ text: '' }],
    type: 'toc',
  },
  {
    children: [{ text: '' }],
    type: 'p',
  },
]);
