
"use client";

import type { ProblemHistoryItem } from '@/types';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOCAL_STORAGE_KEY = 'mathBuddyLastLearningPointSummary'; // Changed key to avoid conflict if needed

interface LastLearningPointProps {
  lastSolvedItem: ProblemHistoryItem | null;
}

// This component now primarily focuses on showing a quick summary of the last activity.
// Detailed knowledge points are handled by KnowledgeNook.
export function LastLearningPoint({ lastSolvedItem }: LastLearningPointProps) {
  const [lastPointSummary, setLastPointSummary] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedPoint = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPoint) {
        setLastPointSummary(storedPoint);
      }
    } catch (error) {
      console.error("Failed to load last learning point summary from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (lastSolvedItem && isClient) {
      // This creates a summary like before, not the detailed knowledge points.
      const newSummary = `上次解題時間: ${new Date(lastSolvedItem.timestamp).toLocaleDateString()} - 解題摘要: ${lastSolvedItem.solution.substring(0, 30)}...`;
      setLastPointSummary(newSummary);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, newSummary);
      } catch (error) {
        console.error("Failed to save last learning point summary to localStorage", error);
      }
    }
  }, [lastSolvedItem, isClient]);
  
  if (!isClient) {
    return (
       <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />
            上次學習記錄
          </CardTitle>
           <CardDescription>從上次離開的地方繼續學習。</CardDescription>
        </CardHeader>
        <CardContent>
          <p>正在載入上次學習記錄...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-primary" />
          上次學習記錄
        </CardTitle>
        <CardDescription>從上次離開的地方繼續學習。</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
        {lastPointSummary ? (
          <>
            <Sparkles className="h-12 w-12 text-accent mb-4" />
            <p className="text-lg font-medium mb-2">歡迎回來！</p>
            <p className="text-muted-foreground">{lastPointSummary}</p>
            <Button variant="link" className="mt-4 text-primary" onClick={() => document.getElementById('solver')?.scrollIntoView({ behavior: 'smooth' })}>
              解決一個新問題
            </Button>
          </>
        ) : (
          <>
            <BookMarked className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">尚無學習活動記錄。</p>
            <p className="text-sm text-muted-foreground">解決您的第一個問題以設定學習點！</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

