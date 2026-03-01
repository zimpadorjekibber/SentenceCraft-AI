// src/components/generated-sentence-display.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, BookOpen, Clock, Loader2, MessageCircle } from 'lucide-react';
import { InteractiveSentence } from './interactive-sentence';
import type { WordPos } from '@/types/ai-types';
import { generateAIContentAction } from '@/ai/flows/generate-content-action';
import type { AiProvider } from '@/lib/ai-client';
import { useToast } from '@/hooks/use-toast';

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

type SentenceType = 'affirmative' | 'negative' | 'interrogative' | 'negative_interrogative' | 'spoken';

const SENTENCE_TYPE_LABELS: Record<SentenceType, { en: string; hi: string }> = {
  affirmative:            { en: "Affirmative",            hi: "सकारात्मक" },
  negative:               { en: "Negative",               hi: "नकारात्मक" },
  interrogative:          { en: "Interrogative",          hi: "प्रश्नवाचक" },
  negative_interrogative: { en: "Neg. Interrogative",     hi: "नकारात्मक प्रश्नवाचक" },
  spoken:                 { en: "Spoken English",          hi: "बोलचाल की अंग्रेज़ी" },
};

// Grammar types (first row buttons)
const GRAMMAR_TYPES: SentenceType[] = ['affirmative', 'negative', 'interrogative', 'negative_interrogative'];

interface ConvertedSentence {
  sentence: WordPos[];
  hindiTranslation: string;
  spokenNote?: string;
}

interface GeneratedSentenceDisplayProps {
  sentence: WordPos[] | null;
  hindiTranslation?: string | null;
  tenseName?: string | null;
  isLoading: boolean;
  apiKey: string | null;
  aiProvider: AiProvider;
  onWordDetailRequest?: (wordData: WordPos, fullSentenceText: string) => void;
  onViewDetailedRules?: () => void;
}

export function GeneratedSentenceDisplay({
  sentence,
  hindiTranslation,
  tenseName,
  isLoading,
  apiKey,
  aiProvider,
  onWordDetailRequest,
  onViewDetailedRules,
}: GeneratedSentenceDisplayProps) {
  const [activeSentenceType, setActiveSentenceType] = useState<SentenceType>('affirmative');
  const [convertedCache, setConvertedCache] = useState<Partial<Record<SentenceType, ConvertedSentence>>>({});
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  // Reset when the main sentence changes
  const sentenceText = sentence?.map(w => w.word).join(' ') || '';
  const [lastSentenceText, setLastSentenceText] = useState('');
  if (sentenceText && sentenceText !== lastSentenceText) {
    setLastSentenceText(sentenceText);
    setActiveSentenceType('affirmative');
    setConvertedCache({});
  }

  const buildPromptForType = useCallback((type: SentenceType): string => {
    if (type === 'spoken') {
      return `You are a fluent English speaker who helps students learn real-life conversational English.

The student has learned this textbook sentence:
"${sentenceText}"

Convert it to how a native English speaker would ACTUALLY say it in everyday conversation.

Rules:
- Use natural contractions (I'm, don't, gonna, wanna, it's, he's, etc.)
- Use informal/casual vocabulary if appropriate
- Use common spoken phrases and fillers if they sound natural
- Shorten or simplify long/formal structures
- Keep the core meaning the same
- The result should sound like something a real person would say in a casual conversation
- Also provide a "spokenNote" explaining 2-3 key differences between the textbook version and the spoken version, in simple Hindi so Indian students understand. Keep it short (2-3 bullet points).

Respond with ONLY a valid JSON object:
{
  "sentence": [ { "word": "...", "pos": "..." }, ... ],
  "hindiTranslation": "Hindi translation of the spoken sentence",
  "spokenNote": "• Textbook vs Spoken difference 1\\n• Difference 2\\n• Difference 3"
}`;
    }

    const typeLabel = SENTENCE_TYPE_LABELS[type].en;
    return `You are an expert English grammar teacher. Convert the following sentence to its ${typeLabel} form.
Keep the SAME tense${tenseName ? ` ("${tenseName}")` : ''} — only change the sentence type.

Original Sentence: "${sentenceText}"

Rules:
- For Negative: Add "not" / "do not" / "does not" / "did not" / "will not" etc. as appropriate for the tense.
- For Interrogative: Rearrange to question form (Do/Does/Did/Is/Are/Was/Were/Has/Have/Had/Will/Shall + Subject + Verb...?).
- For Negative Interrogative: Combine negative + question form (Doesn't/Don't/Didn't/Isn't/Aren't/Won't/Haven't... + Subject + Verb...?).

Respond with ONLY a valid JSON object:
{
  "sentence": [ { "word": "...", "pos": "..." }, ... ],
  "hindiTranslation": "Hindi translation of the converted sentence"
}`;
  }, [sentenceText, tenseName]);

  const handleSentenceTypeChange = useCallback(async (type: SentenceType) => {
    if (type === 'affirmative') {
      setActiveSentenceType('affirmative');
      return;
    }

    // Check cache first
    if (convertedCache[type]) {
      setActiveSentenceType(type);
      return;
    }

    if (!apiKey) {
      toast({ title: "API Key Missing", description: "Please set your API key.", variant: "destructive" });
      return;
    }

    setIsConverting(true);

    const prompt = buildPromptForType(type);

    try {
      const responseText = await generateAIContentAction(apiKey, aiProvider, prompt);
      const parsed = JSON.parse(responseText);

      if (parsed.sentence && Array.isArray(parsed.sentence)) {
        const converted: ConvertedSentence = {
          sentence: parsed.sentence,
          hindiTranslation: parsed.hindiTranslation || '',
          spokenNote: parsed.spokenNote || '',
        };
        setConvertedCache(prev => ({ ...prev, [type]: converted }));
        setActiveSentenceType(type);
      } else {
        throw new Error("AI response format invalid.");
      }
    } catch (e: any) {
      console.error("Sentence conversion error:", e);
      toast({ title: "Conversion Error", description: e.message || "Could not convert sentence.", variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  }, [apiKey, aiProvider, buildPromptForType, convertedCache, toast]);

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

  // Determine what to show based on active type
  const isAffirmative = activeSentenceType === 'affirmative';
  const isSpoken = activeSentenceType === 'spoken';
  const displaySentence = isAffirmative ? sentence : (convertedCache[activeSentenceType]?.sentence || sentence);
  const displayHindi = isAffirmative ? hindiTranslation : (convertedCache[activeSentenceType]?.hindiTranslation || null);
  const spokenNote = isSpoken ? convertedCache.spoken?.spokenNote : null;
  const activeLabel = SENTENCE_TYPE_LABELS[activeSentenceType];

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
            {/* Sentence Type Toggle Buttons */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {GRAMMAR_TYPES.map((type) => {
                const label = SENTENCE_TYPE_LABELS[type];
                const isActive = activeSentenceType === type;
                return (
                  <Button
                    key={type}
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className={`text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8 ${isActive ? '' : 'opacity-70'}`}
                    onClick={() => handleSentenceTypeChange(type)}
                    disabled={isConverting}
                  >
                    <span>{label.en}</span>
                    <span className="hidden sm:inline ml-1 opacity-70">({label.hi})</span>
                  </Button>
                );
              })}

              {/* Spoken English Button - special styled */}
              <Button
                size="sm"
                variant={isSpoken ? "default" : "outline"}
                className={`text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8 ${
                  isSpoken
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30'
                }`}
                onClick={() => handleSentenceTypeChange('spoken')}
                disabled={isConverting}
              >
                <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                <span>Spoken English</span>
                <span className="hidden sm:inline ml-1 opacity-70">(बोलचाल)</span>
              </Button>

              {isConverting && (
                <Loader2 className="h-4 w-4 animate-spin text-primary ml-1 self-center" />
              )}
            </div>

            {/* Active type label badge */}
            {!isAffirmative && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                isSpoken ? 'bg-green-100 dark:bg-green-950/40' : 'bg-primary/10'
              }`}>
                <span className={`text-xs sm:text-sm font-semibold ${isSpoken ? 'text-green-700 dark:text-green-400' : 'text-primary'}`}>
                  {activeLabel.en}
                </span>
                <span className={`text-xs ${isSpoken ? 'text-green-600/70 dark:text-green-400/70' : 'text-primary/70'}`} lang="hi">
                  ({activeLabel.hi})
                </span>
              </div>
            )}

            {/* The sentence */}
            <InteractiveSentence
              taggedSentence={displaySentence}
              onWordDetailRequest={onWordDetailRequest}
              sentenceIdentifier={`main-${activeSentenceType}`}
            />
            {displayHindi && (
              <p className="text-sm sm:text-base text-muted-foreground italic px-1" lang="hi">
                {displayHindi}
              </p>
            )}

            {/* Spoken English note - differences explained */}
            {spokenNote && (
              <div className="p-2.5 sm:p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5 mb-1.5">
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                  📖 Textbook vs 🗣️ Real Life — क्या बदला?
                </p>
                <div className="text-xs sm:text-sm text-green-800 dark:text-green-300 whitespace-pre-line" lang="hi">
                  {spokenNote}
                </div>
              </div>
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
