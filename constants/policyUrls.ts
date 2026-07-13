/** Public HTTPS policy pages (Firebase Hosting). */
export const FIREBASE_PROJECT_ID = 'totus--notes';

export const POLICY_HOSTING_BASE = `https://${FIREBASE_PROJECT_ID}.web.app`;

export const POLICY_URLS = {
  home: POLICY_HOSTING_BASE,
  privacy: `${POLICY_HOSTING_BASE}/privacy`,
  terms: `${POLICY_HOSTING_BASE}/terms`,
  support: `${POLICY_HOSTING_BASE}/support`,
  dataDeletion: `${POLICY_HOSTING_BASE}/data-deletion`,
  permissions: `${POLICY_HOSTING_BASE}/permissions`,
  dataSafety: `${POLICY_HOSTING_BASE}/data-safety`,
  adsMonetization: `${POLICY_HOSTING_BASE}/ads-monetization`,
  security: `${POLICY_HOSTING_BASE}/security`,
  children: `${POLICY_HOSTING_BASE}/children`,
  legalDisclaimer: `${POLICY_HOSTING_BASE}/legal-disclaimer`,
} as const;

export type PolicyDocId =
  | 'privacy'
  | 'terms'
  | 'support'
  | 'data-deletion'
  | 'permissions'
  | 'data-safety'
  | 'ads-monetization'
  | 'security'
  | 'children'
  | 'legal-disclaimer';

export const POLICY_LINKS: { id: PolicyDocId; label: string; url: string }[] = [
  { id: 'privacy', label: 'Privacy Policy', url: POLICY_URLS.privacy },
  { id: 'terms', label: 'Terms & Conditions', url: POLICY_URLS.terms },
  { id: 'data-deletion', label: 'Data Deletion', url: POLICY_URLS.dataDeletion },
  { id: 'permissions', label: 'Permissions', url: POLICY_URLS.permissions },
  { id: 'data-safety', label: 'Data Safety Summary', url: POLICY_URLS.dataSafety },
  { id: 'ads-monetization', label: 'Ads & Monetization', url: POLICY_URLS.adsMonetization },
  { id: 'security', label: 'Security', url: POLICY_URLS.security },
  { id: 'children', label: 'Children & Audience', url: POLICY_URLS.children },
  { id: 'legal-disclaimer', label: 'Legal Disclaimer', url: POLICY_URLS.legalDisclaimer },
  { id: 'support', label: 'Support', url: POLICY_URLS.support },
];
