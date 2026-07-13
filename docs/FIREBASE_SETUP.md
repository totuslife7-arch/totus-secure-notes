# Firebase Setup — Totus Secure Notes

## Project

| Field | Value |
|-------|--------|
| **Project name** | totus secure notes |
| **Project ID** | `totus--notes` |
| **Project number** | `959875118939` |
| **Hosting URL** | https://totus--notes.web.app |

## Android / iOS apps (Firebase)

| Platform | Package / bundle | Firebase App ID |
|----------|------------------|-----------------|
| Android | `com.totuslife.TotusSecureNotes` | `1:959875118939:android:2f111542ca1e14931ecc7e` |
| iOS | `com.totuslife.TotusSecureNotes` | `1:959875118939:ios:4e75b45d141ce2381ecc7e` |

## Firebase config files (not in git)

Client config files are **not** committed (GitHub secret scanning). Use the checked-in templates:

- [`google-services.json.example`](../google-services.json.example) → copy to `google-services.json` (Android)
- [`GoogleService-Info.plist.example`](../GoogleService-Info.plist.example) → copy to `GoogleService-Info.plist` (iOS)

### Local / EAS build setup

1. [Firebase Console](https://console.firebase.google.com/project/totus--notes/settings/general) → **Project settings** → **Your apps**
2. Download **google-services.json** (Android) and **GoogleService-Info.plist** (iOS)
3. Place both at the **repo root** before `npx expo run:android`, `npx expo run:ios`, or `eas build`

### Rotate and restrict exposed keys

Keys that were previously in git history must be **rotated** even after removal from the repo:

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=totus--notes) → **APIs & Services** → **Credentials**
2. For each exposed **Browser/Android/iOS API key**: create a replacement or edit restrictions, then disable/delete the old key
3. Restrict keys by app:
   - **Android:** package `com.totuslife.TotusSecureNotes` + SHA-1/SHA-256 from EAS credentials (see [Add EAS signing fingerprints](#add-eas-signing-fingerprints-to-firebase))
   - **iOS:** bundle ID `com.totuslife.TotusSecureNotes`
4. In GitHub: resolve secret scanning alerts after rotation; old keys in history are still compromised until rotated

### EAS file secrets (required for cloud builds)

EAS only uploads git-tracked files. The `eas-build-post-install` script in `package.json` runs `node scripts/inject-firebase-config.mjs` after install to copy Firebase configs from file environment variables. Build profiles set `"environment": "production"` (or `preview` / `development`) so EAS loads file secrets during the job.

**One-time setup** (from repo root, with local configs present):

```powershell
eas env:create --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --environment production --visibility secret
eas env:create --name GOOGLE_SERVICE_INFO_PLIST --type file --value ./GoogleService-Info.plist --environment production --visibility secret
```

Repeat for `preview` / `development` environments if you build those profiles from CI.

Then re-run store-review builds:

```powershell
npm run build:store-review
npm run build:store-review-apk
```

Keep the same rotate/restrict steps for any key used in production.


## Public policy URLs (Play Store / App Store)

| Document | URL | Play Console use |
|----------|-----|------------------|
| **Policy index** | https://totus--notes.web.app/ | Reference |
| **Privacy Policy** | https://totus--notes.web.app/privacy | **Privacy policy URL (required)** |
| **Terms & Conditions** | https://totus--notes.web.app/terms | EULA |
| **Support** | https://totus--notes.web.app/support | Support supplement |
| **Data deletion** | https://totus--notes.web.app/data-deletion | **Data deletion URL** |
| **Permissions** | https://totus--notes.web.app/permissions | Permissions disclosure |
| **Data safety summary** | https://totus--notes.web.app/data-safety | Data safety reference |
| **Ads & monetization** | https://totus--notes.web.app/ads-monetization | Ads / IAP |
| **Security** | https://totus--notes.web.app/security | Security practices |
| **Children & audience** | https://totus--notes.web.app/children | Target audience / IARC |
| **Legal disclaimer** | https://totus--notes.web.app/legal-disclaimer | Medical/compliance |

Full index: [`docs/POLICY_INDEX.md`](../docs/POLICY_INDEX.md)

## Deploy Hosting + Firestore rules

```powershell
cd "c:\Users\Admin\Documents\TotusNoteSafe\TotusNote\TotusSafe"
npm run firebase:deploy
```

This rebuilds HTML from [`docs/PRIVACY_POLICY.md`](PRIVACY_POLICY.md) etc. and deploys to Firebase.

## Seed Firestore policy CMS (optional — in-app version check)

Firestore collection `policies/{privacy|terms|...}` lets Settings **Check for policy updates** show version metadata.

**One-time setup:**

1. [Firebase Console](https://console.firebase.google.com/project/totus--notes/settings/serviceaccounts/adminsdk) → **Service accounts** → **Generate new private key**
2. Save as `firebase/service-account.json` (gitignored — never commit)
3. Run:

```powershell
npm run policies:seed
```

**Without seed:** All policy **web links work** via Hosting. The app falls back to hosted URLs if Firestore documents are missing.

Alternative: `gcloud auth application-default login` then `npm run policies:seed`

## Add EAS signing fingerprints to Firebase

After [ANDROID_SIGNING_SETUP.md](./ANDROID_SIGNING_SETUP.md):

1. Copy SHA-1 and SHA-256 from [Expo credentials](https://expo.dev/accounts/totuslife/projects/totus-secure-notes/credentials)
2. Firebase Console → Project settings → Android app → **Add fingerprint**

## What Firebase is used for

| Service | Purpose |
|---------|---------|
| **Hosting** | Public privacy, terms, support pages |
| **Firestore** | Read-only policy metadata (version, update date) |
| **Analytics** | Screen views only — no note content |
| **Crashlytics** | Crash reports — no note content |

Notes vault remains **local-only** on device.

## Related

- [ANDROID_SIGNING_SETUP.md](./ANDROID_SIGNING_SETUP.md)  
- [PLAY_FIRST_UPLOAD_CHECKLIST.md](./PLAY_FIRST_UPLOAD_CHECKLIST.md)  
- [ADMOB_SETUP.md](./ADMOB_SETUP.md)
