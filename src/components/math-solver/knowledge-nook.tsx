
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Lightbulb, BookOpenText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface KnowledgeNookProps {
  knowledgePoints: string | null | undefined;
}

export function KnowledgeNook({ knowledgePoints }: KnowledgeNookProps) {
  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          知識小天地
        </CardTitle>
        <CardDescription>探索與您解決的問題相關的知識點。</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {knowledgePoints ? (
          <Textarea
            id="knowledge-points-display"
            value={knowledgePoints}
            readOnly
            rows={10}
            className="bg-primary/5 border-primary focus-visible:ring-primary text-base leading-relaxed whitespace-pre-wrap font-mono h-full"
            aria-label="相關知識點"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <BookOpenText className="h-12 w-12 mb-4" />
            <p className="text-lg">目前沒有相關知識點。</p>
            <p className="text-sm">解決一個問題後，相關的學習概念會顯示在這裡。</p>
          </div>
        )}
      </CardContent>
      {knowledgePoints && (
        <CardFooter>
          <p className="text-sm text-primary font-medium">
            希望這些知識點能幫助您更深入理解！
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

