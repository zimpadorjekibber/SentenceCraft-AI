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
import { Languages, Brain, AlertCircle, Mic, MicOff, BookOpen, Camera } from 'lucide-react';
import type { WordPos } from '@/types/ai-types';
import { cn } from '@/lib/utils';
import { generateAIContentAction } from '@/ai/flows/generate-content-action';
import type { AiProvider } from '@/lib/ai-client';
import { useHindiTransliteration } from '@/hooks/use-hindi-transliteration';
import { useCameraOcr } from '@/hooks/use-camera-ocr';

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
  const [hindiInput, setHindiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeHindiForEnglishTenseOutput | null>(null);

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
            currentTranscript += event.results[i][0].transcript;
        }
        setHindiInput(currentTranscript);
      };
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        toast({ title: "Speech Error", description: `Error: ${event.error}`, variant: "destructive" });
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

  const handleMicClick = () => {
    if (!isSpeechApiSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
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
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
      toast({ title: "Analysis Exception", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
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
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
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
        <div className="flex flex-col sm:flex-row items-stretch space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onClick={handleAnalyzeHindi}
              disabled={isLoading || isListening || isCameraProcessing || !hindiInput.trim()}
              className="flex-grow flex items-center justify-center text-sm"
            >
              {isLoading ? <LoadingSpinner inline /> : <><Brain className="mr-2 h-4 w-4" /> Find English Tense</>}
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
                <div>
                  <h4 className="font-semibold text-muted-foreground">Example Sentence:</h4>
                  <InteractiveSentence
                    taggedSentence={analysisResult.exampleEnglishSentence}
                    onWordDetailRequest={onWordDetailRequest}
                    sentenceIdentifier="hindiHelperExample"
                  />
                </div>
              )}

              {analysisResult.englishTenseRuleKey && (
                <Button
                  variant="outline" size="sm"
                  onClick={() => onViewDetailedRulesRequest(analysisResult.englishTenseRuleKey)}
                  className="text-xs sm:text-sm mt-2"
                  >
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" />
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
