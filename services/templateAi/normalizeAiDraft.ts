import {
  createFieldId,
  createSectionId,
  createTemplateId,
  CustomFieldType,
  CustomTemplateDefinition,
} from '@/store/customTemplateSchema';

import { AiTemplateDraftJson } from './templateDraftSchema';

const VALID_TYPES: CustomFieldType[] = ['text', 'multiline', 'number', 'date', 'checkbox', 'select'];

function coerceFieldType(raw: string): CustomFieldType {
  if (VALID_TYPES.includes(raw as CustomFieldType)) {
    return raw as CustomFieldType;
  }
  return 'text';
}

export function extractJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  return text.slice(start, end + 1);
}

export function normalizeAiDraft(
  raw: AiTemplateDraftJson,
  options?: { sourcePaste?: string; category?: string; title?: string },
): CustomTemplateDefinition {
  const now = new Date().toISOString();
  return {
    id: createTemplateId(),
    title: options?.title?.trim() || raw.title?.trim() || 'Custom Template',
    description: raw.description?.trim() || 'Created with on-device Template AI',
    category: options?.category?.trim() || raw.category?.trim() || 'Other',
    sections: (raw.sections ?? []).map((section) => ({
      id: createSectionId(section.title || 'Section'),
      title: section.title?.trim() || 'Section',
      fields: (section.fields ?? []).map((field) => ({
        id: createFieldId(field.label || 'field'),
        label: field.label?.trim() || 'Field',
        type: coerceFieldType(field.type),
        placeholder: field.placeholder?.trim() || undefined,
      })),
    })),
    sourcePaste: options?.sourcePaste,
    createdAt: now,
    updatedAt: now,
  };
}

export function parseAiDraftFromText(
  text: string,
  options?: { sourcePaste?: string; category?: string; title?: string },
): CustomTemplateDefinition | null {
  const jsonStr = extractJsonObject(text);
  if (!jsonStr) return null;
  try {
    const parsed = JSON.parse(jsonStr) as AiTemplateDraftJson;
    if (!parsed.sections?.length) return null;
    return normalizeAiDraft(parsed, options);
  } catch {
    return null;
  }
}
