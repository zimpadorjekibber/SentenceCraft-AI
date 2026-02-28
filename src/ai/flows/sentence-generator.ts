'use server';

/**
 * @fileOverview AI flow for generating tense-specific sentences.
 * Supports both Gemini (via Genkit) and Groq (via REST API).
 */

import { genkit } from 'genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { callGroq } from '@/lib/groq';

const WordPosSchema = z.object({
  word: z.string(),
  pos: z.string(),
});

const SentenceOutputSchema = z.object({
  sentence: z.array(WordPosSchema),
});

const SentenceInputSchema = z.object({
  subject: z.string(),
  verb: z.string(),
  object: z.string(),
  tense: z.string(),
  adjective: z.string().optional(),
  adverb: z.string().optional(),
  preposition: z.string().optional(),
  conjunction: z.string().optional(),
  determiner: z.string().optional(),
  interjection: z.string().optional(),
  otherWords: z.string().optional(),
  apiKey: z.string(),
  provider: z.enum(['gemini', 'groq']).optional(),
});

export type SentenceInput = z.infer<typeof SentenceInputSchema>;
export type SentenceOutput = z.infer<typeof SentenceOutputSchema>;

// Strict tense formulas to prevent AI from mixing up similar tenses
const TENSE_FORMULAS: Record<string, string> = {
  "Present Indefinite":        "Subject + V1/V1s (e.g., I play / He plays). Do NOT use is/am/are + V-ing.",
  "Present Continuous":        "Subject + is/am/are + V-ing (e.g., I am playing / He is playing). Must use 'be + V-ing'.",
  "Present Perfect":           "Subject + has/have + V3 (past participle) (e.g., I have played / He has eaten). Do NOT use 'been + V-ing'. No continuous form.",
  "Present Perfect Continuous":"Subject + has/have + been + V-ing (e.g., I have been playing / He has been studying). Must use 'been + V-ing'.",
  "Past Indefinite":           "Subject + V2 (past form) (e.g., I played / He ate). Do NOT use was/were + V-ing.",
  "Past Continuous":           "Subject + was/were + V-ing (e.g., I was playing / He was eating). Must use 'was/were + V-ing'.",
  "Past Perfect":              "Subject + had + V3 (past participle) (e.g., I had played / He had eaten). Do NOT use 'been + V-ing'. No continuous form.",
  "Past Perfect Continuous":   "Subject + had + been + V-ing (e.g., I had been playing / He had been studying). Must use 'had been + V-ing'.",
  "Future Indefinite":         "Subject + will/shall + V1 (base form) (e.g., I will play / He will eat). Do NOT use 'be + V-ing'.",
  "Future Continuous":         "Subject + will be + V-ing (e.g., I will be playing / He will be eating). Must use 'will be + V-ing'.",
  "Future Perfect":            "Subject + will have + V3 (past participle) (e.g., I will have played / He will have eaten). Do NOT use 'been + V-ing'. No continuous form.",
  "Future Perfect Continuous": "Subject + will have + been + V-ing (e.g., I will have been playing). Must use 'will have been + V-ing'.",
};

function buildPrompt(input: SentenceInput): string {
  const optionalParts = [
    input.adjective    ? `- Adjective: ${input.adjective}`       : '',
    input.adverb       ? `- Adverb: ${input.adverb}`             : '',
    input.preposition  ? `- Preposition: ${input.preposition}`   : '',
    input.conjunction  ? `- Conjunction: ${input.conjunction}`   : '',
    input.determiner   ? `- Determiner: ${input.determiner}`     : '',
    input.interjection ? `- Interjection: ${input.interjection}` : '',
    input.otherWords   ? `- Other: ${input.otherWords}`          : '',
  ].filter(Boolean).join('\n');

  const tenseFormula = TENSE_FORMULAS[input.tense] || '';

  return `You are an expert English grammar teacher. You must be VERY STRICT about tense accuracy.
Generate a natural, grammatically correct English sentence in the "${input.tense}" tense.

CRITICAL TENSE RULE — You MUST follow this formula exactly:
${tenseFormula || `Use the correct verb form for "${input.tense}" tense.`}

WARNING: Do NOT confuse similar tenses. For example:
- "Present Perfect" uses "have/has + V3" (e.g., "I have studied") — NOT "have been + V-ing"
- "Present Perfect Continuous" uses "have/has + been + V-ing" (e.g., "I have been studying")
- "Past Indefinite" uses "V2" (e.g., "I studied") — NOT "was/were + V-ing"
These are DIFFERENT tenses. Use ONLY the formula for "${input.tense}".

Core Components:
- Subject: ${input.subject}
- Verb: ${input.verb}
- Object: ${input.object}

${optionalParts ? `Optional additions:\n${optionalParts}` : ''}

Instructions:
1. Construct the sentence naturally using the EXACT tense formula above.
2. Double-check: does the verb form match "${input.tense}" exactly? If not, fix it.
3. Break the sentence into an array of objects where each object has "word" and "pos" (e.g., "Noun", "Verb", "Punctuation").
4. If a determiner is needed for correct grammar, add it automatically.
5. Respond with ONLY a JSON object: { "sentence": [ { "word": "...", "pos": "..." }, ... ] }`;
}

export async function generateSentenceAction(input: SentenceInput): Promise<SentenceOutput> {
  if (!input.apiKey) {
    throw new Error('API Key is missing');
  }

  const prompt = buildPrompt(input);

  if (input.provider === 'groq') {
    const responseText = await callGroq(input.apiKey, [
      { role: 'user', content: prompt },
    ], { jsonMode: true });

    const parsed = JSON.parse(responseText);
    if (!parsed.sentence || !Array.isArray(parsed.sentence)) {
      throw new Error('AI failed to generate a sentence output.');
    }
    return parsed as SentenceOutput;
  }

  // Default: Gemini via Genkit
  const customAi = genkit({
    plugins: [googleAI({ apiKey: input.apiKey })],
  });

  const { output } = await customAi.generate({
    model: googleAI.model('gemini-1.5-flash'),
    output: { schema: SentenceOutputSchema },
    config: { temperature: 0.7 },
    prompt,
  });

  if (!output) {
    throw new Error('AI failed to generate a sentence output.');
  }

  return output;
}
