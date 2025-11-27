'use client';

import { PlateEditor } from '@/components/editor/plate-editor';

export default function PlatePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-black dark:to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-black rounded-xl shadow-lg overflow-hidden border dark:border-slate-800">
          <PlateEditor />
        </div>
      </div>
    </div>
  );
}
