# Google Play — First Upload Checklist

Order of operations for Totus Secure Notes internal testing.

**Package:** `com.totuslife.TotusSecureNotes`  
**Privacy URL:** https://totus--notes.web.app/privacy

---

## Phase 1 — Signing (required before upload succeeds)

See [ANDROID_SIGNING_SETUP.md](./ANDROID_SIGNING_SETUP.md).

- [ ] Export EAS upload certificate (`.pem`) via `eas credentials -p android`
- [ ] Optional: download EAS keystore backup to password manager
- [ ] Play Console → **App integrity** → **Upload key certificate** → **Request upload key reset** → upload `.pem`
- [ ] Do **not** use **Change app signing key** unless Play Support specifically tells you to
- [ ] Wait for Google approval
- [ ] `npm run build:aab` and download AAB

---

## Phase 2 — First AAB upload

- [ ] Play Console → **Testing → Internal testing** → Create release
- [ ] Upload AAB (versionCode from EAS build)
- [ ] Add release notes from [`store/RELEASE_NOTES.md`](../store/RELEASE_NOTES.md)
- [ ] **Main store listing** → Privacy policy URL: `https://totus--notes.web.app/privacy`

---

## Phase 3 — App content declarations

- [ ] **Privacy policy** URL live (Firebase Hosting)
- [ ] **Photo and video permissions** — see [`PLAY_PHOTO_PERMISSIONS_DECLARATION.md`](PLAY_PHOTO_PERMISSIONS_DECLARATION.md) (v1.2.15 uses photo picker only; no `READ_MEDIA_*`; versionCode **59**)
- [ ] **Data safety** — follow [`DATA_SAFETY_GOOGLE_PLAY.md`](DATA_SAFETY_GOOGLE_PLAY.md) (Firebase Analytics/Crashlytics + AdMob when enabled)
- [ ] **Ads** — **Yes** when production AdMob is in the build; **No** for ad-free test builds
- [ ] **Content rating** questionnaire
- [ ] **Target audience** / news app / COVID declarations as applicable

---

## Phase 4 — License testing & IAP

After first accepted upload:

- [ ] **Setup → License testing** — add your Gmail
- [ ] **App access / Sign-in** — paste instructions from [`STORE_REVIEW_ACCESS.md`](./STORE_REVIEW_ACCESS.md)
- [ ] Upload **store-review** AAB for review if reviewers need Pro without purchase
- [ ] **Payments profile** — complete merchant setup
- [ ] Create IAP products per [`store/IAP_SETUP.md`](../store/IAP_SETUP.md)
- [ ] Install internal testing build and test purchase + **Restore purchases** in Settings
- [ ] For Google route planning, enable APIs per [`GOOGLE_MAPS_API_SETUP.md`](GOOGLE_MAPS_API_SETUP.md)

---

## Phase 5 — AdMob (when ready for ads)

See [ADMOB_SETUP.md](./ADMOB_SETUP.md).

- [ ] Create AdMob Android app linked to Firebase `totus--notes`
- [ ] Paste production App ID + banner unit into `app.json` and `store/products.json`
- [ ] Rebuild AAB and upload new release

---

## Phase 6 — Firebase policy updates

When you change policy markdown:

```powershell
npm run policies:build
npm run firebase:deploy
# optional Firestore sync:
npm run policies:seed
```

---

## Quick links

| Console | URL |
|---------|-----|
| Play Console | https://play.google.com/console |
| Firebase | https://console.firebase.google.com/project/totus--notes |
| AdMob | https://admob.google.com |
| Expo builds | https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds |
