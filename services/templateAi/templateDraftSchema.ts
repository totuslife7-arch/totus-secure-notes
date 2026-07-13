/** JSON schema passed to llama.rn response_format for structured template drafts. */
export const TEMPLATE_DRAFT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    category: { type: 'string' },
    description: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          fields: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                type: {
                  type: 'string',
                  enum: ['text', 'multiline', 'number', 'date', 'checkbox', 'select'],
                },
                placeholder: { type: 'string' },
              },
              required: ['label', 'type'],
            },
          },
        },
        required: ['title', 'fields'],
      },
    },
  },
  required: ['title', 'sections'],
} as const;

export interface AiTemplateDraftJson {
  title: string;
  category?: string;
  description?: string;
  sections: {
    title: string;
    fields: {
      label: string;
      type: 'text' | 'multiline' | 'number' | 'date' | 'checkbox' | 'select';
      placeholder?: string;
    }[];
  }[];
}
