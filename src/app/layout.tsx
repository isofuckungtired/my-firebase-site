
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { ProblemHistoryProvider } from '@/contexts/problem-history-context';
import { AuthProvider } from '@/contexts/auth-context';
import { KnowledgeNookHistoryProvider } from '@/contexts/knowledge-nook-history-context';
import { FocusTimerProvider } from '@/contexts/focus-timer-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '公子請讀書',
  description: '您的 AI 學習夥伴',
  // viewport: 'width=device-width, initial-scale=1', // Next.js 會自動處理 viewport
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        {/* Next.js 通常會自動加入 viewport meta 標籤。
            如果需要手動加入，可以放在這裡，但通常不需要。
            例如: <meta name="viewport" content="width=device-width, initial-scale=1" />
        */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <AuthProvider>
          <ProblemHistoryProvider>
            <KnowledgeNookHistoryProvider>
              <FocusTimerProvider>
                <SidebarProvider defaultOpen={true}> {/* 預設桌面展開，行動裝置由 Sheet 控制 */}
                  <AppSidebar />
                  <div className="flex flex-col flex-1 min-h-screen">
                    <AppHeader />
                    <main className="flex-1">
                      {children}
                    </main>
                  </div>
                </SidebarProvider>
              </FocusTimerProvider>
            </KnowledgeNookHistoryProvider>
          </ProblemHistoryProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
