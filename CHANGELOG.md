# Changelog — Totus Secure Notes



All notable changes to Totus Secure Notes.



## [1.2.11] — 2026-07-12

### Added

- **Home tab** — Dashboard with vault status, task digest, quick actions, Totus Assist chip, and recent notes
- **Pro upgrade banner** — Dismissible Upgrade CTA on Home, Notes, Templates, and Trips (not only Settings)
- **Totus Assist diagnostics** — Entitlement, model bytes, llama error, canRun, and last inference in Settings → Totus Assist
- **AI capability manifest** — Free vs Pro columns with tap-to-navigate (or paywall) in Totus Assist hub
- **Template Studio entitlement UX** — Prominent "Upgrade to Pro Lifetime" card when AI is locked (replaces misleading model-only messaging)

### Changed

- Notes moved to dedicated **Notes** tab; default landing is **Home**
- Tab bar tint aligned with `theme.primary` (deprecates legacy `Colors.ts` drift)
- Template AI inference logs duration + output preview in dev builds; no silent rules fallback unless user taps Quick parse
- Version **1.2.11** (Android versionCode **40**)

## [1.2.10] — 2026-07-12

### Fixed

- **Notes save race** — Serialized save queue in `VaultContext` (`persistChainRef`) prevents concurrent vault writes from dropping edits; note editor flushes draft snapshot on blur via `useFocusEffect` and on app background
- **Note Assist UI** — Restored missing **Expand** action chip alongside bulletize, shorten, and summarize

### Changed

- Empty states on Notes and Template Studio link to **Settings → Totus Assist**
- Version **1.2.10** (Android versionCode **39**)

## [1.2.9] — 2026-07-11

### Added

- **Totus AI hub** — Settings → Totus Assist with model status, capability cards, troubleshooting, and first-run onboarding sheet
- **Contextual Assist chips** — Notes, Templates, Trips entry points linking to on-device AI and rules fallbacks
- **Note Assist** — Bulletize, shorten, expand, and summarize in the note editor (Pro Lifetime / dev unlock; on-device SmolLM2)
- **Enhanced task digest** — Optional on-device AI summary atop the notes list task banner
- **Secure attachment lifecycle** — Gallery scrub after encrypt, in-app `AttachmentViewer` with screenshot block, multi-pass secure delete with audit log
- **Template marketplace** — Curated public template library (metadata only) with offline bundled fallbacks; import → Studio review
- **Local note reminders** — `reminderAt` field, in-context notification permission, re-sync on vault unlock via `reminderSync`

### Fixed

- **Template AI readiness** — Unified `getTemplateAiReadiness()` gate with `useFocusEffect` refresh on Studio paste and Settings; surfaces llama init errors with actionable recovery
- **Attachment typing** — Library videos no longer mislabeled as audio
- **Audit log** — Attachment events use correct detail string format

### Changed

- Settings **Template AI** card expanded into **Totus Assist** sub-page
- Version **1.2.9** (Android versionCode **38**)

## [1.2.8] — 2026-07-11

### Added

- **Store review mode** — EAS `store-review` builds unlock Pro for app reviewers (`EXPO_PUBLIC_STORE_REVIEW_MODE`)
- **Developer unlock** — Settings → About → tap version **7 times**, enter `TOTUS-DEV-2026` to unlock Pro Lifetime for local testing (includes Trip Planner Pro multi-destination)
- **iOS Google Maps multi-stop routes** — native `comgooglemaps://` URL scheme with `+to:` waypoint chaining; `LSApplicationQueriesSchemes` for iOS

### Fixed

- **Trip Planner maps (iOS + Android):** Multi-stop Google Maps deep links on iPhone via `comgooglemaps://` with https fallback
- **Dev unlock (`TOTUS-DEV-2026`):** `hasTripPlannerPro()` honors developer unlock and store-review mode; multi-stop external maps and Pro route planning unlock correctly
- **Paywall blank screen** — error boundary and safe rendering in `PaywallSheet`
- **Keyboard overlap** — app-wide `softwareKeyboardLayoutMode: resize` (Android) and `KeyboardAwareScrollView` on form screens
- **Template AI** — clearer on-device model download and inference error messages

### Changed

- **Postpartum clinical form** pinned at top of Templates gallery under **Clinical forms**
- Default external maps preference is **Google Maps (app)** on both platforms; Apple Maps remains optional on iOS
- Docs and store listings synced for v1.2.8; policies rebuilt and redeployed
- Version **1.2.8** (Android versionCode **36** AAB / **37** APK sideload)

## [1.2.7] — 2026-07-11

### Changed

- **Trip Planner maps redesign:** Google Maps and in-app map work without user API keys
  - **Google Maps (app)** / **Apple Maps** — external turn-by-turn via installed maps apps
  - **In-app map preview** — OpenStreetMap tiles in react-native-maps (replaces Mapbox BYO)
  - **Driving distance (Pro)** — Nominatim geocoding + OSRM routing by default; optional Google/Mapbox keys under Advanced
- Settings → Trip Planner Pro UX rewritten; BYO key fields moved to collapsed Advanced section
- Docs: new [docs/TRIP_MAPS.md](docs/TRIP_MAPS.md); [docs/GOOGLE_MAPS_API_SETUP.md](docs/GOOGLE_MAPS_API_SETUP.md) simplified for advanced-only use
- Store listings updated — no BYO API key requirement
- Version **1.2.7** (Android versionCode **32**)

## [1.2.6] — 2026-07-11

### Added

- **Web vault security hardening:** in-memory-only session (no localStorage/sessionStorage/IndexedDB); scrub on lock, idle timeout, tab hide, and page unload; prominent private-browsing guidance and **Lock now** on vault pages
- **Web vault clipboard warnings** with auto-clear timeout (60s default on web)
- Settings → **Sync to desktop:** DuckDuck Go open option on Android (intent with default-browser fallback); honest browser-limitation notes
- Firebase Hosting security headers for `/vault/**` (no-store cache, CSP baseline, nosniff, no-referrer)

### Changed

- Updated [docs/SECURITY.md](docs/SECURITY.md) and [docs/USER_GUIDE.md](docs/USER_GUIDE.md) with web vault limitations and safe-browser guidance
- Version **1.2.6** (Android versionCode **30**)

## [1.2.5] — 2026-07-11

### Added

- **Settings → Sync to desktop:** step-by-step instructions, export `.totus` button, and **Open web vault** link (`https://totus--notes.web.app/vault`)
- `constants/vaultWebUrl.ts` — hosted web vault URL constant
- `scripts/copy-vault-to-firebase.mjs` + `npm run vault:prepare` — copy Expo web export to Firebase Hosting at `/vault`

### Changed

- Clarified desktop workflow in docs: manual encrypted export, not live cloud sync; read-only web viewer
- Version **1.2.5** (Android versionCode **27**)

## [1.2.4] — 2026-07-11

### Added

- **Three-layer encryption:** Argon2id KDF (Layer 1), hardware-backed session DEK via SecureStore (Layer 2), envelope encryption + HMAC on `.totus` exports (Layer 3)
- Extended local audit log: failed unlock, clipboard copy, template save, biometric events, policy views, web bundle export; export/clear/retention in Settings
- [docs/HEALTH_APP_REVIEW.md](docs/HEALTH_APP_REVIEW.md) — Google Play / Apple health app and Data safety declaration guide
- Updated [docs/SECURITY.md](docs/SECURITY.md) and [docs/COMPLIANCE_ROADMAP.md](docs/COMPLIANCE_ROADMAP.md) — PIPEDA, FOIPPA (BC), HIPAA technical safeguard mapping

### Changed

- Legacy PBKDF2 vaults (v1) still decrypt; auto-upgrade to Argon2id envelope (v2) on next save
- Session keys zeroized on vault lock
- Version **1.2.4** (Android versionCode **26**)

### Added (store review)

- **Store review mode:** EAS `store-review` profile sets `EXPO_PUBLIC_STORE_REVIEW_MODE=true` — unlocks Pro Lifetime for Google Play and App Store reviewers without purchase
- Settings indicator when store review mode is active
- [docs/STORE_REVIEW_ACCESS.md](docs/STORE_REVIEW_ACCESS.md) — copy-paste sign-in instructions and submission checklists

## [1.2.3] — 2026-07-11



### Added

- **Built-in clinical briefcase templates:** Home Visit Nursing, Wound Care, Psychosocial Assessment, Discharge Planning, General Intake

- **Template AI (Pro Lifetime):** on-device SmolLM2-360M suggests fields from pasted forms; user reviews before save; rules fallback when model unavailable

- **Copy for Plexia / EMR:** plain `Label: value` export from custom and built-in template forms

- **Web vault viewer:** export `.totus` bundle from Settings; read-only unlock at `/vault` on web (browser-only decryption)

- [docs/USER_GUIDE.md](docs/USER_GUIDE.md) — comprehensive user guide

- [docs/ON_DEVICE_AI.md](docs/ON_DEVICE_AI.md) — Template AI architecture and compliance notes



### Changed

- Version **1.2.3** (Play AAB versionCode **24**, sideload APK **25**)

- EAS build fix: removed invalid SDK 56 `app.json` fields; pinned AdMob SDK for Kotlin 2.1 compatibility (`plugins/withPlayServicesAdsPin.js`)

- Updated privacy policy, store listings, and policy HTML for Template AI, web vault, and built-in templates

- `MEMORY.md` documents Template Studio, built-in templates, and web vault paths



## [1.2.2] — 2026-07-01



### Changed

- **Postpartum template:** removed automatic weight calculations (WL%, WG, gain); nurses enter raw weights and dates only

- **IAP simplified:** two paid products — `pro_monthly` (no ads) and `pro_lifetime` (all premium features)

- Pro Monthly removes banner ads only; Trip Planner Pro and Template Studio require Pro Lifetime

- GPS trip start/stop flow now guards against double-stop, tab switching, interrupted sessions, and save failures

- Google Maps route planning now reports clearer API key, billing, quota, and API enablement errors

- Version **1.2.2** (Android versionCode **17**)



### Added

- [docs/LOCATION_AND_ADDRESS_SECURITY.md](docs/LOCATION_AND_ADDRESS_SECURITY.md) — patient address and GPS data handling

- [docs/GOOGLE_MAPS_API_SETUP.md](docs/GOOGLE_MAPS_API_SETUP.md) — Geocoding/Directions setup for Trip Planner Pro



## [1.2.1] — 2026-06-18



### Fixed

- Postpartum **weight gain (WG)** now uses last visit weight vs today's weight only — never birth weight

- WG requires previous visit weight and last visit date; no fallback to delivery or birth date



### Added

- Inter-visit **gain since last visit (g)** on postpartum form and copied note output

- Form hint clarifying WL% vs WG data sources

- Unit tests for newborn weight calc (`utils/newbornWeightCalc.test.ts`)



### Changed

- Version **1.2.1** (Android versionCode **11**)

- IAP, AdMob, and Template Studio Phase A included in production builds (see v1.2.0 monetization work)



## [1.2.0] — 2026-06-18



### Added

- Postpartum template restructure matching clinical copy/paste format

- Newborn weight trends: WL%, total weight lost, WG (g/day) with 15s debounce

- Patient address field + “Include in today’s trip” on postpartum form

- **Trips** tab: mileage / trip planning (up to 50 stops)

- GPS trip recorder (actual km along route phone took)

- Open route in Google/Apple Maps; straight-line km estimate

- Trip Planner Pro: Google Maps / Mapbox BYO API key, driving route planning, map preview

- Strong master password policy (12+ chars, upper/lower/number/symbol)

- Show/hide password on all master password fields

- Biometric unlock on setup + auto-prompt when enabled



### Changed

- Version **1.2.0** (Android versionCode **7**)

- Updated privacy policy, data safety guide, and store listing docs for location/maps

- Store copy: `store/GOOGLE_PLAY_LISTING.md`, `store/APP_STORE_LISTING.md`, `store/RELEASE_NOTES.md`



## [1.1.0] — 2026-06-18



### Fixed

- Invisible text when typing or using voice dictation (theme-aware `ThemedTextInput`)

- Choppy autosave and cursor jumps (removed save feedback loop, content fingerprinting)

- Unreliable saves (flush on blur, background, and navigation)

- Save button overlapping Android navigation (safe area insets, edge-to-edge)

- Full-vault PBKDF2 on every keystroke (session crypto key cache)



### Added

- Light/dark/system theme toggle

- Note flags, reminders, extra notes field, follow-up status

- Local notification reminders (`expo-notifications`)

- Encrypted photo and audio attachments

- Auto-lock, local audit log, clipboard timeout, screenshot blocking

- Rule-based task digest on notes list

- Architecture and compliance documentation



### Security

- Vault schema v2 with normalized note fields

- Encrypted local audit log (no cloud telemetry)



## [1.0.0] — Initial release



- Encrypted local vault (AES-256-GCM)

- Notes, templates, postpartum form

- Biometric unlock, export/import

- EAS Android builds

