# Health App Review — Google Play & Apple App Store

Use this checklist when submitting **Totus Secure Notes** to app review, completing **Google Play Data safety**, **Health apps declaration**, and **Apple privacy nutrition labels**.

**Important:** Totus Secure Notes is a **productivity / encrypted notes tool**, **not** a medical device, diagnostic tool, or HIPAA-certified platform. Do **not** claim HIPAA, PIPEDA, FDA, or Health Canada approval in listings or UI.

---

## App classification

| Question | Answer for reviewers |
|----------|---------------------|
| Is this a medical device? | **No** — personal record-keeping and mileage logging |
| Does it diagnose or treat? | **No** |
| Does it provide clinical decision support? | **No** — templates are user-filled forms; Template AI suggestions require user review |
| Target audience | Adults (healthcare workers, general productivity) — **not directed at children** |
| Sign-in | **Local master password only** — no cloud account |
| No cloud sync of notes | **Yes** — desktop access is manual `.totus` export + read-only web viewer at https://totus--notes.web.app/vault |

---

## Google Play — Health apps declaration

If Play Console prompts for **Health apps** or **Medical** category:

1. **App purpose:** Encrypted local notes, clinical-style templates (user-entered), trip mileage for reimbursement  
2. **Data handling:** Health-related content user may enter stays **on device**; not uploaded to developer servers  
3. **Not a regulated medical device** — productivity tool; user responsible for PHI  
4. **Location:** Optional GPS for **trip mileage only** — declare Location permission; data stays local. Pro driving routes use OpenStreetMap services (Nominatim/OSRM) by default; optional Google/Mapbox keys send addresses directly to those providers  
5. **Ads:** Free tier uses **Google AdMob** banner ads — declare Device IDs / Advertising ID  
6. **IAP:** Pro Monthly (no ads), Pro Lifetime (premium features) — declare Purchase history via Google Play  

See [DATA_SAFETY_GOOGLE_PLAY.md](DATA_SAFETY_GOOGLE_PLAY.md) for Data safety form fields.

---

## Google Play — Data safety form (summary)

| Data type | Collected by developer? | Shared? | Notes |
|-----------|-------------------------|---------|-------|
| Health info / user notes | **No** (local only) | No | User may enter clinical text; stays on device |
| Location | Optional, local | No* | Trip GPS; *Pro default routing sends addresses to Nominatim/OSRM from device; optional Google/Mapbox BYO key |
| Photos (attachments) | Local only | No | User-initiated, encrypted |
| Crash / diagnostics | Yes | Google (Firebase) | No note content |
| Device/ad IDs (ads) | Yes (free tier) | AdMob | Removed on Pro |

Mark: **Data encrypted at rest on device**; **Users can delete data** (uninstall / clear storage).

---

## Apple App Store

### Privacy Nutrition Label

- **Data Not Linked to You:** Most vault content (not collected by developer)  
- **Data Used to Track You:** AdMob identifiers on free tier (declare per AdMob SDK)  
- **Data Linked to You:** Purchase history via Apple (IAP)  

### App Store Connect metadata

- **Category:** Productivity (primary); Medical optional only if emphasizing templates — Productivity is safer  
- **Encryption:** `ITSAppUsesNonExemptEncryption` = false (standard AES in app.json)  
- **HealthKit:** **Not used** — do not enable HealthKit capability  
- **Age rating:** Complete IARC; not for children  

### Review notes (copy-paste)

```
Totus Secure Notes is a local-first encrypted vault. Notes and templates are stored 
only on device. No cloud login. Optional location is for trip mileage logging. 
Free tier shows AdMob banners; Pro removes ads. Not a medical device — productivity 
tool only. Reviewer can use store-review build for Pro features (see STORE_REVIEW_ACCESS.md).
```

---

## Permissions to declare

| Permission | Why | PHI risk |
|------------|-----|----------|
| Location (when in use / background) | GPS trip mileage | Trip stops may include addresses — local encrypted |
| Camera / Photos | Encrypted note attachments | User-initiated |
| Notifications | Note reminders | Title only in notification |
| Biometrics | Optional unlock | Device secure store |

Full detail: [PERMISSIONS.md](PERMISSIONS.md), [LOCATION_AND_ADDRESS_SECURITY.md](LOCATION_AND_ADDRESS_SECURITY.md)

---

## What the developer must still do before release

1. Complete **Google Play Data safety** and **Health apps** questionnaires honestly  
2. Host privacy policy URL (Firebase: `https://totus--notes.web.app/privacy`)  
3. Run `npm run policies:build` and deploy if policy docs changed  
4. Complete **IARC** content rating  
5. Declare **AdMob** and **Firebase** in both stores  
6. Provide reviewer credentials / store-review build if Pro features need testing  
7. **Legal review** before any HIPAA/PIPEDA marketing claims  

---

## Honest disclaimer (for listings and support)

Totus Secure Notes provides **technical safeguards** (encryption, audit log, auto-lock). **Full HIPAA, PIPEDA, or FOIPPA compliance** requires organizational measures: policies, training, BAAs, breach procedures, records retention, and device management — which are the **user's or employer's responsibility**.

See [LEGAL_DISCLAIMER.md](LEGAL_DISCLAIMER.md) and [COMPLIANCE_ROADMAP.md](COMPLIANCE_ROADMAP.md).
