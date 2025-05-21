
"use client";

import { useFocusTimerContext } from '@/contexts/focus-timer-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Play, Pause, RotateCcw, Target, Coffee, Brain, Award } from 'lucide-react'; // Added Award
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ChangeEvent } from 'react';

export function FocusTimer() {
  const {
    timeLeft,
    isRunning,
    isBreakTime,
    problemsSolvedThisSession,
    focusDuration,
    breakDuration,
    totalFocusTime, // Added
    startTimer,
    pauseTimer,
    resetTimer,
    setFocusDuration,
    setBreakDuration,
    currentModeDisplay,
  } = useFocusTimerContext();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (totalSeconds: number) => {
    if (totalSeconds < 0) totalSeconds = 0; // Ensure non-negative
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let parts = [];
    if (hours > 0) parts.push(`${hours}小時`);
    if (minutes > 0 || (hours > 0 && minutes === 0) ) parts.push(`${minutes}分鐘`); // Show minutes if hours exist or minutes > 0
    if (hours === 0 && minutes === 0 && seconds === 0) return '0秒';
    if (seconds > 0 || (hours === 0 && minutes === 0)) parts.push(`${seconds}秒`); // Show seconds if it's the only unit or > 0
    
    return parts.join(' ') || '0秒';
  };


  const handleFocusDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setFocusDuration(val);
    }
  };

  const handleBreakDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setBreakDuration(val);
    }
  };

  return (
    <Card className="my-2 shadow-md">
      <CardHeader className="p-3">
        <CardTitle className="flex items-center text-base gap-2">
          {isBreakTime ? <Coffee className="h-5 w-5 text-green-500" /> : <Timer className="h-5 w-5 text-primary" />}
          專注計時器
        </CardTitle>
        <CardDescription className="text-xs">
          {currentModeDisplay} - {formatTime(timeLeft)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-around gap-2">
          {isRunning ? (
            <Button onClick={pauseTimer} variant="outline" size="sm" className="flex-1">
              <Pause className="mr-1 h-4 w-4" /> 暫停
            </Button>
          ) : (
            <Button onClick={startTimer} variant="outline" size="sm" className="flex-1">
              <Play className="mr-1 h-4 w-4" /> 開始
            </Button>
          )}
          <Button onClick={() => resetTimer(true)} variant="outline" size="sm" className="flex-1">
            <RotateCcw className="mr-1 h-4 w-4" /> 重設
          </Button>
        </div>
        
        <Separator />

        <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
                <Label htmlFor="focus-duration" className="whitespace-nowrap">專注(分):</Label>
                <Input 
                    id="focus-duration" 
                    type="number" 
                    min="1"
                    value={focusDuration / 60} 
                    onChange={handleFocusDurationChange}
                    className="h-7 text-xs px-2 py-1 w-full"
                    disabled={isRunning}
                />
            </div>
            <div className="flex items-center gap-2">
                <Label htmlFor="break-duration" className="whitespace-nowrap">休息(分):</Label>
                <Input 
                    id="break-duration" 
                    type="number" 
                    min="1"
                    value={breakDuration / 60} 
                    onChange={handleBreakDurationChange}
                    className="h-7 text-xs px-2 py-1 w-full"
                    disabled={isRunning}
                />
            </div>
        </div>
        
        <Separator />
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1">
            <Target className="h-4 w-4 text-accent shrink-0" />
            <span>已解決題目 (本工作階段): {problemsSolvedThisSession}</span>
          </p>
          <p className="flex items-center gap-1">
            <Award className="h-4 w-4 text-yellow-500 shrink-0" />
            <span>總累計專注: {formatTotalTime(totalFocusTime)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
