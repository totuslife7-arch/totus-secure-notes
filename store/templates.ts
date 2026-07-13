import { BUILTIN_TEMPLATES } from '@/store/builtinTemplates';

export type TemplateType = 'markdown' | 'form' | 'builtin';

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  type: TemplateType;
  route?: string;
  content?: string;
  category?: string;
}

export const MARKDOWN_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'daily_journal',
    title: 'Daily Journal',
    description: 'Gratitude, reflection, and prayer requests',
    type: 'markdown',
    content: `# Daily Journal

## Gratitude
- 
- 
- 

## Reflection
- 
- 
- 

## Prayer Requests
- 
- 
- 
`,
  },
  {
    id: 'prayer_log',
    title: 'Prayer Log',
    description: 'Track praises, requests, and answers',
    type: 'markdown',
    content: `# Prayer Log

## Praises
- 
- 
- 

## Requests
- 
- 
- 

## Answers
- 
- 
- 
`,
  },
];

export const FORM_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'postpartum',
    title: 'Postpartum Nursing Note',
    description: 'Fill clinical fields and copy into work software',
    type: 'form',
    route: '/templates/postpartum',
  },
];

export const BUILTIN_TEMPLATE_DEFINITIONS: TemplateDefinition[] = BUILTIN_TEMPLATES.map((t) => ({
  id: t.id,
  title: t.title,
  description: t.description ?? '',
  type: 'builtin' as const,
  route: `/templates/builtin/${t.id}`,
  category: t.category,
}));

export const BUILTIN_CATEGORIES = ['Nursing', 'Social Work', 'Other'] as const;

export const ALL_TEMPLATES: TemplateDefinition[] = [
  ...FORM_TEMPLATES,
  ...BUILTIN_TEMPLATE_DEFINITIONS,
  ...MARKDOWN_TEMPLATES,
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return ALL_TEMPLATES.find((template) => template.id === id);
}

export function getBuiltinTemplatesForGallery(): TemplateDefinition[] {
  return BUILTIN_TEMPLATE_DEFINITIONS;
}
