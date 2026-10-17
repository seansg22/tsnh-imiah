import { callOpenRouter } from './openrouter';
import { callGemini, getStoredLang, type GeminiContent } from './gemini';
import { translate } from '../i18n/ui';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResult {
  text: string;
  model: string;
}

const PROXY_URL = import.meta.env.VITE_CLAUDE_PROXY_URL as string | undefined;
const PROXY_SECRET = import.meta.env.VITE_CLAUDE_PROXY_SECRET as string | undefined;
const PROXY_TIMEOUT = 60000;

// Laptop running scripts/claude-proxy.mjs. Returns null if unset, asleep, or slow.
async function callClaudeProxy(systemInstruction: string, messages: AIMessage[]): Promise<AIResult | null> {
  if (!PROXY_URL || !PROXY_SECRET) return null;
  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Proxy-Secret': PROXY_SECRET },
      body: JSON.stringify({ system: systemInstruction, messages }),
      signal: AbortSignal.timeout(PROXY_TIMEOUT),
    });
    if (!res.ok) return null;
    const { text } = await res.json();
    return text ? { text, model: 'claude (laptop)' } : null;
  } catch {
    return null;
  }
}

/**
 * Tries the laptop Claude proxy first (if configured), then Gemini; if it fails (bad key, network error, rate limit,
 * etc., anything that makes it return null), falls back to OpenRouter so the
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
  const claudeResult = await callClaudeProxy(systemInstruction, messages);
  if (claudeResult) return claudeResult;

  const geminiContents: GeminiContent[] = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const geminiResult = await callGemini(systemInstruction, geminiContents, onStatus);
  if (geminiResult) return geminiResult;

  console.warn('Gemini failed, falling back to OpenRouter');
  onStatus?.(translate(getStoredLang(), 'ai.retrying'));
  return callOpenRouter(systemInstruction, messages);
}
