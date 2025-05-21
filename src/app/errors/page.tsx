
"use client";

import type { Metadata } from 'next';
import { useEffect, useState, useCallback } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppFooter } from '@/components/layout/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle as ShadcnAlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2, ListX, HelpCircle, FileText, Brain, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/auth-context';
import { loadProblemHistory } from '@/firebase/firestore-service';
import type { ProblemHistoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useProblemHistoryContext } from '@/contexts/problem-history-context';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import { analyzeErrorPatternsAction } from '@/lib/actions';
import type { AnalyzeErrorPatternsOutput } from '@/ai/flows/analyze-error-patterns-flow';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'; // ShadCN Chart components
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'; // Recharts components


const LOCAL_STORAGE_KEY = 'mathBuddyProblemHistory'; 

interface ErrorDistributionChartProps {
  data: { category: string; count: number }[];
}

function ErrorDistributionChart({ data }: ErrorDistributionChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">暫無錯誤分佈數據可供顯示。</p>;
  }

  const chartConfig = {
    count: {
      label: "錯誤數量",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;


  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-lg mx-auto"> {/* Increased min-h for potentially longer labels */}
      <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 20, left: -10, bottom: 60 /* Increased bottom margin */ }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          interval={0} // Show all category labels
          angle={-45} // Angle for better readability
          textAnchor="end"
          // height is now controlled by BarChart's bottom margin
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={5} allowDecimals={false} />
        <ChartTooltip
            cursor={true} 
            content={<ChartTooltipContent indicator="dot" />}
          />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}


export default function ErrorLogPage() {
  const [errorLog, setErrorLog] = useState<ProblemHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { viewProblemInPage } = useProblemHistoryContext();
  const { toast } = useToast();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeErrorPatternsOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const fetchErrorLog = useCallback(async () => {
    if (authLoading) return; 

    setIsLoading(true);
    setFetchError(null);
    let loadedHistory: ProblemHistoryItem[] = [];

    if (user) {
      try {
        loadedHistory = await loadProblemHistory(user.uid);
      } catch (err) {
        console.error("從 Firestore 載入錯題歷史失敗:", err);
        setFetchError("無法從雲端載入您的錯題記錄，將嘗試從本機載入。");
        const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedHistory) {
          try {
            loadedHistory = JSON.parse(storedHistory);
          } catch (e) {
            console.error("解析 localStorage 錯題歷史失敗 (Firestore fallback):", e);
          }
        }
      }
    } else {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedHistory) {
        try {
          loadedHistory = JSON.parse(storedHistory);
        } catch (e) {
          console.error("解析 localStorage 錯題歷史失敗:", e);
        }
      }
    }
    
    const incorrectItems = loadedHistory.filter(item => item.isIncorrectAttempt === true);
    incorrectItems.sort((a, b) => b.timestamp - a.timestamp);
    setErrorLog(incorrectItems);
    setIsLoading(false);
  }, [user, authLoading]);

  useEffect(() => {
    fetchErrorLog();
  }, [fetchErrorLog]);

  const handleViewDetails = (item: ProblemHistoryItem) => {
    viewProblemInPage(item);
    router.push('/solver'); // Navigate to solver page to view details
  };

  const handleAnalyzeErrors = async () => {
    if (errorLog.length === 0) {
      toast({
        title: "沒有可分析的錯題",
        description: "您的錯題本目前是空的。",
        variant: "default",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      const dataForAnalysis = errorLog.map(item => ({
        problem: item.problemStatement || (item.problemImageUri ? "圖片題目" : "未知題目"),
        userAttempt: item.userAttempt || "未作答",
        correctSolution: item.solution,
        knowledgePoints: item.knowledgePoints
      }));
      const problemHistoryJsonString = JSON.stringify(dataForAnalysis);
      
      const result = await analyzeErrorPatternsAction({ problemHistoryJsonString });

      if ('error' in result) {
        setAnalysisError(result.error);
        toast({ title: "分析失敗", description: result.error, variant: "destructive" });
      } else {
        setAnalysisResult(result); // Store the full result object
        toast({ title: "AI 學習弱點分析完成！", className: "bg-accent text-accent-foreground" });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "分析時發生未知錯誤";
      setAnalysisError(errorMessage);
      toast({ title: "分析失敗", description: errorMessage, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };


  if (isLoading || authLoading) {
    return (
      <SidebarInset className="bg-background">
        <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
          <div className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">正在載入錯題本...</p>
          </div>
          <AppFooter />
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset className="bg-background">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-7 w-7 text-destructive" />
                我的錯題本
              </CardTitle>
              <CardDescription>
                這裡記錄了您先前答錯的題目。點擊題目可查看詳情。
                {fetchError && <p className="mt-2 text-sm text-destructive">{fetchError}</p>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={handleAnalyzeErrors} disabled={isAnalyzing || errorLog.length === 0} className="w-full sm:w-auto">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI 分析中...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    AI 學習弱點分析
                  </>
                )}
              </Button>

              {analysisError && !isAnalyzing && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <ShadcnAlertTitle>分析錯誤</ShadcnAlertTitle>
                  <AlertDescription>{analysisError}</AlertDescription>
                </Alert>
              )}

              {analysisResult && !isAnalyzing && (
                <Card className="mt-4 bg-primary/5 border-primary/30 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Brain className="h-6 w-6" />
                      AI 學習分析與建議
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h3 className="font-semibold text-base">文字總結：</h3>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed bg-card p-3 rounded-md border">
                      {analysisResult.summary}
                    </p>

                    {analysisResult.weakestTopics && analysisResult.weakestTopics.length > 0 && (
                      <>
                        <Separator className="my-3" />
                        <h3 className="font-semibold text-base">主要薄弱主題：</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.weakestTopics.map((topic, index) => (
                            <span key={index} className="text-xs font-medium bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {analysisResult.errorDistribution && analysisResult.errorDistribution.length > 0 && (
                       <>
                        <Separator className="my-3" />
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                           <BarChart3 className="h-5 w-5" />
                           常見錯誤類型分佈：
                        </h3>
                        <ErrorDistributionChart data={analysisResult.errorDistribution} />
                       </>
                    )}
                  </CardContent>
                   <CardFooter>
                        <p className="text-xs text-muted-foreground">以上為 AI 根據您的錯題記錄提供的分析，僅供參考。</p>
                   </CardFooter>
                </Card>
              )}
              
              <Separator />

              {errorLog.length === 0 && !fetchError && (
                <div className="text-center py-10 text-muted-foreground">
                  <ListX className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg">太棒了！目前沒有錯題記錄。</p>
                  <p>繼續努力，保持這個好成績！</p>
                </div>
              )}
              {errorLog.length > 0 && (
                 <Accordion type="multiple" className="w-full space-y-3">
                  {errorLog.map((item) => (
                    <AccordionItem value={item.id} key={item.id} className="border rounded-lg shadow-sm overflow-hidden bg-card">
                      <AccordionTrigger className="text-sm font-semibold px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-destructive/10">
                        <div className="flex items-center gap-3 w-full">
                           {item.problemImageUri ? (
                            <div className="relative w-16 h-12 rounded overflow-hidden border shrink-0 bg-muted">
                              <Image src={item.problemImageUri} alt={`錯題 ${item.id}`} layout="fill" objectFit="contain" data-ai-hint="math equation" />
                            </div>
                          ) : item.problemStatement ? (
                            <div className="w-16 h-12 flex items-center justify-center rounded border bg-muted shrink-0 p-1 text-center overflow-hidden">
                               <FileText className="h-7 w-7 text-muted-foreground shrink-0" />
                            </div>
                          ) : (
                             <div className="w-16 h-12 flex items-center justify-center rounded border bg-muted shrink-0">
                                <HelpCircle className="h-8 w-8 text-muted-foreground" />
                             </div>
                          )}
                          <div className="flex-1 text-left overflow-hidden">
                             <p className="text-xs text-muted-foreground">
                                {new Date(item.timestamp).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                             </p>
                             <p className="truncate text-sm font-medium">
                                {item.problemStatement || (item.solution ? `解題摘要: ${item.solution.substring(0, 30)}...` : "題目詳情")}
                             </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3 pt-2 space-y-2 text-sm">
                        {item.userAttempt && (
                            <p><strong>您的錯誤嘗試：</strong> <span className="text-destructive">{item.userAttempt}</span></p>
                        )}
                        <p><strong>AI 解析摘要：</strong> <span className="text-muted-foreground whitespace-pre-wrap">{item.solution.substring(0, 200)}...</span></p>
                        {item.knowledgePoints && (
                           <p><strong>相關知識點：</strong> <span className="text-blue-600 dark:text-blue-400">{item.knowledgePoints.substring(0,100)}...</span></p>
                        )}
                        <Separator className="my-2"/>
                        <Button onClick={() => handleViewDetails(item)} variant="outline" size="sm" className="w-full">
                          查看完整題目與解析
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}

