'use client';

import { useState, useEffect } from 'react';
import { SerializedEditorState } from 'lexical';
import { Editor } from './blocks/editor-x/editor';

const initialValue = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Start writing here...',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as SerializedEditorState;

const LexicalEditor = () => {
  const [mounted, setMounted] = useState(false);
  const [editorState, setEditorState] = useState<SerializedEditorState>(initialValue);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col p-4 md:p-6 lg:p-8">
      <div className="flex-1 rounded-xl">
        <Editor
          editorSerializedState={editorState}
          onSerializedChange={(value) => setEditorState(value)}
        />
      </div>
    </div>
  );
};

export default LexicalEditor;