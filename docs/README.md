# Totus Secure Notes — Documentation



## Store & legal (required for Google Play & App Store)



| Document | Purpose |

|----------|---------|

| [USER_GUIDE.md](./USER_GUIDE.md) | **End-user guide** — vault, templates, AI, web viewer, Pro tiers |

| [POLICY_INDEX.md](./POLICY_INDEX.md) | **All hosted policy URLs for Play Store** |

| [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) | Privacy policy (source → Firebase Hosting) |

| [TERMS_AND_CONDITIONS.md](./TERMS_AND_CONDITIONS.md) | Terms of use / EULA |

| [DATA_DELETION.md](./DATA_DELETION.md) | Data deletion (Play Console URL) |

| [PERMISSIONS.md](./PERMISSIONS.md) | Runtime permissions disclosure |

| [DATA_SAFETY_SUMMARY.md](./DATA_SAFETY_SUMMARY.md) | Public data safety summary |

| [LOCATION_AND_ADDRESS_SECURITY.md](./LOCATION_AND_ADDRESS_SECURITY.md) | Patient addresses & GPS handling |

| [ADS_AND_MONETIZATION.md](./ADS_AND_MONETIZATION.md) | Ads + IAP disclosure |

| [SECURITY.md](./SECURITY.md) | Encryption & app integrity |

| [ON_DEVICE_AI.md](./ON_DEVICE_AI.md) | Template AI architecture & compliance |

| [CHILDREN_AND_TARGET_AUDIENCE.md](./CHILDREN_AND_TARGET_AUDIENCE.md) | Target audience / IARC |

| [LEGAL_DISCLAIMER.md](./LEGAL_DISCLAIMER.md) | Medical & compliance disclaimer |

| [SUPPORT.md](./SUPPORT.md) | Support contact for store listings |

| [DATA_SAFETY_GOOGLE_PLAY.md](./DATA_SAFETY_GOOGLE_PLAY.md) | Google Play Data safety form answers |

| [GOOGLE_PLAY_POLICY_COMPLIANCE.md](./GOOGLE_PLAY_POLICY_COMPLIANCE.md) | Policy checkbox & advance notice guidance |

| [GOOGLE_PLAY_PRODUCTION_CHECKLIST_2026.md](./GOOGLE_PLAY_PRODUCTION_CHECKLIST_2026.md) | **July 2026** — IAP, AdMob, Data safety, Play publish sequence |

| [ANDROID_17_PLAY_READINESS.md](./ANDROID_17_PLAY_READINESS.md) | Android 16/17 & Play target SDK checklist (2025–2026) |

| [PLAY_PHOTO_PERMISSIONS_DECLARATION.md](./PLAY_PHOTO_PERMISSIONS_DECLARATION.md) | Play Console photo/video permissions form |

| [APP_STORE_REQUIREMENTS.md](./APP_STORE_REQUIREMENTS.md) | Apple App Store Connect checklist |

| [STORE_LISTING_CHECKLIST.md](./STORE_LISTING_CHECKLIST.md) | Screenshots, descriptions, pre-launch |

| [../store/GOOGLE_PLAY_LISTING.md](../store/GOOGLE_PLAY_LISTING.md) | Google Play short + full description |

| [../store/APP_STORE_LISTING.md](../store/APP_STORE_LISTING.md) | Apple App Store listing copy |

| [../store/RELEASE_NOTES.md](../store/RELEASE_NOTES.md) | Release notes / What's New (v1.2.17) |



## Development & product



| Document | Purpose |

|----------|---------|

| [AGENT_MEMORY.md](./AGENT_MEMORY.md) | Session/release history for agents and maintainers |

| [MASTER_GUI_ARCHITECT_PROMPT.md](./MASTER_GUI_ARCHITECT_PROMPT.md) | **Copy-paste prompt** — full-app GUI/UX redesign (Home tab, design system, IA) |

| [GUI_PRODUCTION_AUDIT_2026-07.md](./GUI_PRODUCTION_AUDIT_2026-07.md) | **July 2026 GUI audit** — clutter, IA, permanent-template UX gaps, P0 screens |

| [MASTER_DEVELOPMENT_AUDIT_PROMPT.md](./MASTER_DEVELOPMENT_AUDIT_PROMPT.md) | **Copy-paste prompt** — full audit: Template AI, IAP, GUI Phase 0, builds |
| [MASTER_SOFO_PRODUCTION_RESCUE_PROMPT.md](./MASTER_SOFO_PRODUCTION_RESCUE_PROMPT.md) | **Copy-paste prompt** — P0 rescue: SoFo Postpartum HV, About, saves, AI unlock, voice, ship tomorrow |
| [MASTER_PRODUCTION_ENGINE_PROMPT.md](./MASTER_PRODUCTION_ENGINE_PROMPT.md) | **Copy-paste prompt** — 4-agent production engine: navigation map, saves, AI readiness, voice memos |
| [UI_NAVIGATION_TREE.md](./UI_NAVIGATION_TREE.md) | Full app navigation map (tabs, settings, About, deep links) |
| [PRODUCTION_ENGINE_DELIVERABLES.md](./PRODUCTION_ENGINE_DELIVERABLES.md) | Production engine run — files changed and verification checklist |
| [AUDIT_REPORT.md](./AUDIT_REPORT.md) | **v1.2.11 audit** — feature matrix (Works/Gated/Broken), root causes, fixes |

| [PRODUCTION_READINESS_AUDIT_2026-07.md](./PRODUCTION_READINESS_AUDIT_2026-07.md) | **July 2026** — P0/P1/P2 blockers, AI/IAP/Play, device test script |
| [FOUNDER_FOLLOWUP.md](./FOUNDER_FOLLOWUP.md) | **Founder handoff** — device test, Play Console, build artifact table |

| [MEMORY.md](./MEMORY.md) | Architecture, vault schema, security |

| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Firebase Hosting, Firestore policies, deploy commands |

| [ANDROID_SIGNING_SETUP.md](./ANDROID_SIGNING_SETUP.md) | EAS keystore + Play upload key reset |

| [PLAY_FIRST_UPLOAD_CHECKLIST.md](./PLAY_FIRST_UPLOAD_CHECKLIST.md) | Signing → upload → IAP → AdMob order |

| [TRIP_MAPS.md](./TRIP_MAPS.md) | Trip Planner maps — external apps, in-app OSM preview, OSRM routing (no API keys) |
| [GOOGLE_MAPS_API_SETUP.md](./GOOGLE_MAPS_API_SETUP.md) | Optional Google Geocoding/Directions for advanced routing |

| [ADMOB_SETUP.md](./ADMOB_SETUP.md) | AdMob app + ad unit IDs |

| [DEVELOPMENT_AND_BUILDS.md](./DEVELOPMENT_AND_BUILDS.md) | SDK, dev client, **iOS + Android parallel builds**, web export |

| [MONETIZATION_AND_INTEGRATIONS.md](./MONETIZATION_AND_INTEGRATIONS.md) | Ads, Pro, IAP, Play Games roadmap |



**Current version:** 1.2.17 · Android versionCode 63 · `com.totuslife.TotusSecureNotes`  

**Web vault viewer:** https://totus--notes.web.app/vault  

**Privacy policy URL:** https://totus--notes.web.app/privacy  

**Data deletion URL:** https://totus--notes.web.app/data-deletion  

**Policy index:** https://totus--notes.web.app/



## Before store submission



1. Privacy Policy live at https://totus--notes.web.app/privacy (Firebase Hosting)  

2. Create IAP products (`../store/products.json`) in both consoles  

3. Run `npm run build:all:preview` and test on real devices  

4. Complete Data safety + App Privacy questionnaires  

5. Test Template AI on EAS build (not Expo Go)  

6. Test Settings → **Sync to desktop** → export `.totus` → https://totus--notes.web.app/vault



**Contact:** totuslife7@gmail.com

