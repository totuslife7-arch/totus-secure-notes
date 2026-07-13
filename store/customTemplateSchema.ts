export type CustomFieldType =
  | 'text'
  | 'multiline'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox';

export interface CustomTemplateField {
  id: string;
  label: string;
  type: CustomFieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface CustomTemplateSection {
  id: string;
  title: string;
  fields: CustomTemplateField[];
}

export interface CustomTemplateDefinition {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  sections: CustomTemplateSection[];
  sourcePaste?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomTemplatesVault {
  v: 1;
  templates: CustomTemplateDefinition[];
  categories: string[];
}

export function createTemplateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createFieldId(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
  return slug ? `${slug}_${Math.random().toString(36).slice(2, 6)}` : `field_${Date.now()}`;
}

export function createSectionId(title: string): string {
  return createFieldId(title || 'section');
}

export const DEFAULT_CATEGORIES = ['Intake', 'Social Work', 'Nursing', 'Other'];
