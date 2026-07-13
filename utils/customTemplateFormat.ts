import {
  CustomTemplateDefinition,
  CustomTemplateField,
} from '@/store/customTemplateSchema';

export function formatCustomTemplateNote(
  template: CustomTemplateDefinition,
  formData: Record<string, string>,
): string {
  const lines: string[] = [template.title, ''];

  for (const section of template.sections) {
    lines.push(section.title);
    for (const field of section.fields) {
      lines.push(formatFieldLine(field, formData[field.id] ?? ''));
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

function formatFieldLine(field: CustomTemplateField, value: string): string {
  if (field.type === 'checkbox') {
    const checked = value === 'true' || value === 'yes' || value === '1';
    return `${checked ? '[x]' : '[ ]'} ${field.label}`;
  }
  if (field.type === 'multiline') {
    return `${field.label}:\n${value || '—'}`;
  }
  return `${field.label}: ${value || '—'}`;
}

export function emptyFormData(template: CustomTemplateDefinition): Record<string, string> {
  const data: Record<string, string> = {};
  for (const section of template.sections) {
    for (const field of section.fields) {
      data[field.id] = field.type === 'checkbox' ? 'false' : '';
    }
  }
  return data;
}
