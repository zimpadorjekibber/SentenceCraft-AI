
// src/app/print-chart/page.tsx
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Printer, ArrowLeft } from 'lucide-react';
import { TENSE_RULES } from '@/lib/tense-rules-data';
import { HighlightedRules } from '@/components/highlighted-rules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TENSES_CATEGORIES } from '@/components/tense-selector';
import { cn } from '@/lib/utils';

export default function PrintTenseChartPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-1 sm:p-2">
      <header className="mb-2 print:hidden flex flex-col sm:flex-row items-center justify-between gap-1">
        <Link href="/">
          <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to App
          </Button>
        </Link>
        <h1 className="text-base sm:text-lg font-bold text-center text-primary flex-grow">
          SentenceCraft AI - Tense Rules Chart
        </h1>
        <Button onClick={handlePrint} size="sm" className="w-full sm:w-auto text-xs">
          <Printer className="mr-1 h-3 w-3" />
          Print Preview (Screenshot this page)
        </Button>
      </header>
      
      <div className="space-y-2">
        {Object.entries(TENSES_CATEGORIES).map(([categoryName, categoryData]) => (
          <section key={categoryName} className="print:mb-1">
            <h2 className={cn(
                "text-sm sm:text-base font-semibold text-primary mb-1 flex items-center",
                "print:hidden" 
             )}>
              <categoryData.icon className="mr-2 h-4 w-4 text-accent" />
              {categoryName} Tenses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 print:grid-cols-4 print:gap-0.5 print:items-start">
              {categoryData.tenses.map((tense) => {
                const rules = TENSE_RULES[tense.name];
                return (
                  <Card 
                    key={tense.name} 
                    className={cn(
                      "flex flex-col", 
                      "print:shadow-none print:border print:border-gray-300 print:break-inside-avoid print:h-auto"
                    )}
                  >
                    <CardHeader className="p-1 print:p-1 print:pb-0">
                      <CardTitle className="text-[10px] sm:text-xs font-bold text-primary whitespace-normal leading-tight print:text-[10px] print:leading-tight">
                        {tense.displayName}
                      </CardTitle>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 print:mt-0 leading-tight print:text-[9px] print:leading-tight font-body">
                        {tense.hindiCue}
                      </p>
                    </CardHeader>
                    <CardContent className="p-1 print:p-0.5 print:pt-0 print:flex-grow-0 flex-grow">
                      {rules ? (
                        <ScrollArea className="h-full print:h-auto print:overflow-visible">
                           <div className="text-[8px] sm:text-[9px] leading-snug print:text-[8px] print:leading-tight font-code">
                            {rules.split('\n').map((line, index) => (
                              line.trim() !== '' && (
                                <div key={index} className="mb-0.5 print:mb-0">
                                  <HighlightedRules rules={line} />
                                </div>
                              )
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <p className="text-muted-foreground text-[8px] print:text-[7px]">
                          Rules not available.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <footer className="mt-2 text-center text-[10px] text-muted-foreground print:hidden">
        &copy; {new Date().getFullYear()} SentenceCraft AI. For screenshotting, maximize window and use snipping tool.
      </footer>
    </div>
  );
}

