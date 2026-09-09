import { callOpenRouter } from './openrouter';
import { callGemini, type GeminiContent } from './gemini';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResult {
  text: string;
  model: string;
}

/**
 * Calls Gemini first; if it fails (bad key, network error, rate limit,
 * etc. — anything that makes it return null), falls back to OpenRouter so the
 * app still gets an answer instead of surfacing an error.
 *
 * `onStatus`, if given, is called with a user-facing message whenever this falls
 * back to OpenRouter, and again for each retry Gemini does internally. Callers should
 * treat these as transient UI-only status text, not part of the conversation.
 */
export async function callAI(
  systemInstruction: string,
  messages: AIMessage[],
  onStatus?: (message: string) => void
): Promise<AIResult | null> {
  const geminiContents: GeminiContent[] = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const geminiResult = await callGemini(systemInstruction, geminiContents, onStatus);
  if (geminiResult) return geminiResult;

  console.warn('Gemini failed, falling back to OpenRouter');
  onStatus?.('Having trouble getting a response, retrying...');
  return callOpenRouter(systemInstruction, messages);
}
