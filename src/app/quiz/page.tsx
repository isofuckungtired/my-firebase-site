
"use client";

import type { ChangeEvent, FormEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from '@/components/ui/progress';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppFooter } from '@/components/layout/app-footer';
import { masterQuestionBank, getThemedQuizQuestions, getAvailableTopics } from '@/lib/question-bank';
import type { QuizQuestion, AnsweredThemedQuizQuestion, ProblemHistoryItem } from '@/types';
import { AlertTriangle, CheckCircle2, FileText, Lightbulb, Loader2, PencilRuler, Undo2, ListChecks, Crown } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth-context';
import { saveProblemHistoryItem } from '@/firebase/firestore-service';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge"; // Added Badge import
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type QuizStep = 'topic-selection' | 'in-progress' | 'results';
const QUESTIONS_PER_THEMED_QUIZ = 5;
const LOCAL_STORAGE_QUIZ_PROGRESS_KEY = 'gongziQuizTopicProgress_v1';

interface TopicProgress {
  score: number;
  totalQuestions: number;
  isPerfect: boolean;
}

export default function ThemedQuizPage() {
  const [quizStep, setQuizStep] = useState<QuizStep>('topic-selection');
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<{ score: number; answeredQuestions: AnsweredThemedQuizQuestion[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [topicProgress, setTopicProgress] = useState<Record<string, TopicProgress>>({});

  const { user } = useAuthContext();
  const { toast } = useToast();

  useEffect(() => {
    setAvailableTopics(getAvailableTopics());
    const storedProgress = localStorage.getItem(LOCAL_STORAGE_QUIZ_PROGRESS_KEY);
    if (storedProgress) {
      try {
        setTopicProgress(JSON.parse(storedProgress));
      } catch (e) {
        console.error("Failed to parse topic progress from localStorage", e);
      }
    }
  }, []);

  const startQuiz = (topic: string) => {
    setIsLoading(true);
    const questions = getThemedQuizQuestions(topic, QUESTIONS_PER_THEMED_QUIZ);
    if (questions.length === 0) {
        toast({ title: "題目不足", description: `「${topic}」主題目前沒有足夠的題目。`, variant: "destructive"});
        setIsLoading(false);
        return;
    }
    setSelectedTopic(topic);
    setCurrentQuiz(questions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    setQuizStep('in-progress');
    setIsLoading(false);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const currentQuestion = useMemo(() => {
    return currentQuiz[currentQuestionIndex];
  }, [currentQuiz, currentQuestionIndex]);

  const goToNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setIsLoading(true);
    let score = 0;
    const answeredQuestions: AnsweredThemedQuizQuestion[] = currentQuiz.map(q => {
      const userAnswerText = userAnswers[q.id] || "";
      let isCorrect = false;
      if (q.questionType === 'single-choice') {
        isCorrect = userAnswerText === q.answer;
      } else {
        isCorrect = userAnswerText.trim().toLowerCase() === q.answer.toLowerCase();
      }
      if (isCorrect) {
        score += 1;
      }
      return { question: q, userAnswerText, isCorrect };
    });

    const currentQuizIsPerfect = score === currentQuiz.length && currentQuiz.length > 0;
    if (selectedTopic) {
      const newTopicProgress = {
        ...topicProgress,
        [selectedTopic]: {
          score: score,
          totalQuestions: currentQuiz.length,
          isPerfect: currentQuizIsPerfect,
        },
      };
      setTopicProgress(newTopicProgress);
      localStorage.setItem(LOCAL_STORAGE_QUIZ_PROGRESS_KEY, JSON.stringify(newTopicProgress));
    }
    
    setQuizResults({ score, answeredQuestions });
    setQuizStep('results');

    if (user) {
      for (const ans of answeredQuestions) {
        if (!ans.isCorrect) {
          const errorItem: ProblemHistoryItem = {
            id: `themedquiz-err-${Date.now()}-${ans.question.id}`,
            problemStatement: ans.question.text,
            solution: `正確答案：${ans.question.answer}。\n解析：${ans.question.explanation}`,
            userAttempt: ans.userAnswerText || "(未作答)",
            timestamp: Date.now(),
            isIncorrectAttempt: true,
            userId: user.uid,
          };
          try {
            await saveProblemHistoryItem(user.uid, errorItem);
          } catch (err) {
            console.error("記錄主題測驗錯題失敗:", err);
          }
        }
      }
      if (answeredQuestions.some(aq => !aq.isCorrect)) {
        toast({
          title: "部分錯題已記錄",
          description: "本次測驗中的錯題已加入您的錯題本。",
        });
      }
    }
    setIsLoading(false);
  };

  const restartQuiz = () => {
    if (selectedTopic) {
      startQuiz(selectedTopic);
    }
  };

  const selectAnotherTopic = () => {
    setQuizStep('topic-selection');
    setSelectedTopic(null);
    setCurrentQuiz([]);
    setUserAnswers({});
    setQuizResults(null);
  };

  if (isLoading && quizStep !== 'results') { // Show loader only when loading quiz, not when submitting to results
    return (
      <SidebarInset className="bg-background">
        <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">載入中...</p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset className="bg-background">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <Card className="shadow-lg w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <PencilRuler className="h-7 w-7 text-primary" />
                數學檢定時間
              </CardTitle>
              {quizStep === 'topic-selection' && <CardDescription>選擇一個主題開始您的數學檢定。主題按鈕上會顯示您上次的答對率。</CardDescription>}
              {quizStep === 'in-progress' && selectedTopic && <CardDescription>主題：{selectedTopic} - 第 {currentQuestionIndex + 1} / {currentQuiz.length} 題</CardDescription>}
              {quizStep === 'results' && selectedTopic && <CardDescription>主題：{selectedTopic} - 檢定結果</CardDescription>}
            </CardHeader>

            <CardContent className="space-y-6">
              {quizStep === 'topic-selection' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableTopics.length > 0 ? availableTopics.map(topic => {
                    const progress = topicProgress[topic];
                    const hasProgress = !!progress && progress.totalQuestions > 0;

                    return (
                      <Button
                        key={topic}
                        variant="outline"
                        size="lg"
                        className="h-auto py-3 text-base flex justify-between items-center w-full"
                        onClick={() => startQuiz(topic)}
                        disabled={isLoading}
                      >
                        <span className="flex items-center gap-1 text-left">
                          {topic}
                          {hasProgress && progress.isPerfect && <Crown className="h-4 w-4 text-yellow-500 shrink-0" />}
                        </span>
                        {hasProgress && (
                          <Badge 
                            variant={progress.isPerfect ? "default" : "secondary"} 
                            className={`text-xs ${progress.isPerfect ? 'bg-yellow-400 hover:bg-yellow-400/90 dark:bg-yellow-500 dark:hover:bg-yellow-500/90 dark:text-yellow-950' : ''}`}
                          >
                            {((progress.score / progress.totalQuestions) * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </Button>
                    );
                  }) : <p className="text-muted-foreground col-span-full text-center">目前沒有可用的測驗主題。</p>}
                </div>
              )}

              {quizStep === 'in-progress' && currentQuestion && (
                <div className="space-y-4">
                  <Card className="bg-card/50 p-6 rounded-lg">
                    <p className="text-lg font-medium mb-3 whitespace-pre-wrap">{currentQuestionIndex + 1}. {currentQuestion.text}</p>
                    {currentQuestion.questionType === 'single-choice' && currentQuestion.options && (
                      <RadioGroup
                        value={userAnswers[currentQuestion.id] || ""}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        className="space-y-2"
                      >
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 cursor-pointer">
                            <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${index}`} />
                            <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="font-normal cursor-pointer flex-1">{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {(currentQuestion.questionType === 'calculation' || currentQuestion.questionType === 'fill-in-the-blank') && (
                      <Input
                        type="text"
                        value={userAnswers[currentQuestion.id] || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        placeholder="請輸入您的答案"
                        className="text-base"
                        autoFocus
                      />
                    )}
                  </Card>
                  <Progress value={((currentQuestionIndex + 1) / currentQuiz.length) * 100} className="w-full h-2" />
                  <Button onClick={goToNextQuestion} className="w-full" size="lg" disabled={isLoading || (!userAnswers[currentQuestion.id] && currentQuestion.questionType !== 'single-choice' )}>
                    {currentQuestionIndex < currentQuiz.length - 1 ? '下一題' : '提交測驗'}
                  </Button>
                </div>
              )}

              {quizStep === 'results' && quizResults && (
                <div className="space-y-6">
                  <Card className="text-center p-6 bg-primary/10">
                    <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                      測驗完成！
                      {currentQuiz.length > 0 && quizResults.score === currentQuiz.length && (
                        <Crown className="h-8 w-8 text-yellow-500" />
                      )}
                    </CardTitle>
                    <p className="text-xl mt-2">
                      您的得分：
                      <span className={`font-bold ${currentQuiz.length > 0 && quizResults.score / currentQuiz.length >= 0.6 ? 'text-green-600' : 'text-red-600'}`}>
                        {quizResults.score} / {currentQuiz.length}
                      </span>
                      {currentQuiz.length > 0 && (
                        <span className="text-lg ml-2 text-muted-foreground">
                          (答對率：{((quizResults.score / currentQuiz.length) * 100).toFixed(0)}%)
                        </span>
                      )}
                    </p>
                  </Card>

                  <Accordion type="multiple" className="w-full space-y-3">
                    <AccordionItem value="summary">
                        <AccordionTrigger className="text-lg font-semibold hover:bg-muted/50 data-[state=open]:bg-primary/10">
                            <div className="flex items-center gap-2"><ListChecks /> 答題詳情與解析</div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-3">
                            {quizResults.answeredQuestions.map((ans, index) => (
                                <Card key={ans.question.id} className={`p-4 ${ans.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-red-500 bg-red-50 dark:bg-red-900/30'}`}>
                                <p className="font-medium mb-1">{index + 1}. {ans.question.text}</p>
                                <p className="text-sm">您的答案：
                                    <span className={ans.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400 font-semibold'}>
                                    {ans.userAnswerText || "(未作答)"}
                                    </span>
                                    {ans.isCorrect ? <CheckCircle2 className="inline ml-1 h-4 w-4 text-green-700 dark:text-green-400" /> : <AlertTriangle className="inline ml-1 h-4 w-4 text-red-700 dark:text-red-400" />}
                                </p>
                                {!ans.isCorrect && (
                                    <p className="text-sm">正確答案：<span className="text-green-700 dark:text-green-400 font-semibold">{ans.question.answer}</span></p>
                                )}
                                <Separator className="my-2" />
                                <div className="flex items-start gap-2 text-sm">
                                    <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                                    <p className="text-muted-foreground whitespace-pre-wrap">{ans.question.explanation}</p>
                                </div>
                                </Card>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={restartQuiz} variant="outline" className="flex-1" disabled={isLoading}>再測一次 ({selectedTopic})</Button>
                    <Button onClick={selectAnotherTopic} className="flex-1" disabled={isLoading}>選擇其他主題</Button>
                  </div>
                </div>
              )}

            </CardContent>
             <CardFooter className="text-xs text-muted-foreground justify-center">
                {quizStep !== 'results' && (
                  <p>仔細思考，祝您取得好成績！</p>
                )}
                {quizStep === 'results' && (
                    <p>溫故而知新，繼續努力！</p>
                )}
            </CardFooter>
          </Card>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}

