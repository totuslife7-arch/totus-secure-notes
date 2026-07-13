# Location & Address Security — Totus Secure Notes

**Effective date:** July 1, 2026  
**App:** Totus Secure Notes · `com.totuslife.TotusSecureNotes`  
**Contact:** totuslife7@gmail.com

---

## Summary

Totus Secure Notes stores **patient addresses, trip stops, and GPS mileage on your device only**. Data is encrypted with your vault master password. Optional map routing sends geocoding requests **directly** to Google Maps or Mapbox using **your own API key** — not through Totus servers.

We document **defense in depth**, not absolute guarantees. If a device is compromised (root/jailbreak, malware, unlocked phone left unattended), any local app data could be targeted.

---

## What stays on your device

| Data | Storage | Encryption |
|------|---------|------------|
| Notes (including postpartum addresses) | Local vault file | AES-256-GCM via session crypto |
| Trip stops and daily trip logs | `trips.enc` (encrypted blob) | Same vault password |
| GPS track points during active recording | In-memory buffer until saved to trip | Cleared on vault lock |
| Google/Mapbox API keys | Expo SecureStore | OS-protected keychain |
| Master password | Never stored plaintext | PBKDF2-derived keys only in session |

**No cloud PHI upload:** Totus does not operate a backend that receives note bodies, addresses, or GPS tracks.

---

## Optional external services (user-controlled)

| Feature | What leaves the device | Where it goes |
|---------|------------------------|---------------|
| Driving route planning (Pro Lifetime) | Stop addresses or coordinates | **Your** Google or Mapbox account (BYO API key) |
| Open in Maps | Address string | External Maps app (Google/Apple) — visible while navigating |
| AdMob (free tier) | Device/ad IDs, ad interaction | Google AdMob |
| Firebase Analytics/Crashlytics | Anonymous usage/crash events | Firebase (no note content) |
| Policy updates check | Policy document metadata | Firestore read-only `policies/*` |

Geocoding and routing never pass through Totus-owned servers.

---

## Recommended practices for clinicians

1. **Strong master password** — 12+ characters; use the in-app password policy hints.
2. **Enable biometrics** — faster unlock without weakening the password.
3. **Auto-lock** — set 1–5 minutes in Settings.
4. **Screenshot block** — keep enabled when documenting sensitive visits.
5. **Clipboard timeout** — limits how long copied note text stays on the system clipboard.
6. **Do not export the vault** to unsecured cloud folders or email without encryption.
7. **Lock the vault** before handing the phone to others.
8. **Open in Maps** — address is visible in the external navigation app; close Maps when done.

---

## Play Console / store declarations

- **Location permission:** Optional; used for GPS trip mileage during an active visit day.
- **Data collection:** Location and addresses are **on-device**, encrypted, not sold or shared with Totus.
- **Data safety:** Align with [DATA_SAFETY_GOOGLE_PLAY.md](./DATA_SAFETY_GOOGLE_PLAY.md) and hosted [Data safety](https://totus--notes.web.app/data-safety) page.

---

## Technical references

- Vault encryption: `services/storage.ts`, `services/sessionCrypto.ts`
- Trip storage: `services/trip/tripStorage.ts`
- Maps API keys: `services/trip/mapsSettings.ts`
- GPS buffer cleared on lock: `context/VaultContext.tsx` → `discardGpsBuffer()` in `services/trip/gpsTripRecorder.ts`
- Postpartum “Include in today’s trip” — address added to encrypted trip only; no analytics logging of address text

---

## What we cannot promise

- Protection against a fully compromised operating system
- Recovery if the master password is lost (by design — zero-knowledge local encryption)
- Control over third-party Maps or AdMob data practices (see their privacy policies)

---

**Related:** [SECURITY.md](./SECURITY.md) · [PERMISSIONS.md](./PERMISSIONS.md) · [PRIVACY_POLICY.md](./PRIVACY_POLICY.md)
