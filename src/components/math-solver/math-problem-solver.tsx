
// src/components/math-solver/math-problem-solver.tsx
"use client";

import type { ChangeEvent} from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, Sparkles, AlertCircle, Loader2, BookOpenCheck, XCircle, MessageSquareText, Send, Edit3, Brain, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { solveMathProblemAction, type SolveMathProblemActionInput } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { ProblemHistoryItem } from '@/types';
import { useFocusTimerContext } from '@/contexts/focus-timer-context';

interface MathProblemSolverProps {
  onProblemSolved: (item: ProblemHistoryItem) => void;
  displayItem?: ProblemHistoryItem | null;
  onClearDisplay?: () => void;
}

export function MathProblemSolver({ onProblemSolved, displayItem, onClearDisplay }: MathProblemSolverProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentSolution, setCurrentSolution] = useState<string | null>(null);
  const [userAttempt, setUserAttempt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [userHasChosenAction, setUserHasChosenAction] = useState(false);
  const [userWantsToAttempt, setUserWantsToAttempt] = useState(false);

  const { toast } = useToast();
  const { incrementProblemsSolved } = useFocusTimerContext();

  const isDisplayMode = !!displayItem;

  useEffect(() => {
    if (displayItem) {
      setImagePreview(displayItem.problemImageUri || null);
      setCurrentSolution(displayItem.solution);
      setUserAttempt(displayItem.userAttempt || ""); // Show user's attempt from history if available
      setImageFile(null);
      setError(null);
      setUserHasChosenAction(true); // Skip action choice in display mode
      setUserWantsToAttempt(!!displayItem.userAttempt); // If there was an attempt in history, reflect it
    } else {
      // This else block might be redundant if handleClearAndSolveNew is consistently used.
      // However, it ensures reset if displayItem is externally nulled without onClearDisplay being called.
      // Consider if handleClearAndSolveNew should be the sole source of truth for reset.
    }
  }, [displayItem]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDisplayMode) return; // Prevent changes in display mode
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setCurrentSolution(null); // Reset solution when new image is uploaded
        setError(null);
        setUserAttempt("");
        setUserHasChosenAction(false); // Reset action choice
        setUserWantsToAttempt(false); // Reset attempt state
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserSelectsAttempt = () => {
    setUserHasChosenAction(true);
    setUserWantsToAttempt(true);
    setError(null); // Clear any previous errors from other paths
  };

  const handleUserSelectsDirectSolution = async () => {
    setUserHasChosenAction(true);
    setUserWantsToAttempt(false);
    setUserAttempt(""); // Ensure attempt is empty
    await triggerProblemProcessing(undefined); // Pass undefined for userAttempt
  };

  const handleGoBackToChoice = () => {
    setUserHasChosenAction(false);
    setUserWantsToAttempt(false);
    setUserAttempt("");
    setError(null);
    // currentSolution and imagePreview should remain as they are
  };
  
  const triggerProblemProcessing = async (attemptValue?: string) => {
    if (!imageFile && !isDisplayMode) {
        setError('請先上傳圖片。');
        toast({ title: '錯誤', description: '請上傳數學問題的圖片。', variant: 'destructive' });
        return;
    }
    if (!imagePreview) {
        setError('圖片預覽不存在。');
        toast({ title: '錯誤', description: '圖片預覽不存在。', variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const inputForAction: SolveMathProblemActionInput = {
        photoDataUri: imagePreview,
        userAttempt: attemptValue,
      };
      const result = await solveMathProblemAction(inputForAction);
      
      if ('error' in result && !result.solution) { 
        setError(result.error);
        setCurrentSolution(null);
        toast({ title: '解題錯誤', description: result.error, variant: 'destructive' });
      } else if (result.solution) { 
        setCurrentSolution(result.solution);
        
        const historyItem: ProblemHistoryItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          problemImageUri: imagePreview,
          solution: result.solution,
          timestamp: Date.now(),
          userAttempt: attemptValue,
          // isIncorrectAttempt and feedback related fields from result
          isIncorrectAttempt: result.userAttemptFeedback ? !result.userAttemptFeedback.isMostlyCorrect : undefined,
        };

        if (result.knowledgePoints) {
          historyItem.knowledgePoints = result.knowledgePoints;
        }
        
        onProblemSolved(historyItem);
        if (!isDisplayMode) { // Only increment if not in display mode (i.e., actually solved a new problem)
          incrementProblemsSolved();
        }

        toast({
          title: '取得AI解析！',
          description: 'AI 已經提供了建議方案和回饋。相關知識點（如果有的話）也已更新。',
          variant: 'default',
          className: 'bg-accent text-accent-foreground',
        });
        
        if ('error' in result && result.error && result.solution) {
           toast({ title: '部分成功', description: `${result.error} 但解題方案已提供。`, variant: 'default' });
        }
      } else { 
         setError('發生未預期的錯誤，未收到解題方案。');
         setCurrentSolution(null);
         toast({ title: '錯誤', description: '發生未預期的錯誤，未收到解題方案。', variant: 'destructive' });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '發生意外錯誤。';
      setError(errorMessage);
      setCurrentSolution(null);
      toast({ title: '錯誤', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAttemptForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDisplayMode) return;
    await triggerProblemProcessing(userAttempt);
  };

  const handleClearAndSolveNew = () => {
    if (onClearDisplay) {
      onClearDisplay(); // This will set displayItem to null in parent, triggering useEffect here
    }
    // Explicitly reset all relevant states for a fresh start
    setImagePreview(null);
    setCurrentSolution(null);
    setImageFile(null);
    setError(null);
    setUserAttempt("");
    setUserHasChosenAction(false);
    setUserWantsToAttempt(false);
    setIsLoading(false); // Ensure loading is also reset
    const fileInput = document.getElementById('math-problem-image') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = ""; // Clears the selected file in the input
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDisplayMode ? <BookOpenCheck className="h-6 w-6 text-primary" /> : <Sparkles className="h-6 w-6 text-primary" />}
            {isDisplayMode ? '查看的歷史題目' : 'AI 數學解題助手'}
          </CardTitle>
          <CardDescription>
            {isDisplayMode ? '這是您選擇查看的歷史題目及其解答。' : 
             !imagePreview ? '上傳您的數學問題圖片，讓 AI 協助您！' : 
             !userHasChosenAction ? '選擇您的解題方式。' :
             userWantsToAttempt ? '請輸入您的解法嘗試，或返回選擇直接由 AI 解答。' : 'AI 正在為您準備解答...'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isDisplayMode && (
            <div className="space-y-2">
              <Label htmlFor="math-problem-image" className="text-base">1. 上傳題目圖片</Label>
              <Input
                id="math-problem-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
                aria-describedby="image-help-text"
                disabled={isLoading || (!!imagePreview && userHasChosenAction && !userWantsToAttempt) || (!!imagePreview && currentSolution)} 
              />
              <p id="image-help-text" className="text-sm text-muted-foreground">
                請上傳一張清晰的數學問題圖片。
              </p>
            </div>
          )}
          
          {isDisplayMode && onClearDisplay && (
              <Button onClick={handleClearAndSolveNew} variant="outline" className="w-full">
                <XCircle className="mr-2 h-5 w-5" />
                清除顯示 / 返回解題模式
              </Button>
          )}

          {imagePreview && (
            <div className="space-y-2">
              <Label className="text-base">{isDisplayMode ? '問題圖片' : '圖片預覽'}</Label>
              <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden bg-muted">
                <Image src={imagePreview} alt="數學問題預覽" layout="fill" objectFit="contain" data-ai-hint="math equation" />
              </div>
            </div>
          )}

          {imagePreview && !currentSolution && !isDisplayMode && !userHasChosenAction && (
            <div className="space-y-3 pt-4">
              <Label className="text-base font-medium">您想如何進行？</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleUserSelectsAttempt} variant="outline" className="flex-1">
                  <Edit3 className="mr-2 h-5 w-5" /> 我要自行解題
                </Button>
                <Button onClick={handleUserSelectsDirectSolution} className="flex-1">
                  <Brain className="mr-2 h-5 w-5" /> 請求 AI 直接解答
                </Button>
              </div>
            </div>
          )}
          
          {!isDisplayMode && imagePreview && !currentSolution && userWantsToAttempt && (
            <form onSubmit={handleSubmitAttemptForm} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="user-attempt" className="text-base flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-primary" />
                  您的解法嘗試
                </Label>
                <Textarea
                  id="user-attempt"
                  value={userAttempt}
                  onChange={(e) => setUserAttempt(e.target.value)}
                  rows={5}
                  placeholder="請在此輸入您的解題步驟或答案..."
                  className="bg-primary/5 focus-visible:ring-primary mt-1"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleGoBackToChoice} variant="outline" type="button" className="flex-1" disabled={isLoading}>
                  <Undo2 className="mr-2 h-5 w-5" /> 返回選擇
                </Button>
                <Button type="submit" disabled={isLoading || !userAttempt.trim()} size="lg" className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI 分析中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      提交解法並取得AI解析
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {isLoading && (
            <div className="flex justify-center items-center p-6">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">AI 分析中，請稍候...</p>
            </div>
          )}

          {error && !currentSolution && ( 
            <div className="flex items-center gap-2 text-destructive p-3 bg-destructive/10 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {currentSolution && (
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="solution" className="text-base flex items-center gap-2">
                  <BookOpenCheck className="h-5 w-5 text-accent" />
                  {isDisplayMode ? '歷史解答與回饋' : 'AI 解答與回饋'}
                </Label>
                {isDisplayMode && displayItem?.userAttempt && (
                   <div className="mt-2 space-y-1">
                      <Label htmlFor="history-user-attempt" className="text-sm text-muted-foreground">您的嘗試：</Label>
                      <Textarea
                          id="history-user-attempt"
                          value={displayItem.userAttempt}
                          readOnly
                          rows={3}
                          className="bg-background/50 text-sm whitespace-pre-wrap font-mono"
                          aria-label="歷史中的使用者嘗試"
                      />
                   </div>
                )}
                <Textarea
                  id="solution"
                  value={currentSolution}
                  readOnly
                  rows={isDisplayMode ? 10 : 15}
                  className={`${isDisplayMode ? 'bg-background' : 'bg-accent/5 border-accent focus-visible:ring-accent'} text-base leading-relaxed whitespace-pre-wrap font-mono mt-1`}
                  aria-label="AI 解答與回饋"
                />
              </div>
              {!isDisplayMode && ( // Only show "Solve New Problem" button if not in display mode
                 <Button onClick={handleClearAndSolveNew} variant="outline" className="w-full">
                    <Sparkles className="mr-2 h-5 w-5" />
                    解下一題 / 清除
                 </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          {currentSolution && !isDisplayMode && !(error && !displayItem?.knowledgePoints) && ( 
             <p className="text-sm text-accent font-medium">
               「公子請讀書」已成功解析您的問題！請查看上面的步驟和回饋。相關知識點已更新至「知識小天地」。
             </p>
          )}
           {isDisplayMode && currentSolution && (
             <p className="text-sm text-primary font-medium">
               您正在查看一條歷史解題記錄。
             </p>
           )}
           {!currentSolution && !isLoading && imagePreview && userHasChosenAction && !isDisplayMode && (
             <p className="text-sm text-muted-foreground">
               {userWantsToAttempt ? "完成您的解法後，點擊提交按鈕，或返回上一步。" : "AI 正在處理您的請求..."}
             </p>
           )}
           {!imagePreview && !isDisplayMode && (
             <p className="text-sm text-muted-foreground">
               請先上傳題目圖片以開始。
             </p>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}

