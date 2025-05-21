
"use client";

import { useState, useEffect, useMemo } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppFooter } from '@/components/layout/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Shuffle, Layers } from 'lucide-react'; // Removed Repeat
import { sampleFlashcardSets } from '@/lib/flashcard-data';
import type { Flashcard } from '@/types'; // Removed FlashcardSet as it's only used for sampleFlashcardSets type
import { FlashcardItem } from '@/components/flashcards/flashcard-item';

export default function FlashcardsPage() {
  const [selectedSetId, setSelectedSetId] = useState<string | undefined>(sampleFlashcardSets[0]?.id);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);

  const selectedSet = useMemo(() => {
    return sampleFlashcardSets.find(set => set.id === selectedSetId);
  }, [selectedSetId]);

  useEffect(() => {
    if (selectedSet) {
      setShuffledCards([...selectedSet.cards]); // Initial order
      setCurrentCardIndex(0);
    }
  }, [selectedSet]);

  const handleSetChange = (setId: string) => {
    setSelectedSetId(setId);
  };

  const handleNextCard = () => {
    if (!selectedSet) return;
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % shuffledCards.length);
  };

  const handlePreviousCard = () => {
    if (!selectedSet) return;
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + shuffledCards.length) % shuffledCards.length);
  };

  const handleShuffleCards = () => {
    if (!selectedSet) return;
    const newShuffledCards = [...selectedSet.cards].sort(() => Math.random() - 0.5);
    setShuffledCards(newShuffledCards);
    setCurrentCardIndex(0);
  };

  const currentCard = selectedSet ? shuffledCards[currentCardIndex] : null;

  return (
    <SidebarInset className="bg-background">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <Card className="shadow-lg w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Layers className="h-7 w-7 text-primary" />
                數學公式卡
              </CardTitle>
              <CardDescription>
                選擇一個公式卡組開始學習和記憶重要公式。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Select onValueChange={handleSetChange} defaultValue={selectedSetId}>
                  <SelectTrigger className="w-full sm:w-[280px] text-base">
                    <SelectValue placeholder="選擇一個公式卡組" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleFlashcardSets.map((set) => (
                      <SelectItem key={set.id} value={set.id} className="text-base">
                        {set.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleShuffleCards} variant="outline" disabled={!selectedSet}>
                  <Shuffle className="mr-2 h-4 w-4" /> 隨機排序
                </Button>
              </div>

              {selectedSet && currentCard ? (
                <div className="space-y-4">
                  <div className="h-[22rem] md:h-[26rem]"> {/* Adjusted height for non-flipping card */}
                    <FlashcardItem card={currentCard} />
                  </div>
                  <div className="flex justify-between items-center">
                    <Button onClick={handlePreviousCard} variant="outline" size="lg">
                      <ChevronLeft className="mr-1 h-5 w-5" /> 上一張
                    </Button>
                    <p className="text-muted-foreground font-medium">
                      第 {currentCardIndex + 1} / {shuffledCards.length} 張
                    </p>
                    <Button onClick={handleNextCard} variant="outline" size="lg">
                      下一張 <ChevronRight className="ml-1 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>請先選擇一個公式卡組。</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}
