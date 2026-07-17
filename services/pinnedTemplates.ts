import * as SecureStore from 'expo-secure-store';

import { getCustomTemplate } from '@/services/templateStudio/templateStorage';
import { getBuiltinTemplate } from '@/store/builtinTemplates';
import { SOFO_TEMPLATE_ID } from '@/store/postpartumTemplate';
import { getTemplateById } from '@/store/templates';

export type PinnedTemplateKind = 'form' | 'builtin' | 'custom' | 'markdown';

export type PinnedTemplateRef = {
  kind: PinnedTemplateKind;
  id: string;
};

export type PinnedTemplateDisplay = PinnedTemplateRef & {
  title: string;
  route: string;
};

const STORAGE_KEY = 'totus_pinned_templates_v1';

const DEFAULT_PINS: PinnedTemplateRef[] = [{ kind: 'form', id: SOFO_TEMPLATE_ID }];

function refKey(ref: PinnedTemplateRef): string {
  return `${ref.kind}:${ref.id}`;
}

function dedupeRefs(refs: PinnedTemplateRef[]): PinnedTemplateRef[] {
  const seen = new Set<string>();
  const next: PinnedTemplateRef[] = [];
  for (const ref of refs) {
    const key = refKey(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(ref);
  }
  return next;
}

export async function loadPinnedTemplateRefs(): Promise<PinnedTemplateRef[]> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) {
      await savePinnedTemplateRefs(DEFAULT_PINS);
      return [...DEFAULT_PINS];
    }
    const parsed = JSON.parse(raw) as PinnedTemplateRef[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...DEFAULT_PINS];
    }
    return dedupeRefs(
      parsed.filter(
        (ref) =>
          ref &&
          typeof ref.id === 'string' &&
          ['form', 'builtin', 'custom', 'markdown'].includes(ref.kind),
      ),
    );
  } catch {
    return [...DEFAULT_PINS];
  }
}

export async function savePinnedTemplateRefs(refs: PinnedTemplateRef[]): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(dedupeRefs(refs)));
}

export async function pinTemplate(ref: PinnedTemplateRef): Promise<PinnedTemplateRef[]> {
  const current = await loadPinnedTemplateRefs();
  const key = refKey(ref);
  if (current.some((entry) => refKey(entry) === key)) {
    return current;
  }
  const next = dedupeRefs([ref, ...current]);
  await savePinnedTemplateRefs(next);
  return next;
}

export async function unpinTemplate(ref: PinnedTemplateRef): Promise<PinnedTemplateRef[]> {
  const current = await loadPinnedTemplateRefs();
  const key = refKey(ref);
  const next = current.filter((entry) => refKey(entry) !== key);
  await savePinnedTemplateRefs(next);
  return next;
}

export async function isTemplatePinned(ref: PinnedTemplateRef): Promise<boolean> {
  const current = await loadPinnedTemplateRefs();
  const key = refKey(ref);
  return current.some((entry) => refKey(entry) === key);
}

export function routeForPinnedRef(ref: PinnedTemplateRef): string | null {
  switch (ref.kind) {
    case 'form': {
      const template = getTemplateById(ref.id);
      return template?.route ?? null;
    }
    case 'builtin':
      return `/templates/builtin/${ref.id}`;
    case 'custom':
      return `/templates/studio/${ref.id}`;
    case 'markdown':
      return '/templates';
    default:
      return null;
  }
}

export function titleForPinnedRef(ref: PinnedTemplateRef): string | null {
  switch (ref.kind) {
    case 'form':
    case 'markdown': {
      const template = getTemplateById(ref.id);
      return template?.title ?? null;
    }
    case 'builtin': {
      const template = getBuiltinTemplate(ref.id);
      return template?.title ?? null;
    }
    default:
      return null;
  }
}

export async function resolvePinnedTemplates(
  refs: PinnedTemplateRef[],
  sessionPassword?: string | null,
): Promise<PinnedTemplateDisplay[]> {
  const resolved: PinnedTemplateDisplay[] = [];

  for (const ref of refs) {
    const route = routeForPinnedRef(ref);
    if (!route) continue;

    let title = titleForPinnedRef(ref);
    if (ref.kind === 'custom' && sessionPassword) {
      const custom = await getCustomTemplate(sessionPassword, ref.id);
      title = custom?.title ?? title;
    }

    if (!title) continue;
    resolved.push({ ...ref, title, route });
  }

  return resolved;
}
