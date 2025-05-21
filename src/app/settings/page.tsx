
"use client";

import type { Metadata } from 'next';
import { useState, useEffect, type ChangeEvent, useCallback } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppFooter } from '@/components/layout/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthContext } from '@/contexts/auth-context';
import { useFocusTimerContext } from '@/contexts/focus-timer-context';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Timer, LogOut, Save, Settings as SettingsIcon, Bell, Palette, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Theme = "light" | "dark";

export default function SettingsPage() {
  const { user, logout, loading: authLoading, updateUserProfile } = useAuthContext();
  const { 
    focusDuration, 
    breakDuration, 
    setFocusDuration, 
    setBreakDuration,
    isRunning: timerIsRunning
  } = useFocusTimerContext();
  const { toast } = useToast();
  const router = useRouter();

  const [localFocusMinutes, setLocalFocusMinutes] = useState(focusDuration / 60);
  const [localBreakMinutes, setLocalBreakMinutes] = useState(breakDuration / 60);
  const [displayName, setDisplayName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [theme, setTheme] = useState<Theme>('light'); // Default to light

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    } else {
      setDisplayName('');
    }
  }, [user]);

  useEffect(() => {
    setLocalFocusMinutes(focusDuration / 60);
    setLocalBreakMinutes(breakDuration / 60);
  }, [focusDuration, breakDuration]);

  // Theme logic
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setTheme(storedTheme);
    } else {
      // If no valid theme is stored, or 'system' was stored, default to 'light'
      setTheme('light');
      localStorage.setItem("theme", 'light');
    }
  }, []);

  const applyTheme = useCallback((selectedTheme: Theme) => {
    if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else { // light
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme, applyTheme]);


  const handleFocusDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalFocusMinutes(Number(e.target.value));
  };

  const handleBreakDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalBreakMinutes(Number(e.target.value));
  };

  const handleSaveTimerSettings = () => {
    if (timerIsRunning) {
      toast({
        title: "設定失敗",
        description: "請先暫停或重設計時器後再修改時長。",
        variant: "destructive",
      });
      return;
    }
    if (localFocusMinutes > 0) {
      setFocusDuration(localFocusMinutes);
    }
    if (localBreakMinutes > 0) {
      setBreakDuration(localBreakMinutes);
    }
    toast({
      title: "設定已儲存",
      description: "專注計時器時長已更新。",
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await updateUserProfile({ displayName });
      toast({
        title: "個人資料已更新",
        description: "您的顯示名稱已成功儲存。",
      });
    } catch (error: any) {
      toast({
        title: "更新失敗",
        description: error.message || "無法更新您的個人資料。",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: '已登出',
        description: '您已成功登出。正在跳轉至首頁...',
      });
      router.push('/');
    } catch (error) {
      toast({
        title: '登出失敗',
        description: '登出時發生錯誤，請稍後再試。',
        variant: 'destructive',
      });
    }
  };
  
  if (authLoading && !user) {
    return (
       <SidebarInset className="bg-background">
        <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
          <div className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
            <p className="text-muted-foreground">正在載入設定...</p>
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
              <CardTitle className="flex items-center gap-2 text-2xl">
                <SettingsIcon className="h-7 w-7 text-primary" />
                應用程式設定
              </CardTitle>
              <CardDescription>
                管理您的帳戶資訊和應用程式偏好設定。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* User Profile Section */}
              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <UserCircle className="h-6 w-6 text-primary/80" />
                  使用者資訊
                </h2>
                {user ? (
                  <div className="space-y-4">
                    <p className="text-sm"><strong>電子郵件:</strong> {user.email}</p>
                    <div>
                      <Label htmlFor="displayName" className="text-base">顯示名稱</Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="輸入您的顯示名稱"
                        className="mt-1 w-full sm:w-60"
                        disabled={isSavingProfile}
                      />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={isSavingProfile || (!displayName && !user.displayName)}>
                      {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      儲存個人資料
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">您目前未登入。</p>
                )}
              </section>

              <Separator />

              {/* Appearance Settings Section */}
              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Palette className="h-6 w-6 text-primary/80" />
                  外觀主題設定
                </h2>
                <RadioGroup value={theme} onValueChange={(newTheme) => setTheme(newTheme as Theme)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">淺色模式</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">深色模式</Label>
                  </div>
                </RadioGroup>
              </section>

              <Separator />

              {/* Focus Timer Settings Section */}
              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Timer className="h-6 w-6 text-primary/80" />
                  專注計時器設定
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="focus-minutes" className="text-base">專注時長 (分鐘)</Label>
                    <Input
                      id="focus-minutes"
                      type="number"
                      min="1"
                      value={localFocusMinutes}
                      onChange={handleFocusDurationChange}
                      className="mt-1 w-full sm:w-40"
                      disabled={timerIsRunning}
                    />
                     {timerIsRunning && <p className="text-xs text-destructive mt-1">計時器運行中，無法修改時長。</p>}
                  </div>
                  <div>
                    <Label htmlFor="break-minutes" className="text-base">休息時長 (分鐘)</Label>
                    <Input
                      id="break-minutes"
                      type="number"
                      min="1"
                      value={localBreakMinutes}
                      onChange={handleBreakDurationChange}
                      className="mt-1 w-full sm:w-40"
                      disabled={timerIsRunning}
                    />
                  </div>
                  <Button onClick={handleSaveTimerSettings} disabled={timerIsRunning}>
                    <Save className="mr-2 h-4 w-4" />
                    儲存計時器設定
                  </Button>
                </div>
              </section>
              
              <Separator />

              {/* Notification Settings Placeholder */}
              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Bell className="h-6 w-6 text-primary/80" />
                  通知設定
                </h2>
                <p className="text-muted-foreground text-sm">(此功能開發中，敬請期待)</p>
              </section>

              {user && (
                <>
                  <Separator />
                  <section>
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      帳號管理
                    </h2>
                    <Button variant="destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      登出帳號
                    </Button>
                  </section>
                </>
              )}
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">設定變更會自動儲存或在點擊儲存按鈕後生效。</p>
            </CardFooter>
          </Card>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}
