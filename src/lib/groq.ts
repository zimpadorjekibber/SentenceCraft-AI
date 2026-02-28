/**
 * Groq API helper for Llama model integration.
 * Uses Groq's OpenAI-compatible REST API.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_DEFAULT_MODEL = 'llama-3.3-70b-versatile';
export const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

export interface GroqTextContent {
  type: 'text';
  text: string;
}

export interface GroqImageContent {
  type: 'image_url';
  image_url: {
    url: string; // "data:image/jpeg;base64,..." or a URL
  };
}

export type GroqMessageContent = string | (GroqTextContent | GroqImageContent)[];

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: GroqMessageContent;
}

export interface GroqOptions {
  temperature?: number;
  jsonMode?: boolean;
  model?: string;
}

export async function callGroq(
  apiKey: string,
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<string> {
  const { temperature = 0.7, jsonMode = true, model = GROQ_DEFAULT_MODEL } = options;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `Groq API error (${response.status})`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.error?.message || message;
    } catch {}
    throw new Error(message);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
