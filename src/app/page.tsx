
"use client";

// This is now the Login Page, content copied from src/app/login/page.tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/client';
import { useToast } from '@/hooks/use-toast';

import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppFooter } from '@/components/layout/app-footer';
import { LogIn, Loader2 } from 'lucide-react';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email({ message: "請輸入有效的電子郵件地址。" }),
  password: z.string().min(6, { message: "密碼至少需要6個字元。" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPageAsHome() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "登入成功",
        description: "歡迎回來！",
      });
      router.push('/solver'); // Redirect to the solver page after login
    } catch (error: any) {
      console.error("登入錯誤:", error);
      let errorMessage = "登入失敗，請檢查您的帳號或密碼。";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "電子郵件或密碼錯誤。";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "電子郵件格式不正確。";
      }
      toast({
        title: "登入失敗",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarInset className="bg-background">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <LogIn className="h-7 w-7 text-primary" />
                登入公子請讀書
              </CardTitle>
              <CardDescription>輸入您的憑證以繼續。</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">電子郵件</FormLabel>
                        <FormControl>
                          <Input id="email" type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="password">密碼</FormLabel>
                        <FormControl>
                          <Input id="password" type="text" placeholder="" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        登入中...
                      </>
                    ) : (
                      "登入"
                    )}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    還沒有帳戶？{' '}
                    <Link href="/register" className="font-medium text-primary hover:underline">
                      立即註冊
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}
