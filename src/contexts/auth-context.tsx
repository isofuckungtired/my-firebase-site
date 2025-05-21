
"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, firebaseInitialized } from '@/firebase/client';
import { onAuthStateChanged, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: { displayName?: string | null; photoURL?: string | null }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    if (!firebaseInitialized) {
      console.warn("AuthProvider: Firebase 未初始化。身份驗證功能將不可用。");
      setLoading(false);
      return;
    }
    if (!auth) {
      console.warn("AuthProvider: Firebase auth 物件不存在。身份驗證功能將不可用。");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser && window.location.pathname !== '/' && window.location.pathname !== '/register') {
        // If user is logged out and not on login or register page, redirect to login page
        // This check might need refinement depending on public pages.
        // router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]); // Add router to dependency array if used in effect

  const logout = async () => {
    if (!firebaseInitialized || !auth) {
      console.error("登出錯誤：Firebase 未初始化或 auth 物件不存在。");
      return;
    }
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/'); // Redirect to login page after logout
    } catch (error) {
      console.error("登出錯誤:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData: { displayName?: string | null; photoURL?: string | null }) => {
    if (!firebaseInitialized || !auth || !auth.currentUser) {
      throw new Error("使用者未登入或 Firebase 未初始化。");
    }
    await updateProfile(auth.currentUser, profileData);
    if (auth.currentUser) {
       setUser({...auth.currentUser}); 
    }
  };

  if (loading) { // Show loader if still loading
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">正在載入應用程式...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext 必須在 AuthProvider 中使用');
  }
  return context;
}
