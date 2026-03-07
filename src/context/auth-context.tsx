'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, getRedirectResult, User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import { createOrUpdateUserProfile, getUserStats, updateStreak } from '@/lib/firestore-service';
import type { UserStats } from '@/types/firestore-types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userStats: UserStats | null;
  refreshStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const refreshStats = useCallback(async () => {
    if (!user) return;
    const stats = await getUserStats(user.uid);
    if (stats) setUserStats(stats);
  }, [user]);

  // Handle redirect result (for mobile sign-in)
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      getRedirectResult(auth).catch((error) => {
        console.error("Redirect result error:", error);
      });
    }
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          // Initialize/update profile on login
          try {
            await createOrUpdateUserProfile(firebaseUser.uid, {
              displayName: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
            });
            await updateStreak(firebaseUser.uid);
            const stats = await getUserStats(firebaseUser.uid);
            if (stats) setUserStats(stats);
          } catch (e) {
            console.error('Error initializing user profile:', e);
          }
        } else {
          setUserStats(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Auth observer error:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userStats, refreshStats }}>
      {loading ? (
        <div className="h-screen flex items-center justify-center bg-background">
          <LoadingSpinner />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
