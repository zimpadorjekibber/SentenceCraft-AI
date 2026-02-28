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

  return `You are an expert English grammar teacher.
Generate a natural, grammatically correct English sentence in the "${input.tense}" tense.

Core Components:
- Subject: ${input.subject}
- Verb: ${input.verb}
- Object: ${input.object}

${optionalParts ? `Optional additions:\n${optionalParts}` : ''}

Instructions:
1. Construct the sentence naturally.
2. Ensure the verb form matches the "${input.tense}" tense exactly.
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
