// src/components/interactive-sentence.tsx
"use client";

import React, { useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { WordPos } from '@/types/ai-types';
import { useNativeLanguage } from '@/context/language-context';
import { POS_LABELS } from '@/lib/native-labels';

interface InteractiveSentenceProps {
  taggedSentence: WordPos[];
  onWordDetailRequest?: (wordData: WordPos, fullSentenceText: string) => void;
  sentenceIdentifier?: string;
  highlightMode?: "pos" | "tense";
}

const WordPartOfSpeechColors: Record<string, string> = {
  Noun: "text-sky-700 dark:text-sky-400",
  Pronoun: "text-blue-700 dark:text-blue-400",
  Verb: "text-red-700 dark:text-red-400",
  Adjective: "text-green-700 dark:text-green-400",
  Adverb: "text-yellow-700 dark:text-yellow-500",
  Preposition: "text-purple-700 dark:text-purple-400",
  Conjunction: "text-pink-700 dark:text-pink-400",
  Determiner: "text-indigo-700 dark:text-indigo-400",
  Interjection: "text-gray-700 dark:text-gray-400",
  Subject: "text-orange-700 dark:text-orange-400 font-bold",
  Object: "text-teal-700 dark:text-teal-400 font-bold",
  Auxiliary: "text-lime-700 dark:text-lime-400",
  Punctuation: "text-foreground/80",
  Unknown: "text-foreground",
};

// Tense-mode highlighting: only color auxiliary verbs, main verbs, and negation words
const TenseHighlightColors: Record<string, string> = {
  Auxiliary: "text-sky-600 dark:text-sky-400 font-semibold",
  Verb: "text-emerald-600 dark:text-emerald-400 font-semibold",
  Negation: "text-red-600 dark:text-red-400 font-semibold",
};

function isNegationWord(word: string): boolean {
  const lower = word.toLowerCase();
  return lower === "not" || lower.endsWith("n't") || lower === "never";
}

function getTenseHighlightClass(taggedWord: WordPos): string {
  if (taggedWord.pos === "Auxiliary") return TenseHighlightColors.Auxiliary;
  if (taggedWord.pos === "Verb") return TenseHighlightColors.Verb;
  if (isNegationWord(taggedWord.word)) return TenseHighlightColors.Negation;
  return "text-foreground";
}

// POS labels now come from native-labels.ts via useNativeLanguage()

// Individual word: Tooltip (hover) for POS label + Popover (click) for Vocabulary Details
function InteractiveWord({
  taggedWord,
  fullSentenceText,
  onWordDetailRequest,
  highlightMode = "pos",
}: {
  taggedWord: WordPos;
  fullSentenceText: string;
  onWordDetailRequest?: (wordData: WordPos, fullSentenceText: string) => void;
  highlightMode?: "pos" | "tense";
}) {
  const { nativeLanguage } = useNativeLanguage();
  const nativeLabel = POS_LABELS[taggedWord.pos]?.[nativeLanguage];
  const posLabel = `${taggedWord.pos}${nativeLabel ? ` (${nativeLabel})` : ''}`;
  const colorClass = highlightMode === "tense"
    ? getTenseHighlightClass(taggedWord)
    : (WordPartOfSpeechColors[taggedWord.pos] || WordPartOfSpeechColors.Unknown);

  const handleVocabClick = useCallback(() => {
    onWordDetailRequest?.(taggedWord, fullSentenceText);
  }, [taggedWord, fullSentenceText, onWordDetailRequest]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
    }
  }, []);

  // If we have a vocabulary detail handler, use Popover (click) with tooltip nested
  if (onWordDetailRequest) {
    return (
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <span
                className={`cursor-pointer hover:bg-foreground/10 active:scale-95 transition-all px-0.5 py-1 rounded-sm ${colorClass}`}
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyDown}
              >
                {taggedWord.word}
              </span>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            <p className="text-xs font-semibold">{posLabel}</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-auto max-w-[220px] p-3 z-50" sideOffset={6} onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="flex flex-col space-y-2 items-start">
            <p className="text-sm font-semibold">{posLabel}</p>
            <Button
              variant="default"
              size="sm"
              className="text-xs font-semibold w-full"
              onClick={handleVocabClick}
            >
              Vocabulary Details
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // No vocabulary handler - just Tooltip for POS info on hover/tap
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`cursor-pointer hover:bg-foreground/10 active:scale-95 transition-all px-0.5 py-1 rounded-sm ${colorClass}`}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {taggedWord.word}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        <p className="text-xs font-semibold">{posLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function InteractiveSentence({ taggedSentence, onWordDetailRequest, sentenceIdentifier = "s", highlightMode = "pos" }: InteractiveSentenceProps) {
  if (!taggedSentence || !Array.isArray(taggedSentence) || taggedSentence.length === 0) return null;

  const fullSentenceText = taggedSentence.map(tw => tw.word).join(" ");

  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={100}>
      <div className="text-sm sm:text-base md:text-lg text-foreground bg-secondary/30 p-3 sm:p-4 rounded-md shadow-inner flex flex-wrap items-center leading-loose gap-y-1">
        {taggedSentence.map((taggedWord, index) => (
          <React.Fragment key={`${sentenceIdentifier}-word-${index}`}>
            {taggedWord.pos === "Punctuation" ? (
              <span className="text-foreground/80">{taggedWord.word}</span>
            ) : (
              <InteractiveWord
                taggedWord={taggedWord}
                fullSentenceText={fullSentenceText}
                onWordDetailRequest={onWordDetailRequest}
                highlightMode={highlightMode}
              />
            )}
            {(index < taggedSentence.length - 1 && !/^[.,!?;:]$/.test(taggedSentence[index + 1]?.word)) && '\u00A0'}
          </React.Fragment>
        ))}
      </div>
    </TooltipProvider>
  );
}
