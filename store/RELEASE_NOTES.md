# Release Notes — Totus Secure Notes v1.2.14

Copy into **Google Play Console → Release notes** and **App Store Connect → What's New**.

| Field | Value |
|-------|--------|
| Version | **1.2.14** |
| Android versionCode | **56** (local; EAS auto-increment may apply) |
| Build date | July 15, 2026 |
| Package | `com.totuslife.TotusSecureNotes` |
| Web vault URL | https://totus--notes.web.app/vault |
| Store review build | EAS profiles `store-review` (AAB) / `store-review-apk` (sideload) — Pro unlocked for QA |

### EAS build URLs (v1.2.14)

| Build | Profile | URL |
|-------|---------|-----|
| Android AAB (Play review) | `store-review` | _Pending — run `npm run build:store-review -- --non-interactive`_ |

**AAB artifact:** _Pending — fill after build completes_

**EAS dashboard:** https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds

---

## Google Play — Release notes (1.2.14)

**Limit:** 500 characters per language (en-US below ≈ 380 chars)

```
What's new in 1.2.14:

• Android Photo Picker GMS backport for older devices — no READ_MEDIA permissions
• Manifest hardened: READ_MEDIA_IMAGES/VIDEO stripped via config plugin
• Play photo permissions declaration doc for Console review
• System photo picker + document picker for attachments (unchanged from 1.2.13)
• Permissions and policy docs updated
```

---

## Apple App Store — What's New (1.2.14)

**Limit:** 4000 characters (en-US below ≈ 350 chars)

```
What's New in 1.2.14

• Android Photo Picker compliance patch — GMS backport, no broad gallery access
• READ_MEDIA permissions stripped from manifest
• Updated Play photo permissions declaration and hosted policy docs
• System photo picker for attachments; document picker for audio/video
```

---

# Release Notes — Totus Secure Notes v1.2.13

Copy into **Google Play Console → Release notes** and **App Store Connect → What's New**.

| Field | Value |
|-------|--------|
| Version | **1.2.13** |
| Android versionCode | **55** (EAS auto-increment from local 54) |
| Build date | July 13, 2026 |
| Package | `com.totuslife.TotusSecureNotes` |
| Web vault URL | https://totus--notes.web.app/vault |
| Store review build | EAS profiles `store-review` (AAB) / `store-review-apk` (sideload) — Pro unlocked for QA |

### EAS build URLs (v1.2.13)

| Build | Profile | URL |
|-------|---------|-----|
| Android AAB (Play review) | `store-review` | https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds/4852d23b-24bd-4ff2-8fcb-4ac9a37523f9 |

**AAB artifact:** https://expo.dev/artifacts/eas/JX3PiChbVPY9T1ZYRw2aK6_W6bgMGitEf0XC7eLGdzk.aab

**EAS dashboard:** https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds

---

## Google Play — Release notes (1.2.13)

**Limit:** 500 characters per language (en-US below ≈ 380 chars)

```
What's new in 1.2.13:

• Google Play photo policy fix — no broad gallery access; system photo picker for attachments
• Audio and video import via document picker
• Gallery scrub removed (was best-effort; required media permissions)
• App icon on Home screen
• Permissions and policy docs updated
```

---

## Apple App Store — What's New (1.2.13)

**Limit:** 4000 characters (en-US below ≈ 350 chars)

```
What's New in 1.2.13

• Google Play photo policy compliance — system photo picker for attachments
• Audio and video import via document picker
• Gallery scrub removed for policy compliance
• App icon on Home screen
• Updated permissions and policy documentation
```

---

# Release Notes — Totus Secure Notes v1.2.12

Copy into **Google Play Console → Release notes** and **App Store Connect → What's New**.

| Field | Value |
|-------|--------|
| Version | **1.2.12** |
| Android versionCode | **52** |
| Build date | July 13, 2026 |
| Package | `com.totuslife.TotusSecureNotes` |
| Web vault URL | https://totus--notes.web.app/vault |
| Store review build | EAS profiles `store-review` (AAB) / `store-review-apk` (sideload) — Pro unlocked for QA |

### EAS build URLs (v1.2.12)

| Build | Profile | URL |
|-------|---------|-----|
| Android AAB (Play review) | `store-review` | https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds/5ce77c98-bfec-47bc-a827-7ae8697fac61 |
| Android APK (sideload) | `store-review-apk` | _Pending — run `npm run build:store-review-apk` after AAB upload_ |

**AAB artifact:** https://expo.dev/artifacts/eas/rHFXBByXY-utX_8ilZSrv5PDGhf9O2XHT6yOsrhAsIc.aab

**Superseded builds (versionCode 49, failed or incomplete):**
- AAB: https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds/6fcfdf54-9705-45f9-89e6-b8ffa036d62f
- APK: https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds/8a33c14e-0d5a-4cf9-bdc3-1508aed381a5

**EAS dashboard:** https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds

---

## Google Play — Release notes (1.2.12)

**Limit:** 500 characters per language (en-US below ≈ 480 chars)

```
What's new in 1.2.12:

• SoFo Postpartum HV pinned first — voice-friendly fields, draft auto-save, preview-before-copy, EMR export
• Encrypted voice memos in notes — record and play back inside your vault
• Settings → About & Legal — policies, version, tester unlock (tap version 7×)
• Note Save alerts when vault locked; Template AI shows Ready only when engine initializes
• Totus Assist diagnostics and Mapbox key save fix
```

---

## Apple App Store — What's New (1.2.12)

**Limit:** 4000 characters (en-US below ≈ 450 chars)

```
What's New in 1.2.12

• SoFo Postpartum HV — pinned clinical template with voice-friendly fields and EMR copy
• Encrypted voice memos — record and play back in the note editor
• About & Legal — version, policies, and tester unlock in Settings
• Clear Save feedback and vault-locked alerts across notes and templates
• Template AI readiness — Ready only when the on-device model is verified
```

---

# Release Notes — Totus Secure Notes v1.2.11

Copy into **Google Play Console → Release notes** and **App Store Connect → What's New**.

| Field | Value |
|-------|--------|
| Version | **1.2.11** |
| Android versionCode | **43** (AAB review build used 42; EAS autoIncrement) |
| Build date | July 12, 2026 |
| Package | `com.totuslife.TotusSecureNotes` |
| Web vault URL | https://totus--notes.web.app/vault |
| Store review build | EAS profile `store-review` — Pro unlocked for reviewers (see `docs/STORE_REVIEW_ACCESS.md`) |

### EAS build URLs (v1.2.11 audit)

| Build | Profile | URL |
|-------|---------|-----|
| Android AAB (Play review) | `store-review` | https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds/01d6d60e-a7b1-4b2a-a435-14c61a2f9a95 |
| Android APK (sideload) | `store-review-apk` | https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds/2a380d93-f3c5-40e4-9572-098554c5284a |
| iOS IPA (TestFlight) | `store-review` | _Blocked — run `eas build --platform ios --profile store-review` interactively_ |

**EAS dashboard:** https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds

---

## Google Play — Release notes (1.2.11)

**Limit:** 500 characters per language (en-US below ≈ 420 chars)

```
What's new in 1.2.11:

• Home dashboard — vault status, quick actions, recent notes, and Totus Assist at a glance
• Pro upgrade banner on Home, Notes, Templates, and Trips
• Totus Assist diagnostics — model status, entitlement, and last AI run in Settings
• Template Studio shows clear Pro upgrade when AI is locked
• Navigation: dedicated Notes tab; Home is the new landing screen
```

---

## Apple App Store — What's New (1.2.11)

**Limit:** 4000 characters (en-US below ≈ 400 chars)

```
What's New in 1.2.11

• Home dashboard with vault status, quick actions, and recent notes
• Pro upgrade banner on major screens — easier path to Pro Lifetime
• Totus Assist diagnostics in Settings — model status and AI troubleshooting
• Template Studio entitlement UX — clear upgrade path when AI is locked
• Dedicated Notes tab; Home is now the default landing screen
```

---

## Archive — v1.2.10

# Release Notes — Totus Secure Notes v1.2.10

Copy into **Google Play Console → Release notes** and **App Store Connect → What's New**.

| Field | Value |
|-------|--------|
| Version | **1.2.10** |
| Android versionCode | **39** (AAB for Play) |
| Build date | July 12, 2026 |
| Package | `com.totuslife.TotusSecureNotes` |
| Web vault URL | https://totus--notes.web.app/vault |
| Store review build | EAS profile `store-review` — Pro unlocked for reviewers (see `docs/STORE_REVIEW_ACCESS.md`) |

---

## Google Play — Release notes (1.2.10)

**Limit:** 500 characters per language (en-US below ≈ 280 chars)

```
What's new in 1.2.10:

• Notes save reliability — fixes dropped edits when leaving the editor quickly
• Note Assist — expand action restored in the editor
• Empty states link to Totus Assist for easier AI setup
```

---

## Apple App Store — What's New (1.2.10)

**Limit:** 4000 characters (en-US below ≈ 260 chars)

```
What's New in 1.2.10

• Notes save reliability — fixes dropped edits when leaving the editor quickly
• Note Assist — expand action restored in the editor
• Empty states link to Totus Assist for easier AI setup
```

---

## Archive — v1.2.9

### Release Notes — Totus Secure Notes v1.2.9

Copy into **Google Play Console → Release notes** and **App Store Connect → What's New**.

| Field | Value |
|-------|--------|
| Version | **1.2.9** |
| Android versionCode | **38** (AAB for Play) |
| Build date | July 11, 2026 |
| Package | `com.totuslife.TotusSecureNotes` |
| Web vault URL | https://totus--notes.web.app/vault |
| Store review build | EAS profile `store-review` — Pro unlocked for reviewers (see `docs/STORE_REVIEW_ACCESS.md`) |

---

## Google Play — Release notes (1.2.9)

**Limit:** 500 characters per language (en-US below ≈ 495 chars)

```
What's new in 1.2.9:

• Totus Assist hub — on-device AI status, capabilities, troubleshooting in Settings
• Note Assist — bulletize, shorten, expand, summarize notes on-device (Pro Lifetime)
• Assist chips on Notes, Templates, and Trips for quick AI access
• Task digest on notes list with optional on-device AI summary (Pro)
• Template AI readiness fixes — clearer errors, focus sync in Studio
• Secure attachments — gallery scrub, in-app viewer, secure delete
• Template library — curated imports, local only
• Local note reminders with notification permission in context
```

---

## Apple App Store — What's New (1.2.9)

**Limit:** 4000 characters (en-US below ≈ 480 chars)

```
What's New in 1.2.9

• Totus Assist hub — model status, capabilities, and troubleshooting in Settings
• Note Assist — bulletize, shorten, expand, or summarize notes on-device (Pro Lifetime)
• Assist chips on Notes, Templates, and Trips
• Task digest with optional on-device AI summary on the notes list (Pro)
• Template AI readiness improvements and clearer error messages
• Secure attachments — gallery scrub, in-app viewer, secure delete
• Template library — curated public templates, import locally
• Local note reminders with in-context notification permission
```

---

## Archive — v1.2.8

| Field | Value |
|-------|--------|
| Version | **1.2.8** |
| Android versionCode | **36** (AAB for Play) · **37** (APK sideload) |

## Google Play — Release notes (1.2.8)

**Limit:** 500 characters per language (en-US below ≈ 380 chars)

```
What's new in 1.2.8:

• Trip Planner: Google Maps & Apple Maps multi-stop routes — no API keys
• iOS Google Maps app opens full multi-destination routes
• Postpartum clinical form at top of Templates gallery
• Keyboard and paywall stability fixes
• Template AI clearer error messages
• Store review builds unlock Pro for app reviewers
```

---

## Google Play — Release notes (1.2.7 archive)

```
What's new in 1.2.7:

• Trip Planner maps work without API keys — Google/Apple Maps apps, in-app OSM preview
• Driving route distance via OpenStreetMap (Pro Lifetime)
• Optional Google/Mapbox keys moved to Advanced settings
```

---

## Google Play — Release notes (1.2.5 archive)

```
What's new in 1.2.5:

• Settings → Sync to desktop: step-by-step export + web vault link
• Export encrypted .totus bundle, transfer to PC/Mac, open web vault (read-only)
• Not live cloud sync — manual encrypted export only
• Bug fixes and stability improvements
```

---

## Apple App Store — What's New (1.2.8 archive)

**Limit:** 4000 characters (en-US below ≈ 350 chars)

```
What's New in 1.2.8

• Trip Planner: open multi-stop routes in Google Maps or Apple Maps — no API keys required
• iPhone: native Google Maps app support for full multi-destination navigation
• Postpartum clinical form featured at top of Templates
• Improved keyboard behavior on forms and notes
• Paywall and Template AI stability improvements
• Bug fixes and performance improvements
```

---

## Apple App Store — What's New (1.2.5 archive)

```
What's New in 1.2.5

• Sync to desktop: export encrypted .totus bundle from Settings
• Open web vault on PC/Mac for read-only viewing (not live cloud sync)
• Three-layer encryption and web vault security improvements
• Bug fixes and stability improvements
```

---

## Internal release checklist

- [ ] Upload **store-review** AAB to Play internal / closed testing
- [ ] Upload **store-review** IPA to TestFlight (iOS)
- [ ] Paste sign-in notes from `docs/STORE_REVIEW_ACCESS.md`
- [ ] Verify Data safety form matches `docs/DATA_SAFETY_GOOGLE_PLAY.md`
- [ ] Confirm privacy URL: https://totus--notes.web.app/privacy
- [ ] Run `npm run policies:build && npm run firebase:deploy:all` if policies changed
