'use client';

import * as React from 'react';

import { normalizeNodeId } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { TooltipProvider } from '@/components/ui/tooltip';

export function PlateEditor({ editor: externalEditor }: { editor?: any }) {
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

  const internalEditor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue,
  });

  const editor = externalEditor || internalEditor;

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
    children: [{ text: '' }],
    type: 'p',
  },
]);
