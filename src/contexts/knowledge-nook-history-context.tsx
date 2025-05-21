
"use client";

import type { KnowledgeNookHistoryItem } from '@/types';
import type { ReactNode} from 'react';
import { createContext, useContext, useState } from 'react';

interface KnowledgeNookHistoryContextType {
  latestKnowledgeNookItem: KnowledgeNookHistoryItem | null;
  setLatestKnowledgeNookItem: (item: KnowledgeNookHistoryItem | null) => void;
  knowledgeToViewInPage: KnowledgeNookHistoryItem | null; // Added
  viewKnowledgeInPage: (item: KnowledgeNookHistoryItem | null) => void; // Added
}

const KnowledgeNookHistoryContext = createContext<KnowledgeNookHistoryContextType | undefined>(undefined);

export function KnowledgeNookHistoryProvider({ children }: { children: ReactNode }) {
  const [latestKnowledgeNookItem, setLatestKnowledgeNookItem] = useState<KnowledgeNookHistoryItem | null>(null);
  const [knowledgeToViewInPage, setKnowledgeToViewInPage] = useState<KnowledgeNookHistoryItem | null>(null); // Added

  const viewKnowledgeInPage = (item: KnowledgeNookHistoryItem | null) => { // Added
    setKnowledgeToViewInPage(item);
  };

  return (
    <KnowledgeNookHistoryContext.Provider value={{ latestKnowledgeNookItem, setLatestKnowledgeNookItem, knowledgeToViewInPage, viewKnowledgeInPage }}>
      {children}
    </KnowledgeNookHistoryContext.Provider>
  );
}

export function useKnowledgeNookHistoryContext() {
  const context = useContext(KnowledgeNookHistoryContext);
  if (context === undefined) {
    throw new Error('useKnowledgeNookHistoryContext 必須在 KnowledgeNookHistoryProvider 中使用');
  }
  return context;
}
