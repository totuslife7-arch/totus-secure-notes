import * as Clipboard from 'expo-clipboard';
import { Alert, Linking } from 'react-native';

import { TemplateAiError, TemplateAiErrorCode, TemplateAiReadiness } from './generateTemplateDraft';

export type ReadinessBlockReason =
  | 'paywall'
  | 'expo_go'
  | 'native_unavailable'
  | 'model_missing'
  | 'llama_init_failed'
  | 'ready';

export function getReadinessBlockReason(readiness: TemplateAiReadiness): ReadinessBlockReason {
  if (readiness.canRun) return 'ready';
  if (!readiness.entitled) return 'paywall';
  if (readiness.expoGo) return 'expo_go';
  if (!readiness.supported) return 'native_unavailable';
  if (!readiness.modelReady) return 'model_missing';
  return 'llama_init_failed';
}

export function readinessStatusLabel(readiness: TemplateAiReadiness): string {
  const reason = getReadinessBlockReason(readiness);
  switch (reason) {
    case 'ready':
      return 'On-device AI ready';
    case 'paywall':
      return 'Pro Lifetime or developer unlock required';
    case 'expo_go':
      return 'Requires EAS build — not Expo Go';
    case 'native_unavailable':
      return 'Requires iOS or Android';
    case 'model_missing':
      return 'Model not downloaded (~240 MB)';
    case 'llama_init_failed':
      return readiness.llamaError ?? 'AI engine failed to start';
    default:
      return 'AI unavailable';
  }
}

export function readinessStatusColor(readiness: TemplateAiReadiness): 'ready' | 'warn' | 'error' {
  if (readiness.canRun) return 'ready';
  if (getReadinessBlockReason(readiness) === 'model_missing') return 'warn';
  return 'error';
}

export function buildRecoveryActions(
  code: TemplateAiErrorCode,
  handlers: {
    onQuickParse?: () => void;
    onRedownload?: () => void;
    onOpenSettings?: () => void;
  },
): { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] {
  const actions: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [];

  if (code === 'model_missing' || code === 'llama_init_failed') {
    actions.push({ text: 'Re-download model', onPress: handlers.onRedownload });
  }
  if (code === 'paywall') {
    actions.push({ text: 'Open Settings', onPress: handlers.onOpenSettings });
  }
  if (handlers.onQuickParse) {
    actions.push({ text: 'Quick parse (rules)', onPress: handlers.onQuickParse });
  }
  actions.push({ text: 'Cancel', style: 'cancel' });
  return actions;
}

export async function showTemplateAiFailure(
  error: unknown,
  handlers: {
    onQuickParse?: () => void;
    onRedownload?: () => void;
    onOpenSettings?: () => void;
  },
): Promise<void> {
  const message =
    error instanceof TemplateAiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Template AI is unavailable right now.';

  const title =
    error instanceof TemplateAiError
      ? ({
          paywall: 'Pro Lifetime required',
          expo_go: 'Expo Go not supported',
          native_unavailable: 'Platform not supported',
          model_missing: 'Model required',
          llama_init_failed: 'AI engine failed to start',
          inference_failed: 'AI inference failed',
          parse_failed: 'Could not read AI output',
          empty_paste: 'Paste required',
        }[error.code] ?? 'Template AI unavailable')
      : 'Template AI unavailable';

  const code = error instanceof TemplateAiError ? error.code : 'inference_failed';

  Alert.alert(title, message, [
    {
      text: 'Copy error',
      onPress: () => Clipboard.setStringAsync(`${title}: ${message}`),
    },
    ...buildRecoveryActions(code as TemplateAiErrorCode, handlers),
  ]);
}
