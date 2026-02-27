"use client";

import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpenText, Sparkles, Wand2, FlaskConical, AlertCircle, Printer, Settings, KeyRound } from 'lucide-react';
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
import { ApiKeyDialog } from '@/components/api-key-dialog';

// AI Server Actions
import { generateSentenceAction } from '@/ai/flows/sentence-generator';

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

  const { toast } = useToast();

  // Load API key from local storage on mount to avoid hydration mismatch
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini_api_key');
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
      toast({ title: "API Key Missing", description: "Please set your Gemini API key in the settings.", variant: "destructive" });
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
        apiKey: apiKey
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

  const handleWordDetailRequest = (wordData: WordPos, fullSentenceText?: string) => {
    toast({
        title: `Word: "${wordData.word}"`,
        description: `Part of Speech: ${wordData.pos}${fullSentenceText ? `\nIn: "${fullSentenceText}"` : ''}`,
    });
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
              onSave={(newKey) => {
                setApiKey(newKey);
                localStorage.setItem('gemini_api_key', newKey);
                toast({ title: "API Key Saved!", description: "Your Gemini API key has been saved." });
                setShowApiKeyDialog(false);
              }}
              onClear={() => {
                setApiKey(null);
                localStorage.removeItem('gemini_api_key');
                toast({ title: "API Key Removed", description: "Your Gemini API key has been cleared." });
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
              To start generating sentences, please set your Google Gemini API key. Gemini 1.5 Flash is <strong>FREE</strong> to use.
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
                      onWordDetailRequest={handleWordDetailRequest}
                  />
                  <HindiToEnglishTenseHelper
                      apiKey={apiKey}
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

        <footer className="mt-12 sm:mt-16 text-center text-muted-foreground text-xs sm:text-sm space-y-2">
          <Link href="/print-chart" passHref>
             <Button variant="outline" size="sm"><Printer className="mr-2 h-4 w-4"/> View & Print Tense Chart</Button>
          </Link>
          <p>&copy; {new Date().getFullYear()} SentenceCraft AI. Powered by You and Google AI Studio.</p>
        </footer>
      </div>
    </div>
  );
}
