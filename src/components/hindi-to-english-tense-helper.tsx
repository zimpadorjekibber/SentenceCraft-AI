// src/components/hindi-to-english-tense-helper.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingSpinner } from './loading-spinner';
import { InteractiveSentence } from './interactive-sentence';
import { HighlightedRules } from './highlighted-rules';
import { useToast } from "@/hooks/use-toast";
import { Languages, Brain, AlertCircle, Mic, MicOff, BookOpen, Camera, MessageCircle, Loader2 } from 'lucide-react';
import type { WordPos } from '@/types/ai-types';
import { cn } from '@/lib/utils';
import { generateAIContentAction } from '@/ai/flows/generate-content-action';
import type { AiProvider } from '@/lib/ai-client';
import { useHindiTransliteration } from '@/hooks/use-hindi-transliteration';
import { useCameraOcr } from '@/hooks/use-camera-ocr';
import { useAuth } from '@/context/auth-context';
import { saveSentence, incrementStat, incrementTenseUsage, incrementFeatureUsage, updateStreak } from '@/lib/firestore-service';

interface AnalyzeHindiForEnglishTenseOutput {
  identifiedEnglishTense: string;
  reasoning: string;
  exampleEnglishSentence: WordPos[];
  englishTenseRuleKey: string;
  error?: string;
}

interface HindiToEnglishTenseHelperProps {
  apiKey: string | null;
  aiProvider: AiProvider;
  onWordDetailRequest: (wordData: WordPos, fullSentenceText: string) => void;
  onViewDetailedRulesRequest: (tenseName: string) => void;
}

export function HindiToEnglishTenseHelper({ apiKey, aiProvider, onWordDetailRequest, onViewDetailedRulesRequest }: HindiToEnglishTenseHelperProps) {
  const { user, refreshStats } = useAuth();
  const [hindiInput, setHindiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeHindiForEnglishTenseOutput | null>(null);

  const [spokenResult, setSpokenResult] = useState<{ sentence: WordPos[]; hindiTranslation: string; spokenNote: string } | null>(null);
  const [isSpokenLoading, setIsSpokenLoading] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSpeechApiSupported, setIsSpeechApiSupported] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  const { toast } = useToast();

  const {
    suggestions,
    currentWord,
    fetchSuggestions,
    applySuggestion,
    clearSuggestions,
  } = useHindiTransliteration();

  const { fileInputRef: cameraInputRef, isProcessing: isCameraProcessing, triggerCamera, handleFileSelected: handleCameraFile } = useCameraOcr({
    apiKey,
    aiProvider,
    onTextExtracted: (text) => {
      setHindiInput(text);
      setAnalysisResult(null);
      setError(null);
      clearSuggestions();
      toast({ title: "Text Extracted!", description: "Image se Hindi text nikaal kar input mein daal diya." });
    },
    onError: (message) => {
      toast({ title: "OCR Failed", description: message, variant: "destructive" });
    },
    language: 'hindi',
  });

  const checkApiKey = useCallback(() => {
    if (!apiKey) {
      toast({ title: "API Key Missing", description: "Please set your API key to use this feature.", variant: "destructive" });
      return false;
    }
    return true;
  }, [apiKey, toast]);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSpeechApiSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
        toast({ title: "बोलना शुरू करें..." });
      };
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
            if (event.results[i]?.[0]) {
              currentTranscript += event.results[i][0].transcript || '';
            }
        }
        setHindiInput(currentTranscript);
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
      // Check permission state first using Permissions API
      let permissionBlocked = false;
      try {
        const permStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permStatus.state === 'denied') {
          permissionBlocked = true;
        }
      } catch {
        // Permissions API not supported, proceed with getUserMedia
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

      // Request mic permission (required on mobile browsers)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately - we just needed the permission
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
      setHindiInput('');
      setAnalysisResult(null);
      setError(null);
      clearSuggestions();
      recognitionRef.current.start();
    }
  };

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    const { newText, newCursorPos } = applySuggestion(hindiInput, suggestion);
    setHindiInput(newText);
    setSelectedSuggestionIndex(0);
    // Restore focus and cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [applySuggestion, hindiInput]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setHindiInput(value);
    if (analysisResult) setAnalysisResult(null);
    if (error) setError(null);
    setSelectedSuggestionIndex(0);

    const cursorPos = e.target.selectionStart ?? value.length;
    fetchSuggestions(value, cursorPos);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      // Select the highlighted suggestion
      if (suggestions[selectedSuggestionIndex]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      clearSuggestions();
    } else if (e.key === ' ') {
      // On space, auto-select the first suggestion
      if (suggestions.length > 0 && currentWord.length > 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[0]);
      }
    }
  };

  const handleAnalyzeHindi = async () => {
    if (isListening) recognitionRef.current?.stop();
    clearSuggestions();
    if (!hindiInput.trim()) {
      setError("कृपया विश्लेषण के लिए एक हिंदी वाक्य दर्ज करें।");
      return;
    }

    if (!checkApiKey()) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setSpokenResult(null);

    const prompt = `
        You are an expert English teacher who is fluent in Hindi.
        Analyze the following Hindi sentence to determine the most appropriate English tense to convey the same meaning.

        Hindi Sentence: "${hindiInput}"

        Task:
        1. Identify the most suitable English tense (e.g., "Present Perfect", "Past Indefinite").
        2. Provide a clear, concise reasoning for your choice, referencing cues from the Hindi sentence (like "रहा था", "चुका है", etc.).
        3. Create a simple, clear example English sentence that uses this tense and reflects the meaning of the Hindi sentence.
        4. Break down your example English sentence into an array of objects, each with "word" (string) and "pos" (Part-of-Speech tag string like "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Determiner", "Auxiliary", "Punctuation", etc.).
        5. Provide the exact key for the English tense (e.g., "PastPerfect") for rule lookup.

        Respond with ONLY a valid JSON object (no extra text):
        { "identifiedEnglishTense": "Present Continuous", "reasoning": "...", "exampleEnglishSentence": [{"word":"He","pos":"Pronoun"},{"word":"is","pos":"Auxiliary"},{"word":"going","pos":"Verb"},{"word":".","pos":"Punctuation"}], "englishTenseRuleKey": "PresentContinuous" }
        If the input is not valid Hindi, respond with { "error": "The provided text does not appear to be a valid Hindi sentence." }.
    `;

    try {
      const responseText = await generateAIContentAction(apiKey!, aiProvider, prompt);
      const parsedResult: AnalyzeHindiForEnglishTenseOutput = JSON.parse(responseText);

      if (parsedResult.error) {
        setError(parsedResult.error);
        toast({ title: "Analysis Failed", description: parsedResult.error, variant: "destructive" });
      } else {
        // Validate exampleEnglishSentence is a proper WordPos array
        if (parsedResult.exampleEnglishSentence && !Array.isArray(parsedResult.exampleEnglishSentence)) {
          // AI returned a string instead of array - convert it
          const sentenceStr = String(parsedResult.exampleEnglishSentence);
          parsedResult.exampleEnglishSentence = sentenceStr.split(/\s+/).map(word => {
            const cleanWord = word.replace(/[.,!?;:]$/, '');
            const punct = word.match(/[.,!?;:]$/)?.[0];
            const result: WordPos[] = [];
            if (cleanWord) result.push({ word: cleanWord, pos: 'Unknown' });
            if (punct) result.push({ word: punct, pos: 'Punctuation' });
            return result;
          }).flat();
        }
        setAnalysisResult(parsedResult);
        // Save to Firestore
        if (user && parsedResult.exampleEnglishSentence) {
          const sentenceText = Array.isArray(parsedResult.exampleEnglishSentence)
            ? parsedResult.exampleEnglishSentence.map((w: WordPos) => w.word).join(' ')
            : String(parsedResult.exampleEnglishSentence);
          saveSentence(user.uid, {
            sentenceText,
            sentenceTagged: Array.isArray(parsedResult.exampleEnglishSentence) ? parsedResult.exampleEnglishSentence : [],
            hindiTranslation: hindiInput,
            tense: parsedResult.identifiedEnglishTense || null,
            source: 'hindi_helper',
            action: 'tense_identification',
            inputWords: null,
            isFavorite: false,
          }).catch(() => {});
          incrementStat(user.uid, 'totalAnalyses').catch(() => {});
          if (parsedResult.identifiedEnglishTense) {
            incrementTenseUsage(user.uid, parsedResult.identifiedEnglishTense).catch(() => {});
          }
          incrementFeatureUsage(user.uid, 'hindi_helper').catch(() => {});
          updateStreak(user.uid).catch(() => {});
          refreshStats().catch(() => {});
        }
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
      toast({ title: "Analysis Exception", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpokenConvert = async () => {
    if (!analysisResult?.exampleEnglishSentence?.length) return;
    if (spokenResult) { setSpokenResult(null); return; } // Toggle off
    if (!checkApiKey()) return;

    const sentenceText = analysisResult.exampleEnglishSentence.map(w => w.word).join(' ');
    setIsSpokenLoading(true);

    const prompt = `You are a fluent English speaker who helps students learn real-life conversational English.

The student has learned this textbook sentence:
"${sentenceText}"

Convert it to how a native English speaker would ACTUALLY say it in everyday conversation.

Rules:
- Use natural contractions (I'm, don't, gonna, wanna, it's, he's, etc.)
- Use informal/casual vocabulary if appropriate
- Use common spoken phrases and fillers if they sound natural
- Shorten or simplify long/formal structures
- Keep the core meaning the same
- Also provide a "spokenNote" explaining 2-3 key differences between the textbook version and the spoken version, in simple Hindi so Indian students understand. Keep it short (2-3 bullet points).

HINDI GRAMMAR RULE FOR PERFECT TENSES:
- For TRANSITIVE verbs in Perfect tenses: subject MUST use ergative "ने" — मैंने, उसने, हमने, तुमने, उन्होंने. Example: "मैंने क्रिकेट खेला है" (NOT "मैं क्रिकेट खेला है").
- For INTRANSITIVE verbs: Do NOT use "ने". Subject stays as-is.

Respond with ONLY a valid JSON object:
{
  "sentence": [ { "word": "...", "pos": "..." }, ... ],
  "hindiTranslation": "Hindi translation of the spoken sentence",
  "spokenNote": "• Textbook vs Spoken difference 1\\n• Difference 2\\n• Difference 3"
}`;

    try {
      const responseText = await generateAIContentAction(apiKey!, aiProvider, prompt);
      const parsed = JSON.parse(responseText);
      if (parsed.sentence && Array.isArray(parsed.sentence)) {
        setSpokenResult({
          sentence: parsed.sentence,
          hindiTranslation: parsed.hindiTranslation || '',
          spokenNote: parsed.spokenNote || '',
        });
      }
    } catch (e: any) {
      toast({ title: "Spoken Conversion Error", description: e.message || "Could not convert.", variant: "destructive" });
    } finally {
      setIsSpokenLoading(false);
    }
  };

  return (
    <Card className="shadow-lg mt-6 sm:mt-8">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-headline text-primary flex items-center">
          <Languages className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          Hindi to English Tense Helper
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground pt-1">
          Type in English to get Hindi suggestions (e.g., type "main" → मैं). Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs font-mono">Space</kbd> or <kbd className="px-1 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> to select. You can also speak in Hindi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden camera file input */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraFile}
        />
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type in English for Hindi suggestions, or use mic/camera..."
            value={hindiInput}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            onFocus={(e) => {
              setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
            }}
            onBlur={() => {
              // Delay clearing so click on suggestion works
              setTimeout(() => clearSuggestions(), 150);
            }}
            rows={3}
            disabled={isListening || isLoading || isCameraProcessing}
            className="text-sm sm:text-base font-body"
            lang="hi"
          />
          {/* Hindi Transliteration Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
            >
              <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                <span className="text-xs text-muted-foreground">
                  Hindi suggestions for "<span className="font-semibold text-primary">{currentWord}</span>"
                </span>
              </div>
              <div className="flex flex-wrap gap-1 p-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent textarea blur
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
        <div className="flex items-stretch gap-2">
            <Button
              onClick={handleAnalyzeHindi}
              disabled={isLoading || isListening || isCameraProcessing || !hindiInput.trim()}
              className="flex-grow flex items-center justify-center text-sm"
            >
              {isLoading ? <LoadingSpinner inline /> : <><Brain className="mr-2 h-5 w-5" /> Find Tense</>}
            </Button>
            <Button
                variant="outline" size="icon" onClick={triggerCamera}
                disabled={isLoading || isListening || isCameraProcessing}
                className="shrink-0"
                title="Take photo to extract Hindi text"
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

        {error && !isLoading && (
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && !isLoading && !error && (
          <Card className="mt-4 border-primary shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-md sm:text-lg text-primary">Analysis Result:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm sm:text-base">
              <div>
                <h4 className="font-semibold text-muted-foreground">Suggested Tense:</h4>
                <p className="text-primary font-bold text-base sm:text-lg">{analysisResult.identifiedEnglishTense}</p>
              </div>

              {analysisResult.reasoning && (
                <div>
                  <h4 className="font-semibold text-muted-foreground">Reasoning:</h4>
                  <div className="p-2 bg-muted/30 rounded-md border text-xs sm:text-sm">
                    <HighlightedRules rules={analysisResult.reasoning} />
                  </div>
                </div>
              )}

              {analysisResult.exampleEnglishSentence?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-muted-foreground">Example Sentence:</h4>
                  <InteractiveSentence
                    taggedSentence={analysisResult.exampleEnglishSentence}
                    onWordDetailRequest={onWordDetailRequest}
                    sentenceIdentifier="hindiHelperExample"
                  />

                  {/* Spoken English toggle button */}
                  <Button
                    size="sm"
                    variant={spokenResult ? "default" : "outline"}
                    className={`text-xs sm:text-sm ${
                      spokenResult
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30'
                    }`}
                    onClick={handleSpokenConvert}
                    disabled={isSpokenLoading}
                  >
                    {isSpokenLoading ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    🗣️ Spoken English (बोलचाल)
                  </Button>

                  {/* Spoken English result */}
                  {spokenResult && (
                    <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/40 rounded-full">
                        <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">🗣️ Spoken Version</span>
                        <span className="text-xs text-green-600/70 dark:text-green-400/70" lang="hi">(बोलचाल)</span>
                      </div>
                      <InteractiveSentence
                        taggedSentence={spokenResult.sentence}
                        onWordDetailRequest={onWordDetailRequest}
                        sentenceIdentifier="hindiHelperSpoken"
                      />
                      {spokenResult.hindiTranslation && (
                        <p className="text-sm text-muted-foreground italic px-1" lang="hi">
                          {spokenResult.hindiTranslation}
                        </p>
                      )}
                      {spokenResult.spokenNote && (
                        <div className="pt-1">
                          <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5 mb-1">
                            <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                            📖 Textbook vs 🗣️ Real Life — क्या बदला?
                          </p>
                          <div className="text-xs sm:text-sm text-green-800 dark:text-green-300 whitespace-pre-line" lang="hi">
                            {spokenResult.spokenNote}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {analysisResult.englishTenseRuleKey && (
                <Button
                  variant="outline" size="default"
                  onClick={() => onViewDetailedRulesRequest(analysisResult.englishTenseRuleKey)}
                  className="text-xs sm:text-sm mt-2 w-full sm:w-auto"
                  >
                    <BookOpen className="mr-1.5 h-4 w-4" />
                    View Rules for {analysisResult.identifiedEnglishTense}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
