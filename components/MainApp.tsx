'use client';

import React from 'react';
import { MainAppHeader } from './main-app/MainAppHeader';
import { MainAppDashboard } from './main-app/MainAppDashboard';
import { MainAppContent } from './main-app/MainAppContent';
import dynamic from 'next/dynamic';

const AddClassModal = dynamic(() => import('./main-app/AddClassModal').then(mod => mod.AddClassModal), { ssr: false });
const AddHomeworkModal = dynamic(() => import('./main-app/AddHomeworkModal').then(mod => mod.AddHomeworkModal), { ssr: false });
const DeleteConfirmModal = dynamic(() => import('./main-app/DeleteConfirmModal').then(mod => mod.DeleteConfirmModal), { ssr: false });
const OnboardingModal = dynamic(() => import('./OnboardingModal').then(mod => mod.OnboardingModal), { ssr: false });
const WelcomeLetter = dynamic(() => import('./WelcomeLetter'), { ssr: false });
const AddTestModal = dynamic(() => import('./AddTestModal').then(mod => mod.AddTestModal), { ssr: false });
const TestDetailModal = dynamic(() => import('./TestDetailModal').then(mod => mod.TestDetailModal), { ssr: false });
const TaskBracket = dynamic(() => import('./TaskBracket').then(mod => mod.TaskBracket), { ssr: false });

import { useMainApp, setCookie, getCookie } from '@/context/MainAppContext';
import { useClassContext } from '@/context/ClassContext';

export const MainApp = () => {
  const {
    showAddTest, setShowAddTest,
    classIdForAddTest, setClassIdForAddTest,
    selectedTest, setSelectedTest,
    isTestDetailModalOpen, setIsTestDetailModalOpen,
    showBracket, setShowBracket,
  } = useMainApp();

  const { homeworks, deleteTest } = useClassContext();

  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [showWelcomeLetter, setShowWelcomeLetter] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenWelcome = getCookie('hasSeenWelcomeLetter2');
      if (!hasSeenWelcome) {
        setShowWelcomeLetter(true);
      } else {
        const hasSeenOnboarding = getCookie('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 overflow-x-hidden font-sans text-[#111827] dark:text-gray-100">
      <main className="w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-8">
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
          onClose={() => {
            setShowOnboarding(false);
            setCookie('hasSeenOnboarding', 'true');
          }}
        />

        <WelcomeLetter
          isOpen={showWelcomeLetter}
          onClose={() => {
            setShowWelcomeLetter(false);
            setCookie('hasSeenWelcomeLetter2', 'true');
            if (!getCookie('hasSeenOnboarding')) {
              setTimeout(() => {
                setShowOnboarding(true);
              }, 500);
            }
          }}
        />

        <TaskBracket
          open={showBracket}
          onClose={() => setShowBracket(false)}
          tasks={homeworks.filter((hw: any) => !hw.completed).map((hw: any) => ({ id: hw.id, title: hw.title }))}
        />
      </main>
    </div>
  );
};

export default MainApp;