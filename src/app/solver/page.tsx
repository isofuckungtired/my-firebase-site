
"use client";

import { useState, useEffect } from 'react'; 
import { MathProblemSolver } from '@/components/math-solver/math-problem-solver';
import { KnowledgeNook } from '@/components/math-solver/knowledge-nook';
import type { ProblemHistoryItem, KnowledgeNookHistoryItem } from '@/types';
import { AppFooter } from '@/components/layout/app-footer';
import { SidebarInset } from '@/components/ui/sidebar';
import { useProblemHistoryContext } from '@/contexts/problem-history-context';
import { useKnowledgeNookHistoryContext } from '@/contexts/knowledge-nook-history-context';

export default function SolverPage() { // Renamed from HomePage to SolverPage
  const { setLastSolvedItem, problemToViewInPage, viewProblemInPage } = useProblemHistoryContext();
  const { setLatestKnowledgeNookItem, knowledgeToViewInPage, viewKnowledgeInPage } = useKnowledgeNookHistoryContext();
  
  const [problemForSolver, setProblemForSolver] = useState<ProblemHistoryItem | null>(null);
  const [knowledgeForNook, setKnowledgeForNook] = useState<string | null>(null);

  useEffect(() => {
    if (problemToViewInPage) {
      setProblemForSolver(problemToViewInPage);
      setKnowledgeForNook(problemToViewInPage.knowledgePoints || null);
      viewKnowledgeInPage(null); 
    }
  }, [problemToViewInPage, viewKnowledgeInPage]);

  useEffect(() => {
    if (knowledgeToViewInPage) {
      setKnowledgeForNook(knowledgeToViewInPage.knowledgePoints);
      setProblemForSolver(null); 
      viewProblemInPage(null); 
    }
  }, [knowledgeToViewInPage, viewProblemInPage]);

  const handleProblemSolved = (item: ProblemHistoryItem) => {
    setLastSolvedItem(item); 
    if (item.knowledgePoints) {
      const newKnowledgeNookEntry: KnowledgeNookHistoryItem = {
        id: `knook-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        knowledgePoints: item.knowledgePoints,
        timestamp: Date.now(),
      };
      setLatestKnowledgeNookItem(newKnowledgeNookEntry);
    }

    setProblemForSolver(item); 
    setKnowledgeForNook(item.knowledgePoints || null);

    viewProblemInPage(null);
    viewKnowledgeInPage(null);
  };

  const handleClearSolverDisplay = () => {
    viewProblemInPage(null); 
    setProblemForSolver(null); 
  };

  return (
    <SidebarInset className="bg-background">
      <div className="flex flex-col flex-1">
        <div className="flex-1 container mx-auto p-4 md:p-8 space-y-10">
          <section id="solver" aria-labelledby="solver-heading" className="scroll-mt-20">
            <MathProblemSolver 
              onProblemSolved={handleProblemSolved}
              displayItem={problemForSolver}
              onClearDisplay={handleClearSolverDisplay}
            />
          </section>

          <section id="knowledge-nook" aria-labelledby="knowledge-nook-heading">
            <KnowledgeNook knowledgePoints={knowledgeForNook} />
          </section>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}
