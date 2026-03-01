// src/components/sentence-analyzer.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { InteractiveSentence } from './interactive-sentence';
import { LoadingSpinner } from './loading-spinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ScanText,
  Info,
  Mic,
  MicOff,
  Repeat,
  BookOpenCheck,
  MessageCircleQuestion,
  HelpCircle,
  Quote,
  Sparkles,
  TextCursorInput,
  Camera,
  MessageCircle
} from 'lucide-react';

import type { WordPos } from '@/types/ai-types';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { HighlightedRules } from './highlighted-rules';
import { GRAMMAR_FEATURE_RULES } from '@/lib/grammar-feature-rules';
import { generateAIContentAction } from '@/ai/flows/generate-content-action';
import type { AiProvider } from '@/lib/ai-client';
import { useCameraOcr } from '@/hooks/use-camera-ocr';

interface SentenceAnalyzerProps {
  apiKey: string | null;
  aiProvider: AiProvider;
  onWordDetailRequest: (wordData: WordPos, fullSentenceText: string) => void;
}

const QUESTION_TYPES = [
  { value: "What", label: "What (क्या)" },
  { value: "Why", label: "Why (क्यों)" },
  { value: "When", label: "When (कब)" },
  { value: "Where", label: "Where (कहाँ)" },
  { value: "Who", label: "Who (कौन)" },
  { value: "How", label: "How (कैसे)" },
  { value: "Yes/No", label: "Yes/No (Is/Are/Do/Does etc.)" }
];

const MODAL_VERBS = [
  { value: "can", label: "can (Ability, Permission)" },
  { value: "could", label: "could (Past Ability, Polite Request)" },
  { value: "may", label: "may (Permission, Possibility)" },
  { value: "might", label: "might (Possibility)" },
  { value: "must", label: "must (Obligation)" },
  { value: "should", label: "should (Advice)" },
];

const CONDITIONALS = [
  { value: "Zero", label: "Zero (General Truths)" },
  { value: "First", label: "First (Real Possibilities)" },
  { value: "Second", label: "Second (Imaginary - If I were...)" },
  { value: "Third", label: "Third (Past Regrets - If I had...)" }
];

type GrammarRuleKey = keyof typeof GRAMMAR_FEATURE_RULES;

function wordPosArrayToString(sentence: WordPos[]): string {
    return sentence.map(wp => wp.word).join(" ").replace(/ \./g, ".").replace(/ \?/g, "?").replace(/ \!/g, "!").replace(/ ,/g, ",");
}

export function SentenceAnalyzer({ apiKey, aiProvider, onWordDetailRequest }: SentenceAnalyzerProps) {
  const [inputText, setInputText] = useState('');
  const [analyzedSentence, setAnalyzedSentence] = useState<WordPos[] | null>(null);
  const [analyzedSentenceHindi, setAnalyzedSentenceHindi] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedQuestionType, setSelectedQuestionType] = useState<string | null>(QUESTION_TYPES[0].value);
  const [selectedModalVerbForRewrite, setSelectedModalVerbForRewrite] = useState<string | null>(null);
  const [selectedConditional, setSelectedConditional] = useState<string | null>(CONDITIONALS[0].value);
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSpeechApiSupported, setIsSpeechApiSupported] = useState(false); 

  const [lastTransformationExplanation, setLastTransformationExplanation] = useState<string | null>(null);

  const [showFeatureRuleDialog, setShowFeatureRuleDialog] = useState(false);
  const [activeFeatureRuleTitle, setActiveFeatureRuleTitle] = useState<string | null>(null);
  const [activeFeatureRuleContent, setActiveFeatureRuleContent] = useState<string | null>(null);
  
  const { toast } = useToast();

  const { fileInputRef: cameraInputRef, isProcessing: isCameraProcessing, triggerCamera, handleFileSelected: handleCameraFile } = useCameraOcr({
    apiKey,
    aiProvider,
    onTextExtracted: (text) => {
      setInputText(text);
      resetAllOutputs(false);
      toast({ title: "Text Extracted!", description: "Image se text nikaal kar input mein daal diya." });
    },
    onError: (message) => {
      toast({ title: "OCR Failed", description: message, variant: "destructive" });
    },
    language: 'english',
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
      recognitionRef.current = new SpeechRecognitionAPI();
      const recognition = recognitionRef.current;
      recognition!.continuous = false;
      recognition!.interimResults = true;
      recognition!.lang = 'en-US';

      recognition!.onstart = () => setIsListening(true);
      recognition!.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
            if (event.results[i]?.[0]) {
              currentTranscript += event.results[i][0].transcript || '';
            }
        }
        setInputText(currentTranscript);
      };
      recognition!.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessages: Record<string, string> = {
          'not-allowed': 'Microphone permission denied। कृपया browser settings में mic allow करें।',
          'no-speech': 'कोई आवाज़ नहीं सुनाई दी। फिर से बोलें।',
          'network': 'Network error। Internet connection check करें।',
          'aborted': 'Speech recognition बंद हो गया।',
        };
        toast({ title: "Speech Error", description: errorMessages[event.error] || `Error: ${event.error}`, variant: "destructive" });
        setIsListening(false);
      };
      recognition!.onend = () => setIsListening(false);
    }
    return () => recognitionRef.current?.abort();
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
      setInputText('');
      resetAllOutputs();
      recognitionRef.current.start();
    }
  };

  const resetAllOutputs = (keepAnalyzed: boolean = false) => {
    if (!keepAnalyzed) {
        setAnalyzedSentence(null); 
        setAnalyzedSentenceHindi(null); 
    }
    setError(null);
    if (!keepAnalyzed) { 
        setLastTransformationExplanation(null);
    }
  }

  const handleGenericAction = async (actionType: string, promptGenerator: () => string) => {
    if (isListening) recognitionRef.current?.stop();
    if (!inputText.trim()) {
        toast({ title: "Input Missing", description: "Please provide a sentence.", variant: "destructive" });
        return;
    }

    if (!checkApiKey()) return;

    setIsLoading(true);
    setCurrentAction(actionType);
    setError(null);
    resetAllOutputs(true);

    const prompt = promptGenerator();

    try {
        const responseText = await generateAIContentAction(apiKey!, aiProvider, prompt);
        const parsedResult = JSON.parse(responseText);

        if (parsedResult.error) {
            throw new Error(parsedResult.error);
        }

        const newSentence = parsedResult.sentence || parsedResult.transformedSentence || parsedResult.rewrittenSentence || parsedResult.generatedQuestion;
        if (newSentence) {
            setInputText(wordPosArrayToString(newSentence));
            setAnalyzedSentence(newSentence);
            setAnalyzedSentenceHindi(parsedResult.hindiTranslation || null);
            setLastTransformationExplanation(parsedResult.explanation || null);
            toast({ title: `${actionType} Complete!`, description: "The sentence has been updated." });
        } else if (parsedResult.taggedSentence) {
            setAnalyzedSentence(parsedResult.taggedSentence);
            setAnalyzedSentenceHindi(parsedResult.hindiTranslation || null);
            setLastTransformationExplanation(null);
            toast({ title: "Analysis Complete!" });
        } else {
            throw new Error("The AI response was not in the expected format.");
        }
    } catch (e: any) {
        console.error(`Error during ${actionType}:`, e);
        const errorMessage = e.message || "An unexpected error occurred.";
        setError(errorMessage);
        toast({ title: `${actionType} Failed`, description: errorMessage, variant: "destructive" });
    } finally {
        setIsLoading(false);
        setCurrentAction(null);
    }
  };

  const handleAnalyze = () => {
    handleGenericAction("Analysis", () => `
        You are an English grammar expert. Analyze the following sentence with CONTEXTUAL accuracy.
        Sentence: "${inputText}"

        CRITICAL RULES for POS tagging:
        - Tag each word based on its ACTUAL FUNCTION in THIS sentence, not just its dictionary default.
        - Words like "who", "which", "that" can be Pronouns OR Conjunctions depending on context:
          * "Who is there?" → "Who" = Pronoun (Interrogative Pronoun)
          * "The boy who came here is smart." → "who" = Conjunction (Relative Pronoun acting as conjunction connecting clauses)
        - Words like "that" can be Determiner, Pronoun, OR Conjunction:
          * "That book is good." → "That" = Determiner
          * "I know that he is coming." → "that" = Conjunction
        - "before", "after", "since", "until" can be Preposition OR Conjunction depending on whether they connect clauses or relate to nouns.
        - Always consider the SENTENCE STRUCTURE to determine the correct POS.

        Task:
        1. Break down into an array of objects, each with "word" (string) and "pos" (Part-of-Speech tag string like "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Determiner", "Auxiliary", "Punctuation", etc.). Use the CONTEXTUALLY CORRECT POS.
        2. Translate into natural Hindi.
        3. Respond with ONLY a valid JSON object (no extra text): { "taggedSentence": [{"word":"The","pos":"Determiner"},{"word":"cat","pos":"Noun"},...], "hindiTranslation": "..." }
    `);
  };

  const handleMakeQuestion = () => {
    handleGenericAction("Question Generation", () => `
        You are an English grammar expert. Transform the following sentence into a "${selectedQuestionType}" type question.
        Sentence: "${inputText}"
        Task:
        1. Generate the question from the given sentence.
        2. Explain the grammar rule for forming this type of question in simple language.
        3. Break down the generated question into an array of objects, each with "word" (string) and "pos" (Part-of-Speech tag string like "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Determiner", "Auxiliary", "Punctuation", etc.).
        4. Translate the generated question into natural Hindi.
        Respond with ONLY a valid JSON object (no extra text):
        { "generatedQuestion": [{"word":"What","pos":"Pronoun"},{"word":"do","pos":"Auxiliary"},...], "hindiTranslation": "...", "explanation": "..." }
    `);
  };

  const handleModalRewrite = () => {
    if (!selectedModalVerbForRewrite) {
        toast({ title: "Select Modal", description: "Please select a modal verb.", variant: "destructive" });
        return;
    }
    handleGenericAction("Modal Rewrite", () => `
        You are an English grammar expert. Rewrite the following sentence using the modal verb "${selectedModalVerbForRewrite}".
        Sentence: "${inputText}"
        Task:
        1. Rewrite the sentence correctly using "${selectedModalVerbForRewrite}".
        2. Explain the modal verb usage rule in simple language.
        3. Break down the rewritten sentence into an array of objects, each with "word" (string) and "pos" (Part-of-Speech tag string like "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Determiner", "Auxiliary", "Punctuation", etc.).
        4. Translate the rewritten sentence into natural Hindi.
        Respond with ONLY a valid JSON object (no extra text):
        { "rewrittenSentence": [{"word":"He","pos":"Pronoun"},{"word":"can","pos":"Auxiliary"},...], "hindiTranslation": "...", "explanation": "..." }
    `);
  };

  const handleTransformConditional = () => {
    handleGenericAction("Conditional Transformation", () => `
        You are an English grammar expert. Transform the following sentence into a ${selectedConditional} Conditional sentence.
        Sentence: "${inputText}"
        Task:
        1. Rewrite the sentence as a ${selectedConditional} conditional.
        2. Explain the conditional rule applied in simple language.
        3. Break down the transformed sentence into an array of objects, each with "word" (string) and "pos" (Part-of-Speech tag string like "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Determiner", "Auxiliary", "Punctuation", etc.).
        4. Translate the transformed sentence into natural Hindi.
        Respond with ONLY a valid JSON object (no extra text):
        { "transformedSentence": [{"word":"If","pos":"Conjunction"},{"word":"I","pos":"Pronoun"},...], "hindiTranslation": "...", "explanation": "..." }
    `);
  };

  const handleFeatureInfoClick = (featureKey: GrammarRuleKey) => {
    const rule = GRAMMAR_FEATURE_RULES[featureKey];
    setActiveFeatureRuleTitle(featureKey);
    setActiveFeatureRuleContent(rule || "Rules not available.");
    setShowFeatureRuleDialog(true);
  };
  
  return (
    <Card className="shadow-lg mt-6 sm:mt-8">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-headline text-primary flex items-center">
          <ScanText className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          Advanced Grammar Lab
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground pt-1">
          Explore advanced features like Questions, Modals, Conditionals, and Voice.
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
        <Textarea
          placeholder="Paste your sentence here, or use mic/camera..."
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            resetAllOutputs(false);
          }}
          rows={3}
          disabled={isListening || isLoading || isCameraProcessing}
          className="text-sm sm:text-base"
          onFocus={(e) => {
            setTimeout(() => {
              e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }}
        />
        <div className="flex items-stretch gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || isListening || isCameraProcessing || !inputText.trim()}
            className="flex-grow flex items-center justify-center text-sm"
          >
            {isLoading && currentAction === 'Analysis' ? <LoadingSpinner inline /> : <><ScanText className="mr-2 h-4 w-4" /> Analyze</>}
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

        {analyzedSentence && (
          <div className="mt-4 space-y-2 p-3 bg-muted/50 rounded-md border">
            <h4 className="text-md sm:text-lg font-semibold text-primary flex items-center"><Info className="mr-2 h-5 w-5" />Result:</h4>
            <InteractiveSentence
              taggedSentence={analyzedSentence}
              onWordDetailRequest={onWordDetailRequest}
              sentenceIdentifier="analyzer"
            />
            {analyzedSentenceHindi && (
              <p className="text-xs sm:text-sm text-muted-foreground italic pl-1 font-body">
                Hindi: {analyzedSentenceHindi}
              </p>
            )}
            {lastTransformationExplanation && (
              <div className="mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                <h5 className="font-semibold text-primary/90 mb-1">Explanation:</h5>
                <HighlightedRules rules={lastTransformationExplanation} />
              </div>
            )}
          </div>
        )}

        <Separator className="my-6" />

        <div className="grid grid-cols-2 gap-3">
            {/* Question Generator */}
            <div className="space-y-2 p-3 border rounded-lg">
              <h4 className="text-sm font-semibold text-primary flex items-center"><MessageCircleQuestion className="mr-1.5 h-4 w-4 shrink-0" />Questions</h4>
              <div className="flex flex-col gap-2">
                <Select value={selectedQuestionType || ''} onValueChange={setSelectedQuestionType}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{QUESTION_TYPES.map(q => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-1.5">
                  <Button variant="outline" onClick={handleMakeQuestion} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs">
                    {isLoading && currentAction === 'Question Generation' ? <LoadingSpinner inline /> : "Make"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleFeatureInfoClick("Questions")} className="shrink-0"><BookOpenCheck className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            {/* Modal Verbs */}
            <div className="space-y-2 p-3 border rounded-lg">
              <h4 className="text-sm font-semibold text-primary flex items-center"><HelpCircle className="mr-1.5 h-4 w-4 shrink-0" />Modals</h4>
              <div className="flex flex-col gap-2">
                <Select value={selectedModalVerbForRewrite || ''} onValueChange={setSelectedModalVerbForRewrite}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Select modal" /></SelectTrigger>
                    <SelectContent>{MODAL_VERBS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-1.5">
                  <Button variant="outline" onClick={handleModalRewrite} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs">
                    {isLoading && currentAction === 'Modal Rewrite' ? <LoadingSpinner inline /> : "Apply"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleFeatureInfoClick("Modals")} className="shrink-0"><BookOpenCheck className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            {/* Conditionals */}
            <div className="space-y-2 p-3 border rounded-lg">
              <h4 className="text-sm font-semibold text-primary flex items-center"><Sparkles className="mr-1.5 h-4 w-4 shrink-0" />Conditionals</h4>
              <div className="flex flex-col gap-2">
                <Select value={selectedConditional || ''} onValueChange={setSelectedConditional}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{CONDITIONALS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-1.5">
                  <Button variant="outline" onClick={handleTransformConditional} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs">
                    {isLoading && currentAction === 'Conditional Transformation' ? <LoadingSpinner inline /> : "Transform"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleFeatureInfoClick("Conditionals")} className="shrink-0"><BookOpenCheck className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            {/* Punctuate */}
            <div className="space-y-2 p-3 border rounded-lg flex flex-col justify-between">
              <h4 className="text-sm font-semibold text-primary flex items-center"><TextCursorInput className="mr-1.5 h-4 w-4 shrink-0" />Punctuate</h4>
              <div className="flex gap-1.5">
                <Button variant="outline" onClick={() => handleGenericAction("Punctuation", () => `You are an English grammar expert. Add correct punctuation to the following sentence. The sentence may be missing commas, periods, question marks, exclamation marks, apostrophes, quotation marks, colons, semicolons, or capital letters at the start. Sentence: "${inputText}". Task: 1. Add all missing punctuation marks and fix capitalization. 2. Explain what punctuation was added and why, referencing punctuation rules. 3. Break down the punctuated sentence into an array of objects, each with "word" (string) and "pos" (Part-of-Speech tag string like "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Determiner", "Auxiliary", "Punctuation", etc.). 4. Translate the punctuated sentence into natural Hindi. Respond with ONLY a valid JSON object (no extra text): { "rewrittenSentence": [{"word":"He","pos":"Pronoun"},{"word":"said","pos":"Verb"},{"word":",","pos":"Punctuation"},{"word":"Hello","pos":"Interjection"},{"word":"!","pos":"Punctuation"}], "hindiTranslation": "...", "explanation": "..." }`)} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs">
                  {isLoading && currentAction === 'Punctuation' ? <LoadingSpinner inline /> : "Fix"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleFeatureInfoClick("Punctuation")} className="shrink-0"><BookOpenCheck className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="space-y-2 p-3 border rounded-lg flex flex-col justify-between">
              <h4 className="text-sm font-semibold text-primary flex items-center"><Repeat className="mr-1.5 h-4 w-4 shrink-0" />Voice</h4>
              <div className="flex gap-1.5">
                <Button variant="outline" onClick={() => handleGenericAction("Voice", () => `You are an English grammar expert. Transform the following sentence to the other grammatical voice (active to passive or passive to active). Sentence: "${inputText}". Task: 1. Transform the voice. 2. Explain the rule. 3. Break down into array of objects with "word" (string) and "pos" (string like "Noun","Verb","Auxiliary", etc.). 4. Translate to Hindi. Respond with ONLY valid JSON: { "transformedSentence": [{"word":"The","pos":"Determiner"},...], "hindiTranslation": "...", "explanation": "..." }`)} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs">Swap</Button>
                <Button variant="ghost" size="icon" onClick={() => handleFeatureInfoClick("Active and Passive Voice")} className="shrink-0"><BookOpenCheck className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <div className="space-y-2 p-3 border rounded-lg flex flex-col justify-between">
              <h4 className="text-sm font-semibold text-primary flex items-center"><Quote className="mr-1.5 h-4 w-4 shrink-0" />Speech</h4>
              <div className="flex gap-1.5">
                <Button variant="outline" onClick={() => handleGenericAction("Speech", () => `You are an English grammar expert. Transform the following sentence between direct and indirect (reported) speech. Sentence: "${inputText}". Task: 1. Transform the speech type. 2. Explain the rule. 3. Break down into array of objects with "word" (string) and "pos" (string like "Noun","Verb","Auxiliary", etc.). 4. Translate to Hindi. Respond with ONLY valid JSON: { "transformedSentence": [{"word":"He","pos":"Pronoun"},...], "hindiTranslation": "...", "explanation": "..." }`)} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs">Swap</Button>
                <Button variant="ghost" size="icon" onClick={() => handleFeatureInfoClick("Direct and Indirect Speech")} className="shrink-0"><BookOpenCheck className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Spoken English */}
            <div className="space-y-2 p-3 border rounded-lg flex flex-col justify-between border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20 col-span-2">
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center"><MessageCircle className="mr-1.5 h-4 w-4 shrink-0" />🗣️ Spoken English (बोलचाल)</h4>
              <div className="flex gap-1.5">
                <Button variant="outline" onClick={() => handleGenericAction("Spoken English", () => `You are a fluent English speaker who helps students learn real-life conversational English.

The student has this textbook/formal sentence:
"${inputText}"

Convert it to how a native English speaker would ACTUALLY say it in everyday conversation.

Rules:
- Use natural contractions (I'm, don't, gonna, wanna, it's, he's, etc.)
- Use informal/casual vocabulary if appropriate
- Use common spoken phrases and fillers if they sound natural
- Shorten or simplify long/formal structures
- Keep the core meaning the same

Task:
1. Convert to spoken/conversational English.
2. Explain 2-3 key differences between textbook and spoken version in simple Hindi so Indian students understand (use bullet points).
3. Break down the spoken sentence into an array of objects with "word" (string) and "pos" (Part-of-Speech tag like "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Determiner", "Auxiliary", "Punctuation", etc.).
4. Translate the spoken sentence into natural Hindi.

Respond with ONLY a valid JSON object:
{ "rewrittenSentence": [{"word":"I'm","pos":"Pronoun"},{"word":"gonna","pos":"Verb"},...], "hindiTranslation": "...", "explanation": "📖 Textbook vs 🗣️ Real Life — क्या बदला?\\n• Point 1\\n• Point 2\\n• Point 3" }`)} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs border-green-400 text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950/40">
                  {isLoading && currentAction === 'Spoken English' ? <LoadingSpinner inline /> : "Convert"}
                </Button>
              </div>
            </div>
        </div>
      </CardContent>

      <AlertDialog open={showFeatureRuleDialog} onOpenChange={setShowFeatureRuleDialog}>
        <AlertDialogContent className="sm:max-w-2xl">
          <AlertDialogHeader><AlertDialogTitle>{activeFeatureRuleTitle}</AlertDialogTitle></AlertDialogHeader>
          <div className="max-h-[60vh] pr-4 overflow-y-auto">
            <div className="text-sm text-muted-foreground"><HighlightedRules rules={activeFeatureRuleContent || ''} /></div>
          </div>
          <AlertDialogFooter><AlertDialogAction>Got it!</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
