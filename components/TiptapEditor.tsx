'use client';

import React, { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Quote,
  Undo,
  Redo,
  Minus,
  Underline,
  Strikethrough,
} from 'lucide-react';

const TiptapEditor = () => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('Untitled Document');
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: { class: 'bg-gray-100 p-3 rounded font-mono text-sm' },
        },
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder: 'Start typing…',
      }),
    ],
    content: `<h1>Welcome to the Google Docs-style Editor</h1>
<p>This editor works just like Google Docs – what you see is what you get!</p>
<h2>Rich Text Features</h2>
<ul>
  <li><strong>Bold text</strong> with the toolbar or Ctrl+B</li>
  <li><em>Italic text</em> with Ctrl+I</li>
  <li><a href="https://example.com">Links</a> that are clickable</li>
  <li>Plain code blocks (no external deps)</li>
</ul>
<blockquote>This is a beautiful blockquote</blockquote>
<pre><code>const greeting = "Hello, World!";
console.log(greeting);</code></pre>
<hr/>
<p>Start editing and watch the magic happen!</p>`,
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none focus:outline-none min-h-screen p-16 pt-8',
      },
    },
  });

  const toggleMark = (mark: string) => editor?.chain().focus().toggleMark(mark).run();

  const setBlock = (type: string, attrs = {}) => {
    if (!editor) return;
    if (type === 'heading')
      editor.chain().focus().toggleHeading(attrs as any).run();
    else if (type === 'paragraph') editor.chain().focus().setParagraph().run();
    else if (type === 'bulletList')
      editor.chain().focus().toggleBulletList().run();
    else if (type === 'orderedList')
      editor.chain().focus().toggleOrderedList().run();
    else if (type === 'blockquote')
      editor.chain().focus().toggleBlockquote().run();
    else if (type === 'codeBlock')
      editor.chain().focus().toggleCodeBlock().run();
    else if (type === 'hr') editor.chain().focus().setHorizontalRule().run();
  };

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', prev || 'https://');
    if (url === null) return;
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const toolbar = [
    { icon: <Bold className="w-4 h-4" />, title: 'Bold', action: () => toggleMark('bold'), active: () => editor?.isActive('bold') },
    { icon: <Italic className="w-4 h-4" />, title: 'Italic', action: () => toggleMark('italic'), active: () => editor?.isActive('italic') },
    { icon: <Underline className="w-4 h-4" />, title: 'Underline', action: () => toggleMark('underline'), active: () => editor?.isActive('underline') },
    { icon: <Strikethrough className="w-4 h-4" />, title: 'Strikethrough', action: () => toggleMark('strike'), active: () => editor?.isActive('strike') },
    { divider: true },
    { icon: <Heading1 className="w-4 h-4" />, title: 'H1', action: () => setBlock('heading', { level: 1 }), active: () => editor?.isActive('heading', { level: 1 }) },
    { icon: <Heading2 className="w-4 h-4" />, title: 'H2', action: () => setBlock('heading', { level: 2 }), active: () => editor?.isActive('heading', { level: 2 }) },
    { icon: <Heading3 className="w-4 h-4" />, title: 'H3', action: () => setBlock('heading', { level: 3 }), active: () => editor?.isActive('heading', { level: 3 }) },
    { divider: true },
    { icon: <List className="w-4 h-4" />, title: 'Bullet List', action: () => setBlock('bulletList'), active: () => editor?.isActive('bulletList') },
    { icon: <ListOrdered className="w-4 h-4" />, title: 'Numbered List', action: () => setBlock('orderedList'), active: () => editor?.isActive('orderedList') },
    { icon: <Quote className="w-4 h-4" />, title: 'Blockquote', action: () => setBlock('blockquote'), active: () => editor?.isActive('blockquote') },
    { icon: <Code className="w-4 h-4" />, title: 'Code Block', action: () => setBlock('codeBlock'), active: () => editor?.isActive('codeBlock') },
    { divider: true },
    { icon: <LinkIcon className="w-4 h-4" />, title: 'Link', action: setLink, active: () => editor?.isActive('link') },
    { icon: <Minus className="w-4 h-4" />, title: 'Horizontal Rule', action: () => setBlock('hr') },
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!editor || !(e.ctrlKey || e.metaKey)) return;
      switch (e.key) {
        case 'b': e.preventDefault(); toggleMark('bold'); break;
        case 'i': e.preventDefault(); toggleMark('italic'); break;
        case 'u': e.preventDefault(); toggleMark('underline'); break;
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [editor]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-500">Loading editor...</div>
      </div>
    );
  }

  if (!editor) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsTitleFocused(true)}
              onBlur={() => setIsTitleFocused(false)}
              className={`text-xl font-medium outline-none ${
                isTitleFocused ? 'border-b-2 border-blue-600' : ''
              }`}
              placeholder="Untitled document"
            />
          </div>
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Share
          </button>
        </div>

        <div className="border-t border-gray-200 px-2 py-1 bg-gray-50">
          <div className="flex items-center gap-1 flex-wrap">
            {toolbar.map((b, i) => {
              if (b.divider) return <div key={i} className="w-px h-8 bg-gray-300 mx-1" />;
              return (
                <button
                  key={i}
                  onClick={b.action}
                  title={b.title}
                  className={`p-2 rounded transition-colors ${
                    b.active?.() ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {b.icon}
                </button>
              );
            })}

            <div className="w-px h-8 bg-gray-300 mx-1" />
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-lg">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span>Page 1 of 1</span>
            <span>•</span>
            <span>Last edit was seconds ago</span>
          </div>
          <div className="flex items-center gap-4">
            <span>100%</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TiptapEditor;
