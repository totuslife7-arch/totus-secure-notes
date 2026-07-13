import {
  TEMPLATE_AI_N_PREDICT,
  TEMPLATE_AI_STOP_WORDS,
} from '@/constants/templateAiConfig';
import { getMonetizationState, hasTemplateAi } from '@/services/monetization';
import { parsePastedForm } from '@/services/templateStudio/parsePastedForm';
import { CustomTemplateDefinition } from '@/store/customTemplateSchema';
import type { LlamaContext, TokenData } from 'llama.rn';

import {
  getLastLlamaInitError,
  getLlamaContext,
  isExpoGo,
  isNativeLlamaSupported,
} from './llamaContext';
import { recordInferenceDiagnostic } from './inferenceDiagnostics';
import { isModelReady } from './modelManager';
import { normalizeAiDraft, parseAiDraftFromText } from './normalizeAiDraft';
import { AiTemplateDraftJson, TEMPLATE_DRAFT_JSON_SCHEMA } from './templateDraftSchema';

export type GenerateDraftOptions = {
  paste: string;
  title?: string;
  category?: string;
  builtinSeed?: CustomTemplateDefinition;
  onToken?: (token: string) => void;
  /** Progress messages for UI (e.g. "Loading model…", "Running inference…"). */
  onStatus?: (message: string) => void;
  /** When true, silently falls back to rules-based parsing on failure. */
  allowRulesFallback?: boolean;
};

export type GenerateDraftResult = {
  draft: CustomTemplateDefinition;
  source: 'ai' | 'rules';
};

export type TemplateAiErrorCode =
  | 'paywall'
  | 'expo_go'
  | 'native_unavailable'
  | 'model_missing'
  | 'llama_init_failed'
  | 'inference_failed'
  | 'parse_failed'
  | 'empty_paste';

export class TemplateAiError extends Error {
  readonly code: TemplateAiErrorCode;

  constructor(code: TemplateAiErrorCode, message: string) {
    super(message);
    this.name = 'TemplateAiError';
    this.code = code;
  }
}

export type TemplateAiReadiness = {
  entitled: boolean;
  supported: boolean;
  expoGo: boolean;
  modelReady: boolean;
  llamaAvailable: boolean;
  llamaError: string | null;
  canRun: boolean;
};

function buildSystemPrompt(builtinSeed?: CustomTemplateDefinition): string {
  const seedHint = builtinSeed
    ? `\nStarter template to adapt:\n${JSON.stringify({
        title: builtinSeed.title,
        category: builtinSeed.category,
        sections: builtinSeed.sections.map((s) => ({
          title: s.title,
          fields: s.fields.map((f) => ({ label: f.label, type: f.type })),
        })),
      })}`
    : '';

  return `You extract clinical intake form fields from pasted text. Output JSON only matching the schema.
Rules:
- Use plain field labels (no markdown).
- Infer field types: date for DOB/visit dates, number for vitals/weights, checkbox for yes/no items, multiline for long notes.
- Group fields into logical sections.
- Do not invent clinical advice or diagnoses.
- Productivity assist only; user will review all fields.
- Respond with a single JSON object only. No markdown fences or commentary.${seedHint}`;
}

function buildUserPrompt(paste: string, options: GenerateDraftOptions): string {
  const trimmed = paste.trim().slice(0, 6000);
  return `Create a reusable form template from this pasted clinic form text.

Title hint: ${options.title || '(infer from content)'}
Category hint: ${options.category || 'Other'}

Pasted form:
"""
${trimmed}
"""`;
}

export async function getTemplateAiReadiness(): Promise<TemplateAiReadiness> {
  const state = await getMonetizationState();
  const entitled = hasTemplateAi(state);
  const supported = isNativeLlamaSupported();
  const expoGo = isExpoGo();
  const modelReady = supported ? await isModelReady() : false;

  let llamaAvailable = false;
  let llamaError: string | null = null;

  if (entitled && supported && !expoGo && modelReady) {
    const handle = await getLlamaContext();
    llamaAvailable = handle.available;
    llamaError = handle.available ? null : handle.error ?? getLastLlamaInitError();
  } else if (expoGo) {
    llamaError = 'llama.rn is not available in Expo Go. Install a dev or production build.';
  } else if (!supported) {
    llamaError = 'Template AI requires iOS or Android.';
  } else if (!modelReady) {
    llamaError = 'Download the on-device model first (~240 MB).';
  }

  return {
    entitled,
    supported,
    expoGo,
    modelReady,
    llamaAvailable,
    llamaError,
    canRun: entitled && supported && !expoGo && modelReady && llamaAvailable,
  };
}

export async function canRunTemplateAi(): Promise<boolean> {
  const readiness = await getTemplateAiReadiness();
  return readiness.canRun;
}

function rulesFallback(options: GenerateDraftOptions): GenerateDraftResult {
  return {
    draft: parsePastedForm(options.paste, {
      title: options.title,
      category: options.category,
    }),
    source: 'rules',
  };
}

async function runCompletion(
  llama: LlamaContext,
  options: GenerateDraftOptions,
  useJsonSchema: boolean,
): Promise<string> {
  const result = await llama.completion(
    {
      messages: [
        { role: 'system', content: buildSystemPrompt(options.builtinSeed) },
        { role: 'user', content: buildUserPrompt(options.paste, options) },
      ],
      jinja: true,
      n_predict: TEMPLATE_AI_N_PREDICT,
      temperature: 0.2,
      stop: TEMPLATE_AI_STOP_WORDS,
      response_format: useJsonSchema
        ? {
            type: 'json_schema',
            json_schema: {
              schema: TEMPLATE_DRAFT_JSON_SCHEMA,
            },
          }
        : { type: 'json_object' },
    },
    (data: TokenData) => {
      if (data.token) {
        options.onToken?.(data.token);
      }
    },
  );

  return result.text;
}

function parseDraftFromCompletion(
  text: string,
  options: GenerateDraftOptions,
): CustomTemplateDefinition | null {
  const parsed =
    parseAiDraftFromText(text, {
      sourcePaste: options.paste,
      category: options.category,
      title: options.title,
    }) ?? null;

  if (parsed?.sections.length) {
    return parsed;
  }

  try {
    const normalized = normalizeAiDraft(JSON.parse(text) as AiTemplateDraftJson, {
      sourcePaste: options.paste,
      category: options.category,
      title: options.title,
    });
    return normalized.sections.length ? normalized : null;
  } catch {
    return null;
  }
}

export async function generateTemplateDraft(
  options: GenerateDraftOptions,
): Promise<GenerateDraftResult> {
  const allowFallback = options.allowRulesFallback ?? false;

  if (!options.paste.trim()) {
    throw new TemplateAiError('empty_paste', 'Paste required');
  }

  const state = await getMonetizationState();
  if (!hasTemplateAi(state)) {
    if (allowFallback) return rulesFallback(options);
    throw new TemplateAiError(
      'paywall',
      'Template AI requires Pro Lifetime. Upgrade in Settings or enter the developer unlock code.',
    );
  }

  if (isExpoGo()) {
    if (allowFallback) return rulesFallback(options);
    throw new TemplateAiError(
      'expo_go',
      'Template AI is not available in Expo Go. Install a dev or production EAS build.',
    );
  }

  if (!isNativeLlamaSupported()) {
    if (allowFallback) return rulesFallback(options);
    throw new TemplateAiError('native_unavailable', 'Template AI requires iOS or Android.');
  }

  options.onStatus?.('Checking on-device model…');
  const modelReady = await isModelReady();
  if (!modelReady) {
    if (allowFallback) return rulesFallback(options);
    throw new TemplateAiError(
      'model_missing',
      'Download the on-device AI model first (~240 MB). Use Settings → Totus AI or Download model in Studio.',
    );
  }

  options.onStatus?.('Loading AI engine…');
  const handle = await getLlamaContext();
  if (!handle.available) {
    const message =
      handle.error ??
      getLastLlamaInitError() ??
      'Could not initialize the on-device AI engine. Re-download the model and try again.';
    if (allowFallback) return rulesFallback(options);
    throw new TemplateAiError('llama_init_failed', message);
  }

  const llama = handle.context;

  const startedAt = Date.now();
  try {
    let text: string;
    options.onStatus?.('Running inference…');
    try {
      text = await runCompletion(llama, options, true);
    } catch {
      await llama.clearCache?.(true).catch(() => undefined);
      text = await runCompletion(llama, options, false);
    }

    const parsed = parseDraftFromCompletion(text, options);
    if (!parsed?.sections.length) {
      recordInferenceDiagnostic({
        source: 'error',
        durationMs: Date.now() - startedAt,
        outputPreview: text.slice(0, 200),
        error: 'parse_failed',
      });
      if (allowFallback) return rulesFallback(options);
      throw new TemplateAiError(
        'parse_failed',
        'AI returned an unreadable template. Try again or use Quick parse (rules).',
      );
    }

    recordInferenceDiagnostic({
      source: 'ai',
      durationMs: Date.now() - startedAt,
      outputPreview: text.slice(0, 200),
      error: null,
    });
    return { draft: parsed, source: 'ai' };
  } catch (err) {
    if (err instanceof TemplateAiError) {
      recordInferenceDiagnostic({
        source: 'error',
        durationMs: Date.now() - startedAt,
        outputPreview: null,
        error: err.code,
      });
      throw err;
    }
    const message =
      err instanceof Error ? err.message : 'On-device AI inference failed.';
    recordInferenceDiagnostic({
      source: 'error',
      durationMs: Date.now() - startedAt,
      outputPreview: null,
      error: message,
    });
    if (allowFallback) return rulesFallback(options);
    throw new TemplateAiError('inference_failed', message);
  }
}

export function templateAiErrorMessage(error: unknown): string {
  if (error instanceof TemplateAiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Template AI is unavailable right now.';
}

export function templateAiErrorTitle(code: TemplateAiErrorCode): string {
  switch (code) {
    case 'paywall':
      return 'Pro Lifetime required';
    case 'expo_go':
      return 'Expo Go not supported';
    case 'native_unavailable':
      return 'Platform not supported';
    case 'model_missing':
      return 'Model required';
    case 'llama_init_failed':
      return 'AI engine failed to start';
    case 'inference_failed':
      return 'AI inference failed';
    case 'parse_failed':
      return 'Could not read AI output';
    case 'empty_paste':
      return 'Paste required';
    default:
      return 'Template AI unavailable';
  }
}
