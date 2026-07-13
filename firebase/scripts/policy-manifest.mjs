/** Shared policy manifest for HTML build and Firestore seed. */
export const POLICY_MANIFEST = [
  { id: 'privacy', title: 'Privacy Policy — Totus Secure Notes', file: 'PRIVACY_POLICY.md', path: 'privacy' },
  { id: 'terms', title: 'Terms and Conditions — Totus Secure Notes', file: 'TERMS_AND_CONDITIONS.md', path: 'terms' },
  { id: 'support', title: 'Support — Totus Secure Notes', file: 'SUPPORT.md', path: 'support' },
  { id: 'data-deletion', title: 'Data Deletion — Totus Secure Notes', file: 'DATA_DELETION.md', path: 'data-deletion' },
  { id: 'permissions', title: 'Permissions — Totus Secure Notes', file: 'PERMISSIONS.md', path: 'permissions' },
  { id: 'data-safety', title: 'Data Safety Summary — Totus Secure Notes', file: 'DATA_SAFETY_SUMMARY.md', path: 'data-safety' },
  { id: 'ads-monetization', title: 'Ads & Monetization — Totus Secure Notes', file: 'ADS_AND_MONETIZATION.md', path: 'ads-monetization' },
  { id: 'security', title: 'Security — Totus Secure Notes', file: 'SECURITY.md', path: 'security' },
  { id: 'children', title: 'Children & Target Audience — Totus Secure Notes', file: 'CHILDREN_AND_TARGET_AUDIENCE.md', path: 'children' },
  { id: 'legal-disclaimer', title: 'Legal & Medical Disclaimer — Totus Secure Notes', file: 'LEGAL_DISCLAIMER.md', path: 'legal-disclaimer' },
];

export const HOSTING_BASE = 'https://totus--notes.web.app';

export function publicUrlForPolicy(path) {
  return `${HOSTING_BASE}/${path}`;
}
