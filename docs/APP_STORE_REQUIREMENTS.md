# Apple App Store — Requirements Checklist (Totus Secure Notes)

## Accounts & identifiers

| Item | Value / action |
|------|----------------|
| Apple Developer Program | Enroll at developer.apple.com ($99/year) |
| Bundle ID | `com.totuslife.TotusSecureNotes` (already in `app.json`) |
| App Store Connect | Create app record matching bundle ID |
| EAS iOS credentials | `eas credentials` or auto during first iOS build |

---

## Required URLs (App Store Connect)

| Field | URL |
|-------|-----|
| Privacy Policy | Link to `docs/PRIVACY_POLICY.md` (public raw or Pages) |
| Terms of Use (EULA) | Link to `docs/TERMS_AND_CONDITIONS.md` or Apple standard EULA + supplement |

---

## App Privacy (Nutrition Labels)

For **current v1.2.8** (local-only notes/trips, optional location on device, ads + IAP, on-device Template AI, web vault export, no-API-key maps):

- **Data Not Collected** by developer — notes and trip data stay on device  
- **Location** — optional, for GPS mileage; not sent to Totus Life servers  

When **Pro maps API** is used, addresses may be sent to Google/Mapbox per user's API key.

When **IAP** is live:

- **Purchases** — linked to user (via Apple) — App functionality  

When **ads** are live:

- **Identifiers** — Device ID — Advertising  
- Declare third-party partners (AdMob / Apple Search Ads network as applicable)  

**Note content:** Not collected by developer → do not declare as collected.

---

## In-App Purchases (StoreKit)

1. Create products in App Store Connect (see `store/products.json`)  
2. Types: consumable, non-consumable, auto-renewable subscription  
3. Test with **Sandbox Apple ID** on physical device  
4. Implement via `expo-iap` (requires dev client / store build)  

---

## Advertising (free tier)

- Implement App Tracking Transparency (ATT) if tracking across apps  
- Use AdMob or Apple mediation; update privacy label  
- **Pro tier:** disable ad SDK initialization  

---

## Encryption export compliance

`expo-secure-store` uses standard encryption. In `app.json` you can set:

```json
"ios": {
  "config": {
    "usesNonExemptEncryption": false
  }
}
```

(Already recommended in Expo SecureStore docs for standard app encryption.)

| Location (When In Use / Always) | GPS trip mileage — optional |
| Camera / Photo Library | Encrypted attachments |
| Notifications | Note reminders |
| Face ID / Touch ID | Biometric vault unlock |

---

## TestFlight workflow

```bash
eas build --platform ios --profile preview --non-interactive
eas submit --platform ios --profile production
```

Or download IPA from EAS and upload manually to App Store Connect.

---

## Mac / Windows / cross-platform

| Platform | Support |
|----------|---------|
| iPhone / iPad | Primary — native app |
| Android | Primary — native app |
| Web (Expo static) | Optional — limited secure storage vs native |
| macOS (Expo) | Future — `expo run:macos` or Catalyst |
| Windows | Future — separate Expo/React Native target or PWA |

Telegram and desktop control are **external integrations** (Cursor Cloud, bots), not App Store binaries.

---

## Review notes for Apple

Full copy-paste instructions (vault password, Pro unlock, feature walkthrough): **[STORE_REVIEW_ACCESS.md](./STORE_REVIEW_ACCESS.md)**

Build for review with:

```bash
npm run build:store-review-ios
```

Suggested summary for App Review Information:

> Totus Secure Notes stores all note data locally on device with AES-256 encryption. No cloud account login. Master password is never transmitted to our servers. Optional biometric unlock uses iOS Keychain. This review build unlocks Pro Lifetime automatically (Template Studio, Template AI, Trip Planner Pro, no ads). Use vault password: TotusReview2026! (create on first launch). See review notes for full steps.

---

## Contact

- **Support URL / email:** totuslife7@gmail.com  
