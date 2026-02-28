// src/components/interactive-sentence.tsx
"use client";

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { WordPos } from '@/types/ai-types';

interface InteractiveSentenceProps {
  taggedSentence: WordPos[];
  onWordDetailRequest?: (wordData: WordPos, fullSentenceText: string) => void;
  sentenceIdentifier?: string;
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

const POS_HINDI_MAP: Record<string, string> = {
  Noun: "संज्ञा",
  Pronoun: "सर्वनाम",
  Verb: "क्रिया",
  Adjective: "विशेषण",
  Adverb: "क्रियाविशेषण",
  Preposition: "सम्बन्धबोधक",
  Conjunction: "समुच्चयबोधक",
  Determiner: "निर्धारक",
  Interjection: "विस्मयादिबोधक",
  Subject: "कर्ता",
  Object: "कर्म",
  Auxiliary: "सहायक क्रिया",
};

export function InteractiveSentence({ taggedSentence, onWordDetailRequest, sentenceIdentifier = "s" }: InteractiveSentenceProps) {
  if (!taggedSentence || !Array.isArray(taggedSentence) || taggedSentence.length === 0) return null;

  const fullSentenceText = taggedSentence.map(tw => tw.word).join(" ");

  return (
    <TooltipProvider delayDuration={100}>
      <div className="text-sm sm:text-base md:text-lg text-foreground bg-secondary/30 p-3 sm:p-4 rounded-md shadow-inner flex flex-wrap items-center leading-relaxed">
        {taggedSentence.map((taggedWord, index) => (
          <React.Fragment key={`${sentenceIdentifier}-word-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`cursor-pointer hover:underline hover:scale-105 transition-transform ${WordPartOfSpeechColors[taggedWord.pos] || WordPartOfSpeechColors.Unknown}`}
                  role="button" 
                  tabIndex={0}
                >
                  {taggedWord.word}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-card border shadow-lg rounded-md p-2 z-50">
                <div className="flex flex-col space-y-1 items-start">
                  <p className="text-sm font-semibold">
                    {taggedWord.pos} {POS_HINDI_MAP[taggedWord.pos] ? `(${POS_HINDI_MAP[taggedWord.pos]})` : ''}
                  </p>
                  {onWordDetailRequest && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs text-primary"
                      onClick={() => onWordDetailRequest(taggedWord, fullSentenceText)}
                    >
                      Vocabulary Details
                    </Button>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
            {(index < taggedSentence.length - 1 && !/^[.,!?;:]$/.test(taggedSentence[index+1]?.word)) && '\u00A0'}
          </React.Fragment>
        ))}
      </div>
    </TooltipProvider>
  );
}
