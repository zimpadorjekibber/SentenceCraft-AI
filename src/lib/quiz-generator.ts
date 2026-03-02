import { generateAIContentAction } from '@/ai/flows/generate-content-action';
import type { QuizQuestion } from '@/types/firestore-types';
import type { AiProvider } from '@/lib/ai-client';

export async function generateQuizQuestions(
  apiKey: string,
  aiProvider: AiProvider,
  tense: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  count: number = 5
): Promise<QuizQuestion[]> {
  const difficultyGuide = {
    easy: 'Use simple, common vocabulary. Short sentences. Clear, obvious answers.',
    medium: 'Use everyday vocabulary. Medium-length sentences. Some distractors in options.',
    hard: 'Use varied vocabulary. Longer sentences. Tricky distractors that test deep understanding.',
  };

  const prompt = `You are an expert English grammar quiz master for Indian students learning English.

Generate exactly ${count} quiz questions to test knowledge of the "${tense}" tense.
Difficulty: ${difficulty} — ${difficultyGuide[difficulty]}

Mix these question types:
1. "fill_blank" — Fill in the blank with correct verb form. Example: "She ___ (play) cricket every day." Answer: "plays"
2. "identify_tense" — Give a sentence and ask which tense it is. Provide 4 tense options.
3. "correct_error" — Give a sentence with a grammar error. Ask to find the correct version from options.
4. "translate" — Give a Hindi sentence and ask for the correct English translation from 4 options.

For each question provide:
- "id": sequential number starting from 1
- "type": one of "fill_blank", "identify_tense", "correct_error", "translate"
- "questionText": the question in English
- "questionHindi": Hindi version/hint of the question (helpful for Indian students)
- "options": array of exactly 4 choices (for fill_blank, provide 4 verb form options)
- "correctAnswer": the exact string from options that is correct
- "explanation": brief English explanation of WHY this is correct
- "explanationHindi": same explanation in simple Hindi

IMPORTANT:
- correctAnswer MUST exactly match one of the options
- All questions must specifically test "${tense}" tense knowledge
- Include Hindi translations/hints for every question
- For "identify_tense" type, all 4 options should be different tense names

Respond with ONLY a JSON object: { "questions": [ ... ] }`;

  const responseText = await generateAIContentAction(apiKey, aiProvider, prompt);
  const parsed = JSON.parse(responseText);

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('AI did not return valid quiz questions');
  }

  // Validate and clean questions
  return parsed.questions
    .filter((q: any) => q.questionText && q.options?.length === 4 && q.correctAnswer)
    .map((q: any, i: number) => ({
      id: i + 1,
      type: q.type || 'fill_blank',
      questionText: q.questionText,
      questionHindi: q.questionHindi || '',
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      explanationHindi: q.explanationHindi || '',
    })) as QuizQuestion[];
}
