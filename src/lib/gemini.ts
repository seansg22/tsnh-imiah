// https://aistudio.google.com/u/1/api-keys?pli=1&project=gen-lang-client-0041515414
// tson.regis@gmail.com
const MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash',
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
];
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Index into MODELS to start from. Sticky across calls: once a model succeeds,
// later calls start there instead of retrying already-known-bad models from the top.
let modelIndex = 0;
const keyIndexes = new Map<string, number>();

export interface GeminiContent {
  role: string;
  parts: { text: string }[];
}

export interface GeminiResult {
  text: string;
  model: string;
}

function getApiKeys() {
  return String(import.meta.env.VITE_GEMINI_API_KEY ?? '')
    .split(',')
    .map(key => key.trim())
    .filter(Boolean);
}

function getNextApiKey(model: string, apiKeys: string[]) {
  const index = keyIndexes.get(model) ?? 0;
  keyIndexes.set(model, index + 1);
  return apiKeys[index % apiKeys.length];
}

/**
 * Calls the Gemini generateContent API, falling back through MODELS until one succeeds.
 * Each model rotates through all comma-separated keys in VITE_GEMINI_API_KEY, so repeated
 * attempts go model A / key 1, model A / key 2, model A / key 1, then model B / key 1, etc.
 *
 * A 503 ("model overloaded") skips the remaining retries for that model and moves
 * straight to the next one — retrying an overloaded model rarely helps and only
 * burns the fixed RETRY_DELAY.
 *
 * The starting model is sticky across calls (see `modelIndex`): once a fallback
 * model succeeds, subsequent calls start there instead of re-trying earlier models
 * that just failed. If the current model and every model after it fail, the search
 * wraps around to the start of MODELS (e.g. sticky on C, C fails → D, E, ... wraps to A, B).
 *
 * `onStatus`, if given, is called with a user-facing message before every retry (same
 * model, next attempt, or next model) — but never on the very first attempt. Callers
 * should treat these as transient UI-only status text, not part of the conversation.
 */
export async function callGemini(
  systemInstruction: string,
  contents: GeminiContent[],
  onStatus?: (message: string) => void
): Promise<GeminiResult | null> {
  const apiKeys = getApiKeys();
  if (apiKeys.length === 0) {
    console.error('Missing VITE_GEMINI_API_KEY');
    return null;
  }

  for (let n = 0; n < MODELS.length; n++) {
    const i = (modelIndex + n) % MODELS.length;
    const model = MODELS[i];
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      if (n > 0 || attempt > 1) {
        onStatus?.('Having trouble getting a response, retrying...');
      }
      try {
        const apiKey = getNextApiKey(model, apiKeys);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemInstruction }] },
              contents,
            }),
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`, { cause: res.status });

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response received.';
        modelIndex = i;
        return { text, model };
      } catch (err) {
        if (err instanceof Error && err.cause === 503) break;
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
  }

  return null;
}
