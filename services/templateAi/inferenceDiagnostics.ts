export type InferenceDiagnostic = {
  at: string;
  source: 'ai' | 'rules' | 'error';
  durationMs: number;
  outputPreview: string | null;
  error: string | null;
};

let lastDiagnostic: InferenceDiagnostic | null = null;

export function recordInferenceDiagnostic(entry: Omit<InferenceDiagnostic, 'at'>): void {
  lastDiagnostic = { ...entry, at: new Date().toISOString() };
  if (__DEV__ && entry.outputPreview) {
    console.log(
      `[TemplateAI] ${entry.source} in ${entry.durationMs}ms — ${entry.outputPreview.slice(0, 200)}`,
    );
  }
}

export function getLastInferenceDiagnostic(): InferenceDiagnostic | null {
  return lastDiagnostic;
}

export function clearInferenceDiagnostic(): void {
  lastDiagnostic = null;
}
