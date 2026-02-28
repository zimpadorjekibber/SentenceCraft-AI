import { generateAIContentAction } from '@/ai/flows/generate-content-action';

export type AiProvider = 'gemini' | 'groq';

/**
 * Wrapper that delegates AI content generation to a server action.
 * This avoids CORS issues when calling APIs like Groq from the browser.
 */
export async function generateAIContent(
  apiKey: string,
  provider: AiProvider,
  prompt: string
): Promise<string> {
  return generateAIContentAction(apiKey, provider, prompt);
}
