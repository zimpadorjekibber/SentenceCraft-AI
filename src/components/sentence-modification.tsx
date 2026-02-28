// src/components/sentence-modification.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ThumbsUp, Wand } from 'lucide-react';
import type { WordPos } from '@/types/ai-types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateAIContent, type AiProvider } from '@/lib/ai-client';
import { useToast } from '@/hooks/use-toast';
import { InteractiveSentence } from './interactive-sentence';

interface SentenceModificationProps {
  apiKey: string | null;
  aiProvider: AiProvider;
  originalSentenceTagged: WordPos[] | null;
  onSuggestionSelect: (suggestionTagged: WordPos[]) => void;
  onWordDetailRequest?: (wordData: WordPos, fullSentenceText: string) => void;
}

export function SentenceModification({ apiKey, aiProvider, originalSentenceTagged, onSuggestionSelect, onWordDetailRequest }: SentenceModificationProps) {
    const [suggestions, setSuggestions] = useState<WordPos[][] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    if (!originalSentenceTagged || originalSentenceTagged.length === 0) {
        return null;
    }

    const getSuggestions = async () => {
        if (!apiKey) {
            toast({ title: "API Key Missing", description: "Cannot get suggestions without an API key.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setSuggestions(null);

        const originalSentenceText = originalSentenceTagged.map(w => w.word).join(' ');

        const prompt = `
            You are an AI language assistant. Your task is to rewrite a sentence in three different ways.
            The core meaning and tense should remain the same, but the structure, vocabulary, or style should be varied.

            Original Sentence: "${originalSentenceText}"

            Task:
            1. Generate exactly three alternative versions of the original sentence.
            2. For each new sentence, break it down into an array of objects, where each object has a "word" and a "pos" (Part-of-Speech) tag.
            3. Ensure the output is a JSON object with a single key "suggestions", which is an array containing the three tagged sentences.

            Example Output Structure:
            {
                "suggestions": [
                    [ { "word": "The", "pos": "Determiner" }, { "word": "cat", "pos": "Noun" }, { "word": "pursued", "pos": "Verb" }, { "word": "the", "pos": "Determiner" }, { "word": "mouse", "pos": "Noun" }, { "word": ".", "pos": "Punctuation" } ],
                    [ { "word": "The", "pos": "Determiner" }, { "word": "mouse", "pos": "Noun" }, { "word": "was", "pos": "Verb" }, { "word": "chased", "pos": "Verb" }, { "word": "by", "pos": "Preposition" }, { "word": "the", "pos": "Determiner" }, { "word": "cat", "pos": "Noun" }, { "word": ".", "pos": "Punctuation" } ],
                    [ { "word": "The", "pos": "Determiner" }, { "word": "feline", "pos": "Noun" }, { "word": "ran", "pos": "Verb" }, { "word": "after", "pos": "Preposition" }, { "word": "the", "pos": "Determiner" }, { "word": "rodent", "pos": "Noun" }, { "word": ".", "pos": "Punctuation" } ]
                ]
            }
        `;

        try {
            const responseText = await generateAIContent(apiKey, aiProvider, prompt);
            const parsedResult = JSON.parse(responseText);

            if (parsedResult.suggestions && Array.isArray(parsedResult.suggestions)) {
                setSuggestions(parsedResult.suggestions);
            } else {
                throw new Error("AI response did not contain a 'suggestions' array.");
            }
        } catch (e: any) {
            console.error("Suggestion Generation Error:", e);
            toast({ title: "Suggestion Error", description: "Could not generate suggestions. " + e.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-lg mt-6 sm:mt-8">
            <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-headline text-primary flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Sentence Suggestions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={getSuggestions} disabled={isLoading || !apiKey}>
                    <Wand className="mr-2 h-4 w-4" />
                    {isLoading ? "Generating..." : "Get Alternative Phrasings"}
                </Button>

                {suggestions && suggestions.length > 0 && (
                    <div className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                                <div className="flex-grow">
                                    <InteractiveSentence 
                                        taggedSentence={suggestion}
                                        onWordDetailRequest={onWordDetailRequest}
                                        sentenceIdentifier={`sugg-${index}`}
                                    />
                                </div>
                                <Button size="sm" variant="outline" onClick={() => onSuggestionSelect(suggestion)}>
                                    <ThumbsUp className="mr-2 h-4 w-4" />
                                    Use this
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}