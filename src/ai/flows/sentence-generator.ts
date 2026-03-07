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
  hindiTranslation: z.string().describe('Translation of the sentence in the requested native language (Hindi or Tibetan)'),
  nativeTranslation: z.string().optional().describe('Same translation as hindiTranslation in the selected native language'),
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
  nativeLanguage: z.enum(['hi', 'bo']).optional(),
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

// Time-related instructions for tenses that REQUIRE time references
const TENSE_TIME_INSTRUCTIONS: Record<string, string> = {
  "Present Perfect Continuous": "IMPORTANT: You MUST include a time reference using 'since' or 'for'. Wrap the time value in parentheses to show it is an example. Example output: 'I have been playing cricket since (morning)' or 'I have been playing cricket for (two hours)'. The parentheses show students the time is a replaceable example.",
  "Past Perfect Continuous":    "IMPORTANT: You MUST include a time reference using 'since' or 'for'. Wrap the time value in parentheses. Example: 'had been playing since (childhood)' or 'for (three years)'.",
  "Future Perfect Continuous":  "IMPORTANT: You MUST include a time reference. Wrap the time value in parentheses. Example: 'for (two hours) by (evening)'.",
  "Present Perfect":            "TIP: Consider adding a time word like already, just, yet, ever, never. If you add one, wrap it in parentheses. Example: 'I have (already) played cricket'. The parentheses show it is optional.",
  "Past Perfect":               "TIP: Consider adding time context. If you add one, wrap it in parentheses. Example: 'had (already) eaten' or '(before) he came'.",
  "Future Perfect":             "TIP: Consider adding a time reference using 'by'. Wrap it in parentheses. Example: 'will have finished by (tomorrow)'.",
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
  const timeInstruction = TENSE_TIME_INSTRUCTIONS[input.tense] || '';

  const isPerfectTense = input.tense.includes('Perfect') && !input.tense.includes('Continuous');
  const lang = input.nativeLanguage || 'hi';
  const isHindi = lang === 'hi';

  const hindiRules = (isPerfectTense && isHindi) ? `
CRITICAL HINDI TRANSLATION RULE (MUST FOLLOW):
For Perfect tenses with TRANSITIVE verbs (खेलना, खाना, पढ़ना, लिखना, करना, देखना, बनाना, etc.):
- Subject MUST take "ने": मैंने (NOT मैं), उसने (NOT वह), हमने (NOT हम), तुमने (NOT तुम), उन्होंने (NOT वे), आपने (NOT आप)
- Verb agrees with OBJECT gender/number, NOT subject
- CORRECT: "I have played cricket" = "मैंने क्रिकेट खेला है"
- WRONG:  "I have played cricket" = "मैं क्रिकेट खेला है" ← NEVER do this
- CORRECT: "She has eaten food" = "उसने खाना खाया है"
- WRONG:  "She has eaten food" = "वह खाना खाया है" ← NEVER do this
For INTRANSITIVE verbs (जाना, आना, सोना, रोना): Do NOT use "ने", keep subject as-is.
- CORRECT: "He has gone" = "वह गया है" (NOT "उसने गया है")
` : '';

  const translationLang = isHindi ? 'Hindi' : 'Tibetan (བོད་སྐད)';
  const translationScript = isHindi ? 'Devanagari (हिंदी)' : 'Tibetan script (བོད་ཡིག)';
  const translationInstruction = isHindi
    ? `6. Provide a grammatically correct Hindi translation of the sentence (without parentheses — the Hindi should be a normal complete sentence). Put the Hindi translation in BOTH the "hindiTranslation" and "nativeTranslation" fields.`
    : `6. Provide a grammatically correct Tibetan (བོད་སྐད) translation of the sentence using standard Tibetan script (without parentheses — the translation should be a normal complete sentence). CRITICAL: The "hindiTranslation" field MUST contain the Tibetan (བོད་སྐད) translation in Tibetan script — NOT Hindi, NOT English. Also put the same Tibetan translation in the "nativeTranslation" field.`;

  const selfCheckInstruction = isHindi
    ? `7. SELF-CHECK before responding: (a) Is the English verb form correct for "${input.tense}"? (b) Does the Hindi use "ने" correctly for transitive verbs in Perfect tenses? (c) Are optional time words wrapped in parentheses?`
    : `7. SELF-CHECK before responding: (a) Is the English verb form correct for "${input.tense}"? (b) Is the Tibetan translation natural and grammatically correct? (c) Are optional time words wrapped in parentheses?`;

  return `You are an expert English grammar teacher. You must be VERY STRICT about tense accuracy.
Generate a natural, grammatically correct English sentence in the "${input.tense}" tense.

CRITICAL TENSE RULE — You MUST follow this formula exactly:
${tenseFormula || `Use the correct verb form for "${input.tense}" tense.`}

${timeInstruction ? `TIME REFERENCE RULE:\n${timeInstruction}\n` : ''}WARNING: Do NOT confuse similar tenses. For example:
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
5. PARENTHESES RULE for optional/example time words: If the TIME REFERENCE RULE above says to wrap time in parentheses, use "(" and ")" as separate Punctuation tokens around the optional time words.
   Example: "I have been playing cricket since (morning)" becomes:
   [..., {"word":"since","pos":"Preposition"}, {"word":"(","pos":"Punctuation"}, {"word":"morning","pos":"Noun"}, {"word":")","pos":"Punctuation"}, ...]
   Example: "I have (already) played cricket" becomes:
   [..., {"word":"have","pos":"Verb"}, {"word":"(","pos":"Punctuation"}, {"word":"already","pos":"Adverb"}, {"word":")","pos":"Punctuation"}, {"word":"played","pos":"Verb"}, ...]
${translationInstruction}
${hindiRules}
${selfCheckInstruction}
8. Respond with ONLY a JSON object: { "sentence": [ { "word": "...", "pos": "..." }, ... ], "hindiTranslation": "YOUR ${translationLang.toUpperCase()} TRANSLATION IN ${translationScript.toUpperCase()}", "nativeTranslation": "SAME ${translationLang.toUpperCase()} TRANSLATION" }
REMINDER: Both "hindiTranslation" and "nativeTranslation" MUST be in ${translationLang} (${translationScript}). Do NOT put English in these fields.`;
}

export async function generateSentenceAction(input: SentenceInput): Promise<SentenceOutput> {
  if (!input.apiKey) {
    throw new Error('API Key is missing');
  }

  const prompt = buildPrompt(input);

  if (input.provider === 'groq') {
    const lang = input.nativeLanguage || 'hi';
    const systemContent = lang === 'bo'
      ? 'You are an expert English grammar teacher who also knows Tibetan (བོད་སྐད) well. You MUST follow tense formulas exactly. CRITICAL: ALL translations must be in Tibetan script (བོད་ཡིག). The "hindiTranslation" field must contain TIBETAN text, NOT Hindi or English. The "nativeTranslation" field must also contain the same Tibetan translation.'
      : 'You are an expert English grammar teacher who also knows Hindi grammar perfectly. You MUST follow tense formulas exactly. For Hindi translations of Perfect tenses: ALWAYS use ergative "ने" with transitive verbs (मैंने, उसने, हमने — NEVER मैं, वह, हम). This is non-negotiable.';
    const responseText = await callGroq(input.apiKey, [
      { role: 'system', content: systemContent },
      { role: 'user', content: prompt },
    ], { jsonMode: true, temperature: 0.4 });

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
    config: { temperature: 0.4 },
    prompt,
  });

  if (!output) {
    throw new Error('AI failed to generate a sentence output.');
  }

  return output;
}
