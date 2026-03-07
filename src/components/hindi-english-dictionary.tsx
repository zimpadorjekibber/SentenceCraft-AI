// src/components/hindi-english-dictionary.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from './loading-spinner';
import { useToast } from "@/hooks/use-toast";
import {
  BookA, Search, AlertCircle, Mic, MicOff, Camera,
  ArrowRightLeft, Users, VenetianMask, GraduationCap, ChevronDown, ChevronUp,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateAIContentAction } from '@/ai/flows/generate-content-action';
import type { AiProvider } from '@/lib/ai-client';
import { useHindiTransliteration } from '@/hooks/use-hindi-transliteration';
import { useCameraOcr } from '@/hooks/use-camera-ocr';
import { useAuth } from '@/context/auth-context';
import { useNativeLanguage } from '@/context/language-context';
import { incrementStat, incrementFeatureUsage, updateStreak } from '@/lib/firestore-service';

// ─── Types ────────────────────────────────────────────────────
interface DictionaryResult {
  hindiWord: string;
  englishMeaning: string;
  pos: string; // "Verb" | "Noun" | "Adjective" | "Adverb" | "Preposition" | etc.
  posHindi: string;
  pronunciation: string;
  additionalMeanings: string[];
  synonyms: string[];
  antonyms: string[];
  examples: { english: string; hindi: string }[];
}

interface VerbFormsData {
  base: string; // V1
  pastSimple: string; // V2
  pastParticiple: string; // V3
  presentParticiple: string; // V4 (V-ing)
  thirdPersonSingular: string; // V5 (V-s/es)
  examples: { form: string; label: string; sentence: string; sentenceHindi: string }[];
}

interface NounFormsData {
  singular: string;
  plural: string;
  pluralRule: string;
  pluralRuleHindi: string;
  singularExample: string;
  singularExampleHindi: string;
  pluralExample: string;
  pluralExampleHindi: string;
}

interface NounGenderData {
  gender: string; // "Masculine" | "Feminine" | "Neuter" | "Common"
  genderHindi: string;
  explanation: string;
  explanationHindi: string;
  countability: string; // "Countable" | "Uncountable"
  countabilityHindi: string;
  countabilityExplanation: string;
}

interface AdjectiveDegreesData {
  positive: string;
  comparative: string;
  superlative: string;
  rule: string;
  ruleHindi: string;
  positiveExample: string;
  positiveExampleHindi: string;
  comparativeExample: string;
  comparativeExampleHindi: string;
  superlativeExample: string;
  superlativeExampleHindi: string;
}

interface HindiEnglishDictionaryProps {
  apiKey: string | null;
  aiProvider: AiProvider;
}

// ─── Helpers ──────────────────────────────────────────────────
/** Returns true if text contains mostly Devanagari (Hindi) or Tibetan characters */
function isNativeScriptText(text: string): boolean {
  const devanagariChars = text.match(/[\u0900-\u097F]/g)?.length || 0;
  const tibetanChars = text.match(/[\u0F00-\u0FFF]/g)?.length || 0;
  const latinChars = text.match(/[a-zA-Z]/g)?.length || 0;
  return (devanagariChars + tibetanChars) > latinChars;
}

// ─── Component ────────────────────────────────────────────────
export function HindiEnglishDictionary({ apiKey, aiProvider }: HindiEnglishDictionaryProps) {
  const { user, refreshStats } = useAuth();
  const { nativeLanguage, t } = useNativeLanguage();
  const [inputText, setInputText] = useState('');
  const [searchDirection, setSearchDirection] = useState<'hi2en' | 'en2hi'>('hi2en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DictionaryResult | null>(null);

  // Sub-feature states
  const [verbForms, setVerbForms] = useState<VerbFormsData | null>(null);
  const [verbFormsLoading, setVerbFormsLoading] = useState(false);
  const [showVerbForms, setShowVerbForms] = useState(false);

  const [nounForms, setNounForms] = useState<NounFormsData | null>(null);
  const [nounFormsLoading, setNounFormsLoading] = useState(false);
  const [showNounForms, setShowNounForms] = useState(false);

  const [nounGender, setNounGender] = useState<NounGenderData | null>(null);
  const [nounGenderLoading, setNounGenderLoading] = useState(false);
  const [showNounGender, setShowNounGender] = useState(false);

  const [adjDegrees, setAdjDegrees] = useState<AdjectiveDegreesData | null>(null);
  const [adjDegreesLoading, setAdjDegreesLoading] = useState(false);
  const [showAdjDegrees, setShowAdjDegrees] = useState(false);

  // Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSpeechApiSupported, setIsSpeechApiSupported] = useState(false);

  // Transliteration
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  const { toast } = useToast();

  const {
    suggestions,
    currentWord,
    fetchSuggestions,
    applySuggestion,
    clearSuggestions,
  } = useHindiTransliteration(nativeLanguage);

  const { fileInputRef: cameraInputRef, isProcessing: isCameraProcessing, triggerCamera, handleFileSelected: handleCameraFile } = useCameraOcr({
    apiKey,
    aiProvider,
    onTextExtracted: (text) => {
      setInputText(text);
      resetResults();
      clearSuggestions();
      toast({ title: "Text Extracted!", description: t({ hi: "Image se text nikaal kar input mein daal diya.", bo: "པར་རིས་ནས་ཡི་གེ་ལེན་ཟིན།" }) });
    },
    onError: (message) => {
      toast({ title: "OCR Failed", description: message, variant: "destructive" });
    },
    language: nativeLanguage === 'bo' ? 'tibetan' : 'hindi', // OCR extracts native script + English from images
  });

  const checkApiKey = useCallback(() => {
    if (!apiKey) {
      toast({ title: "API Key Missing", description: "Please set your API key to use this feature.", variant: "destructive" });
      return false;
    }
    return true;
  }, [apiKey, toast]);

  const resetResults = useCallback(() => {
    setResult(null);
    setError(null);
    setVerbForms(null);
    setShowVerbForms(false);
    setNounForms(null);
    setShowNounForms(false);
    setNounGender(null);
    setShowNounGender(false);
    setAdjDegrees(null);
    setShowAdjDegrees(false);
  }, []);

  // ─── Speech Recognition Setup ──────────────────────────────
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSpeechApiSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = nativeLanguage === 'bo' ? 'bo' : 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
        toast({ title: nativeLanguage === 'bo' ? "ད་ལྟ་བཤད་རོགས།" : "बोलना शुरू करें..." });
      };
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i]?.[0]) {
            currentTranscript += event.results[i][0].transcript || '';
          }
        }
        setInputText(currentTranscript);
      };
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessages: Record<string, string> = {
          'not-allowed': 'Microphone permission denied। कृपया browser settings में mic allow करें।',
          'no-speech': 'कोई आवाज़ नहीं सुनाई दी। फिर से बोलें।',
          'network': 'Network error। Internet connection check करें।',
          'aborted': 'Speech recognition बंद हो गया।',
        };
        toast({ title: "Speech Error", description: errorMessages[event.error] || `Error: ${event.error}`, variant: "destructive" });
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  const handleMicClick = async () => {
    if (!isSpeechApiSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      let permissionBlocked = false;
      try {
        const permStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permStatus.state === 'denied') {
          permissionBlocked = true;
        }
      } catch {
        // Permissions API not supported
      }

      if (permissionBlocked) {
        toast({
          title: "Microphone Block है",
          description: "आपने पहले mic Block किया था। Fix करने के लिए: Chrome में address bar के बाईं ओर 🔒 lock icon पर tap करें → Permissions → Microphone → Allow करें → Page reload करें।",
          variant: "destructive",
          duration: 10000,
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err: any) {
        const isBlocked = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
        toast({
          title: "Microphone Permission Denied",
          description: isBlocked
            ? "Mic block है। Fix: Chrome address bar में 🔒 lock icon tap करें → Permissions → Microphone → Allow → फिर page reload करें।"
            : "Microphone access नहीं मिला। कृपया browser settings check करें।",
          variant: "destructive",
          duration: 10000,
        });
        return;
      }
      setInputText('');
      resetResults();
      clearSuggestions();
      recognitionRef.current.start();
    }
  };

  // ─── Transliteration Handlers ──────────────────────────────
  const handleSelectSuggestion = useCallback((suggestion: string) => {
    const { newText, newCursorPos } = applySuggestion(inputText, suggestion);
    setInputText(newText);
    setSelectedSuggestionIndex(0);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [applySuggestion, inputText]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);
    if (result) resetResults();
    setSelectedSuggestionIndex(0);

    // Only fetch Hindi transliteration suggestions if there's Devanagari text already
    // or the user is typing the first word (no Devanagari yet = could be either language)
    // Transliteration suggestions appear for English chars; user picks Hindi if they want Hindi
    const cursorPos = e.target.selectionStart ?? value.length;
    fetchSuggestions(value, cursorPos);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => prev < suggestions.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => prev > 0 ? prev - 1 : suggestions.length - 1);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (suggestions[selectedSuggestionIndex]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      clearSuggestions();
    } else if (e.key === ' ') {
      if (suggestions.length > 0 && currentWord.length > 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[0]);
      }
    }
  };

  // ─── Primary Lookup ──────────────────────────────────────
  const handleSearch = async () => {
    if (isListening) recognitionRef.current?.stop();
    clearSuggestions();
    if (!inputText.trim()) {
      setError(t({ hi: "कृपया कोई शब्द टाइप करें (Hindi या English)।", bo: "ཚིག་གཅིག་འཇུག་རོགས། (བོད་ཡིག་ or English)" }));
      return;
    }
    if (!checkApiKey()) return;

    setIsLoading(true);
    resetResults();

    // Detect language direction
    const isNativeInput = isNativeScriptText(inputText.trim());
    setSearchDirection(isNativeInput ? 'hi2en' : 'en2hi');

    const nativeLangName = nativeLanguage === 'bo' ? 'Tibetan (བོད་སྐད)' : 'Hindi';
    const nativeScriptName = nativeLanguage === 'bo' ? 'Tibetan script' : 'Devanagari script';
    const posNativeHint = nativeLanguage === 'bo' ? 'Part of Speech in Tibetan (མིང་ཚིག, བྱ་ཚིག, རྒྱན་ཚིག, etc.)' : 'Part of Speech in Hindi (संज्ञा, क्रिया, विशेषण, क्रियाविशेषण, etc.)';
    const nativeErrorMsg = nativeLanguage === 'bo'
      ? 'ཚིག་འདི་ངོས་ཟིན་མ་བྱུང། ཡང་བསྐྱར་ཚིག་ཡག་པོ་གཏག་རོགས།'
      : 'यह शब्द पहचाना नहीं जा सका। कृपया सही शब्द लिखें।';

    const prompt = isNativeInput
      ? `You are a ${nativeLangName}-English dictionary expert. The user typed a ${nativeLangName} word or phrase.

${nativeLangName} Input: "${inputText}"

Task: Provide the English meaning of this ${nativeLangName} word/phrase.

Respond with ONLY a valid JSON object (no extra text):
{
  "hindiWord": "the ${nativeLangName} word/phrase as given",
  "englishMeaning": "primary English meaning/translation",
  "pos": "Part of Speech in English (Noun, Verb, Adjective, Adverb, Preposition, Conjunction, Pronoun, Interjection, Phrase, Idiom)",
  "posHindi": "${posNativeHint}",
  "pronunciation": "English pronunciation guide (e.g., /kɒf/ for cough)",
  "additionalMeanings": ["other meaning 1", "other meaning 2"],
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "antonyms": ["antonym1", "antonym2"],
  "examples": [
    {"english": "Example sentence in English using the word", "hindi": "Same sentence in ${nativeLangName}"},
    {"english": "Another example", "hindi": "${nativeLangName} translation"},
    {"english": "Third example", "hindi": "${nativeLangName} translation"}
  ]
}

If the input is not recognizable ${nativeLangName}, respond with: { "error": "${nativeErrorMsg}" }`
      : `You are an English-${nativeLangName} dictionary expert. The user typed an English word or phrase.

English Input: "${inputText}"

Task: Provide the ${nativeLangName} meaning of this English word/phrase.

Respond with ONLY a valid JSON object (no extra text):
{
  "hindiWord": "${nativeLangName} meaning/translation (in ${nativeScriptName})",
  "englishMeaning": "the English word/phrase as given",
  "pos": "Part of Speech in English (Noun, Verb, Adjective, Adverb, Preposition, Conjunction, Pronoun, Interjection, Phrase, Idiom)",
  "posHindi": "${posNativeHint}",
  "pronunciation": "English pronunciation guide with IPA (e.g., /kɒf/ for cough)",
  "additionalMeanings": ["other ${nativeLangName} meaning 1", "other ${nativeLangName} meaning 2"],
  "synonyms": ["English synonym1", "English synonym2", "English synonym3"],
  "antonyms": ["English antonym1", "English antonym2"],
  "examples": [
    {"english": "Example sentence in English using the word", "hindi": "Same sentence in ${nativeLangName}"},
    {"english": "Another example", "hindi": "${nativeLangName} translation"},
    {"english": "Third example", "hindi": "${nativeLangName} translation"}
  ]
}

If the input is not recognizable English, respond with: { "error": "This word could not be recognized. Please enter a valid English word." }`;

    try {
      const responseText = await generateAIContentAction(apiKey!, aiProvider, prompt);
      const parsed = JSON.parse(responseText);

      if (parsed.error) {
        setError(parsed.error);
        toast({ title: "Error", description: parsed.error, variant: "destructive" });
      } else {
        setResult(parsed as DictionaryResult);
        // Track dictionary usage in Firestore
        if (user) {
          incrementStat(user.uid, 'totalDictionaryLookups').catch(() => {});
          incrementFeatureUsage(user.uid, 'dictionary').catch(() => {});
          updateStreak(user.uid).catch(() => {});
          refreshStats().catch(() => {});
        }
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
      toast({ title: "Search Error", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Verb Forms (V1-V5) ──────────────────────────────────
  const handleLoadVerbForms = async () => {
    if (verbForms) {
      setShowVerbForms(!showVerbForms);
      return;
    }
    if (!checkApiKey() || !result) return;

    setVerbFormsLoading(true);
    setShowVerbForms(true);

    const verbLangName = nativeLanguage === 'bo' ? 'Tibetan (བོད་སྐད)' : 'Hindi';
    const prompt = `You are an English grammar expert. The English verb is "${result.englishMeaning}" (${verbLangName}: "${result.hindiWord}").

Provide ALL 5 forms of this verb.

Respond with ONLY a valid JSON object:
{
  "base": "V1 - Base form (e.g., run)",
  "pastSimple": "V2 - Past Simple (e.g., ran)",
  "pastParticiple": "V3 - Past Participle (e.g., run)",
  "presentParticiple": "V4 - Present Participle / V-ing (e.g., running)",
  "thirdPersonSingular": "V5 - Third Person Singular / V-s/es (e.g., runs)",
  "examples": [
    {"form": "V1", "label": "Base Form", "sentence": "I run every morning.", "sentenceHindi": "${verbLangName} translation of the example sentence"},
    {"form": "V2", "label": "Past Simple", "sentence": "He ran yesterday.", "sentenceHindi": "${verbLangName} translation"},
    {"form": "V3", "label": "Past Participle", "sentence": "She has run 5 kilometers.", "sentenceHindi": "${verbLangName} translation"},
    {"form": "V4", "label": "Present Participle", "sentence": "They are running now.", "sentenceHindi": "${verbLangName} translation"},
    {"form": "V5", "label": "3rd Person Singular", "sentence": "He runs fast.", "sentenceHindi": "${verbLangName} translation"}
  ]
}`;

    try {
      const responseText = await generateAIContentAction(apiKey!, aiProvider, prompt);
      const parsed = JSON.parse(responseText);
      setVerbForms(parsed as VerbFormsData);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load verb forms.", variant: "destructive" });
      setShowVerbForms(false);
    } finally {
      setVerbFormsLoading(false);
    }
  };

  // ─── Noun Singular/Plural ────────────────────────────────
  const handleLoadNounForms = async () => {
    if (nounForms) {
      setShowNounForms(!showNounForms);
      return;
    }
    if (!checkApiKey() || !result) return;

    setNounFormsLoading(true);
    setShowNounForms(true);

    const nounLangName = nativeLanguage === 'bo' ? 'Tibetan (བོད་སྐད)' : 'Hindi';
    const prompt = `You are an English grammar expert. The English noun is "${result.englishMeaning}" (${nounLangName}: "${result.hindiWord}").

Provide the singular and plural forms with the rule.

Respond with ONLY a valid JSON object:
{
  "singular": "singular form (e.g., child)",
  "plural": "plural form (e.g., children)",
  "pluralRule": "Rule for forming the plural in English (e.g., Irregular plural - changes completely)",
  "pluralRuleHindi": "Same rule in ${nounLangName}",
  "singularExample": "A child is playing in the park.",
  "singularExampleHindi": "${nounLangName} translation of the singular example",
  "pluralExample": "The children are playing in the park.",
  "pluralExampleHindi": "${nounLangName} translation of the plural example"
}`;

    try {
      const responseText = await generateAIContentAction(apiKey!, aiProvider, prompt);
      const parsed = JSON.parse(responseText);
      setNounForms(parsed as NounFormsData);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load noun forms.", variant: "destructive" });
      setShowNounForms(false);
    } finally {
      setNounFormsLoading(false);
    }
  };

  // ─── Noun Gender ─────────────────────────────────────────
  const handleLoadNounGender = async () => {
    if (nounGender) {
      setShowNounGender(!showNounGender);
      return;
    }
    if (!checkApiKey() || !result) return;

    setNounGenderLoading(true);
    setShowNounGender(true);

    const genderLangName = nativeLanguage === 'bo' ? 'Tibetan (བོད་སྐད)' : 'Hindi';
    const prompt = `You are an English grammar expert. The English noun is "${result.englishMeaning}" (${genderLangName}: "${result.hindiWord}").

Determine the grammatical gender and countability of this noun.

Respond with ONLY a valid JSON object:
{
  "gender": "Masculine / Feminine / Neuter / Common (most English nouns are Common or Neuter)",
  "genderHindi": "Gender in ${genderLangName}",
  "explanation": "Explain the gender classification in English with ${genderLangName} comparison",
  "explanationHindi": "Gender explanation in ${genderLangName}",
  "countability": "Countable / Uncountable",
  "countabilityHindi": "Countability in ${genderLangName}",
  "countabilityExplanation": "Explain why it is countable or uncountable, and how to use it with articles (a/an/the) or without. Include ${genderLangName} comparison."
}`;

    try {
      const responseText = await generateAIContentAction(apiKey!, aiProvider, prompt);
      const parsed = JSON.parse(responseText);
      setNounGender(parsed as NounGenderData);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load gender info.", variant: "destructive" });
      setShowNounGender(false);
    } finally {
      setNounGenderLoading(false);
    }
  };

  // ─── Adjective Degrees ───────────────────────────────────
  const handleLoadAdjDegrees = async () => {
    if (adjDegrees) {
      setShowAdjDegrees(!showAdjDegrees);
      return;
    }
    if (!checkApiKey() || !result) return;

    setAdjDegreesLoading(true);
    setShowAdjDegrees(true);

    const adjLangName = nativeLanguage === 'bo' ? 'Tibetan (བོད་སྐད)' : 'Hindi';
    const prompt = `You are an English grammar expert. The English adjective is "${result.englishMeaning}" (${adjLangName}: "${result.hindiWord}").

Provide the three degrees of comparison for this adjective.

Respond with ONLY a valid JSON object:
{
  "positive": "Positive degree (e.g., beautiful)",
  "comparative": "Comparative degree (e.g., more beautiful)",
  "superlative": "Superlative degree (e.g., most beautiful)",
  "rule": "Rule for forming comparative and superlative (e.g., For long adjectives, add 'more' for comparative and 'most' for superlative)",
  "ruleHindi": "Same rule in ${adjLangName}",
  "positiveExample": "She is beautiful.",
  "positiveExampleHindi": "${adjLangName} translation",
  "comparativeExample": "She is more beautiful than her sister.",
  "comparativeExampleHindi": "${adjLangName} translation",
  "superlativeExample": "She is the most beautiful girl in the class.",
  "superlativeExampleHindi": "${adjLangName} translation"
}`;

    try {
      const responseText = await generateAIContentAction(apiKey!, aiProvider, prompt);
      const parsed = JSON.parse(responseText);
      setAdjDegrees(parsed as AdjectiveDegreesData);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load adjective degrees.", variant: "destructive" });
      setShowAdjDegrees(false);
    } finally {
      setAdjDegreesLoading(false);
    }
  };

  // ─── Speak word using browser TTS ─────────────────────────
  const speakWord = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // ─── Determine which POS buttons to show ──────────────────
  const isVerb = result?.pos?.toLowerCase().includes('verb');
  const isNoun = result?.pos?.toLowerCase().includes('noun');
  const isAdjective = result?.pos?.toLowerCase().includes('adjective');

  // ─── Render ───────────────────────────────────────────────
  return (
    <Card className="shadow-lg">
      <CardHeader className="px-3 sm:px-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-headline text-primary flex items-center">
          <BookA className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          {t({ hi: 'Dictionary / शब्दकोश', bo: 'Dictionary / ཚིག་མཛོད' })}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground pt-1">
          {t({
            hi: 'Hindi → English या English → Hindi — दोनों काम करता है! Hindi ke liye English mein type karein, Space dabayein.',
            bo: 'བོད་ཡིག → English ཡང་ན English → བོད་ཡིག — གཉིས་ཀ་བཀོལ་ཐུབ! བོད་ཡིག་གཏག་པ་དང་ mic བཀོལ་ཐུབ།'
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 space-y-4">
        {/* Hidden camera file input */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraFile}
        />

        {/* Input Area with Transliteration */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Hindi या English में type करें... (e.g., khansi → खाँसी, या beautiful)"
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            onFocus={(e) => {
              setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
            }}
            onBlur={() => {
              setTimeout(() => clearSuggestions(), 150);
            }}
            rows={2}
            disabled={isListening || isLoading || isCameraProcessing}
            className="text-sm sm:text-base font-body"
          />
          {/* Transliteration Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
              <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                <span className="text-xs text-muted-foreground">
                  Hindi suggestions for &quot;<span className="font-semibold text-primary">{currentWord}</span>&quot;
                </span>
              </div>
              <div className="flex flex-wrap gap-1 p-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(s);
                    }}
                    className={cn(
                      "px-3 py-2.5 sm:py-1.5 rounded-md text-base sm:text-sm font-medium transition-colors cursor-pointer min-h-[44px] sm:min-h-0",
                      i === selectedSuggestionIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-stretch gap-2">
          <Button
            onClick={handleSearch}
            disabled={isLoading || isListening || isCameraProcessing || !inputText.trim()}
            className="flex-grow flex items-center justify-center text-sm"
          >
            {isLoading ? <LoadingSpinner inline /> : <><Search className="mr-2 h-5 w-5" /> Search</>}
          </Button>
          <Button
            variant="outline" size="icon" onClick={triggerCamera}
            disabled={isLoading || isListening || isCameraProcessing}
            className="shrink-0"
            title="Take photo to extract text"
          >
            {isCameraProcessing ? <LoadingSpinner inline /> : <Camera className="h-5 w-5 text-primary" />}
          </Button>
          <Button
            variant="outline" size="icon" onClick={handleMicClick}
            disabled={isLoading || isCameraProcessing || !isSpeechApiSupported}
            className={cn("shrink-0", isListening && "bg-red-500 hover:bg-red-600 text-white")}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-primary" />}
          </Button>
        </div>

        {/* Error */}
        {error && !isLoading && (
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ─── Result Card ──────────────────────────────────── */}
        {result && !isLoading && !error && (
          <Card className="mt-4 border-primary/50 shadow-md">
            <CardContent className="pt-5 space-y-4">
              {/* Main Meaning */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  {searchDirection === 'hi2en' ? (
                    <>
                      <p className="text-muted-foreground text-xs">Hindi: <span className="font-semibold text-foreground text-sm">{result.hindiWord}</span></p>
                      <p className="text-primary font-bold text-xl sm:text-2xl">{result.englishMeaning}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground text-xs">English: <span className="font-semibold text-foreground text-sm">{result.englishMeaning}</span></p>
                      <p className="text-primary font-bold text-xl sm:text-2xl">{result.hindiWord}</p>
                    </>
                  )}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <Badge variant="secondary" className="text-xs">{result.pos}</Badge>
                    <Badge variant="outline" className="text-xs">{result.posHindi}</Badge>
                    {result.pronunciation && (
                      <span className="text-xs text-muted-foreground italic">{result.pronunciation}</span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => speakWord(result.englishMeaning)} title="Listen pronunciation" className="shrink-0 mt-1">
                  <Volume2 className="h-5 w-5 text-primary" />
                </Button>
              </div>

              {/* Additional Meanings */}
              {result.additionalMeanings?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">{searchDirection === 'hi2en' ? 'Other English Meanings' : t({ hi: 'Other Hindi Meanings', bo: 'Other Tibetan Meanings' })} / {t({ hi: 'अन्य अर्थ', bo: 'གོ་དོན་གཞན' })}:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.additionalMeanings.map((m, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Synonyms & Antonyms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.synonyms?.length > 0 && (
                  <div className="p-2.5 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
                    <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Synonyms / {t({ hi: 'समानार्थी', bo: 'དོན་འདྲ' })}:</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.synonyms.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {result.antonyms?.length > 0 && (
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-800">
                    <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Antonyms / {t({ hi: 'विलोम', bo: 'དོན་ལྡོག' })}:</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.antonyms.map((a, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Example Sentences */}
              {result.examples?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Example Sentences / {t({ hi: 'उदाहरण', bo: 'དཔེར་བརྗོད' })}:</h4>
                  <div className="space-y-2">
                    {result.examples.map((ex, i) => (
                      <div key={i} className="p-2.5 bg-muted/30 rounded-md border text-sm">
                        <p className="text-foreground">{ex.english}</p>
                        <p className="text-muted-foreground italic text-xs mt-0.5">{ex.hindi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── POS-Conditional Feature Buttons ───────────── */}
              {(isVerb || isNoun || isAdjective) && (
                <div className="pt-2 border-t space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Learn More / {t({ hi: 'और सीखें', bo: 'ད་དུང་སྦྱོང' })}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {isVerb && (
                      <Button
                        variant={showVerbForms ? "default" : "outline"}
                        size="sm"
                        onClick={handleLoadVerbForms}
                        disabled={verbFormsLoading}
                        className="text-xs"
                      >
                        {verbFormsLoading ? <LoadingSpinner inline /> : <ArrowRightLeft className="mr-1.5 h-4 w-4" />}
                        Verb Forms (V1-V5)
                        {showVerbForms && !verbFormsLoading ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                      </Button>
                    )}
                    {isNoun && (
                      <>
                        <Button
                          variant={showNounForms ? "default" : "outline"}
                          size="sm"
                          onClick={handleLoadNounForms}
                          disabled={nounFormsLoading}
                          className="text-xs"
                        >
                          {nounFormsLoading ? <LoadingSpinner inline /> : <Users className="mr-1.5 h-4 w-4" />}
                          Singular / Plural
                          {showNounForms && !nounFormsLoading ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                        </Button>
                        <Button
                          variant={showNounGender ? "default" : "outline"}
                          size="sm"
                          onClick={handleLoadNounGender}
                          disabled={nounGenderLoading}
                          className="text-xs"
                        >
                          {nounGenderLoading ? <LoadingSpinner inline /> : <VenetianMask className="mr-1.5 h-4 w-4" />}
                          Gender Check
                          {showNounGender && !nounGenderLoading ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                        </Button>
                      </>
                    )}
                    {isAdjective && (
                      <Button
                        variant={showAdjDegrees ? "default" : "outline"}
                        size="sm"
                        onClick={handleLoadAdjDegrees}
                        disabled={adjDegreesLoading}
                        className="text-xs"
                      >
                        {adjDegreesLoading ? <LoadingSpinner inline /> : <GraduationCap className="mr-1.5 h-4 w-4" />}
                        Degrees of Adjective
                        {showAdjDegrees && !adjDegreesLoading ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* ─── Verb Forms Display ─────────────────────── */}
              {showVerbForms && (
                <div className="mt-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  {verbFormsLoading ? (
                    <div className="flex justify-center py-6"><LoadingSpinner /></div>
                  ) : verbForms ? (
                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                      <CardContent className="pt-4 space-y-3">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400 text-sm flex items-center">
                          <ArrowRightLeft className="mr-1.5 h-4 w-4" /> Verb Forms / {t({ hi: 'क्रिया रूप', bo: 'བྱ་ཚིག་གི་རྣམ་པ' })}
                        </h4>
                        {/* Forms Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-blue-100 dark:bg-blue-900/40">
                                <th className="text-left p-2 rounded-tl-md text-xs font-semibold text-blue-800 dark:text-blue-300">Form</th>
                                <th className="text-left p-2 rounded-tr-md text-xs font-semibold text-blue-800 dark:text-blue-300">Word</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-blue-200 dark:border-blue-800">
                                <td className="p-2 font-medium text-xs text-muted-foreground">V1 (Base)</td>
                                <td className="p-2 font-bold text-primary">{verbForms.base}</td>
                              </tr>
                              <tr className="border-b border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/10">
                                <td className="p-2 font-medium text-xs text-muted-foreground">V2 (Past Simple)</td>
                                <td className="p-2 font-bold text-primary">{verbForms.pastSimple}</td>
                              </tr>
                              <tr className="border-b border-blue-200 dark:border-blue-800">
                                <td className="p-2 font-medium text-xs text-muted-foreground">V3 (Past Participle)</td>
                                <td className="p-2 font-bold text-primary">{verbForms.pastParticiple}</td>
                              </tr>
                              <tr className="border-b border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/10">
                                <td className="p-2 font-medium text-xs text-muted-foreground">V4 (V-ing)</td>
                                <td className="p-2 font-bold text-primary">{verbForms.presentParticiple}</td>
                              </tr>
                              <tr>
                                <td className="p-2 font-medium text-xs text-muted-foreground">V5 (V-s/es)</td>
                                <td className="p-2 font-bold text-primary">{verbForms.thirdPersonSingular}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        {/* Examples */}
                        {verbForms.examples?.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <h5 className="text-xs font-semibold text-muted-foreground">Examples / {t({ hi: 'उदाहरण', bo: 'དཔེར་བརྗོད' })}:</h5>
                            {verbForms.examples.map((ex, i) => (
                              <div key={i} className="p-2 bg-background rounded-md border text-xs">
                                <span className="font-bold text-blue-600 dark:text-blue-400">{ex.form}</span>
                                <span className="text-muted-foreground"> ({ex.label}): </span>
                                <span className="text-foreground">{ex.sentence}</span>
                                <p className="text-muted-foreground italic mt-0.5">{ex.sentenceHindi}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              )}

              {/* ─── Noun Forms Display ─────────────────────── */}
              {showNounForms && (
                <div className="mt-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  {nounFormsLoading ? (
                    <div className="flex justify-center py-6"><LoadingSpinner /></div>
                  ) : nounForms ? (
                    <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
                      <CardContent className="pt-4 space-y-3">
                        <h4 className="font-semibold text-purple-700 dark:text-purple-400 text-sm flex items-center">
                          <Users className="mr-1.5 h-4 w-4" /> Singular & Plural / {t({ hi: 'एकवचन और बहुवचन', bo: 'གཅིག་ཚིག་དང་མང་ཚིག' })}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-background rounded-md border text-center">
                            <p className="text-xs text-muted-foreground mb-1">Singular / {t({ hi: 'एकवचन', bo: 'གཅིག་ཚིག' })}</p>
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{nounForms.singular}</p>
                          </div>
                          <div className="p-3 bg-background rounded-md border text-center">
                            <p className="text-xs text-muted-foreground mb-1">Plural / {t({ hi: 'बहुवचन', bo: 'མང་ཚིག' })}</p>
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{nounForms.plural}</p>
                          </div>
                        </div>
                        <div className="p-2.5 bg-purple-100/50 dark:bg-purple-900/30 rounded-md border border-purple-200 dark:border-purple-800">
                          <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-0.5">Rule / {t({ hi: 'नियम', bo: 'སྒྲིག་གཞི' })}:</p>
                          <p className="text-xs text-foreground">{nounForms.pluralRule}</p>
                          <p className="text-xs text-muted-foreground italic">{nounForms.pluralRuleHindi}</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="p-2 bg-background rounded-md border text-xs">
                            <span className="font-semibold text-purple-600 dark:text-purple-400">Singular: </span>
                            <span>{nounForms.singularExample}</span>
                            <p className="text-muted-foreground italic mt-0.5">{nounForms.singularExampleHindi}</p>
                          </div>
                          <div className="p-2 bg-background rounded-md border text-xs">
                            <span className="font-semibold text-purple-600 dark:text-purple-400">Plural: </span>
                            <span>{nounForms.pluralExample}</span>
                            <p className="text-muted-foreground italic mt-0.5">{nounForms.pluralExampleHindi}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              )}

              {/* ─── Noun Gender Display ────────────────────── */}
              {showNounGender && (
                <div className="mt-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  {nounGenderLoading ? (
                    <div className="flex justify-center py-6"><LoadingSpinner /></div>
                  ) : nounGender ? (
                    <Card className="border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/20">
                      <CardContent className="pt-4 space-y-3">
                        <h4 className="font-semibold text-pink-700 dark:text-pink-400 text-sm flex items-center">
                          <VenetianMask className="mr-1.5 h-4 w-4" /> Gender & Countability / {t({ hi: 'लिंग और गणनीयता', bo: 'ཕོ་མོ་དང་གྲངས་ཐུབ' })}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-background rounded-md border text-center">
                            <p className="text-xs text-muted-foreground mb-1">Gender / {t({ hi: 'लिंग', bo: 'ཕོ་མོ' })}</p>
                            <p className="text-lg font-bold text-pink-700 dark:text-pink-400">{nounGender.gender}</p>
                            <p className="text-xs text-muted-foreground">{nounGender.genderHindi}</p>
                          </div>
                          <div className="p-3 bg-background rounded-md border text-center">
                            <p className="text-xs text-muted-foreground mb-1">Countability</p>
                            <p className="text-lg font-bold text-pink-700 dark:text-pink-400">{nounGender.countability}</p>
                            <p className="text-xs text-muted-foreground">{nounGender.countabilityHindi}</p>
                          </div>
                        </div>
                        <div className="p-2.5 bg-pink-100/50 dark:bg-pink-900/30 rounded-md border border-pink-200 dark:border-pink-800 space-y-1">
                          <p className="text-xs font-semibold text-pink-700 dark:text-pink-400">Explanation / {t({ hi: 'व्याख्या', bo: 'འགྲེལ་བཤད' })}:</p>
                          <p className="text-xs text-foreground">{nounGender.explanation}</p>
                          <p className="text-xs text-muted-foreground italic">{nounGender.explanationHindi}</p>
                        </div>
                        {nounGender.countabilityExplanation && (
                          <div className="p-2.5 bg-background rounded-md border text-xs">
                            <p className="font-semibold text-pink-600 dark:text-pink-400 mb-0.5">Countability Detail:</p>
                            <p>{nounGender.countabilityExplanation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              )}

              {/* ─── Adjective Degrees Display ──────────────── */}
              {showAdjDegrees && (
                <div className="mt-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  {adjDegreesLoading ? (
                    <div className="flex justify-center py-6"><LoadingSpinner /></div>
                  ) : adjDegrees ? (
                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                      <CardContent className="pt-4 space-y-3">
                        <h4 className="font-semibold text-amber-700 dark:text-amber-400 text-sm flex items-center">
                          <GraduationCap className="mr-1.5 h-4 w-4" /> Degrees of Adjective / {t({ hi: 'विशेषण की अवस्थाएं', bo: 'རྒྱན་ཚིག་གི་ཚད་གནས' })}
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2.5 bg-background rounded-md border text-center">
                            <p className="text-[10px] text-muted-foreground mb-1">Positive / {t({ hi: 'मूलावस्था', bo: 'གཞི་རིམ' })}</p>
                            <p className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400">{adjDegrees.positive}</p>
                          </div>
                          <div className="p-2.5 bg-background rounded-md border text-center">
                            <p className="text-[10px] text-muted-foreground mb-1">Comparative / {t({ hi: 'उत्तरावस्था', bo: 'ཆེས་ཆེ' })}</p>
                            <p className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400">{adjDegrees.comparative}</p>
                          </div>
                          <div className="p-2.5 bg-background rounded-md border text-center">
                            <p className="text-[10px] text-muted-foreground mb-1">Superlative / {t({ hi: 'उत्तमावस्था', bo: 'མཆོག་ཏུ་ཆེ' })}</p>
                            <p className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400">{adjDegrees.superlative}</p>
                          </div>
                        </div>
                        <div className="p-2.5 bg-amber-100/50 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-800">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Rule / {t({ hi: 'नियम', bo: 'སྒྲིག་གཞི' })}:</p>
                          <p className="text-xs text-foreground">{adjDegrees.rule}</p>
                          <p className="text-xs text-muted-foreground italic">{adjDegrees.ruleHindi}</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="p-2 bg-background rounded-md border text-xs">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">Positive: </span>
                            <span>{adjDegrees.positiveExample}</span>
                            <p className="text-muted-foreground italic mt-0.5">{adjDegrees.positiveExampleHindi}</p>
                          </div>
                          <div className="p-2 bg-background rounded-md border text-xs">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">Comparative: </span>
                            <span>{adjDegrees.comparativeExample}</span>
                            <p className="text-muted-foreground italic mt-0.5">{adjDegrees.comparativeExampleHindi}</p>
                          </div>
                          <div className="p-2 bg-background rounded-md border text-xs">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">Superlative: </span>
                            <span>{adjDegrees.superlativeExample}</span>
                            <p className="text-muted-foreground italic mt-0.5">{adjDegrees.superlativeExampleHindi}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              )}

            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
