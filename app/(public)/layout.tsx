import React from 'react';
import { AIProvider } from '@/context/AIContext';
import { ClassProvider } from '@/context/ClassContext';
import { DataProvider } from '@/context/DataContext';
import { HomeworkProvider } from '@/context/HomeworkContext';
import { SearchProvider } from '@/context/SearchContext';
import { StudyGroupsProvider } from '@/context/StudyGroupsContext';
import { TestProvider } from '@/context/TestContext';
import { UpgradeProvider } from '@/context/UpgradeContext';
import { WebSavesProvider } from '@/context/WebSavesContext';
import { ClientLayout } from '../ClientLayout';
import { cookies } from 'next/headers';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
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
                      <ClientLayout initialSidebarCollapsed={initialSidebarCollapsed}>{children}</ClientLayout>
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
