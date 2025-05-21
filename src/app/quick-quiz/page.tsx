
"use client";

import type { ChangeEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppFooter } from '@/components/layout/app-footer';
import { getRandomQuestion, TOTAL_QUICK_QUIZ_QUESTIONS, TIME_PER_QUICK_QUIZ_QUESTION } from '@/lib/question-bank';
import type { QuizQuestion, AnsweredQuizQuestion, LeaderboardEntry, ProblemHistoryItem } from '@/types';
import { Zap, AlertTriangle, CheckCircle2, RotateCcw, TimerIcon, Target, HelpCircle, ChevronDown, ChevronUp, Award, FileText } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth-context';
import { addScoreToLeaderboard, saveProblemHistoryItem } from '@/firebase/firestore-service';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';


type QuizState = 'idle' | 'playing' | 'question_answered' | 'finished';

const SCORE_CORRECT = 100;
const MAX_TIME_BONUS_SECONDS = 10;
const SCORE_TIME_BONUS_PER_SECOND = 10;


export default function QuickQuizPage() {
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState(0);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [allAnsweredQuestions, setAllAnsweredQuestions] = useState<AnsweredQuizQuestion[]>([]);
  
  const [timeLeftForQuestion, setTimeLeftForQuestion] = useState(TIME_PER_QUICK_QUIZ_QUESTION);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | 'timeout'; message: string } | null>(null);
  const [isSubmittingToLeaderboard, setIsSubmittingToLeaderboard] = useState(false);

  const { user } = useAuthContext();
  const { toast } = useToast();

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (quizState === 'playing' && currentQuestion) {
      setTimeLeftForQuestion(TIME_PER_QUICK_QUIZ_QUESTION); 
      setQuestionStartTime(Date.now());
      timerInterval = setInterval(() => {
        setTimeLeftForQuestion(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            handleAnswerSubmit(true); 
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, quizState]);


  const loadNextQuestion = useCallback(() => {
    setUserAnswer('');
    setFeedback(null);
    const nextQ = getRandomQuestion(answeredQuestionIds);
    if (nextQ && questionsAnsweredCount < TOTAL_QUICK_QUIZ_QUESTIONS) {
      setCurrentQuestion(nextQ);
      setQuizState('playing');
    } else {
      setQuizState('finished');
      if (user && score > 0) { 
        submitScoreToLeaderboard();
      }
    }
  }, [answeredQuestionIds, questionsAnsweredCount, user, score]); // Added user and score dependencies for submitScoreToLeaderboard

  const startQuiz = useCallback(() => {
    setScore(0);
    setQuestionsAnsweredCount(0);
    setAnsweredQuestionIds([]);
    setAllAnsweredQuestions([]);
    loadNextQuestion();
  }, [loadNextQuestion]);

  const handleAnswerChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
  };

  const handleAnswerSubmit = async (timeout: boolean = false) => {
    if (!currentQuestion || quizState !== 'playing') return; 
    
    setQuizState('question_answered'); 

    const timeTaken = timeout ? TIME_PER_QUICK_QUIZ_QUESTION : Math.max(0, (Date.now() - questionStartTime) / 1000);
    let awardedScore = 0;
    let isCorrect = false;
    
    if (timeout) {
      setFeedback({ type: 'timeout', message: `時間到！正確答案是：${currentQuestion.answer}` });
    } else if (userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()) {
      isCorrect = true;
      awardedScore = SCORE_CORRECT;
      if (timeTaken <= MAX_TIME_BONUS_SECONDS) {
        awardedScore += Math.floor((MAX_TIME_BONUS_SECONDS - timeTaken) * SCORE_TIME_BONUS_PER_SECOND);
      }
      setFeedback({ type: 'correct', message: `答對了！獲得 ${awardedScore} 分！` });
    } else {
      setFeedback({ type: 'incorrect', message: `答錯了。正確答案是：${currentQuestion.answer}` });
    }
    
    setScore(prevScore => prevScore + awardedScore);
    setQuestionsAnsweredCount(prevCount => prevCount + 1);
    setAnsweredQuestionIds(prevIds => [...prevIds, currentQuestion.id]); 
    const answeredQuestionDetail: AnsweredQuizQuestion = { question: currentQuestion, userAnswer: userAnswer, isCorrect, scoreAwarded: awardedScore, timeTaken };
    setAllAnsweredQuestions(prev => [...prev, answeredQuestionDetail]);

    if (!isCorrect && user && currentQuestion) {
      const errorItem: ProblemHistoryItem = {
        id: `quiz-err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        problemStatement: currentQuestion.text,
        solution: `正確答案：${currentQuestion.answer}。解析：${currentQuestion.explanation}`,
        userAttempt: userAnswer.trim() || (timeout ? "(超時未作答)" : "(未作答)"),
        timestamp: Date.now(),
        isIncorrectAttempt: true,
        userId: user.uid,
        problemImageUri: undefined,
        knowledgePoints: undefined,
      };
      try {
        await saveProblemHistoryItem(user.uid, errorItem);
        toast({
          title: "錯題已記錄",
          description: "這題的錯誤已記錄到您的錯題本。",
          variant: "default",
        });
      } catch (err) {
        console.error("記錄快速問答錯題到 Firestore 失敗:", err);
        toast({
          title: "記錄錯題失敗",
          description: "無法將此錯題記錄到雲端錯題本。",
          variant: "destructive",
        });
      }
    }

    setTimeout(() => {
      if (questionsAnsweredCount + 1 < TOTAL_QUICK_QUIZ_QUESTIONS) {
        loadNextQuestion();
      } else {
        setQuizState('finished');
        if (user && (score + awardedScore) > 0) { 
           submitScoreToLeaderboard(score + awardedScore); 
        }
      }
    }, 2000); 
  };

  const submitScoreToLeaderboard = async (finalScore?: number) => {
    if (!user) return;
    setIsSubmittingToLeaderboard(true);
    const currentScore = finalScore !== undefined ? finalScore : score; 

    const displayName = user.displayName || user.email?.split('@')[0] || '匿名玩家';
    const entry: LeaderboardEntry = {
      userId: user.uid,
      displayName,
      score: currentScore,
      timestamp: Date.now(),
    };
    try {
      await addScoreToLeaderboard(entry);
      toast({
        title: '分數已提交',
        description: '您的分數已成功記錄到排行榜！',
        variant: 'default',
         className: 'bg-accent text-accent-foreground',
      });
    } catch (error) {
      console.error("提交分數到排行榜失敗:", error);
      toast({
        title: '提交失敗',
        description: '記錄分數到排行榜時發生錯誤。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingToLeaderboard(false);
    }
  };
  
  const resetQuiz = () => {
    setQuizState('idle');
    setCurrentQuestion(null);
    setAllAnsweredQuestions([]); 
  };

  const incorrectAnswers = allAnsweredQuestions.filter(aq => !aq.isCorrect);

  return (
    <SidebarInset className="bg-background">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
          <Card className="w-full max-w-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="h-7 w-7 text-primary" />
                快速問答挑戰
              </CardTitle>
              <CardDescription>測試您的數學反應速度！每題 {TIME_PER_QUICK_QUIZ_QUESTION} 秒。</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {quizState === 'idle' && (
                <div className="text-center py-10">
                  <p className="mb-6 text-lg">準備好開始了嗎？您將有 {TOTAL_QUICK_QUIZ_QUESTIONS} 道題目需要回答。</p>
                  <Button onClick={startQuiz} size="lg">
                    開始挑戰！
                  </Button>
                </div>
              )}

              {(quizState === 'playing' || quizState === 'question_answered') && currentQuestion && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">第 {questionsAnsweredCount + (quizState === 'question_answered' ? 0 : 1)} / {TOTAL_QUICK_QUIZ_QUESTIONS} 題</p>
                    <p className="text-lg font-semibold text-primary">總分: {score}</p>
                  </div>
                  
                  <Card className="bg-card/50 p-6 rounded-lg">
                    <p className="text-xl font-medium text-center mb-2">{currentQuestion.text}</p>
                     {quizState === 'playing' && (
                        <div className="mt-2">
                            <Progress value={(timeLeftForQuestion / TIME_PER_QUICK_QUIZ_QUESTION) * 100} className="w-full h-2" />
                            <p className="text-xs text-center text-muted-foreground mt-1">剩餘時間: {timeLeftForQuestion} 秒</p>
                        </div>
                     )}
                  </Card>

                  {quizState === 'playing' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleAnswerSubmit(); }} className="space-y-4">
                      <div>
                        <Label htmlFor="user-answer" className="text-base">您的答案：</Label>
                        <Input
                          id="user-answer"
                          type="text"
                          value={userAnswer}
                          onChange={handleAnswerChange}
                          placeholder="請輸入答案"
                          className="mt-1 text-lg"
                          autoFocus
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg">提交答案</Button>
                    </form>
                  )}
                  
                  {quizState === 'question_answered' && feedback && (
                    <div className={`p-4 rounded-md text-center ${
                      feedback.type === 'correct' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                      feedback.type === 'incorrect' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {feedback.type === 'correct' && <CheckCircle2 className="inline-block mr-2 h-5 w-5" />}
                      {feedback.type === 'incorrect' && <AlertTriangle className="inline-block mr-2 h-5 w-5" />}
                      {feedback.type === 'timeout' && <TimerIcon className="inline-block mr-2 h-5 w-5" />}
                      {feedback.message}
                    </div>
                  )}
                </div>
              )}

              {quizState === 'finished' && (
                <div className="text-center py-6 space-y-4">
                  <h2 className="text-2xl font-bold text-primary">挑戰結束！</h2>
                  <p className="text-xl">您的最終得分是：<span className="font-bold text-accent">{score}</span> 分</p>
                  <p className="text-muted-foreground">共回答了 {questionsAnsweredCount} 道題目。</p>
                  {isSubmittingToLeaderboard && <p className="text-sm text-muted-foreground">正在提交分數至排行榜...</p>}
                  
                  {incorrectAnswers.length > 0 && (
                    <Card className="mt-6 text-left">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <HelpCircle className="h-6 w-6 text-destructive" />
                          錯題回顧與解析
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="multiple" className="w-full space-y-2">
                          {incorrectAnswers.map((ans, index) => (
                            <AccordionItem value={`incorrect-${index}`} key={`incorrect-${index}`} className="border rounded-md shadow-sm overflow-hidden">
                              <AccordionTrigger className="text-sm font-semibold px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-destructive/10">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                                  <span className="truncate">題目：{ans.question.text.substring(0,30)}...</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-3 pt-2 space-y-2 bg-card text-sm">
                                <p><strong>您的答案：</strong> <span className="text-destructive">{ans.userAnswer || "(未作答)"}</span></p>
                                <p><strong>正確答案：</strong> <span className="text-green-600">{ans.question.answer}</span></p>
                                <Separator className="my-2" />
                                <p><strong>解析：</strong></p>
                                <p className="text-muted-foreground whitespace-pre-wrap">{ans.question.explanation}</p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  )}

                  <Button onClick={resetQuiz} size="lg" variant="outline" className="mt-4">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    再玩一次
                  </Button>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="text-xs text-muted-foreground justify-center">
              <Target className="mr-1 h-3 w-3" /> 快速反應，爭取高分！
            </CardFooter>
          </Card>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}
