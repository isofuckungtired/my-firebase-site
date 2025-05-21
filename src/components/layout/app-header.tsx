
"use client";

import { UserCircle2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { CustomBookOpenIcon } from '@/components/icons/custom-book-open-icon';
import { useRouter } from 'next/navigation'; // Added for potential programmatic navigation

export function AppHeader() {
  const { user, logout, loading } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: '已登出',
        description: '您已成功登出。', 
      });
      // AuthContext's logout already handles router.push('/')
    } catch (error) {
      toast({
        title: '登出失敗',
        description: '登出時發生錯誤，請稍後再試。',
        variant: 'destructive',
      });
    }
  };

  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || '';

  return (
    <header className="bg-card border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <Link href={user ? "/solver" : "/"} className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <CustomBookOpenIcon className="h-7 w-7 text-primary fill-white" />
            <h1 className="text-xl sm:text-2xl font-bold">公子請讀書</h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {loading ? (
            <Button variant="ghost" size="icon" disabled>
              <UserCircle2 className="h-6 w-6 animate-pulse" />
            </Button>
          ) : user ? (
            <>
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline truncate max-w-xs" title={userDisplayName}>
                {userDisplayName}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="登出">
                <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/" legacyBehavior passHref>
                  <a>登入</a>
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register" legacyBehavior passHref>
                  <a>註冊</a>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
