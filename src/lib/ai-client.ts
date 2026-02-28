import { GoogleGenerativeAI } from '@google/generative-ai';
import { callGroq } from './groq';

export type AiProvider = 'gemini' | 'groq';

export async function generateAIContent(
  apiKey: string,
  provider: AiProvider,
  prompt: string
): Promise<string> {
  if (provider === 'groq') {
    return callGroq(apiKey, [{ role: 'user', content: prompt }], { jsonMode: true });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
