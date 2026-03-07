'use client';

import React, { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { LogIn, LogOut, Target, GraduationCap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthButtonProps {
  onOpenProgress?: () => void;
  onOpenQuiz?: () => void;
}

export function AuthButton({ onOpenProgress, onOpenQuiz }: AuthButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    if (!auth) {
      toast({
        title: 'Login Error',
        description: 'Firebase is not initialized. Please check configuration.',
        variant: 'destructive',
      });
      return;
    }

    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Sign-in error:", error);

      const errorCode = error?.code || 'unknown';
      const errorMessage = error?.message || 'Unknown error';

      let userMessage = '';

      switch (errorCode) {
        case 'auth/popup-blocked':
          userMessage = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
          break;
        case 'auth/popup-closed-by-user':
          userMessage = 'Sign-in popup was closed. Please try again.';
          break;
        case 'auth/cancelled-popup-request':
          userMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/operation-not-allowed':
          userMessage = 'Google Sign-In is not enabled in Firebase Console. Please enable it in Firebase Console → Authentication → Sign-in method → Google.';
          break;
        case 'auth/unauthorized-domain':
          userMessage = 'This domain is not authorized for Firebase Auth. Add your domain in Firebase Console → Authentication → Settings → Authorized domains.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/internal-error':
          userMessage = 'Firebase internal error. Please check Firebase Console configuration.';
          break;
        default:
          userMessage = `Sign-in failed: ${errorCode} - ${errorMessage}`;
      }

      toast({
        title: 'Login Failed',
        description: userMessage,
        variant: 'destructive',
        duration: 10000, // Show for 10 seconds so user can read it
      });
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been signed out successfully.',
      });
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" disabled className="h-9 w-9 sm:h-auto sm:w-auto sm:px-3">
              <LogIn className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Login is disabled: Firebase keys are not configured.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {onOpenProgress && (
            <DropdownMenuItem onClick={onOpenProgress} className="py-2.5">
              <Target className="mr-2 h-4 w-4" />
              <span>My Progress / मेरी प्रगति</span>
            </DropdownMenuItem>
          )}
          {onOpenQuiz && (
            <DropdownMenuItem onClick={onOpenQuiz} className="py-2.5">
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Practice Quiz / अभ्यास क्विज़</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="py-2.5">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      variant="outline"
      className="h-9 w-9 sm:h-auto sm:w-auto sm:px-3"
      disabled={signingIn}
    >
      {signingIn ? (
        <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4 sm:mr-2" />
      )}
      <span className="hidden sm:inline">{signingIn ? 'Signing in...' : 'Login'}</span>
    </Button>
  );
}
