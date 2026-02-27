
// src/components/highlighted-rules.tsx
"use client";

import React from 'react';

interface HighlightedRulesProps {
  rules: string;
}

// Define distinct colors for rule labels (A, N, I) and other POS tags
const PartOfSpeechColors: Record<string, string> = {
  rule_label_A: "text-green-600 dark:text-green-400 font-bold", // Affirmative label
  rule_label_N: "text-red-600 dark:text-red-400 font-bold",   // Negative label
  rule_label_I: "text-blue-600 dark:text-blue-400 font-bold",   // Interrogative label
  rule_label_NI_N: "text-red-600 dark:text-red-400 font-bold", // Negative part of NI
  rule_label_NI_I: "text-blue-600 dark:text-blue-400 font-bold", // Interrogative part of NI
  
  subject: "text-pink-600 dark:text-pink-400 font-semibold", // S
  verb: "text-emerald-600 dark:text-emerald-400 font-semibold", // Main verb in explanations
  verb_form: "text-teal-500 dark:text-teal-400 font-semibold", // V1, V2, V3, V1+ing, V1(+s/es)
  object: "text-amber-600 dark:text-amber-400 font-semibold", // O
  auxiliary: "text-sky-600 dark:text-sky-400 font-semibold", // is/am/are, has/have, do/does, did, will/shall, etc.
  negation: "text-red-500 dark:text-red-400 font-semibold", // Not
  punctuation: "text-gray-500 dark:text-gray-400", // ?, (, )
  other_grammatical_term: "text-purple-600 dark:text-purple-400 font-semibold", // for 3rd P, Since/For, Time, WH
  
  // Keep existing colors from previous implementation for broader compatibility in explanations
  tense_marker: "text-amber-600 dark:text-amber-400 font-semibold",
  preposition: "text-indigo-600 dark:text-indigo-400 font-semibold",
  noun: "text-orange-600 dark:text-orange-400 font-semibold",
  pronoun: "text-blue-600 dark:text-blue-400 font-semibold",
  adjective: "text-yellow-500 dark:text-yellow-300 font-semibold",
  adverb: "text-lime-600 dark:text-lime-400 font-semibold",
  punctuation_mark: "text-slate-600 dark:text-slate-400 font-medium",
  other: "text-fuchsia-600 dark:text-fuchsia-400 font-semibold",
  default: "text-foreground",
};

export function HighlightedRules({ rules }: HighlightedRulesProps) {
  const parts = [];
  let lastIndex = 0;
  const regex = /<pos type="([^"]+)">([^<]+)<\/pos>/g;
  let match;

  while ((match = regex.exec(rules)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <React.Fragment key={`text-${lastIndex}`}>
          {rules.substring(lastIndex, match.index)}
        </React.Fragment>
      );
    }
    const type = match[1];
    const content = match[2];
    const styleClass = PartOfSpeechColors[type] || PartOfSpeechColors.default;
    
    parts.push(
      <span key={`pos-${lastIndex}-${type}`} className={styleClass}>
        {content}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < rules.length) {
    parts.push(
      <React.Fragment key={`text-${lastIndex}-end`}>
        {rules.substring(lastIndex)}
      </React.Fragment>
    );
  }

  if (parts.length === 0 && rules) {
    return <>{rules}</>;
  }

  return <>{parts.map((part, index) => React.cloneElement(part, { key: index }))}</>;
}
