# Policy Index — Totus Secure Notes (Play Store URLs)

**Last updated:** July 15, 2026  
**Base URL:** https://totus--notes.web.app

Use these **public HTTPS links** in Google Play Console, App Store Connect, and in-app Settings.

---

## Required for Google Play

| Play Console field | URL |
|--------------------|-----|
| **Privacy policy** | https://totus--notes.web.app/privacy |
| **Data deletion** (no cloud account) | https://totus--notes.web.app/data-deletion |
| **App content → Ads declaration** | See https://totus--notes.web.app/ads-monetization |
| **Data safety** (public summary) | https://totus--notes.web.app/data-safety |

---

## All hosted policies

| Document | URL | Play / store use |
|----------|-----|------------------|
| Privacy Policy | https://totus--notes.web.app/privacy | **Required** — Privacy policy URL |
| Terms & Conditions | https://totus--notes.web.app/terms | EULA / Terms link |
| Support | https://totus--notes.web.app/support | Store support contact supplement |
| Data deletion | https://totus--notes.web.app/data-deletion | **Account/data deletion URL** |
| Permissions | https://totus--notes.web.app/permissions | Permissions disclosure |
| Data safety summary | https://totus--notes.web.app/data-safety | Matches Data safety form |
| Ads & monetization | https://totus--notes.web.app/ads-monetization | Ads + IAP disclosure |
| Security | https://totus--notes.web.app/security | Security / encryption |
| Children & audience | https://totus--notes.web.app/children | Target audience / IARC |
| Legal disclaimer | https://totus--notes.web.app/legal-disclaimer | Medical / compliance disclaimer |
| **Policy home** | https://totus--notes.web.app/ | Index of all links |
| **Web vault viewer** | https://totus--notes.web.app/vault | Read-only `.totus` import (not live sync) |

---

## v1.2.14 policy updates

Android Photo Picker GMS backport (`plugins/withAndroidPhotoPicker.js`); `READ_MEDIA_*` stripped from manifest; Play photo permissions declaration doc. No broad gallery access — system photo picker + document picker only. Gallery scrub removed (v1.2.13+).

## v1.2.13 policy updates

Google Play photo policy compliance: no `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO`; system photo picker for attachments; audio/video via document picker; gallery scrub removed; `expo-media-library` removed. Permissions and privacy docs updated.

## v1.2.12 policy updates

SoFo Postpartum HV clinical template, encrypted **voice memos** (microphone permission), Settings → **About & Legal** hub (policies + tester unlock). Template AI readiness gated on GGUF verification. Firebase client configs removed from git — hosted policy URLs unchanged.

## v1.2.8 policy updates

Trip Planner default routing uses Nominatim/OSRM (addresses from device to OpenStreetMap services). Optional Google/Mapbox keys remain advanced-only. Store review mode and developer unlock documented in `DEVELOPMENT_AND_BUILDS.md` (not for public store listings).

## v1.2.5 policy updates

Settings → **Sync to desktop** documents manual encrypted export workflow. Web vault hosted at `/vault`. No live cloud sync; browser-only decryption of user-exported `.totus` bundles.

## v1.2.3 policy updates

Policies updated for **Template AI** (on-device, Pro Lifetime), **web vault viewer** (`.totus` export, browser decryption), **built-in templates**, and **Plexia/EMR copy** workflow. No HIPAA/FDA certification claims.

---

## Google Play reference docs (developer guides — not hosted)

These inform our policies but are **Google’s rules**, not Totus Life documents:

- [Developer Program Policy](https://play.google.com/about/developer-content-policy/)
- [User Data policy](https://play.google.com/about/privacy-security/user-data/)
- [Permissions policy](https://play.google.com/about/privacy-security-deception/permissions/)
- [Ads policy](https://play.google.com/about/monetization-ads/ads/)
- [Data safety help](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Content ratings](https://support.google.com/googleplay/android-developer/answer/9859655)
- [App bundles](https://developer.android.com/guide/app-bundle)

---

## Updating policies

1. Edit markdown in `docs/*.md`  
2. Run `npm run policies:build` (HTML in `firebase/public/`)  
3. Run `npm run firebase:deploy` or `npm run firebase:deploy:all`  
4. Optional: `npm run policies:seed` (requires `firebase/service-account.json`)  
5. Update Play Console Data safety if data types change  

---

**Contact:** totuslife7@gmail.com
