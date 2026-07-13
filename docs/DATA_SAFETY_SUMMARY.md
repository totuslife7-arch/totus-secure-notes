# Data Safety Summary — Totus Secure Notes

**Effective date:** June 20, 2026  
**Last updated:** July 13, 2026  
**App:** Totus Secure Notes · `com.totuslife.TotusSecureNotes`  
**Public URL:** https://totus--notes.web.app/data-safety  
**Contact:** totuslife7@gmail.com

---

## Purpose

This page mirrors the information declared in **Google Play Console → App content → Data safety** and [User Data policy](https://play.google.com/about/privacy-security/user-data/) requirements. Use it alongside the full [Privacy Policy](https://totus--notes.web.app/privacy).

---

## Does the app collect or share data?

**Yes — minimal data** for app functionality, purchases, optional ads, and diagnostics. **Note content is not collected by the developer.**

| Question | Answer |
|----------|--------|
| Data encrypted in transit (where applicable) | Yes (HTTPS for Firebase, stores, AdMob) |
| Users can request data deletion | Yes — [Data deletion policy](https://totus--notes.web.app/data-deletion) |
| Independent security review | No |
| Committed to Play Families / Designed for Families | No — app targets adults/professionals |

---

## Data collected (developer / SDK)

| Data type | Collected | Shared | Purpose | Optional | Encrypted at rest (on device) |
|-----------|-----------|--------|---------|----------|-------------------------------|
| **User-generated notes** | No (local only) | No | — | — | Yes |
| **Health / clinical notes** | No (local only) | No | — | — | Yes |
| **Precise location** | Yes (if user starts GPS trip) | No to Totus servers | Trip mileage | Yes | Yes (local vault) |
| **Approximate location** | Possible via AdMob | Yes (AdMob) | Advertising (free tier) | Yes (use Pro to remove ads) | N/A |
| **Photos / voice memos** | Yes (if user attaches or records) | No | Note attachments | Yes | Yes |
| **Purchase history** | Yes (via Play/Apple) | With store | IAP entitlements | No for paid features | Local entitlement cache |
| **App interactions (ads)** | Yes (AdMob) | Yes (AdMob) | Advertising | Yes | N/A |
| **Device or other IDs** | Yes (AdMob, Firebase) | Yes (Google) | Ads, analytics, crashes | Partially optional | N/A |
| **Crash logs / diagnostics** | Yes (Firebase Crashlytics) | Yes (Google) | App stability | No (can uninstall) | N/A |
| **App activity (screens)** | Yes (Firebase Analytics) | Yes (Google) | Aggregated usage | No (can uninstall) | N/A |
| **On-device AI model** | Yes (if user downloads Template AI) | No to Totus servers | Template field suggestions | Yes (Pro Lifetime) | Local file |
| **Web vault export** | No (user-controlled file) | No | Desktop viewer | Yes | Yes (encrypted bundle) |

---

## Data NOT collected

- Email address or name (unless you email support voluntarily)  
- Contacts, SMS, call logs  
- Browsing history outside the app  
- Financial info (handled by app stores)  
- Cloud upload of vault contents  

---

## Third parties

| Partner | Role |
|---------|------|
| Google Play / Apple App Store | Distribution, billing |
| Google AdMob | Banner ads (free tier) |
| Google Firebase | Hosting, policy metadata, analytics, crashlytics |
| OpenStreetMap (Nominatim / OSRM) | Default Pro trip geocoding and routing (from device) |
| Google Maps / Mapbox (optional, user API key) | Advanced Pro route planning |

We do **not sell** personal or sensitive user data.

---

## Security practices

- Local vault: AES-256-GCM encryption  
- Master password never stored in plaintext  
- Optional auto-lock, clipboard timeout, screenshot blocking  
- See [Security policy](https://totus--notes.web.app/security)

---

## Keeping this accurate

When features change, we update Play Console Data safety, this page, and the Privacy Policy, then redeploy Firebase Hosting.

**Developer checklist:** See `docs/DATA_SAFETY_GOOGLE_PLAY.md` in the repository for Play Console form answers.

**Google Play help:** [Data safety form](https://support.google.com/googleplay/android-developer/answer/10787469) · [App content summary](https://play.google.com/console/app/app-content/summary)

---

**Related:** [Privacy Policy](https://totus--notes.web.app/privacy) · [Permissions](https://totus--notes.web.app/permissions) · [Ads & monetization](https://totus--notes.web.app/ads-monetization)
