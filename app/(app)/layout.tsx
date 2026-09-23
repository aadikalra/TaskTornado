import { ClassProvider } from '@/context/ClassContext';
import { HomeworkProvider } from '@/context/HomeworkContext';
import { TestProvider } from '@/context/TestContext';
import { DataProvider } from '@/context/DataContext';
import { SearchProvider } from '@/context/SearchContext';
import { AIProvider } from '@/context/AIContext';
import { WebSavesProvider } from '@/context/WebSavesContext';
import { StudyGroupsProvider } from '@/context/StudyGroupsContext';
import { UpgradeProvider } from '@/context/UpgradeContext';
import AuthWrapper from '@/components/AuthWrapper';
import { ClientLayout } from '../ClientLayout';
import React from 'react';
import { cookies } from 'next/headers';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get('tasktornado_newhome_sidebar_collapsed');
  const initialSidebarCollapsed = sidebarCookie ? sidebarCookie.value === 'true' : false;

  return (
    <ClassProvider>
      <HomeworkProvider>
        <TestProvider>
          <DataProvider>
            <SearchProvider>
              <AIProvider>
                <WebSavesProvider>
                  <StudyGroupsProvider>
                    <UpgradeProvider>
                      <AuthWrapper>
                        <ClientLayout initialSidebarCollapsed={initialSidebarCollapsed}>{children}</ClientLayout>
                      </AuthWrapper>
                    </UpgradeProvider>
                  </StudyGroupsProvider>
                </WebSavesProvider>
              </AIProvider>
            </SearchProvider>
          </DataProvider>
        </TestProvider>
      </HomeworkProvider>
    </ClassProvider>
  );
}
