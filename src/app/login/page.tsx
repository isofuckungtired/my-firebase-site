
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarInset } from '@/components/ui/sidebar'; 
import { AppFooter } from '@/components/layout/app-footer'; 

export default function LoginPageRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/'); // Redirect to the new main login page at root
  }, [router]);

  return (
    <SidebarInset className="bg-background">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">正在重導向至登入頁面...</p>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}
