'use server';

/**
 * Server action for AI content generation.
 * Runs server-side to avoid CORS issues with Groq and other APIs.
 * Supports optional image input for vision/OCR tasks.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { callGroq, GROQ_VISION_MODEL } from '@/lib/groq';

export async function generateAIContentAction(
  apiKey: string,
  provider: 'gemini' | 'groq',
  prompt: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('API Key is missing. Please set your API key in settings.');
  }

  try {
    const hasImage = imageBase64 && imageMimeType;

    if (provider === 'groq') {
      if (hasImage) {
        // Use vision model with multimodal content
        const dataUri = `data:${imageMimeType};base64,${imageBase64}`;
        return await callGroq(apiKey, [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: dataUri } },
            ],
          },
        ], { jsonMode: false, model: GROQ_VISION_MODEL });
      }
      return await callGroq(apiKey, [{ role: 'user', content: prompt }], { jsonMode: true });
    }

    // Default: Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    if (hasImage) {
      // Vision request - no JSON mime type (returns plain text for OCR)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64,
          },
        },
      ]);
      return result.response.text();
    }

    // Text-only request
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
