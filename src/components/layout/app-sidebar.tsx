
// src/components/layout/app-sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardCheck, Settings, ChevronsLeft, ChevronsRight, Library, History as HistoryIcon, BookMarked, Timer as TimerIcon, AlertTriangle, Zap, Award, Layers, Lightbulb, Wand2, FileText } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { FocusTimer } from '@/components/sidebar-features/focus-timer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProblemHistory } from '@/components/math-solver/problem-history';
import { KnowledgeNookHistory } from '@/components/knowledge-nook/knowledge-nook-history';
import { useProblemHistoryContext } from '@/contexts/problem-history-context';
import { CustomBookOpenIcon } from '@/components/icons/custom-book-open-icon';


const menuItems = [
  { href: '/solver', label: 'AI 數學解題助手', icon: Home },
  { href: '/history', label: '解題歷史總覽', icon: HistoryIcon },
  { href: '/knowledge', label: '知識小天地總覽', icon: BookMarked },
  { href: '/errors', label: '錯題本', icon: AlertTriangle },
  { href: '/quick-quiz', label: '快速問答挑戰', icon: Zap },
  { href: '/leaderboard', label: '排行榜', icon: Award },
  { href: '/flashcards', label: '數學公式卡', icon: Layers },
  { href: '/quiz', label: '數學檢定時間', icon: ClipboardCheck },
  { href: '/courses', label: '課程學習區', icon: Library },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const { lastSolvedItem } = useProblemHistoryContext();


  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex items-center gap-2",
          state === "collapsed" && "justify-center"
        )}>
          <CustomBookOpenIcon className="h-8 w-8 text-primary shrink-0 fill-white" />
          {state === "expanded" && <span className="text-xl font-semibold text-primary">公子請讀書</span>}
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col flex-grow p-0 overflow-y-auto thin-scrollbar">
        <div className="p-2">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <a>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

         <div className={cn("overflow-y-auto px-2 pb-2 thin-scrollbar space-y-3", state !== 'expanded' && 'hidden')}>
          <SidebarSeparator className="my-2" />
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1 ml-1 px-1 flex items-center gap-1.5">
              <HistoryIcon className="h-4 w-4" />
              解題歷史摘要
            </h4>
            <ProblemHistory newHistoryItem={lastSolvedItem} />
          </div>

          <SidebarSeparator className="my-2" />
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1 ml-1 px-1 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" />
              知識小天地摘要
            </h4>
            <KnowledgeNookHistory />
          </div>
        </div>

        {state === 'expanded' && (
           <div className="p-2 border-t border-sidebar-border mt-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="focus-timer" className="border-none">
                <AccordionTrigger className="w-full rounded-md px-2 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                  <div className="flex items-center gap-2">
                    <TimerIcon className="h-5 w-5 text-primary" />
                    <span>專注計時器</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-1">
                  <FocusTimer />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
         <SidebarMenu>
           <SidebarMenuItem>
            <Link href="/settings" passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/settings"}
                tooltip="設定"
              >
                <a>
                  <Settings className="h-5 w-5" />
                  <span>設定</span>
                </a>
              </SidebarMenuButton>
            </Link>
           </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar} tooltip={state === 'expanded' ? '收起側邊欄' : '展開側邊欄'}>
              {state === 'expanded' ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
              <span>{state === 'expanded' ? '收起' : '展開'}</span>
            </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
