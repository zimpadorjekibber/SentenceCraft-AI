// src/components/sentence-input-form.tsx
"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User, Zap, Package, Link as LinkIcon, Pilcrow, Palette, Rabbit, GitMerge,
  MousePointerSquareDashed, SmilePlus, WholeWord
} from 'lucide-react';

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
  hindiLabel: string,
  description: string,
  placeholder: string,
  Icon: React.ElementType,
  colorClass: string
}> = [
  { id: "subject", label: "Subject*", hindiLabel: "कर्ता", description: "काम करने वाला (Who/What)", placeholder: "e.g., The cat", Icon: User, colorClass: "text-orange-700 dark:text-orange-400" },
  { id: "verb", label: "Verb*", hindiLabel: "क्रिया", description: "काम (Action word)", placeholder: "e.g., chased", Icon: Zap, colorClass: "text-red-700 dark:text-red-400" },
  { id: "object", label: "Object*", hindiLabel: "कर्म", description: "जिस पर काम हो (Receives action)", placeholder: "e.g., the mouse", Icon: Package, colorClass: "text-teal-700 dark:text-teal-400" },
  { id: "adjective", label: "Adjective", hindiLabel: "विशेषण", description: "कैसा/कैसी (Describes noun)", placeholder: "e.g., big, happy", Icon: Palette, colorClass: "text-green-700 dark:text-green-400" },
  { id: "adverb", label: "Adverb", hindiLabel: "क्रियाविशेषण", description: "कैसे/कब/कहाँ (Describes verb)", placeholder: "e.g., quickly, very", Icon: Rabbit, colorClass: "text-yellow-700 dark:text-yellow-500" },
  { id: "preposition", label: "Preposition", hindiLabel: "सम्बन्धबोधक", description: "स्थिति/दिशा (Position word)", placeholder: "e.g., under, with", Icon: LinkIcon, colorClass: "text-purple-700 dark:text-purple-400" },
  { id: "conjunction", label: "Conjunction", hindiLabel: "समुच्चयबोधक", description: "जोड़ने वाला (Joining word)", placeholder: "e.g., and, but", Icon: GitMerge, colorClass: "text-pink-700 dark:text-pink-400" },
  { id: "determiner", label: "Determiner", hindiLabel: "निर्धारक", description: "a, an, the, this, that", placeholder: "e.g., a, the, this", Icon: MousePointerSquareDashed, colorClass: "text-indigo-700 dark:text-indigo-400" },
  { id: "interjection", label: "Interjection", hindiLabel: "विस्मयादिबोधक", description: "भावना (Emotion word)", placeholder: "e.g., Wow!, Oh!", Icon: SmilePlus, colorClass: "text-gray-700 dark:text-gray-400" },
  { id: "otherWords", label: "Other Words", hindiLabel: "अन्य शब्द", description: "बाकी शब्द जो ऊपर fit न हों", placeholder: "e.g., very, often", Icon: Pilcrow, colorClass: "text-slate-700 dark:text-slate-400" },
];

export function SentenceInputForm({ values, onChange, disabled }: SentenceInputFormProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-headline text-primary flex items-center">
          <WholeWord className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          Input Your Words
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4 -mt-2">Fields marked with * are required. Optional fields छोड़ सकते हैं।</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {inputFields.map(({ id, label, hindiLabel, description, placeholder, Icon, colorClass }) => (
            <div key={id} className="space-y-1.5">
              <Label htmlFor={id} className="flex items-center text-sm sm:text-md">
                <Icon className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${colorClass}`} />
                <span>{label} <span className={`font-normal ${colorClass}`}>({hindiLabel})</span></span>
              </Label>
              <p className="text-[11px] text-muted-foreground pl-6 sm:pl-7 -mt-0.5">{description}</p>
              <Input
                id={id}
                type="text"
                placeholder={placeholder}
                value={values[id]}
                onChange={(e) => onChange(id, e.target.value)}
                disabled={disabled}
                aria-label={`${label} (${hindiLabel})`}
                className="text-sm sm:text-base"
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
