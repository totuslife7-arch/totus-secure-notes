# Security — Totus Secure Notes

**Effective date:** June 20, 2026  
**Last updated:** July 11, 2026  
**App:** Totus Secure Notes · `com.totuslife.TotusSecureNotes`  
**Public URL:** https://totus--notes.web.app/security  
**Contact:** totuslife7@gmail.com

---

## Summary

Totus Secure Notes is designed as a **local-first encrypted vault**. This Security Policy describes **technical safeguards**. The app is a **productivity tool**, not a certified medical device or HIPAA/PIPEDA-certified platform.

---

## 1. Three-layer encryption (v1.2.4+)

| Layer | Method | Implementation |
|-------|--------|----------------|
| **1 — Key derivation** | Argon2id (memory-hard KDF) | `@noble/hashes/argon2.js` — new vaults and saves after unlock |
| **2 — Hardware key wrap** | Session DEK in Secure Enclave / Android Keystore | `expo-secure-store` via `services/keyWrap.ts` — DEK not kept plaintext in app storage |
| **3 — Envelope + integrity** | Per-vault random DEK, AES-256-GCM, HMAC on `.totus` exports | `services/encryption.ts`, `services/vaultBundle.ts` |

### Legacy migration

Vaults created before v1.2.4 use **PBKDF2** (100,000 iterations) with direct key encryption (`EncryptedPayload` v1). These vaults **decrypt normally**. On the next save (or password change), data is re-encrypted with **Argon2id + envelope** (`EncryptedPayload` v2).

KDF parameters (salt, Argon2 `t`/`m`/`p`) are stored in the encrypted payload metadata.

### Web vault viewer

The read-only browser path at `/vault` uses **password-only** envelope decryption. Hardware key wrap (Layer 2) is not available on web — this is expected.

#### What the web vault protects

- `.totus` bundles remain encrypted in transit (HTTPS) until you import them locally
- Decryption runs **only in your browser** — Totus servers do not receive vault contents or your master password
- Decrypted data is kept **in memory only** (not written to localStorage, sessionStorage, IndexedDB, or URL parameters)
- Session scrubs on **Lock now**, idle timeout (5 minutes), tab hide, and page unload
- Firebase Hosting serves `/vault/**` with `Cache-Control: no-store` and a baseline Content-Security-Policy

#### What the web vault cannot protect

- **Malware, browser extensions, or compromised OS** that read screen, memory, or clipboard
- **Screen capture** or shoulder-surfing on shared displays
- **Clipboard exposure** — copied text is visible to the OS until cleared (auto-clear after ~60s on web)
- **Browser memory** until you lock or close the tab — we cannot zeroize all JS heap pages
- **Shared or public computers** — do not use the web vault there

#### Recommended use

- **Firefox or DuckDuck Go private/incognito window** on desktop; close the tab when finished
- On Android, the app can try to open DuckDuck Go via intent when installed; desktop and iOS cannot be forced into a specific browser or private mode
- Treat `.totus` exports like sensitive backups; do not leave them on unsecured drives

This viewer is a **productivity tool**, not HIPAA/PIPEDA-certified infrastructure.

---

## 2. Encryption details

| Component | Method |
|-----------|--------|
| Vault file | AES-256-GCM |
| Key derivation (new) | Argon2id (default: t=3, m=16384 KiB, p=1) |
| Key derivation (legacy) | PBKDF2-SHA256 (100,000 iterations) |
| Session | Derived keys zeroized on lock (`utils/zeroize.ts`) |
| Attachments | Encrypted with vault session DEK |
| Trip data | Separate encrypted store (`trips.enc`) |
| `.totus` bundle export | HMAC-SHA256 integrity tag (tamper detection) |

We **cannot** recover your master password or decrypt your vault.

---

## 3. Authentication

- Master password (strong policy: 12+ chars, mixed case, number, symbol)  
- Optional **biometric unlock** (device Keychain / Keystore)  
- Auto-lock after configurable idle time  
- Local **audit log** (encrypted) of security events — unlock/lock, export, clipboard, templates, biometrics, failed attempts  

---

## 4. Device protections

- Optional **screenshot blocking** while vault unlocked (`expo-screen-capture`)  
- **Clipboard timeout** for copied note text  
- No cloud sync of plaintext notes  

---

## 5. Template AI (Pro Lifetime)

- Model weights downloaded on demand; inference on-device via `llama.rn`  
- No vault content uploaded for AI suggestions  
- User must review all AI-suggested fields before save  

## 6. Web vault export (desktop access)

- Settings → **Sync to desktop** — manual export workflow; **not live cloud sync**
- `.totus` bundles are encrypted; decryption in browser only at **https://totus--notes.web.app/vault**
- v2 bundles include HMAC integrity — tampered files are rejected
- Read-only viewer; no server-side vault storage
- In-memory session scrub on lock, idle, tab hide, and unload — see **Web vault viewer** above for limitations
- Treat exports like sensitive backups

## 7. Distribution integrity

Production builds are distributed via **Google Play** (AAB) and signed with our upload key registered in Play App Signing. We may verify install source using **Google Play Integrity API** to reduce piracy and protect IAP.

We do not operate a backend that stores these tokens linked to your notes.

---

## 8. Third-party SDK security

SDKs (Firebase, AdMob, expo-iap, maps) are chosen from reputable providers and configured to **minimize data collection**. See [Privacy Policy](https://totus--notes.web.app/privacy) and [Data safety summary](https://totus--notes.web.app/data-safety).

---

## 9. Export and backup risk

Encrypted exports (`.enc`, `.totus`) are only as secure as where you store them. Protect backup files like passwords.

---

## 10. Reporting vulnerabilities

Email **totuslife7@gmail.com** with subject “Security report — Totus Secure Notes”. We appreciate responsible disclosure.

---

## 11. Limitations

No system is 100% secure. You are responsible for device security, password choice, and compliance with workplace policies (e.g. PHI handling).

**Organizational compliance** (HIPAA BAA, PIPEDA accountability programs, FOIPPA records management) requires policies, training, and legal review beyond what any app alone can provide.

---

**Related:** [Privacy Policy](https://totus--notes.web.app/privacy) · [Compliance roadmap](COMPLIANCE_ROADMAP.md) · [Health app review prep](HEALTH_APP_REVIEW.md) · [Permissions](https://totus--notes.web.app/permissions)
