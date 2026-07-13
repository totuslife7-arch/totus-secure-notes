import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { initLlama, LlamaContext } from 'llama.rn';

import {
  TEMPLATE_AI_N_CTX,
  TEMPLATE_AI_N_THREADS,
} from '@/constants/templateAiConfig';

import { getModelFilePath } from './modelManager';
import type { LlamaContextHandle } from './llamaContext.types';

let context: LlamaContext | null = null;
let loading: Promise<LlamaContext> | null = null;
let lastInitError: string | null = null;

export function isNativeLlamaSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

export function getLastLlamaInitError(): string | null {
  return lastInitError;
}

export async function getLlamaContext(): Promise<LlamaContextHandle> {
  if (!isNativeLlamaSupported()) {
    lastInitError = 'Template AI requires iOS or Android.';
    return { available: false, error: lastInitError };
  }

  if (isExpoGo()) {
    lastInitError = 'llama.rn is not available in Expo Go. Install a dev or production build.';
    return { available: false, error: lastInitError };
  }

  if (context) {
    return { available: true, context };
  }

  if (!loading) {
    const modelPath = getModelFilePath();
    loading = initLlama({
      model: modelPath,
      use_mlock: false,
      n_ctx: TEMPLATE_AI_N_CTX,
      n_gpu_layers: Platform.OS === 'ios' ? 99 : 0,
      n_threads: TEMPLATE_AI_N_THREADS,
    })
      .then((ctx) => {
        context = ctx;
        lastInitError = null;
        return ctx;
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to initialize on-device AI engine.';
        lastInitError = message;
        throw err;
      });
  }

  try {
    const ctx = await loading;
    return { available: true, context: ctx };
  } catch {
    loading = null;
    context = null;
    return {
      available: false,
      error: lastInitError ?? 'Failed to initialize on-device AI engine.',
    };
  }
}

export async function releaseLlamaContext(): Promise<void> {
  if (context) {
    try {
      await context.release();
    } catch {
      // ignore
    }
  }
  context = null;
  loading = null;
  lastInitError = null;
}
