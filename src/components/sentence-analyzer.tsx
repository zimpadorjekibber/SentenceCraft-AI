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
  Shapes,
  TextCursorInput,
  Camera
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
            currentTranscript += event.results[i][0].transcript;
        }
        setInputText(currentTranscript);
      };
      recognition!.onerror = (event: SpeechRecognitionErrorEvent) => {
        toast({ title: "Speech Error", description: `Error: ${event.error}`, variant: "destructive" });
        setIsListening(false);
      };
      recognition!.onend = () => setIsListening(false);
    }
    return () => recognitionRef.current?.abort();
  }, [toast]);

  const handleMicClick = () => {
    if (!isSpeechApiSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
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
        You are an English grammar expert. Analyze the following sentence.
        Sentence: "${inputText}"
        Task:
        1. Break down into an array of objects, each with "word" (string) and "pos" (Part-of-Speech tag string like "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Determiner", "Auxiliary", "Punctuation", etc.).
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

  const handleAnalyzeArticles = () => {
    handleGenericAction("Article Check", () => `
        You are an English grammar expert. Analyze the articles (a, an, the) in the following sentence.
        Sentence: "${inputText}"
        Task:
        1. Check if articles are used correctly. If missing or wrong, suggest corrections.
        2. Explain the article rules for each used or suggested article in simple language.
        3. Break down the corrected sentence into an array of objects, each with "word" (string) and "pos" (Part-of-Speech tag string like "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Determiner", "Auxiliary", "Punctuation", etc.).
        4. Translate the corrected sentence into natural Hindi.
        Respond with ONLY a valid JSON object (no extra text):
        { "rewrittenSentence": [{"word":"The","pos":"Determiner"},{"word":"cat","pos":"Noun"},...], "hindiTranslation": "...", "explanation": "..." }
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
        />
        <div className="flex flex-col sm:flex-row items-stretch space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || isListening || isCameraProcessing || !inputText.trim()}
            className="flex-grow flex items-center justify-center text-sm"
          >
            {isLoading && currentAction === 'Analysis' ? <LoadingSpinner inline /> : <><ScanText className="mr-2 h-4 w-4" /> Analyze Sentence</>}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Generator */}
            <div className="space-y-2 p-3 border rounded-md">
              <h4 className="text-md font-semibold text-primary flex items-center"><MessageCircleQuestion className="mr-2 h-4 w-4" />Question Builder</h4>
              <div className="flex flex-col gap-2">
                <Select value={selectedQuestionType || ''} onValueChange={setSelectedQuestionType}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{QUESTION_TYPES.map(q => <SelectItem key={q.value} value={q.value} className="text-xs">{q.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleMakeQuestion} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs h-8">
                    {isLoading && currentAction === 'Question Generation' ? <LoadingSpinner inline /> : "Make Question"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleFeatureInfoClick("Questions")} className="h-8"><BookOpenCheck className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            {/* Modal Verbs */}
            <div className="space-y-2 p-3 border rounded-md">
              <h4 className="text-md font-semibold text-primary flex items-center"><HelpCircle className="mr-2 h-4 w-4" />Modal Transformer</h4>
              <div className="flex flex-col gap-2">
                <Select value={selectedModalVerbForRewrite || ''} onValueChange={setSelectedModalVerbForRewrite}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Select modal" /></SelectTrigger>
                    <SelectContent>{MODAL_VERBS.map(m => <SelectItem key={m.value} value={m.value} className="text-xs">{m.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleModalRewrite} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs h-8">
                    {isLoading && currentAction === 'Modal Rewrite' ? <LoadingSpinner inline /> : "Apply Modal"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleFeatureInfoClick("Modals")} className="h-8"><BookOpenCheck className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            {/* Conditionals */}
            <div className="space-y-2 p-3 border rounded-md">
              <h4 className="text-md font-semibold text-primary flex items-center"><Sparkles className="mr-2 h-4 w-4" />Conditional Master</h4>
              <div className="flex flex-col gap-2">
                <Select value={selectedConditional || ''} onValueChange={setSelectedConditional}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{CONDITIONALS.map(c => <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleTransformConditional} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs h-8">
                    {isLoading && currentAction === 'Conditional Transformation' ? <LoadingSpinner inline /> : "Transform"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleFeatureInfoClick("Conditionals")} className="h-8"><BookOpenCheck className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="space-y-2 p-3 border rounded-md">
              <h4 className="text-md font-semibold text-primary flex items-center"><Shapes className="mr-2 h-4 w-4" />Articles & Determiners</h4>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleAnalyzeArticles} disabled={isLoading || !inputText.trim()} className="text-xs h-8">
                  {isLoading && currentAction === 'Article Check' ? <LoadingSpinner inline /> : "Check Article Usage"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleFeatureInfoClick("Articles")} className="text-xs h-8 w-full"><BookOpenCheck className="mr-2 h-3 w-3" /> View Article Rules</Button>
              </div>
            </div>

            {/* Punctuate */}
            <div className="space-y-2 p-3 border rounded-md flex flex-col justify-between">
              <h4 className="text-md font-semibold text-primary flex items-center"><TextCursorInput className="mr-2 h-4 w-4" />Punctuate</h4>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleGenericAction("Punctuation", () => `You are an English grammar expert. Add correct punctuation to the following sentence. The sentence may be missing commas, periods, question marks, exclamation marks, apostrophes, quotation marks, colons, semicolons, or capital letters at the start. Sentence: "${inputText}". Task: 1. Add all missing punctuation marks and fix capitalization. 2. Explain what punctuation was added and why, referencing punctuation rules. 3. Break down the punctuated sentence into an array of objects, each with "word" (string) and "pos" (Part-of-Speech tag string like "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Determiner", "Auxiliary", "Punctuation", etc.). 4. Translate the punctuated sentence into natural Hindi. Respond with ONLY a valid JSON object (no extra text): { "rewrittenSentence": [{"word":"He","pos":"Pronoun"},{"word":"said","pos":"Verb"},{"word":",","pos":"Punctuation"},{"word":"Hello","pos":"Interjection"},{"word":"!","pos":"Punctuation"}], "hindiTranslation": "...", "explanation": "..." }`)} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs h-8">
                  {isLoading && currentAction === 'Punctuation' ? <LoadingSpinner inline /> : "Punctuate"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleFeatureInfoClick("Punctuation")} className="h-8"><BookOpenCheck className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="space-y-2 p-3 border rounded-md flex flex-col justify-between">
              <h4 className="text-md font-semibold text-primary flex items-center"><Repeat className="mr-2 h-4 w-4" />Active/Passive Voice</h4>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleGenericAction("Voice", () => `You are an English grammar expert. Transform the following sentence to the other grammatical voice (active to passive or passive to active). Sentence: "${inputText}". Task: 1. Transform the voice. 2. Explain the rule. 3. Break down into array of objects with "word" (string) and "pos" (string like "Noun","Verb","Auxiliary", etc.). 4. Translate to Hindi. Respond with ONLY valid JSON: { "transformedSentence": [{"word":"The","pos":"Determiner"},...], "hindiTranslation": "...", "explanation": "..." }`)} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs h-8">Voice Swap</Button>
                <Button variant="ghost" size="sm" onClick={() => handleFeatureInfoClick("Active and Passive Voice")} className="h-8"><BookOpenCheck className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <div className="space-y-2 p-3 border rounded-md flex flex-col justify-between">
              <h4 className="text-md font-semibold text-primary flex items-center"><Quote className="mr-2 h-4 w-4" />Direct/Indirect Speech</h4>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleGenericAction("Speech", () => `You are an English grammar expert. Transform the following sentence between direct and indirect (reported) speech. Sentence: "${inputText}". Task: 1. Transform the speech type. 2. Explain the rule. 3. Break down into array of objects with "word" (string) and "pos" (string like "Noun","Verb","Auxiliary", etc.). 4. Translate to Hindi. Respond with ONLY valid JSON: { "transformedSentence": [{"word":"He","pos":"Pronoun"},...], "hindiTranslation": "...", "explanation": "..." }`)} disabled={isLoading || !inputText.trim()} className="flex-grow text-xs h-8">Speech Swap</Button>
                <Button variant="ghost" size="sm" onClick={() => handleFeatureInfoClick("Direct and Indirect Speech")} className="h-8"><BookOpenCheck className="h-4 w-4" /></Button>
              </div>
            </div>
        </div>
      </CardContent>

      <AlertDialog open={showFeatureRuleDialog} onOpenChange={setShowFeatureRuleDialog}>
        <AlertDialogContent className="max-w-2xl">
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
