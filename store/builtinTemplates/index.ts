import { CustomTemplateDefinition } from '@/store/customTemplateSchema';

function field(
  label: string,
  type: CustomTemplateDefinition['sections'][0]['fields'][0]['type'] = 'text',
  placeholder?: string,
) {
  return { label, type, placeholder };
}

function tpl(
  id: string,
  title: string,
  category: string,
  description: string,
  sections: { title: string; fields: ReturnType<typeof field>[] }[],
): CustomTemplateDefinition {
  const now = new Date().toISOString();
  return {
    id,
    title,
    description,
    category,
    sections: sections.map((s, si) => ({
      id: `builtin_sec_${id}_${si}`,
      title: s.title,
      fields: s.fields.map((f, fi) => ({
        id: `builtin_${id}_${si}_${fi}`,
        label: f.label,
        type: f.type,
        placeholder: f.placeholder,
      })),
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export const BUILTIN_TEMPLATES: CustomTemplateDefinition[] = [
  tpl('home_visit_nursing', 'Home Visit Nursing', 'Nursing', 'Community nursing home visit documentation', [
    {
      title: 'Vitals',
      fields: [
        field('Blood pressure', 'text', 'e.g. 120/80'),
        field('Heart rate', 'number'),
        field('Temperature', 'number'),
        field('Respiratory rate', 'number'),
        field('O2 saturation', 'number'),
      ],
    },
    {
      title: 'Assessment',
      fields: [
        field('Chief concern', 'multiline'),
        field('Physical assessment', 'multiline'),
        field('Pain level', 'number'),
        field('Mobility', 'text'),
      ],
    },
    {
      title: 'Interventions & Plan',
      fields: [
        field('Interventions provided', 'multiline'),
        field('Patient education', 'multiline'),
        field('Follow-up plan', 'multiline'),
        field('Next visit', 'date'),
      ],
    },
  ]),
  tpl('wound_care', 'Wound Care', 'Nursing', 'Wound assessment and dressing documentation', [
    {
      title: 'Wound Site',
      fields: [
        field('Location', 'text'),
        field('Wound type', 'text'),
        field('Length (cm)', 'number'),
        field('Width (cm)', 'number'),
        field('Depth (cm)', 'number'),
      ],
    },
    {
      title: 'Appearance',
      fields: [
        field('Drainage', 'text'),
        field('Odor present', 'checkbox'),
        field('Periwound skin', 'multiline'),
        field('Pain at site', 'text'),
      ],
    },
    {
      title: 'Treatment',
      fields: [
        field('Cleansing', 'text'),
        field('Dressing applied', 'text'),
        field('Patient education', 'multiline'),
        field('Reassessment date', 'date'),
      ],
    },
  ]),
  tpl('psychosocial_assessment', 'Psychosocial Assessment', 'Social Work', 'Psychosocial intake and risk screening', [
    {
      title: 'Living Situation',
      fields: [
        field('Housing stability', 'text'),
        field('Household members', 'multiline'),
        field('Financial stressors', 'multiline'),
      ],
    },
    {
      title: 'Supports & Risks',
      fields: [
        field('Support network', 'multiline'),
        field('Safety concerns', 'multiline'),
        field('Substance use', 'text'),
        field('Mental health history', 'multiline'),
      ],
    },
    {
      title: 'Goals',
      fields: [
        field('Client-stated goals', 'multiline'),
        field('Barriers', 'multiline'),
        field('Recommended referrals', 'multiline'),
      ],
    },
  ]),
  tpl('discharge_planning', 'Discharge Planning', 'Social Work', 'Hospital or program discharge coordination', [
    {
      title: 'Discharge Needs',
      fields: [
        field('Primary diagnosis context', 'text'),
        field('Functional status', 'multiline'),
        field('Equipment needs', 'multiline'),
        field('Home care needs', 'multiline'),
      ],
    },
    {
      title: 'Barriers & Referrals',
      fields: [
        field('Barriers to discharge', 'multiline'),
        field('Referrals made', 'multiline'),
        field('Follow-up appointments', 'multiline'),
      ],
    },
    {
      title: 'Follow-up',
      fields: [
        field('Responsible party notified', 'checkbox'),
        field('Patient education provided', 'checkbox'),
        field('Follow-up contact date', 'date'),
      ],
    },
  ]),
  tpl('general_intake', 'General Intake', 'Other', 'General client intake form', [
    {
      title: 'Visit',
      fields: [
        field('Reason for visit', 'multiline'),
        field('Visit date', 'date'),
        field('Location', 'text'),
      ],
    },
    {
      title: 'History',
      fields: [
        field('Relevant history', 'multiline'),
        field('Medications', 'multiline'),
        field('Allergies', 'multiline'),
      ],
    },
    {
      title: 'Notes',
      fields: [
        field('Assessment notes', 'multiline'),
        field('Plan', 'multiline'),
      ],
    },
  ]),
];

export const BUILTIN_CATEGORIES = ['Nursing', 'Social Work', 'Other'] as const;

export function getBuiltinTemplate(id: string): CustomTemplateDefinition | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}

export function getBuiltinTemplatesByCategory(category: string): CustomTemplateDefinition[] {
  return BUILTIN_TEMPLATES.filter((t) => t.category === category);
}

export function cloneBuiltinForBriefcase(
  builtin: CustomTemplateDefinition,
): CustomTemplateDefinition {
  const now = new Date().toISOString();
  return {
    ...builtin,
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    description: `${builtin.description ?? ''} (saved from built-in)`.trim(),
    createdAt: now,
    updatedAt: now,
  };
}
