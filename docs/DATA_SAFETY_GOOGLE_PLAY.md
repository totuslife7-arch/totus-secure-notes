# Google Play — Data Safety & Store Declarations (Totus Secure Notes)

Use this when filling out **Google Play Console → App content → Data safety** for **Totus Secure Notes**.

## App summary for reviewers

| Question | Answer |
|----------|--------|
| App name | **Totus Secure Notes** |
| Does your app collect or share user data? | **Yes** (minimal; see below) |
| Is all user data encrypted in transit? | N/A for notes (local-only); **Yes** for store/IAP/ads HTTPS |
| Can users request data deletion? | **Yes** — uninstall app / clear app data; no server-side note storage |

---

## Data types — current release (v1.2.12)

| Data type | Collected by developer? | Shared? | Purpose | Required? |
|-----------|-------------------------|---------|---------|-----------|
| User-generated notes | No (local only) | No | — | — |
| Patient addresses (trip planner) | No (local encrypted) | No | Mileage on device | Optional |
| GPS trip track points | No (local encrypted) | No | Mileage on device | Optional |
| Passwords | No (verifier on device only) | No | — | — |
| Name, email | No | No | — | — |
| Photos / voice memos | No (local encrypted attachments) | No | Note attachments | Optional |
| Crash logs | Yes (Firebase Crashlytics) | Google | App stability | No |
| Diagnostics | Yes (Firebase Analytics — screens only) | Google | App functionality | No |

**Play Console selection (v1.2.0+ with ads + IAP):**

- **Location:** User may grant location for GPS mileage. Data stays **on device**; not transmitted to Totus Life servers. If using Pro route planning with your own Google/Mapbox key, addresses are sent **directly to that provider** (declare third-party processing in Data safety if required).
- **Ads (free tier):** Declare device/advertising IDs collected by **Google AdMob** for banner ads.
- **Purchases:** Google Play processes IAP; we store entitlement flags locally only.

- **Microphone (optional):** Used only when you record a **voice memo** in the note editor. Audio is encrypted and stored on device; not sent to Totus servers. Declare under **Photos and videos** or **Audio files** in Data safety if prompted — collected only when user initiates recording.

When **Pro maps API** is used, also declare:

| Data type | Collected | Shared with | Purpose |
|-----------|-----------|-------------|---------|
| Approximate location / addresses | User-entered | Google or Mapbox (user's API key) | Route planning |

---

## Data types — ads + IAP (v1.2.0+)

When AdMob and billing are enabled, declare:

| Data type | Collected | Shared with | Purpose |
|-----------|-----------|-------------|---------|
| Device or other IDs | Yes | AdMob | Advertising |
| App interactions (ad views/clicks) | Yes | AdMob | Advertising |
| Purchase history | Yes | Google Play | App functionality |
| User IDs (Play Games, if enabled) | Optional | Google | Account / achievements |

Mark data as **encrypted in transit** where applicable. Note content is **not** collected by the developer.

---

## Security practices

- Data is encrypted on the device (AES-256-GCM; Argon2id key derivation + envelope encryption v1.2.4+)  
- Local encrypted audit log of security events (unlock, export, clipboard, etc.)  
- Users can delete all app data by uninstalling or clearing storage  
- No developer-operated note database  

---

## Privacy policy URL

Required before production release:

```
https://github.com/totuslife7-arch/totus-secure-notes/blob/main/docs/PRIVACY_POLICY.md
```

(Or host on a custom domain / GitHub Pages for a cleaner URL.)

---

## Target audience & content rating

- Complete **IARC questionnaire** in Play Console  
- App category: **Productivity** or **Medical** (if emphasizing clinical templates — Productivity is safer if general notes)  
- No user-generated public content → lower UGC risk  

---

## Permissions (Android)

Declared via Expo / manifest:

| Permission | Why |
|------------|-----|
| Biometric / fingerprint | Optional unlock |
| Location (foreground + background) | Optional GPS trip mileage recording |
| Camera / photos | Optional encrypted note attachments |
| Notifications | Optional note reminders |
| Internet | Maps API (Pro, user key), future ads/IAP |
| Billing | In-app purchases (when enabled) |

---

## Families / Designed for Families

If targeting children: stricter ad and data rules apply. **Recommended:** Not designed for children under 13 (see Privacy Policy).

---

## Google Play programs checklist

| Program | Relevant? | Notes |
|---------|-----------|-------|
| Play Billing | **Yes** | Pro, subscriptions, one-time |
| AdMob | **Yes** | Free tier ads |
| Play Games Services | **Optional** | Achievements/cloud save — atypical for notes app |
| Play Pass | Future | If accepted into subscription catalog |
| Internal / closed / open testing | **Yes** | Use before production |
| Promotional content / promo codes | **Yes** | Configure in Play Console |

---

## Contact for Play listing

- **Developer email:** totuslife7@gmail.com  
- **Website:** GitHub repo or future landing page  
