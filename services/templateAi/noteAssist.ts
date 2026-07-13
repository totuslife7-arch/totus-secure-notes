import {
  generateTemplateDraft,
  getTemplateAiReadiness,
  TemplateAiError,
} from '@/services/templateAi/generateTemplateDraft';
import { getLlamaContext } from '@/services/templateAi/llamaContext';
import { hasTemplateAi, getMonetizationState } from '@/services/monetization';

export type NoteAssistAction = 'bulletize' | 'shorten' | 'expand' | 'summarize';

const ACTION_PROMPTS: Record<NoteAssistAction, string> = {
  bulletize: 'Convert the note into clear markdown bullet points. Keep all facts. Output markdown only.',
  shorten: 'Shorten the note while keeping key clinical facts. Output markdown only.',
  expand: 'Expand abbreviations and add structure with headings. Do not invent facts. Output markdown only.',
  summarize: 'Write a 2-3 sentence summary. Output plain text only.',
};

function buildNoteAssistPrompt(content: string, action: NoteAssistAction): string {
  return `${ACTION_PROMPTS[action]}

Note:
"""
${content.trim().slice(0, 4000)}
"""`;
}

export async function runNoteAssist(
  content: string,
  action: NoteAssistAction,
  onStatus?: (msg: string) => void,
): Promise<string> {
  if (!content.trim()) {
    throw new TemplateAiError('empty_paste', 'Write something in the note first.');
  }

  const state = await getMonetizationState();
  if (!hasTemplateAi(state)) {
    throw new TemplateAiError(
      'paywall',
      'Note Assist requires Pro Lifetime or developer unlock (TOTUS-DEV-2026).',
    );
  }

  const readiness = await getTemplateAiReadiness();
  if (!readiness.canRun) {
    const msg = readiness.llamaError ?? 'Download the on-device model in Settings → Totus AI.';
    throw new TemplateAiError(
      readiness.modelReady ? 'llama_init_failed' : 'model_missing',
      msg,
    );
  }

  onStatus?.('Loading AI engine…');
  const handle = await getLlamaContext();
  if (!handle.available) {
    throw new TemplateAiError('llama_init_failed', handle.error ?? 'AI engine unavailable.');
  }

  onStatus?.('Editing note…');
  const result = await handle.context.completion({
    messages: [
      {
        role: 'system',
        content:
          'You are a productivity writing assistant for encrypted clinical notes. Never diagnose. Never invent patient data. User reviews all output.',
      },
      { role: 'user', content: buildNoteAssistPrompt(content, action) },
    ],
    jinja: true,
    n_predict: 512,
    temperature: 0.3,
    stop: ['</s>', '<|end|>', '<|eot_id|>'],
  });

  const text = result.text?.trim();
  if (!text) {
    throw new TemplateAiError('inference_failed', 'AI returned empty output. Try again.');
  }
  return text;
}

/** Rules-based fallback when AI unavailable */
export function rulesNoteAssist(content: string, action: NoteAssistAction): string {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  switch (action) {
    case 'bulletize':
      return lines.map((l) => (l.startsWith('- ') ? l : `- ${l}`)).join('\n');
    case 'shorten':
      return lines.slice(0, Math.max(3, Math.ceil(lines.length / 2))).join('\n');
    case 'expand':
      return `## Notes\n\n${content}\n\n## Follow-up\n\n- `;
    case 'summarize':
      return lines.slice(0, 2).join(' ');
    default:
      return content;
  }
}
