
"use client";

import type { ProblemHistoryItem } from '@/types';
import type { ReactNode} from 'react';
import { createContext, useContext, useState } from 'react';

interface ProblemHistoryContextType {
  lastSolvedItem: ProblemHistoryItem | null;
  setLastSolvedItem: (item: ProblemHistoryItem | null) => void;
  problemToViewInPage: ProblemHistoryItem | null; // Added
  viewProblemInPage: (item: ProblemHistoryItem | null) => void; // Added
}

const ProblemHistoryContext = createContext<ProblemHistoryContextType | undefined>(undefined);

export function ProblemHistoryProvider({ children }: { children: ReactNode }) {
  const [lastSolvedItem, setLastSolvedItem] = useState<ProblemHistoryItem | null>(null);
  const [problemToViewInPage, setProblemToViewInPage] = useState<ProblemHistoryItem | null>(null); // Added

  const viewProblemInPage = (item: ProblemHistoryItem | null) => { // Added
    setProblemToViewInPage(item);
  };

  return (
    <ProblemHistoryContext.Provider value={{ lastSolvedItem, setLastSolvedItem, problemToViewInPage, viewProblemInPage }}>
      {children}
    </ProblemHistoryContext.Provider>
  );
}

export function useProblemHistoryContext() {
  const context = useContext(ProblemHistoryContext);
  if (context === undefined) {
    throw new Error('useProblemHistoryContext 必須在 ProblemHistoryProvider 中使用');
  }
  return context;
}
