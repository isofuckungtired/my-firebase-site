
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, type User } from 'firebase/auth';
import { auth, db } from '@/firebase/client'; 
import { doc, setDoc } from "firebase/firestore"; 
import { useToast } from '@/hooks/use-toast';

import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppFooter } from '@/components/layout/app-footer';
import { UserPlus, Loader2 } from 'lucide-react';
import { useState } from 'react';

const registerSchema = z.object({
  email: z.string().email({ message: "請輸入有效的電子郵件地址。" }),
  password: z.string().min(6, { message: "密碼至少需要6個字元。" }),
  confirmPassword: z.string().min(6, { message: "確認密碼至少需要6個字元。" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "密碼與確認密碼不相符。",
  path: ["confirmPassword"], 
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true);
    let firebaseUser: User | null = null;

    try {
      console.log("[Auth] 準備建立 Firebase Auth 使用者...");
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      firebaseUser = userCredential.user;
      console.log("[Auth] Firebase Auth 使用者已建立:", firebaseUser.uid);

      if (firebaseUser) {
        const userDocData = {
          email: firebaseUser.email,
          createdAt: new Date(),
          // 您可以在這裡加入更多使用者初始資料，例如 displayName: firebaseUser.email?.split('@')[0] || '新使用者'
        };
        console.log(`[Firestore] 準備在 users/${firebaseUser.uid} 建立使用者文件:`, userDocData);
        await setDoc(doc(db, "users", firebaseUser.uid), userDocData);
        console.log("[Firestore] 使用者文件已成功建立。");
      }

      toast({
        title: "註冊成功",
        description: "您的帳戶已建立，歡迎加入公子請讀書！",
      });
      router.push('/solver'); // Redirect to solver page after registration

    } catch (error: any) {
      console.error("註冊過程中發生錯誤:", error);
      if (firebaseUser && error.code && error.code.startsWith('firestore/')) { // Firestore 錯誤
        toast({
          title: "帳號已建立但設定檔儲存失敗",
          description: `您的帳戶已建立，但儲存個人資料時發生 Firestore 錯誤：${error.message} 請檢查 Firestore 安全規則。`,
          variant: "destructive",
          duration: 9000,
        });
        router.push('/solver'); 
      } else if (error.code && error.code.startsWith('auth/')) { // Firebase Auth 錯誤
        let errorMessage = "註冊失敗，請稍後再試。";
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = "此電子郵件地址已被註冊。";
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = "電子郵件格式不正確。";
        } else if (error.code === 'auth/weak-password') {
          errorMessage = "密碼強度不足，請使用更強的密碼。";
        }
        toast({
          title: "註冊失敗",
          description: errorMessage,
          variant: "destructive",
        });
      } else { // 其他未知錯誤
         toast({
          title: "註冊失敗",
          description: `發生未知錯誤: ${error.message}`,
          variant: "destructive",
        });
      }
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
                <UserPlus className="h-7 w-7 text-primary" />
                建立您的帳戶
              </CardTitle>
              <CardDescription>開始您的學習之旅。</CardDescription>
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
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="confirm-password">確認密碼</FormLabel>
                        <FormControl>
                          <Input id="confirm-password" type="text" placeholder="" {...field} disabled={isLoading} />
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
                        註冊中...
                      </>
                    ) : (
                      "註冊"
                    )}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    已經有帳戶了？{' '}
                    <Link href="/" className="font-medium text-primary hover:underline"> {/* Link to new login page at / */}
                      前往登入
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
