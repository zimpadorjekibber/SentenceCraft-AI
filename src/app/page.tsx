"use client";

import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpenText, Sparkles, Wand2, FlaskConical, AlertCircle, Printer, Settings, KeyRound, BookOpen, Share2, Download } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { AppQrCode } from '@/components/app-qr-code';

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
    contextualPos: string;
    contextualPosHindi: string;
    sentenceType: string;
    sentenceTypeHindi: string;
    subType: string;
    subTypeHindi: string;
    definition: string;
    definitionHindi: string;
    useCases: string[];
    examples: { word: string; sentence: string; sentenceHindi: string }[];
    rules: string[];
    dualRoleExplanation: string;
    dualRoleExplanationHindi: string;
  } | null>(null);

  // Share & Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast({ title: "App Installed!", description: "SentenceCraft AI has been installed on your device." });
      }
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'SentenceCraft AI',
      text: 'Learn English Grammar with AI - SentenceCraft AI. Free tool to practice tenses, voice, questions, modals & more!',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://sentencecraft-ai.web.app',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link Copied!", description: "App URL copied to clipboard. Share it with your friends!" });
      }
    } catch (err) {
      // User cancelled share
    }
  };

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

IMPORTANT CONTEXT RULES:
- You MUST determine the ACTUAL Part of Speech of "${wordData.word}" based on HOW it is USED in THIS SPECIFIC SENTENCE, not just its general dictionary classification.
- Many words play DUAL ROLES. For example: "who" can be a Pronoun ("Who is there?") but it acts as a Conjunction/Relative Pronoun when it connects clauses ("The boy who came here is my friend."). Similarly, "that" can be a Determiner, Pronoun, or Conjunction depending on context.
- Also determine the TYPE OF SENTENCE (Declarative/Assertive, Interrogative, Imperative, Exclamatory).
- If the word's actual contextual role differs from the initial tag "${wordData.pos}", you MUST correct it and explain why.

Respond with ONLY a valid JSON object (no extra text):
{
  "word": "${wordData.word}",
  "pos": "The CORRECT Part of Speech for this word IN THIS SENTENCE's context (may differ from '${wordData.pos}' if context demands it)",
  "contextualPos": "The specific contextual role (e.g., Relative Pronoun, Subordinating Conjunction, Demonstrative Pronoun, Linking Verb etc.)",
  "contextualPosHindi": "Contextual role in Hindi (e.g., सम्बन्धवाचक सर्वनाम, अधीनस्थ समुच्चयबोधक)",
  "sentenceType": "Type of this sentence: Declarative (Statement), Interrogative (Question), Imperative (Command/Request), or Exclamatory",
  "sentenceTypeHindi": "Sentence type in Hindi (e.g., विधानवाचक वाक्य, प्रश्नवाचक वाक्य, आज्ञावाचक वाक्य, विस्मयादिबोधक वाक्य)",
  "subType": "The specific sub-type based on context (e.g., Relative Pronoun, Subordinating Conjunction, Common Noun, Transitive Verb etc.)",
  "subTypeHindi": "Sub-type in Hindi",
  "definition": "Clear English definition of the word AS USED in this specific sentence context",
  "definitionHindi": "Hindi definition (हिंदी में अर्थ - इस वाक्य के संदर्भ में)",
  "useCases": ["3-4 rules/use cases explaining when and how to use this word IN THIS specific role, written simply for students"],
  "examples": [
    {"word": "example word 1", "sentence": "Full example sentence where the word plays the SAME contextual role", "sentenceHindi": "Hindi translation"},
    {"word": "example word 2", "sentence": "Another example with same role", "sentenceHindi": "Hindi translation"},
    {"word": "example word 3", "sentence": "Another example", "sentenceHindi": "Hindi translation"},
    {"word": "example word 4", "sentence": "Another example", "sentenceHindi": "Hindi translation"},
    {"word": "example word 5", "sentence": "Another example", "sentenceHindi": "Hindi translation"}
  ],
  "rules": ["2-3 important grammar rules about this contextual usage in simple language with Hindi cues"],
  "dualRoleExplanation": "IMPORTANT: Explain how this word '${wordData.word}' can play multiple roles in different sentences. Give 2-3 examples showing different POS roles. E.g., 'who' as Interrogative Pronoun in questions vs Relative Pronoun (conjunction-like) in complex sentences. This helps students understand the difference.",
  "dualRoleExplanationHindi": "Hindi explanation of dual/multiple roles (हिंदी में समझाएं कि यह शब्द अलग-अलग वाक्यों में कैसे अलग भूमिका निभाता है)"
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
          {/* Top Left: QR Code */}
          <div className="absolute top-0 left-0 flex flex-col items-start gap-1">
            <AppQrCode />
            <AuthButton />
          </div>
          {/* Top Right: Share, Install, Theme, Settings */}
          <div className="absolute top-0 right-0 flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleShare} title="Share App">
              <Share2 className="h-5 w-5 text-primary" />
            </Button>
            {canInstall && (
              <Button variant="ghost" size="icon" onClick={handleInstall} title="Install App">
                <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
              </Button>
            )}
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
          <div className="inline-flex items-center justify-center bg-primary/10 p-3 rounded-full mb-3 sm:mb-4 mt-2">
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
                          <>Word: &quot;{wordDetailData.word}&quot; — <span className="text-accent ml-1">{wordDetailData.contextualPos || wordDetailData.pos}</span></>
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
                      {/* Sentence Type Badge */}
                      {wordDetailData.sentenceType && (
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
                          <h4 className="font-semibold text-blue-700 dark:text-blue-400 text-xs mb-1">Sentence Type / वाक्य का प्रकार:</h4>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-bold rounded-full text-sm">
                              {wordDetailData.sentenceType}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-semibold rounded-full text-sm">
                              {wordDetailData.sentenceTypeHindi}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Contextual POS & Sub-Type Badges */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-sm">
                          {wordDetailData.contextualPos || wordDetailData.subType}
                        </span>
                        <span className="px-3 py-1 bg-accent/10 text-accent font-semibold rounded-full text-sm">
                          {wordDetailData.contextualPosHindi || wordDetailData.subTypeHindi}
                        </span>
                      </div>

                      {/* Definition */}
                      <div className="p-3 bg-muted/40 rounded-md border space-y-1">
                        <h4 className="font-semibold text-primary text-sm">Definition (in this sentence) / अर्थ (इस वाक्य में):</h4>
                        <p className="text-foreground">{wordDetailData.definition}</p>
                        <p className="text-muted-foreground italic">{wordDetailData.definitionHindi}</p>
                      </div>

                      {/* Dual Role Explanation - Key new feature */}
                      {wordDetailData.dualRoleExplanation && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800 space-y-1.5">
                          <h4 className="font-semibold text-amber-700 dark:text-amber-400 text-sm flex items-center">
                            <BookOpen className="mr-1.5 h-4 w-4" />
                            Dual Role / एक शब्द, अनेक भूमिकाएं:
                          </h4>
                          <p className="text-sm text-foreground">{wordDetailData.dualRoleExplanation}</p>
                          {wordDetailData.dualRoleExplanationHindi && (
                            <p className="text-sm text-muted-foreground italic">{wordDetailData.dualRoleExplanationHindi}</p>
                          )}
                        </div>
                      )}

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
                            More Examples of {wordDetailData.contextualPos || wordDetailData.subType} / और उदाहरण:
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
