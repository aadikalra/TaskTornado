'use client';

import { PlateEditor } from '@/components/editor/plate-editor';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { PenTool } from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';

const WritingAssistPage = () => {
  const { authenticated } = useRequireAuth();
  if (!authenticated) return null;
  const { showIntro, dismissIntro } = useRouteIntro('writing-assist');

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-20 pb-16 h-screen flex flex-col">
        <TooltipProvider>
          <PlateEditor />
        </TooltipProvider>

        {/* Route Intro Popup */}
        <RouteIntroPopup
          isOpen={showIntro}
          onClose={dismissIntro}
          title="Welcome to Writing Assist!"
          description="AI-powered writing assistant with intelligent autocomplete and rich text editing"
          icon={<PenTool className="h-6 w-6" />}
          features={[
            'Rich text editor with full formatting options',
            'AI-powered writing improvements (Cmd+J)',
            'Intelligent autocomplete suggestions',
            'Auto-save to preserve your work',
          ]}
        />
      </div>
    </div>
  );
};

export default WritingAssistPage;
