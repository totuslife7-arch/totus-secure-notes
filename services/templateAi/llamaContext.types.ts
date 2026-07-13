import type { LlamaContext } from 'llama.rn';

export type LlamaContextHandle =
  | { available: true; context: LlamaContext }
  | { available: false; error?: string };
