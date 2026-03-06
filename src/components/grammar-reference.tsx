// src/components/grammar-reference.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GRAMMAR_REFERENCE_DATA, type GrammarPosTopic } from '@/lib/grammar-reference-data';

function PosCard({ topic }: { topic: GrammarPosTopic }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Tappable Card Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 p-3 sm:p-4 rounded-xl border-2 shadow-md transition-all duration-200",
          "active:scale-[0.98] touch-manipulation",
          isOpen
            ? `${topic.color} text-white border-transparent shadow-lg`
            : `bg-card border-border hover:shadow-lg`
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl shrink-0">{topic.emoji}</span>
          <div className="text-left min-w-0">
            <p className={cn(
              "font-bold text-sm sm:text-base leading-tight",
              isOpen ? "text-white" : ""
            )}>
              {topic.name}
            </p>
            <p className={cn(
              "text-xs sm:text-sm leading-tight",
              isOpen ? "text-white/80" : "text-muted-foreground"
            )} lang="hi">
              {topic.nameHindi}
            </p>
          </div>
        </div>
        {isOpen
          ? <ChevronUp className="h-5 w-5 shrink-0 text-white/80" />
          : <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        }
      </button>

      {/* Expandable Content */}
      {isOpen && (
        <div className="mt-1.5 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className={cn(
            "rounded-xl border-2 p-3 sm:p-4 space-y-3",
            topic.borderColor, "bg-card"
          )}>
            {/* Definition */}
            <div>
              <p className={cn("text-sm sm:text-base font-semibold", topic.textColor)}>
                Definition / परिभाषा
              </p>
              <p className="text-xs sm:text-sm mt-0.5">{topic.definition}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5" lang="hi">
                {topic.definitionHindi}
              </p>
            </div>

            {/* Types */}
            <div>
              <p className={cn("text-sm sm:text-base font-semibold mb-2", topic.textColor)}>
                Types / प्रकार ({topic.types.length})
              </p>
              <div className="space-y-2.5">
                {topic.types.map((type, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-muted/50 p-2.5 sm:p-3 border border-border/50"
                  >
                    <div className="flex items-start gap-2">
                      <span className={cn(
                        "shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                        topic.color
                      )}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs sm:text-sm leading-tight">
                          {type.name}
                          <span className="font-normal text-muted-foreground ml-1.5" lang="hi">
                            ({type.nameHindi})
                          </span>
                        </p>
                        <p className="text-xs sm:text-sm mt-0.5 text-foreground/80">
                          {type.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5" lang="hi">
                          {type.descriptionHindi}
                        </p>
                        <p className="text-xs sm:text-sm mt-1 font-mono bg-background/80 rounded px-2 py-1 border border-border/30">
                          <span className="font-semibold text-muted-foreground">e.g.</span>{" "}
                          <span className={topic.textColor}>{type.examples}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function GrammarReference() {
  return (
    <Card className="shadow-lg border-2 border-primary/20 mt-6">
      <CardHeader className="px-3 sm:px-6 pb-2 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-headline text-primary flex items-center">
          <BookOpen className="mr-2.5 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Grammar Reference / व्याकरण संदर्भ
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1" lang="hi">
          Parts of Speech, Tense, Voice, Narration, Gerund, Participle और बहुत कुछ — सब एक जगह!
        </p>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {GRAMMAR_REFERENCE_DATA.map((topic) => (
            <PosCard key={topic.id} topic={topic} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
