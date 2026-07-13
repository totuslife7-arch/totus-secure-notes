# Agent Memory — Totus Secure Notes

Session and release history for AI agents and maintainers. For architecture and data flow, see [MEMORY.md](./MEMORY.md).

## Project identity

| Field | Value |
|-------|--------|
| **Display name** | Totus Secure Notes |
| **Expo slug** | `totus-secure-notes` |
| **npm package** | `totus-secure-notes` |
| **Android package / iOS bundle** | `com.totuslife.TotusSecureNotes` |
| **EAS owner** | `totuslife` |
| **GitHub** | https://github.com/totuslife7-arch/totus-secure-notes |
| **Expo project** | https://expo.dev/accounts/totuslife/projects/totus-secure-notes |

## Current focus

- **v1.2.8 release** — store review mode, dev unlock, iOS multi-stop Google Maps, keyboard/paywall fixes, no-API-key maps
- **Postpartum template** — featured at top of Templates gallery; manual weight fields
- **Monetization** — Free + Pro Monthly (no ads) + Pro Lifetime (full premium) + AdMob
- **Store** — EAS store-review builds (AAB + APK), policy deploy, Play internal testing

## Chronological log

### MVP → v1.0.0

- Encrypted local vault (AES-256-GCM), notes, postpartum form, biometrics, export/import
- EAS Android builds established

### v1.1.0 — UX and security foundations

- Light/dark/system theme; note flags, reminders, attachments
- Session crypto cache (no PBKDF2 on every keystroke)
- Autosave, dark-mode text, Android safe-area fixes
- Local audit log, auto-lock, clipboard timeout

### v1.2.0 — Postpartum, trips, package rename (2026-06-18)

- Postpartum template restructure; newborn WL%, total lost, WG with 15s debounce
- **Trips** tab: GPS mileage, up to 50 stops, Open in Maps; Trip Planner Pro (BYO API key)
- Android package renamed to `com.totuslife.TotusSecureNotes` (Play Console requirement)
- App branding: **Totus Secure Notes**; icons from `TLS.png` via `scripts/generate_app_icons.py`
- Strong master password policy, biometrics on setup, show/hide password

### v1.2.0+ — Monetization and Template Studio (same release train)

- **expo-iap** + **react-native-google-mobile-ads** integrated
- Layered paywalls: Pro (trip planner), Template Studio, Template AI
- Template Studio Phase A: custom template schema, studio routes, `GenericCustomForm` (heuristic paste parser only — no on-device LLM)
- Dev override: `EXPO_PUBLIC_TRIP_PLANNER_PRO=true` unlocks all tiers locally
- IAP SKUs documented in `store/products.json`; Play/App Store setup is manual

### v1.2.1 — WG fix (2026-06-18)

- **Weight gain (WG)** now uses **last visit weight vs today's weight only** — never birth weight (`bw`)
- WL% and total weight lost still use birth weight vs today
- Added inter-visit **gain since last visit (g)**; form hints clarify required fields
- Tests: `utils/newbornWeightCalc.test.ts` (run with `npx tsx`)

### v1.2.2 — Postpartum simplify, Pro tier restructure (2026-07-01)

- Removed automatic newborn weight calculations from postpartum form and copy output
- IAP reduced to **pro_monthly** (no ads) and **pro_lifetime** (all premium entitlements)
- Added [LOCATION_AND_ADDRESS_SECURITY.md](./LOCATION_AND_ADDRESS_SECURITY.md)
- GPS buffer discarded on vault lock (`discardGpsBuffer`)

### v1.2.8 — Store review, maps, stability (2026-07-11)

- Store review mode (`EXPO_PUBLIC_STORE_REVIEW_MODE`) and dev unlock (`TOTUS-DEV-2026`, 7 taps on version)
- iOS Google Maps multi-destination native URLs; `hasTripPlannerPro` honors dev unlock
- Paywall blank screen fix, keyboard resize, Template AI clearer errors
- Version **1.2.8**, Android versionCode **34**

### v1.2.3 — Template AI, built-in templates, web vault (2026-07-11)

- **Built-in templates:** home visit, wound care, psychosocial, discharge, intake (`store/builtinTemplates/`)
- **Template AI (Pro Lifetime):** SmolLM2-360M via `llama.rn`; Studio paste → AI assist → review → save
- **Plexia / EMR copy:** `utils/formatEmrExport.ts` — plain Label: value from forms
- **Web vault viewer:** `.totus` export from Settings; read-only `/vault` routes on web
- [USER_GUIDE.md](./USER_GUIDE.md) — comprehensive end-user documentation
- Version **1.2.3**, Android versionCode **19**

### v1.2.1+ — Firebase, signing, Play setup (2026-06-20)

- Firebase project **`totus--notes`**: Hosting live at https://totus--notes.web.app (privacy, terms, support)
- Firestore `policies/*` read-only CMS; Android/iOS apps registered in Firebase
- `@react-native-firebase` Analytics + Crashlytics; policy links in Settings
- Play upload key mismatch documented — reset via EAS `.pem` per [ANDROID_SIGNING_SETUP.md](./ANDROID_SIGNING_SETUP.md)
- AdMob/IAP remain manual: [ADMOB_SETUP.md](./ADMOB_SETUP.md), [PLAY_FIRST_UPLOAD_CHECKLIST.md](./PLAY_FIRST_UPLOAD_CHECKLIST.md)

## Store and build status

| Item | Status |
|------|--------|
| Google Play internal testing | Blocked on upload key reset; then AAB upload |
| Firebase Hosting | Live — use privacy URL in Play listing |
| Firestore policies | Seed via `npm run policies:seed` + service account |
| IAP products | User creates in Play Console per IAP_SETUP.md |
| AdMob | Test IDs in products.json; production per ADMOB_SETUP.md |
| iOS | Builds possible; primary focus Android first |

## How to update this file

When shipping a feature or release:

1. Append a dated subsection under **Chronological log**
2. Update **Current focus** if priorities shift
3. Bump version references in AGENTS.md, CHANGELOG.md, and store docs (see release checklist in plan or DEVELOPMENT_AND_BUILDS.md)

## Related docs

- [MEMORY.md](./MEMORY.md) — architecture, vault schema, security
- [AGENTS.md](../AGENTS.md) — agent quick reference
- [CHANGELOG.md](../CHANGELOG.md) — user-facing change log
- [store/IAP_SETUP.md](../store/IAP_SETUP.md) — IAP product creation
