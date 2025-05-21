
"use client";

import type { Metadata } from 'next';
import { useEffect, useState } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppFooter } from '@/components/layout/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLeaderboardScores } from '@/firebase/firestore-service';
import type { LeaderboardEntry } from '@/types';
import { Award, Loader2, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// Cannot export metadata from client component
// export const metadata: Metadata = {
//   title: '排行榜 - 公子請讀書',
//   description: '查看快速問答挑戰的最高分記錄。',
// };

export default function LeaderboardPage() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedScores = await getLeaderboardScores(10); // Get top 10 scores
        setScores(fetchedScores);
      } catch (err) {
        console.error("載入排行榜失敗:", err);
        setError("無法載入排行榜資料，請稍後再試。");
      } finally {
        setIsLoading(false);
      }
    };
    fetchScores();
  }, []);

  return (
    <SidebarInset className="bg-background">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Award className="h-7 w-7 text-primary" />
                快速問答排行榜
              </CardTitle>
              <CardDescription>
                挑戰最高分，成為數學達人！此處顯示前十名玩家。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <p className="text-muted-foreground">正在載入排行榜...</p>
                </div>
              )}
              {error && !isLoading && (
                <div className="flex flex-col items-center justify-center py-10 text-destructive">
                  <ShieldAlert className="h-10 w-10 mb-3" />
                  <p className="font-semibold">載入錯誤</p>
                  <p>{error}</p>
                </div>
              )}
              {!isLoading && !error && scores.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="text-lg">排行榜目前是空的。</p>
                  <p>快去挑戰快速問答，爭取第一個上榜吧！</p>
                </div>
              )}
              {!isLoading && !error && scores.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px] text-center">名次</TableHead>
                      <TableHead>玩家名稱</TableHead>
                      <TableHead className="text-right">分數</TableHead>
                      <TableHead className="text-right">日期</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scores.map((entry, index) => (
                      <TableRow key={entry.id || index} className={index < 3 ? 'font-semibold' : ''}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>{entry.displayName}</TableCell>
                        <TableCell className="text-right">{entry.score}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: zhTW })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}
