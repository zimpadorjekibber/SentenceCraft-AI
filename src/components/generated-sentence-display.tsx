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
import { TENSE_RULES } from '@/lib/tense-rules-data';
import { HighlightedRules } from './highlighted-rules';

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

type GrammarType = 'affirmative' | 'negative' | 'interrogative' | 'negative_interrogative';

const GRAMMAR_TYPE_LABELS: Record<GrammarType, { en: string; hi: string }> = {
  affirmative:            { en: "Affirmative",        hi: "सकारात्मक" },
  negative:               { en: "Negative",           hi: "नकारात्मक" },
  interrogative:          { en: "Interrogative",      hi: "प्रश्नवाचक" },
  negative_interrogative: { en: "Neg. Interrogative",  hi: "नकारात्मक प्रश्नवाचक" },
};

const ALL_GRAMMAR_TYPES: GrammarType[] = ['affirmative', 'negative', 'interrogative', 'negative_interrogative'];

// Hindi suffix identifiers for each tense (पहचान)
const TENSE_HINDI_SUFFIXES: Record<string, string> = {
  "Present Indefinite": "ता है, ती है, ते हैं",
  "Present Continuous": "रहा है, रही है, रहे हैं, रहा हूँ",
  "Present Perfect": "चुका है, चुकी है, चुके हैं, या है, यी है, ये हैं",
  "Present Perfect Continuous": "से रहा है, से रही है, से रहे हैं",
  "Past Indefinite": "ता था, ती थी, ते थे, या, यी, ये",
  "Past Continuous": "रहा था, रही थी, रहे थे",
  "Past Perfect": "चुका था, चुकी थी, चुके थे, या था, यी थी, ये थे",
  "Past Perfect Continuous": "से रहा था, से रही थी, से रहे थे",
  "Future Indefinite": "गा, गी, गे",
  "Future Continuous": "रहा होगा, रही होगी, रहे होंगे",
  "Future Perfect": "चुका होगा, चुकी होगी, चुके होंगे",
  "Future Perfect Continuous": "से रहा होगा, से रही होगी, से रहे होंगे",
};

// Map grammar type to the rule label identifier in the XML markup
const GRAMMAR_TO_RULE_ID: Record<GrammarType, string> = {
  affirmative: 'type="rule_label_A"',
  negative: 'type="rule_label_N"',
  interrogative: 'type="rule_label_I"',
  negative_interrogative: 'type="rule_label_NI_N"',
};

// Inline display of tense rules with active grammar type highlighted
function TenseRulesInline({
  rules,
  activeGrammarType,
  hindiSuffix,
}: {
  rules: string;
  activeGrammarType: GrammarType;
  hindiSuffix?: string;
}) {
  const lines = rules.split('\n').filter(line => line.trim());
  const activeId = GRAMMAR_TO_RULE_ID[activeGrammarType];

  return (
    <div className="text-xs sm:text-sm bg-muted/40 rounded-md p-2 sm:p-2.5 space-y-0.5 font-mono border border-border/50">
      {hindiSuffix && (
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 font-sans" lang="hi">
          {hindiSuffix}
        </p>
      )}
      {lines.map((line, i) => {
        const isActive = line.includes(activeId);
        return (
          <div
            key={i}
            className={`px-1.5 py-0.5 rounded text-[11px] sm:text-xs leading-relaxed ${
              isActive
                ? 'bg-primary/10 border-l-2 border-primary font-semibold'
                : 'opacity-50'
            }`}
          >
            <HighlightedRules rules={line} />
          </div>
        );
      })}
    </div>
  );
}

interface ConvertedSentence {
  sentence: WordPos[];
  hindiTranslation: string;
  spokenNote?: string;
}

// Cache key: "negative" for grammar, "spoken_negative" for spoken version
type CacheKey = string;

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
  const [activeGrammarType, setActiveGrammarType] = useState<GrammarType>('affirmative');
  const [isSpokenMode, setIsSpokenMode] = useState(false);
  const [convertedCache, setConvertedCache] = useState<Record<CacheKey, ConvertedSentence>>({});
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  // Reset when the main sentence changes
  const sentenceText = sentence?.map(w => w.word).join(' ') || '';
  const [lastSentenceText, setLastSentenceText] = useState('');
  if (sentenceText && sentenceText !== lastSentenceText) {
    setLastSentenceText(sentenceText);
    setActiveGrammarType('affirmative');
    setIsSpokenMode(false);
    setConvertedCache({});
  }

  // Get the text of a grammar type sentence (for spoken conversion)
  const getGrammarSentenceText = useCallback((grammarType: GrammarType): string => {
    if (grammarType === 'affirmative') return sentenceText;
    return convertedCache[grammarType]?.sentence.map(w => w.word).join(' ') || sentenceText;
  }, [sentenceText, convertedCache]);

  const convertSentence = useCallback(async (cacheKey: CacheKey, prompt: string): Promise<boolean> => {
    if (convertedCache[cacheKey]) return true; // Already cached

    if (!apiKey) {
      toast({ title: "API Key Missing", description: "Please set your API key.", variant: "destructive" });
      return false;
    }

    setIsConverting(true);
    try {
      const responseText = await generateAIContentAction(apiKey, aiProvider, prompt);
      const parsed = JSON.parse(responseText);

      if (parsed.sentence && Array.isArray(parsed.sentence)) {
        // Ensure question mark for interrogative sentence types
        if (cacheKey.includes('interrogative') && parsed.sentence.length > 0) {
          const lastWord = parsed.sentence[parsed.sentence.length - 1];
          if (lastWord.word !== '?') {
            parsed.sentence.push({ word: '?', pos: 'Punctuation' });
          }
        }
        const converted: ConvertedSentence = {
          sentence: parsed.sentence,
          hindiTranslation: parsed.hindiTranslation || '',
          spokenNote: parsed.spokenNote || '',
        };
        setConvertedCache(prev => ({ ...prev, [cacheKey]: converted }));
        return true;
      } else {
        throw new Error("AI response format invalid.");
      }
    } catch (e: any) {
      console.error("Sentence conversion error:", e);
      toast({ title: "Conversion Error", description: e.message || "Could not convert sentence.", variant: "destructive" });
      return false;
    } finally {
      setIsConverting(false);
    }
  }, [apiKey, aiProvider, convertedCache, toast]);

  const buildGrammarPrompt = useCallback((type: GrammarType): string => {
    const typeLabel = GRAMMAR_TYPE_LABELS[type].en;
    return `You are an expert English grammar teacher. Convert the following sentence to its ${typeLabel} form.
Keep the SAME tense${tenseName ? ` ("${tenseName}")` : ''} — only change the sentence type.

Original Sentence: "${sentenceText}"

Rules:
- For Negative: Add "not" / "do not" / "does not" / "did not" / "will not" etc. as appropriate for the tense.
- For Interrogative: Rearrange to question form (Do/Does/Did/Is/Are/Was/Were/Has/Have/Had/Will/Shall + Subject + Verb...?). MUST end with question mark.
- For Negative Interrogative: Combine negative + question form (Doesn't/Don't/Didn't/Isn't/Aren't/Won't/Haven't... + Subject + Verb...?). MUST end with question mark.
- IMPORTANT: For Interrogative and Negative Interrogative, ALWAYS include { "word": "?", "pos": "Punctuation" } as the LAST element in the sentence array.

HINDI GRAMMAR RULE FOR PERFECT TENSES:
- For TRANSITIVE verbs in Perfect tenses (Present/Past/Future Perfect): subject MUST use ergative "ने" — मैंने, उसने, हमने, तुमने, उन्होंने, आपने. Verb agrees with object's gender/number.
  Example: "I have not played cricket" = "मैंने क्रिकेट नहीं खेला है" (NOT "मैं क्रिकेट नहीं खेला है")
- For INTRANSITIVE verbs: Do NOT use "ने". Subject stays as-is: मैं, वह, हम. Verb agrees with subject.
  Example: "He has not gone" = "वह नहीं गया है"

Respond with ONLY a valid JSON object:
{
  "sentence": [ { "word": "...", "pos": "..." }, ... ],
  "hindiTranslation": "Hindi translation of the converted sentence"
}`;
  }, [sentenceText, tenseName]);

  const buildSpokenPrompt = useCallback((grammarType: GrammarType): string => {
    const sourceText = getGrammarSentenceText(grammarType);
    const grammarLabel = GRAMMAR_TYPE_LABELS[grammarType].en;
    return `You are a fluent English speaker who helps students learn real-life conversational English.

The student has learned this textbook ${grammarLabel} sentence:
"${sourceText}"

Convert it to how a native English speaker would ACTUALLY say it in everyday conversation.

Rules:
- Use natural contractions (I'm, don't, gonna, wanna, it's, he's, etc.)
- Use informal/casual vocabulary if appropriate
- Use common spoken phrases and fillers if they sound natural
- Shorten or simplify long/formal structures
- Keep the core meaning AND sentence type (${grammarLabel}) the same
- The result should sound like something a real person would say in a casual conversation
- Also provide a "spokenNote" explaining 2-3 key differences between the textbook version and the spoken version, in simple Hindi so Indian students understand. Keep it short (2-3 bullet points).

HINDI GRAMMAR RULE FOR PERFECT TENSES:
- For TRANSITIVE verbs in Perfect tenses (Present/Past/Future Perfect): subject MUST use ergative "ने" — मैंने, उसने, हमने, तुमने, उन्होंने, आपने. Verb agrees with object's gender/number.
  Example: "I've played cricket" = "मैंने क्रिकेट खेला है" (NOT "मैं क्रिकेट खेला है")
- For INTRANSITIVE verbs: Do NOT use "ने". Subject stays as-is: मैं, वह, हम.

Respond with ONLY a valid JSON object:
{
  "sentence": [ { "word": "...", "pos": "..." }, ... ],
  "hindiTranslation": "Hindi translation of the spoken sentence",
  "spokenNote": "• Textbook vs Spoken difference 1\\n• Difference 2\\n• Difference 3"
}`;
  }, [getGrammarSentenceText]);

  // Handle grammar type button click
  const handleGrammarTypeChange = useCallback(async (type: GrammarType) => {
    if (type === 'affirmative') {
      setActiveGrammarType('affirmative');
      // If spoken mode is on, check if spoken_affirmative is cached
      if (isSpokenMode) {
        const spokenKey = 'spoken_affirmative';
        if (!convertedCache[spokenKey]) {
          const prompt = buildSpokenPrompt('affirmative');
          await convertSentence(spokenKey, prompt);
        }
      }
      return;
    }

    // First ensure the grammar conversion exists
    if (!convertedCache[type]) {
      const prompt = buildGrammarPrompt(type);
      const success = await convertSentence(type, prompt);
      if (!success) return;
    }
    setActiveGrammarType(type);

    // If spoken mode is on, also convert spoken version
    if (isSpokenMode) {
      const spokenKey = `spoken_${type}`;
      if (!convertedCache[spokenKey]) {
        const prompt = buildSpokenPrompt(type);
        await convertSentence(spokenKey, prompt);
      }
    }
  }, [isSpokenMode, convertedCache, buildGrammarPrompt, buildSpokenPrompt, convertSentence]);

  // Handle spoken toggle
  const handleSpokenToggle = useCallback(async () => {
    if (isSpokenMode) {
      // Turn OFF spoken mode
      setIsSpokenMode(false);
      return;
    }

    // Turn ON spoken mode — convert current grammar type to spoken
    const spokenKey = `spoken_${activeGrammarType}`;
    if (convertedCache[spokenKey]) {
      setIsSpokenMode(true);
      return;
    }

    // If grammar type is not affirmative and not cached yet, we need the grammar version first
    if (activeGrammarType !== 'affirmative' && !convertedCache[activeGrammarType]) {
      const grammarPrompt = buildGrammarPrompt(activeGrammarType);
      const success = await convertSentence(activeGrammarType, grammarPrompt);
      if (!success) return;
    }

    const prompt = buildSpokenPrompt(activeGrammarType);
    const success = await convertSentence(spokenKey, prompt);
    if (success) {
      setIsSpokenMode(true);
    }
  }, [isSpokenMode, activeGrammarType, convertedCache, buildGrammarPrompt, buildSpokenPrompt, convertSentence]);

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

  // Determine what to display
  const isAffirmative = activeGrammarType === 'affirmative';
  const currentCacheKey = isSpokenMode ? `spoken_${activeGrammarType}` : activeGrammarType;

  let displaySentence: WordPos[];
  let displayHindi: string | null | undefined;

  if (isAffirmative && !isSpokenMode) {
    // Original sentence
    displaySentence = sentence;
    displayHindi = hindiTranslation;
  } else {
    const cached = convertedCache[currentCacheKey];
    displaySentence = cached?.sentence || sentence;
    displayHindi = cached?.hindiTranslation || null;
  }

  const spokenNote = isSpokenMode ? convertedCache[`spoken_${activeGrammarType}`]?.spokenNote : null;
  const grammarLabel = GRAMMAR_TYPE_LABELS[activeGrammarType];

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
            {/* Grammar Type Buttons Row */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {ALL_GRAMMAR_TYPES.map((type) => {
                const label = GRAMMAR_TYPE_LABELS[type];
                const isActive = activeGrammarType === type;
                return (
                  <Button
                    key={type}
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className={`text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8 ${isActive ? '' : 'opacity-70'}`}
                    onClick={() => handleGrammarTypeChange(type)}
                    disabled={isConverting}
                  >
                    <span>{label.en}</span>
                    <span className="hidden sm:inline ml-1 opacity-70">({label.hi})</span>
                  </Button>
                );
              })}

              {/* Spoken English Toggle Button */}
              <Button
                size="sm"
                variant={isSpokenMode ? "default" : "outline"}
                className={`text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8 ${
                  isSpokenMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30'
                }`}
                onClick={handleSpokenToggle}
                disabled={isConverting}
              >
                <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                <span>🗣️ Spoken</span>
                <span className="hidden sm:inline ml-1 opacity-70">(बोलचाल)</span>
              </Button>

              {isConverting && (
                <Loader2 className="h-4 w-4 animate-spin text-primary ml-1 self-center" />
              )}
            </div>

            {/* Active type badges */}
            {(!isAffirmative || isSpokenMode) && (
              <div className="flex flex-wrap gap-1.5">
                {!isAffirmative && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 rounded-full">
                    <span className="text-xs sm:text-sm font-semibold text-primary">{grammarLabel.en}</span>
                    <span className="text-xs text-primary/70" lang="hi">({grammarLabel.hi})</span>
                  </div>
                )}
                {isSpokenMode && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-950/40 rounded-full">
                    <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">🗣️ Spoken</span>
                    <span className="text-xs text-green-600/70 dark:text-green-400/70" lang="hi">(बोलचाल)</span>
                  </div>
                )}
              </div>
            )}

            {/* Tense Rules Display */}
            {tenseName && TENSE_RULES[tenseName] && (
              <TenseRulesInline
                rules={TENSE_RULES[tenseName]}
                activeGrammarType={activeGrammarType}
                hindiSuffix={TENSE_HINDI_SUFFIXES[tenseName]}
              />
            )}

            {/* The sentence */}
            <InteractiveSentence
              taggedSentence={displaySentence}
              onWordDetailRequest={onWordDetailRequest}
              sentenceIdentifier={`main-${currentCacheKey}`}
              highlightMode="tense"
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
