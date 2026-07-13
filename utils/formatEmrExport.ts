import { CustomTemplateDefinition, CustomTemplateField } from '@/store/customTemplateSchema';

export interface EmrField {
  label: string;
  value: string;
  type?: CustomTemplateField['type'];
}

export interface EmrExportOptions {
  title?: string;
  sections?: { title: string; fields: EmrField[] }[];
  /** Plain multiline note text (e.g. postpartum formatted note). */
  plainText?: string;
  omitEmpty?: boolean;
}

function formatCheckbox(value: string): string {
  const checked = value === 'true' || value === 'yes' || value === '1';
  return checked ? 'Yes' : 'No';
}

function formatFieldLine(field: EmrField, omitEmpty: boolean): string | null {
  const label = field.label.trim();
  const raw = field.value?.trim() ?? '';

  if (field.type === 'checkbox') {
    return `${label}: ${formatCheckbox(raw)}`;
  }

  if (!raw && omitEmpty) {
    return null;
  }

  if (field.type === 'multiline' && raw.includes('\n')) {
    return `${label}:\n${raw || '—'}`;
  }

  return `${label}: ${raw || '—'}`;
}

/** Plain-text export safe for pasting into EMR systems (e.g. Plexia). No markdown. */
export function formatEmrExport(options: EmrExportOptions): string {
  if (options.plainText) {
    return options.plainText.trim();
  }

  const lines: string[] = [];
  const omitEmpty = options.omitEmpty !== false;

  if (options.title?.trim()) {
    lines.push(options.title.trim());
    lines.push('');
  }

  for (const section of options.sections ?? []) {
    if (section.title?.trim()) {
      lines.push(section.title.trim());
    }
    for (const field of section.fields) {
      const line = formatFieldLine(field, omitEmpty);
      if (line) lines.push(line);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function formatCustomTemplateForEmr(
  template: CustomTemplateDefinition,
  formData: Record<string, string>,
): string {
  return formatEmrExport({
    title: template.title,
    sections: template.sections.map((section) => ({
      title: section.title,
      fields: section.fields.map((field) => ({
        label: field.label,
        value: formData[field.id] ?? '',
        type: field.type,
      })),
    })),
  });
}
