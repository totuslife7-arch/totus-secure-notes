import {
  createFieldId,
  createSectionId,
  createTemplateId,
  CustomFieldType,
  CustomTemplateDefinition,
  CustomTemplateField,
  CustomTemplateSection,
} from '@/store/customTemplateSchema';

const LABEL_LINE =
  /^(\*{1,2})?\s*([A-Za-z0-9][A-Za-z0-9\s\/\-().]{0,60}?)\s*(\*{1,2})?\s*[:\-–—]\s*(.*)$/;
const CHECKBOX_LINE = /^\s*[\[(][\sxX]?[\])]\s*(.+)$/;
const BULLET_LINE = /^\s*[-•*]\s+(.+)$/;

function detectFieldType(label: string, value: string): CustomFieldType {
  const combined = `${label} ${value}`.toLowerCase();
  if (CHECKBOX_LINE.test(value) || /^\s*[\[(][\sxX]?[\])]/.test(value)) {
    return 'checkbox';
  }
  if (/\bdob\b|date of birth|visit date|delivery date/.test(combined)) {
    return 'date';
  }
  if (/\bweight\b|\bbp\b|\btemp\b|\bhr\b|\bgrams\b|\bkg\b|\blbs\b/.test(combined)) {
    return 'number';
  }
  if (value.length > 80 || value.includes('\n')) {
    return 'multiline';
  }
  return 'text';
}

function parseLabelLine(line: string): { label: string; value: string } | null {
  const match = line.match(LABEL_LINE);
  if (!match) return null;
  return { label: match[2].trim(), value: (match[4] ?? '').trim() };
}

function sectionFromLines(title: string, lines: string[]): CustomTemplateSection {
  const fields: CustomTemplateField[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const labeled = parseLabelLine(line);
    if (labeled) {
      fields.push({
        id: createFieldId(labeled.label),
        label: labeled.label,
        type: detectFieldType(labeled.label, labeled.value),
        placeholder: labeled.value || undefined,
      });
      continue;
    }

    const checkbox = line.match(CHECKBOX_LINE);
    if (checkbox) {
      fields.push({
        id: createFieldId(checkbox[1]),
        label: checkbox[1].trim(),
        type: 'checkbox',
      });
      continue;
    }

    const bullet = line.match(BULLET_LINE);
    if (bullet) {
      fields.push({
        id: createFieldId(bullet[1]),
        label: bullet[1].trim(),
        type: 'text',
      });
    }
  }

  if (fields.length === 0 && lines.some((l) => l.trim())) {
    fields.push({
      id: createFieldId(title),
      label: 'Notes',
      type: 'multiline',
      placeholder: lines.join('\n').trim(),
    });
  }

  return {
    id: createSectionId(title),
    title,
    fields,
  };
}

export function parsePastedForm(
  paste: string,
  options?: { title?: string; category?: string },
): CustomTemplateDefinition {
  const trimmed = paste.trim();
  const blocks = trimmed.split(/\n\s*\n/);
  const now = new Date().toISOString();

  let title = options?.title?.trim() || 'Custom Template';
  const sections: CustomTemplateSection[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trimEnd());
    const nonEmpty = lines.filter((l) => l.trim());
    if (nonEmpty.length === 0) continue;

    const first = nonEmpty[0].trim();
    const isHeader =
      (first.startsWith('#') || first === first.toUpperCase()) &&
      first.length < 80 &&
      !parseLabelLine(first);

    if (isHeader) {
      const sectionTitle = first.replace(/^#+\s*/, '').trim();
      if (sections.length === 0 && !options?.title) {
        title = sectionTitle;
      }
      sections.push(sectionFromLines(sectionTitle, nonEmpty.slice(1)));
    } else {
      sections.push(sectionFromLines('Section', nonEmpty));
    }
  }

  if (sections.length === 0) {
    sections.push(sectionFromLines('Form', trimmed.split('\n')));
  }

  return {
    id: createTemplateId(),
    title,
    description: 'Created from pasted form',
    category: options?.category ?? 'Other',
    sections,
    sourcePaste: trimmed,
    createdAt: now,
    updatedAt: now,
  };
}
