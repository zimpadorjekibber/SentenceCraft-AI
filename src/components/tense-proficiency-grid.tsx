'use client';

import React from 'react';

const TENSE_GRID = [
  { group: 'Present', tenses: ['Present Indefinite', 'Present Continuous', 'Present Perfect', 'Present Perfect Continuous'] },
  { group: 'Past', tenses: ['Past Indefinite', 'Past Continuous', 'Past Perfect', 'Past Perfect Continuous'] },
  { group: 'Future', tenses: ['Future Indefinite', 'Future Continuous', 'Future Perfect', 'Future Perfect Continuous'] },
];

function getColorClass(count: number): string {
  if (count === 0) return 'bg-muted text-muted-foreground';
  if (count <= 3) return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
  if (count <= 10) return 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200';
  if (count <= 20) return 'bg-green-400 text-green-950 dark:bg-green-700 dark:text-green-100';
  return 'bg-green-600 text-white dark:bg-green-500 dark:text-white';
}

interface TenseProficiencyGridProps {
  tensesUsed: Record<string, number>;
}

export function TenseProficiencyGrid({ tensesUsed }: TenseProficiencyGridProps) {
  return (
    <div className="space-y-3">
      {TENSE_GRID.map(group => (
        <div key={group.group}>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">{group.group}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {group.tenses.map(t => {
              const count = tensesUsed[t] || 0;
              return (
                <div
                  key={t}
                  className={`rounded-md px-2 py-2 text-center text-xs font-medium transition-colors ${getColorClass(count)}`}
                >
                  <div className="truncate">{t.replace(group.group + ' ', '')}</div>
                  <div className="text-[10px] mt-0.5 opacity-75">{count} times</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
