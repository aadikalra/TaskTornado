'use client';

import React from 'react';
import { MainAppHeader } from './main-app/MainAppHeader';
import { MainAppDashboard } from './main-app/MainAppDashboard';
import { MainAppContent } from './main-app/MainAppContent';
import { DashboardIntroProvider } from './main-app/DashboardIntro';
import dynamic from 'next/dynamic';

const AddClassModal = dynamic(() => import('./main-app/AddClassModal').then(mod => mod.AddClassModal), { ssr: false });
const AddHomeworkModal = dynamic(() => import('./main-app/AddHomeworkModal').then(mod => mod.AddHomeworkModal), { ssr: false });
const DeleteConfirmModal = dynamic(() => import('./main-app/DeleteConfirmModal').then(mod => mod.DeleteConfirmModal), { ssr: false });
const OnboardingModal = dynamic(() => import('./OnboardingModal').then(mod => mod.OnboardingModal), { ssr: false });
const OnboardingTour = dynamic(() => import('./OnboardingTour').then(mod => mod.OnboardingTour), { ssr: false });
const AddTestModal = dynamic(() => import('./AddTestModal').then(mod => mod.AddTestModal), { ssr: false });
const TestDetailModal = dynamic(() => import('./TestDetailModal').then(mod => mod.TestDetailModal), { ssr: false });
const TaskBracket = dynamic(() => import('./TaskBracket').then(mod => mod.TaskBracket), { ssr: false });

import { useMainApp, setCookie, getCookie } from '@/context/MainAppContext';
import { useAuth } from '@/context/AuthContext';
import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useTestContext } from '@/context/TestContext';

export const MainApp = () => {
  const {
    showAddTest, setShowAddTest,
    classIdForAddTest, setClassIdForAddTest,
    selectedTest, setSelectedTest,
    isTestDetailModalOpen, setIsTestDetailModalOpen,
    showBracket, setShowBracket,
  } = useMainApp();

  const { homeworks, loading: homeworkLoading } = useHomeworkContext();
  const { deleteTest, loading: testsLoading } = useTestContext();
  const { user, isGuardian, isEligible } = useAuth();
  const { loading: classesLoading } = useClassContext();

  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [runSpotlightTour, setRunSpotlightTour] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !user || !isEligible || classesLoading) return;

    const guardianAccount =
      isGuardian || user.user_metadata?.account_type === 'guardian';
    if (guardianAccount) {
      setShowOnboarding(false);
      return;
    }

    const onboardingCookie = `hasSeenOnboarding_${user.id}`;

    // If the account has not completed or has reset setup onboarding,
    // show the setup wizard.
    if (!getCookie(onboardingCookie)) {
      setShowOnboarding(true);
    }
  }, [classesLoading, isEligible, isGuardian, user]);

  const onboardingCookie = user
    ? `hasSeenOnboarding_${user.id}`
    : null;

  const closeOnboarding = () => {
    setShowOnboarding(false);
    if (onboardingCookie) setCookie(onboardingCookie, 'true');
  };

  return (
    <DashboardIntroProvider ready={!classesLoading && !homeworkLoading && !testsLoading && !showOnboarding}>
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 overflow-x-hidden font-sans text-[#111827] dark:text-gray-100">
      <main className="w-full mx-auto px-3.5 sm:px-6 md:px-12 lg:px-16 pt-[4.5rem] sm:pt-28 pb-24 sm:pb-8">
        <MainAppHeader />
        <MainAppDashboard />
        <MainAppContent />
        
        {/* Modals */}
        <AddClassModal />
        <AddHomeworkModal />
        <DeleteConfirmModal />
        
        <AddTestModal
          isOpen={showAddTest}
          onClose={() => {
            setShowAddTest(false);
            setClassIdForAddTest(undefined);
          }}
          defaultClassId={classIdForAddTest}
        />

        {selectedTest && (
          <TestDetailModal
            test={selectedTest}
            isOpen={isTestDetailModalOpen}
            onClose={() => {
              setIsTestDetailModalOpen(false);
              setSelectedTest(null);
            }}
            onDelete={deleteTest}
          />
        )}

        <OnboardingModal
          isOpen={showOnboarding}
          onClose={closeOnboarding}
          onStartTour={() => {
            closeOnboarding();
            setRunSpotlightTour(true);
          }}
        />

        <OnboardingTour
          forceStart={runSpotlightTour}
          suppressAutoStart={showOnboarding}
          onComplete={() => setRunSpotlightTour(false)}
        />

        <TaskBracket
          open={showBracket}
          onClose={() => setShowBracket(false)}
          tasks={homeworks.filter((hw: any) => !hw.completed).map((hw: any) => ({ id: hw.id, title: hw.title }))}
        />
      </main>
    </div>
    </DashboardIntroProvider>
  );
};

export default MainApp;
