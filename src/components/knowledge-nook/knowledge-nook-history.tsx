
"use client";

import type { KnowledgeNookHistoryItem } from '@/types';
import { useEffect, useState } from 'react';
import { Lightbulb, Trash2, Loader2, BookOpenText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useKnowledgeNookHistoryContext } from '@/contexts/knowledge-nook-history-context';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth-context'; 
import { 
  saveKnowledgeNookHistoryItem, 
  loadKnowledgeNookHistory, 
  deleteKnowledgeNookHistoryItem 
} from '@/firebase/firestore-service'; 

const MAX_HISTORY_ITEMS_LOCAL_STORAGE = 15;
const MAX_ITEMS_TO_DISPLAY_IN_SIDEBAR = 2; // Max items to display in sidebar snippet
const LOCAL_STORAGE_KEY = 'gongziKnowledgeNookHistory';

export function KnowledgeNookHistory() {
  const [history, setHistory] = useState<KnowledgeNookHistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { latestKnowledgeNookItem, viewKnowledgeInPage } = useKnowledgeNookHistoryContext();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuthContext(); 

  const saveToLocalStorage = (items: KnowledgeNookHistoryItem[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS_LOCAL_STORAGE)));
      } catch (error) {
        console.error("Failed to save knowledge nook history to localStorage", error);
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
      let loadedHistory: KnowledgeNookHistoryItem[] = [];
      if (user) {
        console.log("知識小天地：使用者已登入，嘗試從 Firestore 載入歷史記錄...");
        try {
          loadedHistory = await loadKnowledgeNookHistory(user.uid);
          if (loadedHistory.length > 0) {
             console.log(`知識小天地：從 Firestore 載入 ${loadedHistory.length} 筆記錄`);
          } else {
            console.log("知識小天地：Firestore 中無歷史記錄，嘗試從 localStorage 載入");
            const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedHistory) loadedHistory = JSON.parse(storedHistory);
          }
        } catch (error) {
          console.error("知識小天地：從 Firestore 載入歷史記錄失敗，嘗試從 localStorage 載入:", error);
          const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (storedHistory) loadedHistory = JSON.parse(storedHistory);
        }
      } else {
        console.log("知識小天地：使用者未登入，從 localStorage 載入歷史記錄...");
        const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedHistory) {
          try {
            loadedHistory = JSON.parse(storedHistory);
          } catch (e) {
            console.error("知識小天地：解析 localStorage 歷史記錄失敗:", e);
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
    if (latestKnowledgeNookItem && isClient) {
      const optimisticNewItem = { ...latestKnowledgeNookItem, id: latestKnowledgeNookItem.id || `temp-knook-${Date.now()}` };
      
      setHistory(prevHistory => {
        const updatedHistory = [optimisticNewItem, ...prevHistory.filter(item => item.id !== optimisticNewItem.id)];
        const uniqueHistory = Array.from(new Set(updatedHistory.map(a => a.id)))
          .map(id => updatedHistory.find(a => a.id === id)) as KnowledgeNookHistoryItem[];
        
        uniqueHistory.sort((a, b) => b.timestamp - a.timestamp);
        saveToLocalStorage(uniqueHistory.slice(0, MAX_HISTORY_ITEMS_LOCAL_STORAGE));
        return uniqueHistory;
      });

      if (user) {
        console.log("知識小天地：使用者已登入，儲存新項目至 Firestore:", optimisticNewItem);
        saveKnowledgeNookHistoryItem(user.uid, optimisticNewItem)
          .then(firestoreId => {
            if (firestoreId) {
              console.log("知識小天地：項目已儲存至 Firestore, ID:", firestoreId);
              setHistory(prev => prev.map(item => item.id === optimisticNewItem.id ? { ...item, id: firestoreId } : item).sort((a,b) => b.timestamp - a.timestamp));
            } else {
              console.warn("知識小天地：儲存項目至 Firestore 失敗，未收到 firestoreId");
            }
          })
          .catch(error => {
            console.error("知識小天地：儲存新項目至 Firestore 失敗:", error);
          });
      }
    }
  }, [latestKnowledgeNookItem, isClient, user]);

  const handleDeleteItem = async (idToDelete: string, event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (!idToDelete) {
      console.warn("知識小天地：嘗試刪除項目但 ID 未定義");
      return;
    }

    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== idToDelete);
      saveToLocalStorage(newHistory);
      return newHistory;
    });

    if (user) {
      console.log(`知識小天地：使用者已登入，從 Firestore 刪除項目 ID: ${idToDelete}`);
      try {
        const success = await deleteKnowledgeNookHistoryItem(user.uid, idToDelete);
        if (success) {
            console.log(`知識小天地：項目 ${idToDelete} 已成功從 Firestore 刪除`);
        } else {
            console.warn(`知識小天地：項目 ${idToDelete} 從 Firestore 刪除失敗 (服務回傳 false)`);
        }
      } catch (error) {
        console.error(`知識小天地：從 Firestore 刪除項目 ${idToDelete} 失敗:`, error);
      }
    }
  };

  const handleItemClick = (item: KnowledgeNookHistoryItem) => {
    viewKnowledgeInPage(item);
    if (pathname !== '/solver') {
      router.push('/solver');
    }
  };
  
  if (!isClient || isLoading || authLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        正在載入知識紀錄...
      </div>
    );
  }
  
  const itemsToDisplay = pathname === '/knowledge' ? history : history.slice(0, MAX_ITEMS_TO_DISPLAY_IN_SIDEBAR);

  if (itemsToDisplay.length === 0 && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
        <BookOpenText className="h-10 w-10 mb-3" />
        <p className="text-sm">尚未有知識點紀錄。</p>
        <p className="text-xs">您遇到的知識點將會顯示在此。</p>
      </div>
    );
  }

  if (itemsToDisplay.length === 0 && history.length > 0 && pathname !== '/knowledge') {
    return (
      <div className="p-2 text-center text-xs text-muted-foreground">
        <p>更多知識紀錄請至<Button variant="link" size="sm" className="p-0 h-auto" onClick={() => router.push('/knowledge')}>總覽頁面</Button>查看。</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {itemsToDisplay.map((item, index) => (
        <AccordionItem value={item.id || `knook-item-${index}`} key={item.id || `knook-key-${index}`} className="mb-2 bg-card/50 dark:bg-card/80 rounded-md border shadow-sm">
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
              <Lightbulb className="h-5 w-5 text-yellow-500 shrink-0" />
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-medium text-xs">
                  {isClient && item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: zhTW }) : '載入日期...'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.knowledgePoints.substring(0,40)}...
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 py-2 border-t bg-card rounded-b-md">
            <p className="text-xs whitespace-pre-wrap font-mono">{item.knowledgePoints}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

