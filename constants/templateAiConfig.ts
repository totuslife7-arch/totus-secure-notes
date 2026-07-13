/** On-device Template AI model (downloaded on demand, not bundled in APK). */
export const TEMPLATE_AI_MODEL = {
  id: 'smollm2-360m-instruct-q4',
  filename: 'SmolLM2-360M-Instruct-Q4_K_M.gguf',
  url: 'https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF/resolve/main/SmolLM2-360M-Instruct-Q4_K_M.gguf',
  sizeBytes: 240_000_000,
  displayName: 'SmolLM2 360M (on-device)',
} as const;

export const TEMPLATE_AI_DIR = 'template-ai';

export const TEMPLATE_AI_N_CTX = 2048;
export const TEMPLATE_AI_N_PREDICT = 768;
export const TEMPLATE_AI_N_THREADS = 4;

export const TEMPLATE_AI_STOP_WORDS = [
  '</s>',
  '<|end|>',
  '<|eot_id|>',
  '<|end_of_text|>',
  '<|im_end|>',
];
