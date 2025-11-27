'use client';

import { PlateEditor } from '@/components/editor/plate-editor';
import { TooltipProvider } from '@/components/ui/tooltip';

const WritingAssistPage = () => {
  return (
    <div className="h-screen w-full p-4 md:p-8">
      <TooltipProvider>
        <PlateEditor />
      </TooltipProvider>
    </div>
  );
};

export default WritingAssistPage;
