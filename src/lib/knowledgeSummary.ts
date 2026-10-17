import { callAI } from './ai';
import type { Lang } from '../i18n/langContext';

interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

const NOTHING_NOTABLE = 'NOTHING_NOTABLE';

/**
 * Reads a (timestamped) Ask AI conversation and asks the AI to distill it into
 * durable, dated knowledge about the baby worth remembering for future conversations.
 * Returns null if the call fails or nothing notable was discussed.
 */
export async function summarizeConversation(
  messages: TranscriptMessage[],
  babyName: string,
  lang: Lang = 'vi'
): Promise<string | null> {
  const transcript = messages
    .map(m => {
      const time = m.timestamp ? new Date(m.timestamp).toISOString() : 'unknown time';
      const speaker = m.role === 'user' ? 'Parent' : 'AI';
      return `[${time}] ${speaker}: ${m.content}`;
    })
    .join('\n');

  const systemInstruction = `You are a memory-extraction assistant for a baby-tracking app.
Read this timestamped conversation between a parent and an AI assistant about their baby, ${babyName}.
Extract ONLY durable, factual knowledge that is specifically meaningful about ${babyName}, health events,
incidents, preferences, routines, or facts the parent mentioned that aren't already static profile data.

Exclude anything not meaningful or not specifically about ${babyName}: small talk, greetings, generic
parenting advice or explanations the AI gave, questions that went unanswered, and any topic unrelated to
the baby. When in doubt about whether something is worth remembering, leave it out.

Write the bullet points in ${lang === 'vi' ? 'Vietnamese' : 'English'}.
Output 1-5 concise bullet points, each starting with a date in YYYY-MM-DD format (derived from the message
timestamps, or from a date mentioned in the text if more specific), e.g.:
- 2026-08-20: Had a mild fever in the evening; given paracetamol, resolved by morning.

If nothing meaningful/durable about ${babyName} was discussed, respond with exactly: ${NOTHING_NOTABLE}`;

  const result = await callAI(systemInstruction, [{ role: 'user', content: transcript }]);
  if (!result) return null;

  const text = result.text.trim();
  if (!text || text === NOTHING_NOTABLE) return null;

  return text;
}
