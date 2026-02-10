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
    <div className="h-screen w-full p-4 md:p-8">
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
  );
};

export default WritingAssistPage;
