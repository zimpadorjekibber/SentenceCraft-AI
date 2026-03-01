// src/components/interactive-sentence.tsx
"use client";

import React, { useState, useRef, useCallback } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// Individual word component with hover (desktop) + tap (mobile) support
function InteractiveWord({
  taggedWord,
  fullSentenceText,
  onWordDetailRequest,
  isOpen,
  onOpen,
  onClose,
}: {
  taggedWord: WordPos;
  fullSentenceText: string;
  onWordDetailRequest?: (wordData: WordPos, fullSentenceText: string) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouch = useRef(false);

  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isTouch.current) return;
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => onOpen(), 120);
  }, [onOpen, clearHoverTimeout]);

  const handleMouseLeave = useCallback(() => {
    clearHoverTimeout();
    if (!isTouch.current) {
      onClose();
    }
  }, [onClose, clearHoverTimeout]);

  const handleTouchStart = useCallback(() => {
    isTouch.current = true;
  }, []);

  const handleClick = useCallback(() => {
    if (isTouch.current) {
      if (isOpen) {
        onClose();
      } else {
        onOpen();
      }
    }
  }, [isOpen, onOpen, onClose]);

  return (
    <Popover open={isOpen} onOpenChange={(newOpen) => { if (!newOpen) onClose(); }}>
      <PopoverTrigger asChild>
        <span
          className={`cursor-pointer hover:bg-foreground/10 active:scale-95 transition-all px-0.5 py-1 rounded-sm ${WordPartOfSpeechColors[taggedWord.pos] || WordPartOfSpeechColors.Unknown}`}
          role="button"
          tabIndex={0}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onClick={handleClick}
        >
          {taggedWord.word}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-[220px] p-3 z-50"
        sideOffset={6}
        onMouseEnter={() => { if (!isTouch.current) onOpen(); }}
        onMouseLeave={() => { if (!isTouch.current) onClose(); }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col space-y-2 items-start">
          <p className="text-sm font-semibold">
            {taggedWord.pos} {POS_HINDI_MAP[taggedWord.pos] ? `(${POS_HINDI_MAP[taggedWord.pos]})` : ''}
          </p>
          {onWordDetailRequest && (
            <Button
              variant="default"
              size="sm"
              className="text-xs font-semibold w-full"
              onClick={(e) => {
                e.stopPropagation();
                onWordDetailRequest(taggedWord, fullSentenceText);
                onClose();
              }}
            >
              Vocabulary Details
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function InteractiveSentence({ taggedSentence, onWordDetailRequest, sentenceIdentifier = "s" }: InteractiveSentenceProps) {
  // Single state to track which word index is active - only ONE popup at a time
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!taggedSentence || !Array.isArray(taggedSentence) || taggedSentence.length === 0) return null;

  const fullSentenceText = taggedSentence.map(tw => tw.word).join(" ");

  return (
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
              isOpen={activeIndex === index}
              onOpen={() => setActiveIndex(index)}
              onClose={() => setActiveIndex((prev) => prev === index ? null : prev)}
            />
          )}
          {(index < taggedSentence.length - 1 && !/^[.,!?;:]$/.test(taggedSentence[index + 1]?.word)) && '\u00A0'}
        </React.Fragment>
      ))}
    </div>
  );
}
