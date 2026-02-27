import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Global Genkit instance configured with Google AI plugin.
 * Used for all AI-related flows and prompts.
 */
export const ai = genkit({
  plugins: [googleAI()],
});
