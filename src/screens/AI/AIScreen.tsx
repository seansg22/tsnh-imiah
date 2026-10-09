import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Copy, Info, RefreshCw, Send, Sparkles, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { differenceInWeeks, parseISO } from 'date-fns';
import { useApp } from '../../context/appStateContext';
import { useBabyAge } from '../../hooks/useBabyAge';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { milestones } from '../../data/weeklyDevelopment';
import { callAI } from '../../lib/ai';
import { summarizeConversation } from '../../lib/knowledgeSummary';
import { nowTimestamp } from '../../lib/timestamp';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp?: number; // Date.now() when the message was created; optional for backward-compat with already-stored messages
}


// How many earlier messages (user + AI) are sent along with the new one. 20 = 10 turns.
// TODO: raise to 20 after testing.
const MAX_CONTEXT_MESSAGES = 2;
const MAX_INPUT_ROWS = 5;

export function AIScreen() {
  const { state, dispatch } = useApp();
  const age = useBabyAge(state.babyProfile?.birthDate ?? null);
  const [messages, setMessages] = useLocalStorage<Message[]>('ai-messages', []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Transient "retrying..." status shown next to the loading indicator. Never added to
  // `messages` — it must not be persisted or sent back to the AI as conversation history.
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (loading || (lastMsg && lastMsg.role === 'user')) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      if (!containerRef.current) return;
      containerRef.current.style.height = `${vv!.height}px`;
      containerRef.current.style.top = `${vv!.offsetTop}px`;
    }

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // Grow the input with its content, up to MAX_INPUT_ROWS, then scroll inside it.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const cs = getComputedStyle(el);
    const box = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const max = (parseFloat(cs.lineHeight) || 21) * MAX_INPUT_ROWS + box;
    const full = el.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    el.style.height = `${Math.min(full, max)}px`;
    el.style.overflowY = full > max ? 'auto' : 'hidden';
  }, [input]);

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || loading) return;

    setInput('');
    const withUser: Message[] = [...messages, { role: 'user', content: text, timestamp: nowTimestamp() }];
    setMessages(withUser);
    setLoading(true);
    setStatusMessage('');

    const baby = state.babyProfile!;

    const latestEntry = state.growthEntries
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    const measurementsLine = latestEntry
      ? [
          latestEntry.weight != null ? `weight ${latestEntry.weight} kg` : null,
          latestEntry.length != null ? `length ${latestEntry.length} cm` : null,
          latestEntry.head != null ? `head circumference ${latestEntry.head} cm` : null,
        ]
          .filter(Boolean)
          .join(', ')
      : null;

    const achievedSet = new Set(state.achievedMilestones);
    const achievedLabels = milestones
      .filter(m => achievedSet.has(m.id))
      .map(m => `- [${m.category}] ${m.label}`);
    const milestonesLine = achievedLabels.join(', ')

    const feedingLabel: Record<string, string> = {
      breast: 'breastfeeding',
      bottle: 'bottle-feeding with expressed breast milk',
      formula: 'formula feeding',
    };

    const solidsLine = baby.solidsStartDate
      ? `Started solids ${differenceInWeeks(new Date(), parseISO(baby.solidsStartDate))} weeks ago (on ${baby.solidsStartDate})`
      : 'Not started solids yet';

    const formulaSwitchLine = baby.feedingMethod === 'formula' && baby.formulaSwitchDate
      ? `\n- Switched from breast milk to formula ${differenceInWeeks(new Date(), parseISO(baby.formulaSwitchDate))} weeks ago (on ${baby.formulaSwitchDate})`
      : '';

    const notesLine = baby.notes?.trim() ? `\n- Parent's notes: ${baby.notes.trim()}` : '';

    const historyLine = state.knowledgeBase
      .slice(-10)
      .map(e => e.content)
      .join('\n');

    const systemInstruction = `You are a careful baby development assistant.

Baby:
- Name: ${baby.name}
- Age: ${age.weeks} weeks
- Gender: ${baby.gender}
- Feeding method: ${feedingLabel[baby.feedingMethod ?? 'breast']}${formulaSwitchLine}
- Solids: ${solidsLine}${measurementsLine ? `\n- Latest measurements: ${measurementsLine}` : ''}${milestonesLine ? `\n- Achieved milestones: ${milestonesLine}` : ''}${notesLine}${historyLine ? `\n\nKnown history about ${baby.name} from past conversations:\n${historyLine}` : ''}

Rules:
- Address the user as "${baby.name}'s parent" in the language they used in their question, but only in the your first response of the conversation.
- Answer in the language the user used in their question.
- Format answers as bullet points — one concise sentence per bullet
- Use 3 to 5 bullets max unless user explicitly asks to be more comprehensive
- Give practical, age-aware, gender-aware, measurement-aware guidance`;

    // Only the most recent messages go to the AI (the full chat stays stored and synced).
    // The window must start with a user message, so drop a leading assistant reply.
    const recent = messages.slice(-MAX_CONTEXT_MESSAGES);
    if (recent[0]?.role === 'assistant') recent.shift();
    const conversation = [...recent, withUser[withUser.length - 1]].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const result = await callAI(systemInstruction, conversation, setStatusMessage);
    setStatusMessage('');

    if (!result) {
      setMessages([...withUser, { role: 'assistant', content: 'Something went wrong after several attempts. Please try again later.', timestamp: nowTimestamp() }]);
      setLoading(false);
      return;
    }

    const { text: answer, model } = result;
    setLoading(false);
    let i = 0;
    const CHUNK = 3;
    streamIntervalRef.current = setInterval(() => {
      i += CHUNK;
      if (i >= answer.length) {
        clearInterval(streamIntervalRef.current!);
        streamIntervalRef.current = null;
        setStreamingContent('');
        setMessages([...withUser, { role: 'assistant', content: answer, model, timestamp: nowTimestamp() }]);
      } else {
        setStreamingContent(answer.slice(0, i));
      }
    }, 16);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] flex flex-col bg-cream w-full max-w-[430px]"
      style={{ height: '100dvh' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-black/5 flex-shrink-0"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_PAGE', payload: 'today' })}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-app-text"
          aria-label="Go back"
        >
          <ArrowLeft size={20} strokeWidth={2.3} />
        </button>
        <div className="flex flex-1 items-center gap-2">
          <Sparkles size={18} className="text-peach" />
          <span className="text-lg font-extrabold text-app-text">Ask AI</span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
                streamIntervalRef.current = null;
              }
              setStreamingContent('');
              const clearedMessages = messages;
              setMessages([]);

              if (clearedMessages.length > 0) {
                summarizeConversation(clearedMessages, state.babyProfile?.name ?? 'the baby')
                  .then(summary => {
                    if (summary) {
                      dispatch({
                        type: 'ADD_KNOWLEDGE_ENTRY',
                        payload: { id: crypto.randomUUID(), createdAt: new Date().toISOString(), content: summary },
                      });
                    }
                  })
                  .catch(err => console.error('Knowledge summarization failed', err));
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-textMuted"
            aria-label="Clear conversation"
          >
            <Trash2 size={16} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 text-center pt-16">
            <div className="w-14 h-14 rounded-full bg-peach/10 flex items-center justify-center">
              <Sparkles size={26} className="text-peach" />
            </div>
            <p className="text-textMuted text-sm font-medium max-w-[260px]">
              I already know {state.babyProfile?.name} — her age, gender, and profile. Ask me anything about her development, feeding, sleep, or milestones.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed bg-peach text-black whitespace-pre-wrap">
                {msg.content}
              </div>
            ) : (
              <div className="text-sm leading-relaxed text-app-text">
                <div className="prose prose-sm prose-neutral max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <div className="mt-3 mb-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                      setCopiedIndex(i);
                      setTimeout(() => setCopiedIndex(null), 1500);
                    }}
                    className="flex items-center gap-1 text-sm text-textMuted active:text-app-text"
                    aria-label="Copy message"
                  >
                    {copiedIndex === i ? <Check size={12} strokeWidth={2.2} /> : <Copy size={12} strokeWidth={2.2} />}
                    {copiedIndex === i ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start gap-1.5">
            {statusMessage && (
              <div className="flex items-center gap-1.5 pl-1 text-xs text-textMuted">
                <RefreshCw size={12} strokeWidth={2.2} className="animate-spin" />
                {statusMessage}
              </div>
            )}
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {streamingContent && (
          <div className="flex justify-start">
            <div className="text-sm leading-relaxed text-app-text">
              <div className="prose prose-sm prose-neutral max-w-none">
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {messages.length > MAX_CONTEXT_MESSAGES && !loading && !streamingContent && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-orange-50 border border-peachLight">
            <Info size={16} strokeWidth={2.2} className="mt-0.5 flex-shrink-0 text-peach" />
            <p className="text-sm leading-relaxed text-app-text">
              Long chats hurt AI quality and use up the budget faster. Clear the chat to start fresh.
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 border-t border-black/5"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end gap-2 px-4 pt-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I know about your kid, just ask..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-app-text placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-peach/40"
            style={{ lineHeight: '1.5' }}
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-peach text-white shadow-sm transition-opacity disabled:opacity-40 active:scale-95"
            aria-label="Send"
          >
            <Send size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
