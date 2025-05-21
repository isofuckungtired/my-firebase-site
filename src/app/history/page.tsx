
"use client";

import type { Metadata } from 'next';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppFooter } from '@/components/layout/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProblemHistory } from '@/components/math-solver/problem-history';
import { useProblemHistoryContext } from '@/contexts/problem-history-context';
import { History as HistoryIcon } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Keep if needed, but ProblemHistory will handle navigation
import type { ProblemHistoryItem } from '@/types';

// Cannot export metadata from client component
// export const metadata: Metadata = {
//   title: '解題歷史總覽 - 公子請讀書',
//   description: '查看您所有已解決的數學問題。',
// };

export default function ProblemHistoryPage() {
  // lastSolvedItem is primarily for feeding new items into ProblemHistory when it's on a page where items are generated.
  // On this dedicated history page, new items aren't generated directly, but ProblemHistory still listens to context for consistency.
  const { lastSolvedItem } = useProblemHistoryContext(); 
  // const router = useRouter(); // ProblemHistory will handle its own navigation for item clicks

  return (
    <SidebarInset className="bg-background">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <Card className="shadow-lg h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HistoryIcon className="h-7 w-7 text-primary" />
                解題歷史總覽
              </CardTitle>
              <CardDescription>
                查看您所有已解決的數學問題。點擊項目可在主頁查看詳情。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow overflow-hidden">
              <div className="h-full overflow-y-auto p-1 pr-2 thin-scrollbar">
                <ProblemHistory newHistoryItem={lastSolvedItem} />
              </div>
            </CardContent>
          </Card>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}
