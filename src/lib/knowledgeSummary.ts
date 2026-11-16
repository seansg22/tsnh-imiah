import { callAI } from './ai';
import type { Lang } from '../i18n/langContext';

interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

const NOTHING_NOTABLE = 'NOTHING_NOTABLE';

/**
 * Reads several (timestamped) Ask AI conversations and asks the AI to distill them into
 * durable, dated knowledge about the baby worth remembering for future conversations.
 * Returns null if nothing notable was discussed. Throws if the AI call fails, so the caller can keep its queue.
 */
export async function summarizeConversation(
  conversations: TranscriptMessage[][],
  babyName: string,
  lang: Lang = 'vi'
): Promise<string | null> {
  const transcript = conversations
    .map(messages => messages
    .map(m => {
      const time = m.timestamp ? new Date(m.timestamp).toISOString() : 'unknown time';
      const speaker = m.role === 'user' ? 'Parent' : 'AI';
      return `[${time}] ${speaker}: ${m.content}`;
    })
    .join('\n'))
    .join('\n\n--- next conversation ---\n\n');

  const systemInstruction = `You are a memory-extraction assistant for a baby-tracking app.
Read these timestamped conversations between a parent and an AI assistant about their baby, ${babyName}.
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
  if (!result) throw new Error('summary call failed');

  const text = result.text.trim();
  if (!text || text === NOTHING_NOTABLE) return null;

  return text;
}
