import { generateAIContentAction } from '@/ai/flows/generate-content-action';
import type { QuizQuestion } from '@/types/firestore-types';
import type { AiProvider } from '@/lib/ai-client';
import type { QuizTopic } from '@/lib/quiz-topics';

/**
 * Generate quiz questions for ANY topic (tenses, modals, voice, etc.)
 * Uses the topic's own promptTemplate to build the AI prompt.
 */
export async function generateQuizQuestions(
  apiKey: string,
  aiProvider: AiProvider,
  topic: QuizTopic,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  count: number = 5
): Promise<QuizQuestion[]> {
  const prompt = topic.promptTemplate(difficulty, count);

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
