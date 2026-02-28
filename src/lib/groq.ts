/**
 * Groq API helper for Llama model integration.
 * Uses Groq's OpenAI-compatible REST API.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  temperature?: number;
  jsonMode?: boolean;
}

export async function callGroq(
  apiKey: string,
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<string> {
  const { temperature = 0.7, jsonMode = true } = options;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
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
