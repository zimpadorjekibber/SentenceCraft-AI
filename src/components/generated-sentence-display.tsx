// src/components/generated-sentence-display.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, BookOpen } from 'lucide-react';
import { InteractiveSentence } from './interactive-sentence';
import type { WordPos } from '@/types/ai-types';
import { HighlightedRules } from './highlighted-rules';
import { cn } from '@/lib/utils';

interface GeneratedSentenceDisplayProps {
  sentence: WordPos[] | null;
  isLoading: boolean;
  onWordDetailRequest?: (wordData: WordPos, fullSentenceText: string) => void;
  onViewDetailedRules?: () => void;
}

export function GeneratedSentenceDisplay({
  sentence,
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
      <CardContent>
        {isLoading && <div className="h-6 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>}
        {!isLoading && 
            <InteractiveSentence
            taggedSentence={sentence}
            onWordDetailRequest={onWordDetailRequest}
            sentenceIdentifier="main"
            />
        }
      </CardContent>
    </Card>
  );
}
