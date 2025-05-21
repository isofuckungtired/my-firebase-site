
"use client";

import type { ProblemHistoryItem } from '@/types';
import { useEffect, useState } from 'react';
import { History as HistoryIcon, ImageOff, Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/auth-context';
import { saveProblemHistoryItem, loadProblemHistory, deleteProblemHistoryItem as deleteFromFirestore } from '@/firebase/firestore-service';
import { useProblemHistoryContext } from '@/contexts/problem-history-context';
import { useRouter, usePathname } from 'next/navigation'; 

const MAX_HISTORY_ITEMS_LOCAL_STORAGE = 10; // Max items in localStorage for backup/anonymous
const MAX_ITEMS_TO_DISPLAY_IN_SIDEBAR = 2; // Max items to display in sidebar snippet
const LOCAL_STORAGE_KEY = 'mathBuddyProblemHistory';

interface ProblemHistoryProps {
  newHistoryItem: ProblemHistoryItem | null; 
}

export function ProblemHistory({ newHistoryItem }: ProblemHistoryProps) {
  const [history, setHistory] = useState<ProblemHistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const { user, loading: authLoading } = useAuthContext();
  const { viewProblemInPage } = useProblemHistoryContext();
  const router = useRouter(); 
  const pathname = usePathname(); 

  const saveToLocalStorage = (items: ProblemHistoryItem[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS_LOCAL_STORAGE)));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    if (authLoading) { 
      setIsLoading(true); 
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      let loadedHistory: ProblemHistoryItem[] = [];
      if (user) {
        console.log("使用者已登入，嘗試從 Firestore 載入解題歷史...");
        try {
          loadedHistory = await loadProblemHistory(user.uid);
          if (loadedHistory.length > 0) {
             console.log(`從 Firestore 載入 ${loadedHistory.length} 筆解題歷史`);
          } else {
            console.log("Firestore 中無解題歷史，嘗試從 localStorage 載入");
            const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedHistory) {
              loadedHistory = JSON.parse(storedHistory);
            }
          }
        } catch (error) {
          console.error("從 Firestore 載入解題歷史失敗，嘗試從 localStorage 載入:", error);
          const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (storedHistory) {
            loadedHistory = JSON.parse(storedHistory);
          }
        }
      } else {
        console.log("使用者未登入，從 localStorage 載入解題歷史...");
        const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedHistory) {
          try {
            loadedHistory = JSON.parse(storedHistory);
          } catch (e) {
            console.error("解析 localStorage 解題歷史失敗:", e);
            loadedHistory = [];
          }
        }
      }
      loadedHistory.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(loadedHistory);
      setIsLoading(false);
    };

    fetchHistory();
  }, [user, authLoading]);

  useEffect(() => {
    if (newHistoryItem && isClient) {
      const optimisticNewItem = { ...newHistoryItem, id: newHistoryItem.id || `temp-${Date.now()}` };
      
      setHistory(prevHistory => {
        const updatedHistory = [optimisticNewItem, ...prevHistory.filter(item => item.id !== optimisticNewItem.id)];
        const uniqueHistory = Array.from(new Set(updatedHistory.map(a => a.id)))
         .map(id => updatedHistory.find(a => a.id === id)) as ProblemHistoryItem[];
        uniqueHistory.sort((a, b) => b.timestamp - a.timestamp); 
        saveToLocalStorage(uniqueHistory.slice(0, MAX_HISTORY_ITEMS_LOCAL_STORAGE)); 
        return uniqueHistory; 
      });

      if (user) {
        console.log("使用者已登入，儲存新解題項目至 Firestore:", optimisticNewItem);
        saveProblemHistoryItem(user.uid, optimisticNewItem)
          .then(firestoreId => {
            if (firestoreId) {
              console.log("解題項目已儲存至 Firestore, ID:", firestoreId);
              setHistory(prev => prev.map(item => item.id === optimisticNewItem.id ? { ...item, id: firestoreId } : item).sort((a,b) => b.timestamp - a.timestamp));
            } else {
              console.warn("儲存解題項目至 Firestore 失敗，未收到 firestoreId");
            }
          })
          .catch(error => {
            console.error("儲存新解題項目至 Firestore 失敗:", error);
          });
      }
    }
  }, [newHistoryItem, isClient, user]);

  const handleDeleteItem = async (idToDelete: string, event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (!idToDelete) {
        console.warn("嘗試刪除解題項目但 ID 未定義");
        return;
    }

    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== idToDelete);
      saveToLocalStorage(newHistory); 
      return newHistory;
    });

    if (user) {
      console.log(`使用者已登入，從 Firestore 刪除解題項目 ID: ${idToDelete}`);
      try {
        const success = await deleteFromFirestore(user.uid, idToDelete);
        if (success) {
            console.log(`解題項目 ${idToDelete} 已成功從 Firestore 刪除`);
        } else {
            console.warn(`解題項目 ${idToDelete} 從 Firestore 刪除失敗 (服務回傳 false)`);
        }
      } catch (error) {
        console.error(`從 Firestore 刪除解題項目 ${idToDelete} 失敗:`, error);
      }
    }
  };

  const handleItemClick = (item: ProblemHistoryItem) => {
    viewProblemInPage(item);
    if (pathname !== '/solver') { 
      router.push('/solver');
    }
  };
  
  if (!isClient || isLoading || authLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        正在載入歷史記錄...
      </div>
    );
  }
  
  const itemsToDisplay = pathname === '/history' ? history : history.slice(0, MAX_ITEMS_TO_DISPLAY_IN_SIDEBAR);

  if (itemsToDisplay.length === 0 && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
        <HistoryIcon className="h-10 w-10 mb-3" />
        <p className="text-sm">還沒有解決任何問題。</p>
        <p className="text-xs">您解決的問題將會顯示在此。</p>
      </div>
    );
  }
  
  if (itemsToDisplay.length === 0 && history.length > 0 && pathname !== '/history') {
    return (
      <div className="p-2 text-center text-xs text-muted-foreground">
        <p>更多歷史記錄請至<Button variant="link" size="sm" className="p-0 h-auto" onClick={() => router.push('/history')}>總覽頁面</Button>查看。</p>
      </div>
    );
  }


  return (
    <Accordion type="single" collapsible className="w-full">
      {itemsToDisplay.map((item, index) => (
        <AccordionItem value={item.id || `item-${index}`} key={item.id || `item-key-${index}`} className="mb-2 bg-card/50 dark:bg-card/80 rounded-md border shadow-sm">
          <AccordionTrigger className="px-3 py-2 hover:bg-muted/50 rounded-t-md text-xs group">
            <div className="flex items-center gap-2 w-full" onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-50 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive mr-1 shrink-0"
                onClick={(e) => handleDeleteItem(item.id, e as React.MouseEvent)}
                title="刪除此記錄"
                aria-label="刪除此記錄"
              >
                <span
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault(); 
                      handleDeleteItem(item.id, e);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </span>
              </Button>
              {item.problemImageUri ? (
                <div className="relative w-12 h-9 rounded overflow-hidden border shrink-0">
                    <Image src={item.problemImageUri} alt={`問題 ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="math equation" />
                </div>
              ) : (
                <div className="w-12 h-9 rounded bg-muted flex items-center justify-center shrink-0">
                  <ImageOff className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex items-center gap-1">
                  {item.isIncorrectAttempt && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                  {!item.isIncorrectAttempt && item.userAttempt && <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />}
                  <p className="font-medium text-xs">
                    {isClient && item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: zhTW }) : '載入日期...'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {item.solution.substring(0,30)}...
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 py-2 border-t bg-card rounded-b-md">
            {item.userAttempt && (
              <div className="mb-2 pb-2 border-b border-dashed">
                <h4 className="text-xs font-semibold mb-1 text-muted-foreground">您的嘗試:</h4>
                <p className={`text-xs whitespace-pre-wrap font-mono ${item.isIncorrectAttempt ? 'text-destructive' : 'text-green-600'}`}>{item.userAttempt}</p>
              </div>
            )}
            <p className="text-xs whitespace-pre-wrap font-mono">{item.solution}</p>
            {item.knowledgePoints && (
              <div className="mt-2 pt-2 border-t border-dashed">
                <h4 className="text-xs font-semibold mb-1 text-primary">相關知識點:</h4>
                <p className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">{item.knowledgePoints}</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

