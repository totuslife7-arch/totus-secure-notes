# Store Listing Checklist — Totus Secure Notes

Complete before **production** release on Google Play and Apple App Store.

**Current release:** v1.2.8 (versionCode 34) — **Totus Secure Notes**

---

## Store listing copy (ready to paste)

| File | Purpose |
|------|---------|
| [../store/GOOGLE_PLAY_LISTING.md](../store/GOOGLE_PLAY_LISTING.md) | Short + full Google Play description |
| [../store/APP_STORE_LISTING.md](../store/APP_STORE_LISTING.md) | Subtitle, keywords, Apple description |
| [../store/RELEASE_NOTES.md](../store/RELEASE_NOTES.md) | Release notes / What's New for v1.2.8 |
| [../store/README.md](../store/README.md) | Index of store assets |

---

## Assets needed

| Asset | Android | iOS |
|-------|---------|-----|
| App icon | ✅ in `assets/images/` | ✅ 1024×1024 |
| Feature graphic | 1024×500 PNG | — |
| Phone screenshots | 2–8 (Notes, Postpartum, Trips, Settings) | 6.7", 6.5", iPad if tablet |
| Short description | 80 chars | Subtitle 30 chars |
| Full description | 4000 chars | 4000 chars |
| Promo video | Optional | Optional |

---

## Text templates (v1.2.1)

See **[store/GOOGLE_PLAY_LISTING.md](../store/GOOGLE_PLAY_LISTING.md)** and **[store/APP_STORE_LISTING.md](../store/APP_STORE_LISTING.md)** for full copy. Quick reference:

**Short (80 chars):**  
`Encrypted local notes, postpartum template, trip mileage — data stays on device.`

**Release notes:**  
[store/RELEASE_NOTES.md](../store/RELEASE_NOTES.md)

---

## Legal links (required)

| Document | File |
|----------|------|
| Privacy Policy | [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) |
| Terms & Conditions | [TERMS_AND_CONDITIONS.md](./TERMS_AND_CONDITIONS.md) |
| Data Safety guide | [DATA_SAFETY_GOOGLE_PLAY.md](./DATA_SAFETY_GOOGLE_PLAY.md) |
| Policy compliance | [GOOGLE_PLAY_POLICY_COMPLIANCE.md](./GOOGLE_PLAY_POLICY_COMPLIANCE.md) |
| Apple requirements | [APP_STORE_REQUIREMENTS.md](./APP_STORE_REQUIREMENTS.md) |

**Action:** Publish privacy & terms at public HTTPS URLs before store submission.

---

## Support

| Field | Value |
|-------|-------|
| Support email | totuslife7@gmail.com |
| Support URL | GitHub repo issues page (optional) |

See [SUPPORT.md](./SUPPORT.md).

---

## Pricing

| Store | Free app | IAP |
|-------|----------|-----|
| Google Play | Free | Pro products in console |
| App Store | Free | IAP in App Store Connect |

---

## Pre-launch testing (v1.2.1)

- [ ] Production APK tested on real Android device  
- [ ] Master password + biometric unlock + show password  
- [ ] Postpartum template: weight calc, copy/save  
- [ ] Trips: GPS start/stop, add stops, Open in Maps  
- [ ] Location permission flow explained to user  
- [ ] Export/import vault  
- [ ] Theme light/dark  
- [ ] Android internal testing track before production  

---

## Build commands

```bash
npm run build:aab          # Play Store AAB (v1.2.1)
npm run build:apk-prod     # Direct APK (v1.2.1)
npm run build:ios          # App Store / TestFlight
```

Details: [DEVELOPMENT_AND_BUILDS.md](./DEVELOPMENT_AND_BUILDS.md)

Builds: https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds
