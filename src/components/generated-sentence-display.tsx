// src/components/generated-sentence-display.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, BookOpen, Clock, Info } from 'lucide-react';
import { InteractiveSentence } from './interactive-sentence';
import type { WordPos } from '@/types/ai-types';

// Tense-specific educational tips about time usage (Hindi + English)
const TENSE_TIME_TIPS: Record<string, { label: string; tip: string; hindiTip: string }> = {
  "Present Perfect Continuous": {
    label: "⏱️ Time Reference Required / समय संदर्भ ज़रूरी है",
    tip: "This tense MUST have a time reference: use 'since' (point in time) or 'for' (duration).",
    hindiTip: "इस tense में 'since' (समय बिंदु, जैसे: since morning) या 'for' (अवधि, जैसे: for 2 hours) लगाना ज़रूरी है।",
  },
  "Past Perfect Continuous": {
    label: "⏱️ Time Reference Required / समय संदर्भ ज़रूरी है",
    tip: "This tense MUST have a time reference: use 'since' or 'for' to show duration.",
    hindiTip: "इस tense में 'since' या 'for' से समय अवधि बतानी ज़रूरी है। जैसे: since childhood, for three years.",
  },
  "Future Perfect Continuous": {
    label: "⏱️ Time Reference Required / समय संदर्भ ज़रूरी है",
    tip: "This tense MUST have a time duration with a deadline: use 'for...by...'.",
    hindiTip: "इस tense में 'for...by...' pattern ज़रूरी है। जैसे: for two hours by evening.",
  },
  "Present Perfect": {
    label: "💡 Time Tip / समय सुझाव",
    tip: "Often uses: since, for, already, just, yet, ever, never.",
    hindiTip: "अक्सर since, for, already, just, yet, ever, never जैसे शब्दों के साथ आता है।",
  },
  "Past Perfect": {
    label: "💡 Time Tip / समय सुझाव",
    tip: "Often uses: before, by the time, already, after — to show sequence of past events.",
    hindiTip: "बीते हुए कामों का क्रम बताने के लिए before, by the time, already, after का उपयोग होता है।",
  },
  "Future Perfect": {
    label: "💡 Time Tip / समय सुझाव",
    tip: "Often uses: by + time (by tomorrow, by next week) to show a deadline.",
    hindiTip: "किसी deadline तक काम पूरा होने के लिए 'by' का उपयोग होता है। जैसे: by tomorrow, by next month.",
  },
};

interface GeneratedSentenceDisplayProps {
  sentence: WordPos[] | null;
  hindiTranslation?: string | null;
  tenseName?: string | null;
  isLoading: boolean;
  onWordDetailRequest?: (wordData: WordPos, fullSentenceText: string) => void;
  onViewDetailedRules?: () => void;
}

export function GeneratedSentenceDisplay({
  sentence,
  hindiTranslation,
  tenseName,
  isLoading,
  onWordDetailRequest,
  onViewDetailedRules,
}: GeneratedSentenceDisplayProps) {
  if (isLoading && (!sentence || sentence.length === 0)) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-headline text-primary flex items-center">
            <MessageSquareText className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
            Generated Sentence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full mt-4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sentence || sentence.length === 0) {
    return null;
  }

  const tenseTip = tenseName ? TENSE_TIME_TIPS[tenseName] : null;

  return (
    <Card className="shadow-lg border-primary border-2">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-2">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-headline text-primary flex items-center">
          <MessageSquareText className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          Generated Sentence
        </CardTitle>
        {onViewDetailedRules && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetailedRules}
            className="text-xs sm:text-sm flex items-center"
            aria-label="View detailed rules for this tense"
          >
            <BookOpen className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Detailed Rules
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <div className="h-6 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>}
        {!isLoading && (
          <>
            <InteractiveSentence
              taggedSentence={sentence}
              onWordDetailRequest={onWordDetailRequest}
              sentenceIdentifier="main"
            />
            {hindiTranslation && (
              <p className="text-sm sm:text-base text-muted-foreground italic px-1" lang="hi">
                {hindiTranslation}
              </p>
            )}
          </>
        )}
        {tenseTip && !isLoading && (
          <div className="p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800">
            <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {tenseTip.label}
            </p>
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-300">{tenseTip.tip}</p>
            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 mt-0.5" lang="hi">{tenseTip.hindiTip}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
