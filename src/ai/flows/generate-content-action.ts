'use server';

/**
 * Server action for AI content generation.
 * Runs server-side to avoid CORS issues with Groq and other APIs.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { callGroq } from '@/lib/groq';

export async function generateAIContentAction(
  apiKey: string,
  provider: 'gemini' | 'groq',
  prompt: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('API Key is missing. Please set your API key in settings.');
  }

  try {
    if (provider === 'groq') {
      return await callGroq(apiKey, [{ role: 'user', content: prompt }], { jsonMode: true });
    }

    // Default: Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: any) {
    const message = err?.message || 'AI generation failed. Please try again.';
    throw new Error(message);
  }
}
