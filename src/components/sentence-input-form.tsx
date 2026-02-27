// src/components/sentence-input-form.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User, Zap, Package, Link as LinkIcon, Pilcrow, Palette, Rabbit, GitMerge,
  MousePointerSquareDashed, SmilePlus, WholeWord, Mic, MicOff
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface WordInputs {
  subject: string;
  verb: string;
  object: string;
  adjective: string;
  adverb: string;
  preposition: string;
  conjunction: string;
  determiner: string;
  interjection: string;
  otherWords: string;
}

interface SentenceInputFormProps {
  values: WordInputs;
  onChange: (fieldName: keyof WordInputs, value: string) => void;
  disabled?: boolean;
}

const inputFields: Array<{
  id: keyof WordInputs,
  label: string,
  placeholder: string,
  Icon: React.ElementType,
  colorClass: string
}> = [
  { id: "subject", label: "Subject*", placeholder: "e.g., The cat", Icon: User, colorClass: "text-orange-700 dark:text-orange-400" },
  { id: "verb", label: "Verb*", placeholder: "e.g., chased", Icon: Zap, colorClass: "text-red-700 dark:text-red-400" },
  { id: "object", label: "Object*", placeholder: "e.g., the mouse", Icon: Package, colorClass: "text-teal-700 dark:text-teal-400" },
  { id: "adjective", label: "Adjective (optional)", placeholder: "e.g., big, happy", Icon: Palette, colorClass: "text-green-700 dark:text-green-400" },
  { id: "adverb", label: "Adverb (optional)", placeholder: "e.g., quickly, very", Icon: Rabbit, colorClass: "text-yellow-700 dark:text-yellow-500" },
  { id: "preposition", label: "Preposition (optional)", placeholder: "e.g., under, with", Icon: LinkIcon, colorClass: "text-purple-700 dark:text-purple-400" },
  { id: "conjunction", label: "Conjunction (optional)", placeholder: "e.g., and, but", Icon: GitMerge, colorClass: "text-pink-700 dark:text-pink-400" },
  { id: "determiner", label: "Determiner (optional)", placeholder: "e.g., a, the, this", Icon: MousePointerSquareDashed, colorClass: "text-indigo-700 dark:text-indigo-400" },
  { id: "interjection", label: "Interjection (optional)", placeholder: "e.g., Wow!, Oh!", Icon: SmilePlus, colorClass: "text-gray-700 dark:text-gray-400" },
  { id: "otherWords", label: "Other Words (optional)", placeholder: "e.g., very, often", Icon: Pilcrow, colorClass: "text-slate-700 dark:text-slate-400" },
];

export function SentenceInputForm({ values, onChange, disabled }: SentenceInputFormProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<keyof WordInputs | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSpeechApiSupported, setIsSpeechApiSupported] = useState(false);
  
  // Use a ref for activeField inside the event handler to avoid stale closure
  const activeFieldRef = useRef<keyof WordInputs | null>(null);
  activeFieldRef.current = activeField;

  // Stable onChange ref to avoid recreating recognition on every onChange call
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    setIsSpeechApiSupported(true);
    const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      // Read activeField from ref so handler is never stale
      if (activeFieldRef.current) {
        onChangeRef.current(activeFieldRef.current, transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      toast({ title: "Speech Recognition Error", description: event.error, variant: "destructive" });
      setIsListening(false);
      setActiveField(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setActiveField(null);
    };

    return () => {
      recognition.abort();
    };
  // Only run once on mount — refs keep values current
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMicClick = useCallback((fieldName: keyof WordInputs) => {
    if (!isSpeechApiSupported || !recognitionRef.current) {
      toast({ title: "Browser Not Supported", description: "Your browser does not support speech recognition.", variant: "destructive" });
      return;
    }
    if (isListening && activeField === fieldName) {
      recognitionRef.current.stop();
    } else if (!isListening) {
      setActiveField(fieldName);
      recognitionRef.current.start();
    }
  }, [isSpeechApiSupported, isListening, activeField, toast]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-headline text-primary flex items-center">
          <WholeWord className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          Input Your Words
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4 -mt-2">Fields marked with * are required. You can also use the mic to speak each word.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {inputFields.map(({ id, label, placeholder, Icon, colorClass }) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id} className="flex items-center text-sm sm:text-md">
                <Icon className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 ${colorClass}`} />
                {label}
              </Label>
              <div className="flex items-center">
                <Input
                  id={id}
                  type="text"
                  placeholder={placeholder}
                  value={values[id]}
                  onChange={(e) => onChange(id, e.target.value)}
                  disabled={disabled || (isListening && activeField !== id)}
                  aria-label={label}
                  className="text-sm sm:text-base flex-grow"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMicClick(id)}
                  disabled={disabled || !isSpeechApiSupported || (isListening && activeField !== id)}
                  className={cn(
                    "ml-2",
                    isListening && activeField === id && "bg-red-500 hover:bg-red-600 text-white"
                  )}
                  aria-label={`Speak ${label}`}
                >
                  {isListening && activeField === id ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4 text-primary" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
