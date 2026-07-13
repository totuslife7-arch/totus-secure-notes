import type { LlamaContextHandle } from './llamaContext.types';

export async function getLlamaContext(): Promise<LlamaContextHandle> {
  return { available: false, error: 'Template AI is not available on web.' };
}

export async function releaseLlamaContext(): Promise<void> {
  // no-op on web
}

export function isNativeLlamaSupported(): boolean {
  return false;
}

export function isExpoGo(): boolean {
  return false;
}

export function getLastLlamaInitError(): string | null {
  return 'Template AI is not available on web.';
}
