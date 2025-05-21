
"use client";

import type { Flashcard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

interface FlashcardItemProps {
  card: Flashcard;
}

export function FlashcardItem({ card }: FlashcardItemProps) {
  return (
    <Card className="w-full h-full shadow-xl flex flex-col">
      <CardHeader className="text-center shrink-0">
        <CardTitle className="text-2xl md:text-3xl font-bold text-primary">{card.term}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="text-center space-y-3 p-4 md:p-6 w-full flex-grow overflow-y-auto thin-scrollbar">
        {card.definition && (
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-1">{card.definition}</h3>
          </div>
        )}
        {card.details && (
          <CardDescription className="text-base whitespace-pre-wrap text-left">
            <strong>詳細說明：</strong><br />
            {card.details}
          </CardDescription>
        )}
        {card.imageUrl && (
          <div className="relative w-full max-w-xs mx-auto h-32 mt-4">
            <Image 
                src={card.imageUrl} 
                alt={`${card.term} 的圖片說明`} 
                layout="fill" 
                objectFit="contain" 
                data-ai-hint="formula diagram" 
            />
          </div>
        )}
        {!card.definition && !card.details && !card.imageUrl && (
          <p className="text-muted-foreground italic mt-4">此卡片沒有額外詳細說明或定義。</p>
        )}
      </CardContent>
    </Card>
  );
}
