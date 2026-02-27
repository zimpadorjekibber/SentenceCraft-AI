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
import { Languages, Brain, AlertCircle, Mic, MicOff, BookOpen } from 'lucide-react';
import type { WordPos } from '@/types/ai-types';
import { cn } from '@/lib/utils';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AnalyzeHindiForEnglishTenseOutput {
  identifiedEnglishTense: string;
  reasoning: string;
  exampleEnglishSentence: WordPos[];
  englishTenseRuleKey: string;
  error?: string;
}

interface HindiToEnglishTenseHelperProps {
  apiKey: string | null;
  onWordDetailRequest: (wordData: WordPos, fullSentenceText: string) => void;
  onViewDetailedRulesRequest: (tenseName: string) => void; 
}

export function HindiToEnglishTenseHelper({ apiKey, onWordDetailRequest, onViewDetailedRulesRequest }: HindiToEnglishTenseHelperProps) {
  const [hindiInput, setHindiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeHindiForEnglishTenseOutput | null>(null);
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSpeechApiSupported, setIsSpeechApiSupported] = useState(false);

  const { toast } = useToast();

  const getGenAIModel = useCallback(() => {
    if (!apiKey) {
      toast({ title: "API Key Missing", description: "Please set your Gemini API key to use this feature.", variant: "destructive" });
      return null;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
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
      recognitionRef.current.start();
    }
  };

  const handleAnalyzeHindi = async () => {
    if (isListening) recognitionRef.current?.stop();
    if (!hindiInput.trim()) {
      setError("कृपया विश्लेषण के लिए एक हिंदी वाक्य दर्ज करें।");
      return;
    }
    
    const model = getGenAIModel();
    if (!model) return;

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
        4. Break down your example English sentence into an array of objects, with each object having a "word" and its "pos" (Part-of-Speech) tag.
        5. Provide the exact key for the English tense (e.g., "PastPerfect") for rule lookup.
        
        Respond with ONLY a JSON object with the following keys: "identifiedEnglishTense", "reasoning", "exampleEnglishSentence", "englishTenseRuleKey".
        If the input is not valid Hindi, respond with { "error": "The provided text does not appear to be a valid Hindi sentence." }.
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsedResult: AnalyzeHindiForEnglishTenseOutput = JSON.parse(responseText);

      if (parsedResult.error) {
        setError(parsedResult.error);
        toast({ title: "Analysis Failed", description: parsedResult.error, variant: "destructive" });
      } else {
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
          Type or speak a Hindi sentence. We'll suggest the best English tense and provide an example.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="अपना हिंदी वाक्य यहाँ लिखें..."
          value={hindiInput}
          onChange={(e) => {
            setHindiInput(e.target.value);
            if (analysisResult) setAnalysisResult(null);
            if (error) setError(null);
          }}
          rows={3}
          disabled={isListening || isLoading}
          className="text-sm sm:text-base font-body"
          lang="hi"
        />
        <div className="flex flex-col sm:flex-row items-stretch space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onClick={handleAnalyzeHindi}
              disabled={isLoading || isListening || !hindiInput.trim()}
              className="flex-grow flex items-center justify-center text-sm"
            >
              {isLoading ? <LoadingSpinner inline /> : <><Brain className="mr-2 h-4 w-4" /> Find English Tense</>}
            </Button>
            <Button
                variant="outline" size="icon" onClick={handleMicClick}
                disabled={isLoading || !isSpeechApiSupported}
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