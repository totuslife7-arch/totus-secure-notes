# Google Play Store Listing — Totus Secure Notes

**Version:** 1.2.13  
**Package:** `com.totuslife.TotusSecureNotes`  
**Category:** Productivity (recommended) or Medical (only if listing emphasizes templates carefully)  
**Contact:** totuslife7@gmail.com

Copy fields below into [Google Play Console](https://play.google.com/console) → Main store listing.

---

## App name

```
Totus Secure Notes
```

---

## Short description (max 80 characters)

**Character count:** 78

```
Local encrypted notes, templates & trips. Optional on-device Assist (Pro).
```

**Alternate (79 chars):**

```
Encrypted notes for clinicians—templates, trips, optional on-device AI. Local.
```

---

## Full description (max 4000 characters)

```
Totus Secure Notes helps clinicians and mobile professionals write, store, and organize encrypted notes on their phone. Your vault is protected with AES-256 encryption on-device. No cloud account is required.

WHO IS THIS FOR?
• Nurses, social workers, and community health staff who need secure note-taking
• Anyone who wants local-first encrypted notes without a subscription cloud service
• Professionals who draft clinical-style text and copy it into their own systems (Plexia, EMR)

SECURITY
• Master password with optional biometric unlock (fingerprint / face)
• Show or hide password while typing
• Strong password requirements for new vaults
• Auto-lock when the app is in the background
• Optional screenshot blocking while unlocked
• Secure attachments: system photo picker (Android), document picker for audio/video, in-app viewer, multi-pass secure delete
• Encrypted export/import backup files (.enc)
• Sync to desktop: export encrypted .totus bundle, transfer manually, open web vault at totus--notes.web.app/vault (read-only; not live sync)
• No developer-operated note database or analytics

NOTES & TOTUS ASSIST
• Markdown note editor with flags, local reminders, follow-up status, and task digest on the notes list
• Optional on-device AI task summary atop your open follow-ups (Pro Lifetime)
• Note Assist (Pro Lifetime): bulletize, shorten, expand, or summarize note text on-device
• Contextual Assist chips on Notes, Templates, and Trips — quick links to on-device AI and rules fallbacks
• Light, dark, and system theme
• Encrypted photo, audio, video, and voice memo attachments (record in-app)
• Local note reminders with notification permission requested in context; re-sync on vault unlock

TEMPLATES & LIBRARY
• SoFo Postpartum HV — pinned postpartum home-visit template with voice-friendly fields, draft auto-save, preview-before-copy, and EMR export
• Postpartum nursing template — manual weight fields for copy/paste into work software
• Built-in briefcase templates: home visit, wound care, psychosocial, discharge, intake
• Template library — curated public templates (metadata only); import and review locally
• Copy for Plexia / EMR: plain Label: value export from filled forms
• Template Studio (Pro Lifetime): create custom templates from pasted forms
• Template AI (Pro Lifetime): on-device SmolLM2 suggests fields — you review before save
• Totus Assist hub (Settings → Totus Assist): model status, capabilities, troubleshooting

TRIP & MILEAGE PLANNER
• Plan up to 50 patient stops for your visit day
• GPS trip recorder logs actual kilometers driven (route your phone took)
• Open your route in Google Maps or Apple Maps — multi-stop, no API keys
• Optional Trip Planner Pro: driving route distance and in-app OpenStreetMap preview (Pro Lifetime)

FREE & PRO
The app is free to download. Pro Monthly removes banner ads. Pro Lifetime unlocks Trip Planner Pro, Template Studio, Template AI, Note Assist, and all premium tools. See in-app Settings for details.

IMPORTANT — PLEASE READ
This app is a productivity and note-taking tool. It does NOT provide medical advice, diagnosis, or treatment. Templates (including nursing forms) are writing aids only. On-device AI (Template AI, Note Assist) is productivity assistance — not clinical decision support. You are solely responsible for accuracy, workplace policies, and compliance with applicable laws including healthcare privacy rules (e.g. HIPAA, PIPEDA, FOIP) in your jurisdiction.

We do not claim FDA approval, Health Canada clearance, or HIPAA certification.

PRIVACY
Notes, trip addresses, and GPS mileage logs are stored locally on your device in encrypted form. Template AI and Note Assist run on-device only. See our Privacy Policy for details on location, optional maps API use, and web vault export.

Support: totuslife7@gmail.com
```

---

## Release notes (this version)

See [RELEASE_NOTES.md](./RELEASE_NOTES.md) — use the **Short** Google Play block.

---

## Privacy policy URL

```
https://totus--notes.web.app/privacy
```

---

## Store graphics (`assets/app store/`)

| Asset | File | Spec |
|-------|------|------|
| App icon | `google-play-icon-512.png` | 512×512 PNG, ≤1 MB |
| Feature graphic | `google-play-feature-graphic-1024x500.png` | 1024×500 PNG, ≤15 MB |
| Phone screenshots | `screenshots/01-06-*.png` | 1080×1920 PNG (9:16), ≤8 MB each — 6 files |

Regenerate feature graphic: `python scripts/generate_feature_graphic.py`  
Regenerate screenshots: `python scripts/generate_play_screenshots.py`  
Background location video: `assets/app store/videos/google-play-background-location-walkthrough.mp4` (~30s — upload to YouTube unlisted for Play Console)

**Screenshot order for Play Console:** 01 Notes → 02 Postpartum → 03 Templates → 04 Trips → 05 Template AI → 06 Security

---

## Data safety (summary)

See [../docs/DATA_SAFETY_GOOGLE_PLAY.md](../docs/DATA_SAFETY_GOOGLE_PLAY.md).

- Notes: local only, not collected by developer
- Location: optional, on-device for GPS mileage
- Free tier: banner ads (AdMob test IDs in dev builds; replace for production)
- IAP: Pro Monthly and Pro Lifetime via Google Play Billing
- Template AI / Note Assist: on-device model download; no note content to Totus servers
- Voice memos: microphone optional; audio encrypted on device only
- Web vault: user-exported .totus bundles; browser-only decryption

---

## Content rating

Complete IARC questionnaire. Target audience: **not designed for children under 13**.

---

## Tags / keywords (for ASO research, not a Play Console field)

encrypted notes, secure notes, nursing notes, postpartum, community nursing, social work notes, mileage tracker, trip planner, healthcare productivity, local encryption, markdown notes, plexia, emr copy, template ai, note assist, on-device ai
