'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { TenseProficiencyGrid } from './tense-proficiency-grid';
import { SentenceHistory } from './sentence-history';
import { Flame, BookOpen, Target, GraduationCap, Heart, Clock } from 'lucide-react';
import { useNativeLanguage } from '@/context/language-context';

interface ProgressDashboardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProgressDashboard({ isOpen, onOpenChange }: ProgressDashboardProps) {
  const { user, userStats } = useAuth();
  const { t } = useNativeLanguage();

  if (!user || !userStats) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>My Progress / {t({ hi: 'मेरी प्रगति', bo: 'ངའི་སྙར་གོམས' })}</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Login karein progress dekhne ke liye.</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const quizAccuracy = userStats.totalQuizQuestionsAnswered > 0
    ? Math.round((userStats.totalCorrectAnswers / userStats.totalQuizQuestionsAnswered) * 100)
    : 0;

  const totalTensesPracticed = Object.values(userStats.tensesUsed).filter(v => v > 0).length;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            My Progress / {t({ hi: 'मेरी प्रगति', bo: 'ངའི་སྙར་གོམས' })}
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-6 space-y-5 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-2xl font-bold">{userStats.totalSentencesGenerated}</p>
                <p className="text-[10px] text-muted-foreground">Sentences / {t({ hi: 'वाक्य', bo: 'ཚིག་གྲུབ' })}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                <p className="text-2xl font-bold">{userStats.streak.current}</p>
                <p className="text-[10px] text-muted-foreground">Day Streak / {t({ hi: 'लगातार दिन', bo: 'ཉིན་རྒྱུན' })}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <GraduationCap className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-2xl font-bold">{quizAccuracy}%</p>
                <p className="text-[10px] text-muted-foreground">Quiz Accuracy / {t({ hi: 'सटीकता', bo: 'ཡང་དག' })}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Target className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                <p className="text-2xl font-bold">{totalTensesPracticed}/12</p>
                <p className="text-[10px] text-muted-foreground">Tenses Practiced</p>
              </CardContent>
            </Card>
          </div>

          {/* Tense Proficiency */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Tense Practice Map / {t({ hi: 'टेन्स अभ्यास', bo: 'དུས་སྦྱོང་བརྡར' })}</h3>
            <TenseProficiencyGrid tensesUsed={userStats.tensesUsed} />
          </div>

          {/* History Tabs */}
          <Tabs defaultValue="recent">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="recent" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />Recent
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs">
                <Heart className="mr-1 h-3 w-3" />Favorites
              </TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="mt-3">
              <SentenceHistory maxHeight="300px" />
            </TabsContent>
            <TabsContent value="favorites" className="mt-3">
              <SentenceHistory maxHeight="300px" />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
