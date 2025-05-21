
"use client";

import type { Metadata } from 'next';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppFooter } from '@/components/layout/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KnowledgeNookHistory } from '@/components/knowledge-nook/knowledge-nook-history';
import { useKnowledgeNookHistoryContext } from '@/contexts/knowledge-nook-history-context';
import { BookMarked } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { KnowledgeNookHistoryItem } from '@/types';
import { useAuthContext } from '@/contexts/auth-context'; // Import auth context
import { useEffect } from 'react'; // Import useEffect

// Cannot export metadata from client component
// export const metadata: Metadata = {
//   title: '知識小天地總覽 - 公子請讀書',
//   description: '查看您所有遇到的知識點紀錄。',
// };

export default function KnowledgeNookHistoryPage() {
  const { latestKnowledgeNookItem, viewKnowledgeInPage } = useKnowledgeNookHistoryContext();
  const { user, loading } = useAuthContext(); // Get user and loading state from auth context
  const router = useRouter();

  // While loading or if user is not authenticated, you might render a loading indicator or null
  if (loading || !user) {
    // TODO: Add a more robust loading or not-authenticated state display
    return <div className="flex items-center justify-center min-h-screen">正在載入或需要登入...</div>; 
  }

  const handleHistoryItemClick = (item: KnowledgeNookHistoryItem) => {
    viewKnowledgeInPage(item);
    router.push("/solver");
  }

  // Render the page content only if user is authenticated
  return (
    <SidebarInset className="bg-background">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <Card className="shadow-lg h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-7 w-7 text-primary" />
                知識小天地總覽
              </CardTitle>
              <CardDescription>
                查看您所有遇到的知識點紀錄。點擊項目可在主頁查看詳情。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow overflow-hidden">
               <div className="h-full overflow-y-auto p-1 pr-2 thin-scrollbar">
                {/*
                  The KnowledgeNookHistory component itself handles the click logic now.
                  If you need specific click handling for this page different from the component's default,
                  you might need to adjust the component's props or logic.
                  For now, relying on the component's internal `handleItemClick` which uses router.push('/solver').
                */}
                <KnowledgeNookHistory />
              </div>
            </CardContent>
          </Card>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}
