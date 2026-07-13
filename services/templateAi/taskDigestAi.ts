import { buildTaskDigest, TaskDigest } from '@/services/taskDigest';
import { Note } from '@/services/storage';
import {
  getTemplateAiReadiness,
  TemplateAiError,
} from '@/services/templateAi/generateTemplateDraft';
import { getLlamaContext } from '@/services/templateAi/llamaContext';
import { hasTemplateAi, getMonetizationState } from '@/services/monetization';

export type EnhancedTaskDigest = TaskDigest & {
  aiSummary?: string;
  source: 'rules' | 'ai';
};

export async function buildEnhancedTaskDigest(notes: Note[]): Promise<EnhancedTaskDigest> {
  const digest = buildTaskDigest(notes);
  const state = await getMonetizationState();

  if (!hasTemplateAi(state)) {
    return { ...digest, source: 'rules' };
  }

  const readiness = await getTemplateAiReadiness();
  if (!readiness.canRun || digest.summary.includes('No open')) {
    return { ...digest, source: 'rules' };
  }

  try {
    const handle = await getLlamaContext();
    if (!handle.available || !handle.context) {
      return { ...digest, source: 'rules' };
    }

    const items = [
      ...digest.flaggedNotes.map((i) => `Flagged: ${i.title}`),
      ...digest.dueReminders.map((i) => `Due: ${i.title} — ${i.reason}`),
      ...digest.openFollowUps.map((i) => `Open: ${i.title}`),
    ]
      .slice(0, 12)
      .join('\n');

    const result = await handle.context.completion({
      messages: [
        {
          role: 'system',
          content:
            'Summarize task priorities in 2-3 short sentences for a clinician. No diagnoses. Plain text only.',
        },
        { role: 'user', content: `Today's vault tasks:\n${items}` },
      ],
      jinja: true,
      n_predict: 128,
      temperature: 0.2,
      stop: ['</s>', '<|end|>'],
    });

    const aiSummary = result.text?.trim();
    if (aiSummary) {
      return { ...digest, aiSummary, source: 'ai' };
    }
  } catch {
    // fall through
  }

  return { ...digest, source: 'rules' };
}
