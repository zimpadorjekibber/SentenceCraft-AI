"use client";

import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpenText, Sparkles, Wand2, FlaskConical, AlertCircle, Printer, Settings, KeyRound, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

// Component Imports
import { SentenceInputForm, type WordInputs } from '@/components/sentence-input-form';
import { TenseSelector } from '@/components/tense-selector';
import { GeneratedSentenceDisplay } from '@/components/generated-sentence-display';
import { LoadingSpinner } from '@/components/loading-spinner';

// Lazy load heavy components that aren't needed on initial render
const SentenceModification = lazy(() => import('@/components/sentence-modification').then(m => ({ default: m.SentenceModification })));
const SentenceAnalyzer = lazy(() => import('@/components/sentence-analyzer').then(m => ({ default: m.SentenceAnalyzer })));
const HindiToEnglishTenseHelper = lazy(() => import('@/components/hindi-to-english-tense-helper').then(m => ({ default: m.HindiToEnglishTenseHelper })));
import { AuthButton } from '@/components/auth-button';
import { ApiKeyDialog, type AiProvider } from '@/components/api-key-dialog';

// AI Server Actions
import { generateSentenceAction } from '@/ai/flows/sentence-generator';
import { generateAIContentAction } from '@/ai/flows/generate-content-action';

// Type Imports
import type { WordPos } from '@/types/ai-types';
import { DETAILED_TENSE_RULES } from '@/lib/detailed-tense-rules-data';

// UI components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { HighlightedRules } from '@/components/highlighted-rules';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HomePage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<AiProvider>('gemini');
  const [wordInputs, setWordInputs] = useState<WordInputs>({
    subject: '', verb: '', object: '', adjective: '', adverb: '', 
    preposition: '', conjunction: '', determiner: '', interjection: '', otherWords: ''
  });
  const [selectedTense, setSelectedTense] = useState<string | null>("Present Indefinite");
  const [generatedSentence, setGeneratedSentence] = useState<WordPos[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDetailedRulesDialog, setShowDetailedRulesDialog] = useState(false);
  const [detailedRulesTense, setDetailedRulesTense] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  // Word Detail Dialog state
  const [showWordDetailDialog, setShowWordDetailDialog] = useState(false);
  const [wordDetailLoading, setWordDetailLoading] = useState(false);
  const [wordDetailData, setWordDetailData] = useState<{
    word: string;
    pos: string;
    subType: string;
    subTypeHindi: string;
    definition: string;
    definitionHindi: string;
    useCases: string[];
    examples: { word: string; sentence: string; sentenceHindi: string }[];
    rules: string[];
  } | null>(null);

  const { toast } = useToast();

  // Load API key and provider from local storage on mount to avoid hydration mismatch
  useEffect(() => {
    const storedProvider = (localStorage.getItem('ai_provider') as AiProvider) || 'gemini';
    setAiProvider(storedProvider);
    const storedApiKey = localStorage.getItem(`${storedProvider}_api_key`);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleInputChange = useCallback((fieldName: keyof WordInputs, value: string) => {
    setWordInputs(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const isGenerateDisabled = useMemo(() => {
    return isLoading || !wordInputs.subject || !wordInputs.verb || !wordInputs.object || !selectedTense;
  }, [isLoading, wordInputs, selectedTense]);

  const handleGenerateSentence = async () => {
    if (!apiKey) {
      toast({ title: "API Key Missing", description: "Please set your API key in the settings.", variant: "destructive" });
      setShowApiKeyDialog(true);
      return;
    }

    if (!wordInputs.subject || !wordInputs.verb || !wordInputs.object || !selectedTense) {
      toast({ title: "Missing Fields", description: "Please fill in Subject, Verb, and Object.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedSentence(null);

    try {
      const result = await generateSentenceAction({
        ...wordInputs,
        tense: selectedTense,
        apiKey: apiKey,
        provider: aiProvider
      });
      
      if (result?.sentence?.length) {
        setGeneratedSentence(result.sentence);
        toast({ title: "Sentence Crafted!", description: "AI has successfully generated your sentence." });
      } else {
        throw new Error("AI returned an empty sentence. Please try again.");
      }
    } catch (e: any) {
      console.error("AI Generation Error:", e);
      const message = e?.message || "An unexpected error occurred while generating.";
      setError(message);
      toast({ title: "Generation Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewDetailedRules = (tense: string) => {
      setDetailedRulesTense(tense);
      setShowDetailedRulesDialog(true);
  };

  const handleWordDetailRequest = async (wordData: WordPos, fullSentenceText?: string) => {
    // Show dialog immediately with loading state
    setWordDetailData(null);
    setShowWordDetailDialog(true);
    setWordDetailLoading(true);

    if (!apiKey) {
      toast({ title: "API Key Missing", description: "Please set your API key for detailed word info.", variant: "destructive" });
      setShowWordDetailDialog(false);
      setWordDetailLoading(false);
      return;
    }

    const prompt = `You are an expert English teacher fluent in Hindi. A student clicked on the word "${wordData.word}" (tagged as "${wordData.pos}") in the sentence: "${fullSentenceText || ''}".

Provide a detailed vocabulary lesson for this word. Respond with ONLY a valid JSON object (no extra text):
{
  "word": "${wordData.word}",
  "pos": "${wordData.pos}",
  "subType": "The specific sub-type (e.g., for Noun: Common Noun/Proper Noun/Abstract Noun/Collective Noun/Material Noun; for Verb: Transitive/Intransitive/Auxiliary/Modal; for Adjective: Descriptive/Possessive/Demonstrative/Quantitative/Interrogative; for Adverb: Manner/Time/Place/Frequency/Degree; for Pronoun: Personal/Possessive/Reflexive/Demonstrative etc.)",
  "subTypeHindi": "Sub-type in Hindi (e.g., जातिवाचक संज्ञा, सकर्मक क्रिया, गुणवाचक विशेषण)",
  "definition": "Clear English definition of the word as used in this sentence",
  "definitionHindi": "Hindi definition (हिंदी में अर्थ)",
  "useCases": ["3-4 rules/use cases explaining when and how to use this type of word, written simply for students"],
  "examples": [
    {"word": "example word 1", "sentence": "Full example sentence using a similar word of the SAME sub-type", "sentenceHindi": "Hindi translation"},
    {"word": "example word 2", "sentence": "Another example", "sentenceHindi": "Hindi translation"},
    {"word": "example word 3", "sentence": "Another example", "sentenceHindi": "Hindi translation"},
    {"word": "example word 4", "sentence": "Another example", "sentenceHindi": "Hindi translation"},
    {"word": "example word 5", "sentence": "Another example", "sentenceHindi": "Hindi translation"}
  ],
  "rules": ["2-3 important grammar rules about this POS sub-type in simple language with Hindi cues"]
}`;

    try {
      const responseText = await generateAIContentAction(apiKey, aiProvider, prompt);
      const parsed = JSON.parse(responseText);
      if (parsed.error) {
        toast({ title: "Error", description: parsed.error, variant: "destructive" });
        setShowWordDetailDialog(false);
      } else {
        setWordDetailData(parsed);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to get word details.", variant: "destructive" });
      setShowWordDetailDialog(false);
    } finally {
      setWordDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-6 sm:py-8 px-4 font-body">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-6 sm:mb-8 text-center relative">
          <div className="absolute top-0 left-0">
            <AuthButton />
          </div>
          <div className="absolute top-0 right-0 flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setShowApiKeyDialog(true)}>
              <Settings className="h-5 w-5" />
            </Button>
            <ApiKeyDialog
              isOpen={showApiKeyDialog}
              onOpenChange={setShowApiKeyDialog}
              currentApiKey={apiKey}
              currentProvider={aiProvider}
              onSave={(newKey, provider) => {
                setApiKey(newKey);
                setAiProvider(provider);
                localStorage.setItem(`${provider}_api_key`, newKey);
                localStorage.setItem('ai_provider', provider);
                toast({ title: "Settings Saved!", description: `Your ${provider === 'groq' ? 'Groq' : 'Gemini'} API key has been saved.` });
                setShowApiKeyDialog(false);
              }}
              onClear={() => {
                setApiKey(null);
                localStorage.removeItem(`${aiProvider}_api_key`);
                toast({ title: "API Key Removed", description: "Your API key has been cleared." });
              }}
            />
          </div>
          <div className="inline-flex items-center justify-center bg-primary/10 p-3 rounded-full mb-3 sm:mb-4">
            <BookOpenText className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-extrabold text-primary tracking-tight">
            SentenceCraft AI
          </h1>
          <p className="mt-2 sm:mt-3 text-md sm:text-lg md:text-xl text-muted-foreground">
            Craft perfect English sentences with AI.
          </p>
        </header>
        
        {!apiKey && (
          <Alert className="mb-6 shadow-lg border-accent animate-pulse-subtle">
            <KeyRound className="h-5 w-5 text-accent" />
            <AlertTitle>Welcome! Set Your API Key</AlertTitle>
            <AlertDescription>
              To start generating sentences, please set your API key. Both Gemini and Groq are <strong>FREE</strong> to use.
              <Button variant="link" className="p-0 h-auto ml-1 font-bold" onClick={() => setShowApiKeyDialog(true)}>Open settings.</Button>
            </AlertDescription>
          </Alert>
        )}

        {error && (
            <Alert variant="destructive" className="mb-6 shadow-lg">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    <div>{error}</div>
                </AlertDescription>
            </Alert>
        )}

        <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generator" className="text-xs sm:text-sm"><Wand2 className="mr-2 h-4 w-4"/>Sentence Generator</TabsTrigger>
                <TabsTrigger value="lab" className="text-xs sm:text-sm"><FlaskConical className="mr-2 h-4 w-4"/>Sentence Lab</TabsTrigger>
            </TabsList>
            <TabsContent value="generator">
                <main className="space-y-6 sm:space-y-8 mt-6">
                    <SentenceInputForm values={wordInputs} onChange={handleInputChange} disabled={isLoading} />
                    <TenseSelector selectedTense={selectedTense} onTenseSelect={setSelectedTense} disabled={isLoading} />
                    <div className="text-center">
                        <Button
                            size="lg"
                            onClick={handleGenerateSentence}
                            disabled={isGenerateDisabled}
                            className="w-full sm:w-auto text-base sm:text-lg font-bold shadow-lg"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            {isLoading ? 'Crafting...' : 'Craft Sentence'}
                        </Button>
                    </div>

                    <GeneratedSentenceDisplay
                        sentence={generatedSentence}
                        isLoading={isLoading}
                        onViewDetailedRules={() => selectedTense && handleViewDetailedRules(selectedTense)}
                        onWordDetailRequest={handleWordDetailRequest}
                    />
                    
                    <Suspense fallback={<div className="flex justify-center p-4"><LoadingSpinner /></div>}>
                      <SentenceModification
                          apiKey={apiKey}
                          aiProvider={aiProvider}
                          originalSentenceTagged={generatedSentence}
                          onSuggestionSelect={(suggestion) => setGeneratedSentence(suggestion)}
                          onWordDetailRequest={handleWordDetailRequest}
                      />
                    </Suspense>

                </main>
            </TabsContent>
            <TabsContent value="lab" className="mt-6">
                <Suspense fallback={<div className="flex justify-center p-8"><LoadingSpinner /></div>}>
                  <SentenceAnalyzer
                      apiKey={apiKey}
                      aiProvider={aiProvider}
                      onWordDetailRequest={handleWordDetailRequest}
                  />
                  <HindiToEnglishTenseHelper
                      apiKey={apiKey}
                      aiProvider={aiProvider}
                      onWordDetailRequest={handleWordDetailRequest}
                      onViewDetailedRulesRequest={(tense) => handleViewDetailedRules(tense)}
                  />
                </Suspense>
            </TabsContent>
        </Tabs>
        
        <AlertDialog open={showDetailedRulesDialog} onOpenChange={setShowDetailedRulesDialog}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg sm:text-xl text-primary">
                        Detailed Rules for: {detailedRulesTense}
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="text-sm sm:text-base leading-relaxed text-foreground font-body">
                         <HighlightedRules rules={DETAILED_TENSE_RULES[detailedRulesTense || ""] || "Rules not available."} />
                    </div>
                </ScrollArea>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setShowDetailedRulesDialog(false)}>Got it!</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Word Detail Dialog */}
        <AlertDialog open={showWordDetailDialog} onOpenChange={setShowWordDetailDialog}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg sm:text-xl text-primary flex items-center">
                        <BookOpen className="mr-2 h-5 w-5" />
                        {wordDetailData ? (
                          <>Word: &quot;{wordDetailData.word}&quot; — <span className="text-accent ml-1">{wordDetailData.pos}</span></>
                        ) : (
                          "Loading word details..."
                        )}
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <ScrollArea className="max-h-[65vh] pr-4">
                  {wordDetailLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <LoadingSpinner />
                      <p className="text-sm text-muted-foreground">AI se detailed vocabulary info la rahe hain...</p>
                    </div>
                  ) : wordDetailData ? (
                    <div className="space-y-4 text-sm sm:text-base font-body">
                      {/* Sub-Type Badge */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-sm">
                          {wordDetailData.subType}
                        </span>
                        <span className="px-3 py-1 bg-accent/10 text-accent font-semibold rounded-full text-sm">
                          {wordDetailData.subTypeHindi}
                        </span>
                      </div>

                      {/* Definition */}
                      <div className="p-3 bg-muted/40 rounded-md border space-y-1">
                        <h4 className="font-semibold text-primary text-sm">Definition / अर्थ:</h4>
                        <p className="text-foreground">{wordDetailData.definition}</p>
                        <p className="text-muted-foreground italic">{wordDetailData.definitionHindi}</p>
                      </div>

                      {/* Use Cases */}
                      {wordDetailData.useCases?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-primary text-sm mb-2">Use Cases / प्रयोग:</h4>
                          <ul className="space-y-1.5">
                            {wordDetailData.useCases.map((uc, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-primary font-bold mt-0.5">•</span>
                                <span>{uc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Grammar Rules */}
                      {wordDetailData.rules?.length > 0 && (
                        <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                          <h4 className="font-semibold text-primary text-sm mb-2">Grammar Rules / नियम:</h4>
                          <ul className="space-y-1.5">
                            {wordDetailData.rules.map((rule, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                                <span>{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Examples */}
                      {wordDetailData.examples?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-primary text-sm mb-2">
                            More Examples of {wordDetailData.subType} / और उदाहरण:
                          </h4>
                          <div className="space-y-2">
                            {wordDetailData.examples.map((ex, i) => (
                              <div key={i} className="p-2.5 bg-muted/30 rounded-md border text-sm">
                                <p>
                                  <span className="font-bold text-primary">{ex.word}</span>
                                  {" — "}{ex.sentence}
                                </p>
                                <p className="text-muted-foreground italic text-xs mt-0.5">{ex.sentenceHindi}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </ScrollArea>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setShowWordDetailDialog(false)}>Got it!</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <footer className="mt-12 sm:mt-16 text-center text-muted-foreground text-xs sm:text-sm space-y-2">
          <Link href="/print-chart" passHref>
             <Button variant="outline" size="sm"><Printer className="mr-2 h-4 w-4"/> View & Print Tense Chart</Button>
          </Link>
          <p>&copy; {new Date().getFullYear()} SentenceCraft AI. Powered by You, Gemini & Groq.</p>
        </footer>
      </div>
    </div>
  );
}
