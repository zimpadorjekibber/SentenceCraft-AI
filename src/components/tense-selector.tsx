
// src/components/tense-selector.tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Sun, Timer, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenseSelectorProps {
  selectedTense: string | null;
  onTenseSelect: (tense: string) => void; // Will receive the full tense name
  disabled?: boolean;
}

interface TenseInfo {
  name: string; // Full name for logic and keys, e.g., "Present Indefinite"
  displayName: string; // Full name for display, e.g., "Present Indefinite"
  hindiCue: string; // Hindi identification cue
}

interface TenseCategory {
  icon: React.ElementType;
  tenses: TenseInfo[];
}

export const TENSES_CATEGORIES: Record<string, TenseCategory> = {
  Present: {
    icon: Sun,
    tenses: [
      { name: "Present Indefinite", displayName: "Present Indefinite", hindiCue: "ता है, ती है, ते हैं" },
      { name: "Present Continuous", displayName: "Present Continuous", hindiCue: "रहा है, रही है, रहे हैं" },
      { name: "Present Perfect", displayName: "Present Perfect", hindiCue: "चुका है, चुकी है, चुके हैं //BR// या है, यी है, ये हैं" },
      { name: "Present Perfect Continuous", displayName: "Present Perfect Continuous", hindiCue: "से रहा है, से रही है, से रहे हैं" },
    ],
  },
  Past: {
    icon: Timer,
    tenses: [
      { name: "Past Indefinite", displayName: "Past Indefinite", hindiCue: "ता था, ती थी, ते थे //BR// या, यी, ये" },
      { name: "Past Continuous", displayName: "Past Continuous", hindiCue: "रहा था, रही थी, रहे थे" },
      { name: "Past Perfect", displayName: "Past Perfect", hindiCue: "चुका था, चुकी थी, चुके थे //BR// या था, यी थी, ये थे" },
      { name: "Past Perfect Continuous", displayName: "Past Perfect Continuous", hindiCue: "से रहा था, से रही थी, से रहे थे" },
    ],
  },
  Future: {
    icon: Rocket,
    tenses: [
      { name: "Future Indefinite", displayName: "Future Indefinite", hindiCue: "गा, गी, गे" },
      { name: "Future Continuous", displayName: "Future Continuous", hindiCue: "रहा होगा, रही होगी, रहे होंगे" },
      { name: "Future Perfect", displayName: "Future Perfect", hindiCue: "चुका होगा, चुकी होगी, चुके होंगे //BR// चुकेगा, चुकेगी, चुकेंगे" },
      { name: "Future Perfect Continuous", displayName: "Future Perfect Continuous", hindiCue: "से रहा होगा, से रही होगी, से रहे होंगे" },
    ],
  },
};

// Define unique styles for each tense button for a more colorful UI
// Keys are full tense names
const TENSE_BUTTON_STYLES: Record<string, string> = {
  "Present Indefinite": "bg-rose-400 hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500 border-rose-500 dark:border-rose-700 text-rose-900 dark:text-rose-50",
  "Present Continuous": "bg-sky-400 hover:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500 border-sky-500 dark:border-sky-700 text-sky-900 dark:text-sky-50",
  "Present Perfect": "bg-emerald-400 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 border-emerald-500 dark:border-emerald-700 text-emerald-900 dark:text-emerald-50",
  "Present Perfect Continuous": "bg-teal-400 hover:bg-teal-500 dark:bg-teal-600 dark:hover:bg-teal-500 border-teal-500 dark:border-teal-700 text-teal-900 dark:text-teal-50",

  "Past Indefinite": "bg-red-400 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500 border-red-500 dark:border-red-700 text-red-900 dark:text-red-50",
  "Past Continuous": "bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 border-blue-500 dark:border-blue-700 text-blue-900 dark:text-blue-50",
  "Past Perfect": "bg-green-400 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-500 border-green-500 dark:border-green-700 text-green-900 dark:text-green-50",
  "Past Perfect Continuous": "bg-cyan-400 hover:bg-cyan-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 border-cyan-500 dark:border-cyan-700 text-cyan-900 dark:text-cyan-50",

  "Future Indefinite": "bg-amber-400 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 border-amber-500 dark:border-amber-700 text-amber-900 dark:text-amber-50",
  "Future Continuous": "bg-indigo-400 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 border-indigo-500 dark:border-indigo-700 text-indigo-900 dark:text-indigo-50",
  "Future Perfect": "bg-lime-400 hover:bg-lime-500 dark:bg-lime-600 dark:hover:bg-lime-500 border-lime-500 dark:border-lime-700 text-lime-900 dark:text-lime-50",
  "Future Perfect Continuous": "bg-fuchsia-400 hover:bg-fuchsia-500 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-500 border-fuchsia-500 dark:border-fuchsia-700 text-fuchsia-900 dark:text-fuchsia-50",
};


export function TenseSelector({ selectedTense, onTenseSelect, disabled }: TenseSelectorProps) {
  return (
    <Card className="shadow-lg border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-headline text-primary flex items-center">
          <CalendarClock className="mr-3 h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          Select a Tense
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(TENSES_CATEGORIES).map(([category, data]) => {
          const CategoryIcon = data.icon;
          return (
            <div key={category} className="mb-8 last:mb-0">
              <h3 className="text-lg sm:text-xl font-bold text-primary/90 dark:text-primary/80 mb-4 flex items-center">
                <CategoryIcon className="mr-3 h-6 w-6 text-accent" />
                {category} Tenses
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {data.tenses.map((tenseInfo) => (
                  <Button
                    key={tenseInfo.name} // Use full name as key for stability
                    variant="outline" // Base variant, custom styles override this
                    onClick={() => onTenseSelect(tenseInfo.name)} // Pass full name
                    className={cn(
                      "w-full h-auto py-3 sm:py-4 text-xs sm:text-sm transition-all duration-200 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-offset-2 flex flex-col items-center justify-center leading-tight shadow-md hover:shadow-lg",
                      "border-2",
                      selectedTense === tenseInfo.name // Compare with full name
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary scale-105 shadow-xl border-primary-foreground/50'
                        : cn(TENSE_BUTTON_STYLES[tenseInfo.name] || 'bg-gray-200 hover:bg-gray-300 border-gray-400 text-gray-800', 'focus:ring-accent'),
                      disabled && "opacity-70 cursor-not-allowed"
                    )}
                    disabled={disabled}
                    aria-pressed={selectedTense === tenseInfo.name}
                  >
                    <span className="font-semibold text-center text-sm md:text-base whitespace-nowrap">{tenseInfo.displayName.split(" ")[0]} {tenseInfo.displayName.split(" ")[1]}</span>
                    {tenseInfo.displayName.split(" ")[2] && <span className="font-semibold text-center text-sm md:text-base whitespace-nowrap">{tenseInfo.displayName.split(" ")[2]} {tenseInfo.displayName.split(" ")[3]}</span>}
                     <span className="text-xs mt-1 opacity-90 font-normal">
                        {tenseInfo.hindiCue.split('//BR//').map((line, idx, arr) => (
                          <React.Fragment key={idx}>
                            {line}
                            {idx < arr.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                     </span>
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

