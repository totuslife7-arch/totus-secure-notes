# Privacy Policy — Totus Secure Notes

**Effective date:** June 19, 2026  
**Last updated:** July 11, 2026  
**App name:** Totus Secure Notes  
**Developer:** Totus Life (`totuslife7@gmail.com`)  
**Package / Bundle ID:** `com.totuslife.TotusSecureNotes`  
**Public URL:** https://totus--notes.web.app/privacy

---

## Summary

Totus Secure Notes is a **local-first, encrypted notes app**. Your note content is stored **on your device** and is **not** uploaded to our servers. We do not operate a cloud account system for your notes.

This Privacy Policy comprehensively discloses how the app accesses, collects, uses, handles, and shares data, as required by [Google Play User Data policies](https://play.google.com/about/privacy-security/user-data/) and applicable privacy laws.

**Related policies:** [Terms](https://totus--notes.web.app/terms) · [Data deletion](https://totus--notes.web.app/data-deletion) · [Permissions](https://totus--notes.web.app/permissions) · [Data safety summary](https://totus--notes.web.app/data-safety)

---

## 1. Developer contact

| Field | Value |
|-------|--------|
| Developer | Totus Life |
| App | Totus Secure Notes |
| Email | totuslife7@gmail.com |
| GitHub | https://github.com/totuslife7-arch/totus-secure-notes |

For privacy inquiries, email **totuslife7@gmail.com**. We aim to respond within 3–5 business days.

---

## 2. Information we do not collect

We do **not** collect, store, or sell on our own servers:

- Your notes, vault contents, or master password  
- Clinical or health note content you enter  
- Contacts, SMS, call logs, or microphone/camera content (except photos/audio you explicitly attach to notes, stored locally)  

Your encrypted vault exists only on your device unless **you** export or share an encrypted backup file.

We do **not sell** personal or sensitive user data.

---

## 3. Data stored on your device

| Data | Purpose | Encrypted |
|------|---------|-----------|
| Note vault | App functionality | Yes (AES-256-GCM; Argon2id + envelope v1.2.4+) |
| Master password verifier | Unlock vault | Yes (hashed verifier only) |
| Biometric unlock preference | Convenience | Device secure store |
| Trip plans, addresses, GPS logs | Mileage reimbursement | Yes |
| Maps API keys (Pro, optional) | Route planning | SecureStore |
| IAP entitlements | Pro / Template Studio / Template AI access | SecureStore |
| Template AI model weights (Pro, optional) | On-device field suggestions | Local file (not bundled in APK) |
| `.totus` web vault export (optional) | Read-only desktop viewer | Encrypted bundle; user-controlled |
| App settings & audit log | Security & preferences | Yes (audit log encrypted) |

You are responsible for your device passcode, backups, and exported `.enc` files.

---

## 4. Third-party services

### 4.1 App stores

**Google Play** and **Apple App Store** process downloads, updates, and purchases under their own privacy policies.

### 4.2 In-app purchases

Purchases are processed by **Google Play Billing** and **Apple StoreKit**. We receive purchase status and product identifiers **on your device** only. Payment card data is handled by the store. See [Ads & monetization policy](https://totus--notes.web.app/ads-monetization).

### 4.3 Advertising (free tier)

The free tier may show **banner ads** via **Google AdMob**. AdMob may collect device/advertising identifiers and ad interaction data per [Google’s policies](https://support.google.com/admob/answer/6128543). **Pro and paid tiers remove ads.**

You can limit ad personalization in Android Settings → Google → Ads, or iOS Limit Ad Tracking.

### 4.4 Firebase (Google)

| Service | Data | Purpose |
|---------|------|---------|
| Hosting | None from app users | Public policy pages |
| Firestore | Policy version metadata only | In-app “check for updates” |
| Analytics | Screen names, aggregated usage | App improvement — **no note content** |
| Crashlytics | Crash stack traces, device model | Stability — **no note content** |

See [Google Privacy Policy](https://policies.google.com/privacy).

### 4.5 Location and maps (optional)

- **GPS mileage:** Location is collected **only during an active trip** you start, stored **encrypted on device**. Prominent disclosure appears when you enable trip recording.
- **Patient addresses:** Stored encrypted locally for trip planning.
- **Default Trip Planner routing (Pro):** Stop addresses are sent **directly from your device** to [Nominatim](https://nominatim.openstreetmap.org/) (geocoding) and [OSRM](https://router.project-osrm.org/) (driving routes). Totus Life does not receive these requests.
- **Advanced routing (optional):** If you add your own **Google Maps** or **Mapbox** API key under Settings → Advanced, addresses are sent **directly to that provider**. We do not receive them.
- **External maps apps:** Opening Google Maps or Apple Maps sends route data to those apps under their privacy policies.

Denying location permission disables GPS mileage; notes still work.

### 4.6 Template AI (Pro Lifetime, optional)

If you enable **Template AI**, the app downloads a small language model (~240 MB) from Hugging Face to your device. Inference runs **on-device only** via `llama.rn`. Pasted form text you submit for AI assist is **not** sent to Totus Life servers. You must review every suggested field before saving. See [On-device AI documentation](https://github.com/totuslife7-arch/totus-secure-notes/blob/main/docs/ON_DEVICE_AI.md).

### 4.7 Web vault viewer (optional)

You may export a **`.totus` bundle** from Settings for use with the read-only **web vault viewer** at `/vault`. Decryption happens **in your browser only**. We do not receive or host your vault contents. Delete exported bundles when no longer needed.

### 4.8 Google Play Integrity (optional, future)

We may use **Google Play Integrity API** on-device to verify app licensing. Integrity verdicts (e.g. `LICENSED`, `PLAY_RECOGNIZED`) are used locally to protect paid features. We do **not** upload integrity tokens to Totus Life servers.

---

## 5. Prominent disclosures (in-app)

Per Google Play requirements, the app shows runtime permission dialogs **before** accessing:

- **Location** — for GPS trip mileage (with explanation in the Trips tab)  
- **Camera / photos** — for encrypted note attachments  
- **Notifications** — for note reminders  
- **Biometrics** — optional unlock convenience  

Ads and IAP are disclosed in Settings and store listings. See [Permissions policy](https://totus--notes.web.app/permissions).

---

## 6. Encryption and security

Notes use **AES-256-GCM** with **Argon2id** key derivation and envelope encryption (v1.2.4+). We cannot decrypt your vault without your master password. See [Security policy](https://totus--notes.web.app/security).

---

## 7. Export, import, and sharing

When you export a vault or use system share sheets, data leaves the app under **your control**. Exported files remain encrypted unless you decrypt them elsewhere.

**`.totus` bundles** for the web vault viewer contain encrypted notes and templates. Treat them like sensitive backups. The web viewer decrypts locally in your browser and does not upload contents to Totus Life.

---

## 8. Children’s privacy

The app is **not directed at children under 13** (or under 16 in the EEA where applicable). We do not knowingly collect personal information from children. See [Target audience policy](https://totus--notes.web.app/children).

---

## 9. Your rights and data deletion

Because we do not host your notes:

- **Delete local data:** Uninstall the app or clear app storage in device Settings.  
- **Delete exported backups:** Delete `.enc` files you saved elsewhere.  
- **Purchases:** Request refunds through Google Play or Apple; purchase history is retained by the store per their policies.

Full instructions: [Data deletion policy](https://totus--notes.web.app/data-deletion).

---

## 10. Data retention

| Data | Retention |
|------|-----------|
| On-device vault | Until you delete the app or clear data |
| Firebase Analytics/Crashlytics | Per Google retention (typically up to 14 months for analytics) |
| Support emails | As long as needed to resolve your request |
| Store purchase records | Per Google/Apple policies |

---

## 11. International users

Device and store services may process data in other countries per their policies. We do not transfer note content internationally because it stays on your device.

---

## 12. Changes

We update this policy when features change. The “Last updated” date will change. Material changes may also appear in the app Settings → Check for policy updates.

---

## 13. Contact

**Email:** totuslife7@gmail.com  

---

*This document is hosted at a stable public URL for Google Play Console and Apple App Store Connect.*
