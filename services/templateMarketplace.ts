import { CustomTemplateDefinition } from '@/store/customTemplateSchema';

/** Curated public templates — metadata only, no PHI. Hosted as static JSON. */
export const TEMPLATE_MARKETPLACE_CDN =
  'https://totus--notes.web.app/template-marketplace/manifest.json';

export type MarketplaceTemplateEntry = {
  id: string;
  title: string;
  category: string;
  description: string;
  version: string;
  definitionUrl: string;
};

export type MarketplaceManifest = {
  updatedAt: string;
  templates: MarketplaceTemplateEntry[];
};

/** Bundled fallback when offline */
export const BUNDLED_MARKETPLACE_TEMPLATES: MarketplaceTemplateEntry[] = [
  {
    id: 'prayer-log',
    title: 'Prayer / mindfulness log',
    category: 'Wellness',
    description: 'Daily prayer or reflection entries with optional reminder flags.',
    version: '1',
    definitionUrl: '',
  },
  {
    id: 'home-visit-intake',
    title: 'Home visit intake',
    category: 'Nursing',
    description: 'Basic home visit checklist and vitals placeholders.',
    version: '1',
    definitionUrl: '',
  },
];

const BUNDLED_DEFINITIONS: Record<string, CustomTemplateDefinition> = {
  'prayer-log': {
    id: 'mp_prayer_log',
    title: 'Prayer / mindfulness log',
    category: 'Wellness',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'sec_daily',
        title: 'Daily entry',
        fields: [
          { id: 'f_date', label: 'Date', type: 'date' },
          { id: 'f_intention', label: 'Intention or prayer', type: 'multiline' },
          { id: 'f_gratitude', label: 'Gratitude', type: 'multiline' },
          { id: 'f_followup', label: 'Follow-up needed', type: 'checkbox' },
        ],
      },
    ],
  },
  'home-visit-intake': {
    id: 'mp_home_visit',
    title: 'Home visit intake',
    category: 'Nursing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'sec_visit',
        title: 'Visit',
        fields: [
          { id: 'f_date', label: 'Visit date', type: 'date' },
          { id: 'f_address', label: 'Address (optional)', type: 'text' },
          { id: 'f_bp', label: 'Blood pressure', type: 'text' },
          { id: 'f_notes', label: 'Assessment notes', type: 'multiline' },
        ],
      },
    ],
  },
};

export async function fetchMarketplaceManifest(): Promise<MarketplaceManifest> {
  try {
    const response = await fetch(TEMPLATE_MARKETPLACE_CDN, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Manifest unavailable');
    }
    return (await response.json()) as MarketplaceManifest;
  } catch {
    return {
      updatedAt: new Date().toISOString(),
      templates: BUNDLED_MARKETPLACE_TEMPLATES,
    };
  }
}

export async function fetchMarketplaceDefinition(
  entry: MarketplaceTemplateEntry,
): Promise<CustomTemplateDefinition> {
  if (!entry.definitionUrl) {
    const bundled = BUNDLED_DEFINITIONS[entry.id];
    if (bundled) {
      return { ...bundled, id: `mp_${entry.id}_${Date.now()}` };
    }
    throw new Error('Template definition not available offline.');
  }

  const response = await fetch(entry.definitionUrl, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Could not download template.');
  }
  const def = (await response.json()) as CustomTemplateDefinition;
  return { ...def, id: `mp_${entry.id}_${Date.now()}` };
}
