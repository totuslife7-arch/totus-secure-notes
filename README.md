# Totus Secure Notes

Encrypted, local-first notes app built with Expo SDK 56. **v1.2.14** hardens Google Play photo policy compliance (GMS Photo Picker backport, no `READ_MEDIA_*` permissions) — plus SoFo Postpartum HV, encrypted voice memos, Totus Assist, Note Assist, secure attachments, Template Studio AI, trip planner, and read-only web vault at https://totus--notes.web.app/vault.

**Expo project:** https://expo.dev/accounts/totuslife/projects/totus-secure-notes

**GitHub:** https://github.com/totuslife7-arch/totus-secure-notes

## Install on Android (no Expo Go required)

This app uses **SDK 56** with native modules (location, maps, notifications, on-device AI). Install a standalone build — not Expo Go:

1. Open the [Expo builds page](https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds)
2. Download the latest **production-apk** (APK) or **production** (AAB for Play Store)
3. On your phone: allow installs from unknown sources if sideloading APK
4. Open the downloaded file and install

## Documentation

Store legal docs, build guides, and monetization roadmap: **[docs/README.md](./docs/README.md)**

- [User Guide](./docs/USER_GUIDE.md)
- [Privacy Policy](./docs/PRIVACY_POLICY.md)
- [Terms & Conditions](./docs/TERMS_AND_CONDITIONS.md)
- [Development & iOS/Android builds](./docs/DEVELOPMENT_AND_BUILDS.md)
- [On-device AI](./docs/ON_DEVICE_AI.md)
- [Changelog](./CHANGELOG.md)
- [Store listing & release notes](./store/README.md)

## Features (v1.2.14)

- Three-layer encryption: Argon2id KDF, hardware-backed session key, envelope + HMAC on `.totus` exports
- Master password with biometrics, show/hide password, strong password policy
- Light / dark / system theme
- **SoFo Postpartum HV** — pinned postpartum home-visit template with draft auto-save and EMR copy
- Markdown notes, flags, local reminders, task digest, encrypted photo/audio/video/**voice memo** attachments
- **Secure attachments:** system photo picker (Android), document picker for audio/video, in-app viewer, multi-pass secure delete
- **Note Assist** (Pro Lifetime): bulletize, shorten, expand, summarize on-device
- **Totus Assist hub** (Settings → Totus Assist): model status, capabilities, troubleshooting
- **Assist chips** on Notes, Templates, and Trips tabs
- Postpartum / **SoFo Postpartum HV** nursing template (featured at top of Templates gallery)
- **Built-in briefcase templates** (home visit, wound care, psychosocial, discharge, intake)
- **Template library** — curated public templates (metadata only); import locally
- **Template Studio + Template AI** (Pro Lifetime): paste forms, on-device SmolLM2 field suggestions, review before save
- **Copy for Plexia / EMR:** plain `Label: value` export from templates
- **Sync to desktop:** Settings → export encrypted `.totus` bundle, transfer manually, open https://totus--notes.web.app/vault (read-only; not live cloud sync)
- **Trips tab:** GPS mileage logging, up to 50 patient stops, Open in Google/Apple Maps (multi-stop, no API key)
- **Trip Planner Pro:** driving route distance (OSRM/Nominatim), in-app OpenStreetMap preview (Pro Lifetime)
- Store review builds unlock Pro for app reviewers (see `docs/STORE_REVIEW_ACCESS.md`)
- Auto-lock, local audit log, clipboard timeout, screenshot blocking
- Encrypted vault export/import (`.enc` files)

## Build commands

```bash
npm run build:aab              # Google Play AAB (production)
npm run build:apk-prod         # Installable APK (production)
npm run build:store-review     # Play review AAB (Pro unlocked)
npm run build:store-review-apk # Play review APK (Pro unlocked)
npm run build:android:dev      # Dev client (for expo start --dev-client)
npm run vault:prepare          # Export web build + copy to firebase/public/vault/
```

Download builds: https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds

## Current version

| Field | Value |
|-------|--------|
| Version | **1.2.14** |
| Android versionCode | **56** |
| Package | `com.totuslife.TotusSecureNotes` |

## Security Notes

- Master password is never stored in plaintext
- Trip addresses and GPS tracks are encrypted locally
- Template AI and Note Assist run on-device only; no note content sent to Totus servers
- Web vault decrypts in the browser only; no cloud upload of vault contents
- Default Trip Planner routing uses Nominatim/OSRM (addresses go from device to OSM services)
- Optional Google/Mapbox API keys (Advanced) stored in SecureStore on device only
- No developer-operated note database or analytics

## License

MIT (open source)
