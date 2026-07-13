/** TypeScript entry; Metro resolves llamaContext.native.ts / llamaContext.web.ts at runtime. */
export type { LlamaContextHandle } from './llamaContext.types';
export {
  getLlamaContext,
  releaseLlamaContext,
  isNativeLlamaSupported,
  isExpoGo,
  getLastLlamaInitError,
} from './llamaContext.native';
