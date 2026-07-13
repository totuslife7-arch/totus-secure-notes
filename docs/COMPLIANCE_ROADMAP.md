# Compliance Roadmap — Totus Secure Notes (Technical Safeguards)

Totus Secure Notes is a **local productivity tool**. This document maps **technical measures** to common privacy and health-data safeguard expectations — **not legal certification**. Consult qualified counsel before marketing HIPAA, PIPEDA, or FOIPPA compliance.

## Current safeguards (v1.2.8)

| Control | Status | Implementation |
|---------|--------|----------------|
| Argon2id key derivation | Shipped | `services/encryption.ts` — Layer 1 |
| Hardware session DEK wrap | Shipped | `services/keyWrap.ts` — Layer 2 (native) |
| Envelope encryption + HMAC exports | Shipped | `EncryptedPayload` v2, `services/vaultBundle.ts` — Layer 3 |
| Legacy PBKDF2 decrypt + auto-upgrade | Shipped | v1 payloads decrypt; v2 on next save |
| Encryption at rest | Shipped | AES-256-GCM |
| No cloud PHI | Shipped | All note data on device |
| Master password | Shipped | SecureStore verifier + salted hash |
| Biometric unlock (optional) | Shipped | Device keychain via expo-local-authentication |
| Auto-lock | Shipped | Configurable 1/5/15 min background lock |
| Audit log | Shipped | Local encrypted log; export/clear/retention in Settings |
| Clipboard timeout | Shipped | Clears copied template text after N seconds |
| Screenshot block | Shipped | When vault unlocked (platform support varies) |
| Encrypted attachments | Shipped | Session vault DEK |
| Export/import | Shipped | User-controlled encrypted backup |

---

## PIPEDA (Canada) — technical alignment

| Principle | App provides | User / organization responsibility |
|-----------|--------------|-----------------------------------|
| Accountability | Local-only storage; encrypted audit log | Workplace policies for PHI on personal devices |
| Identifying purposes | Privacy policy; no account signup | Decide whether app is appropriate for patient data |
| Consent | User chooses what to store | Obtain patient consent where required |
| Limiting collection | No analytics on note content; minimal Firebase | Do not store unnecessary identifiers |
| Limiting use/disclosure | No cloud transmission of vault | Control exports, clipboard, backups |
| Accuracy | User edits own records | Verify clinical accuracy |
| Safeguards | 3-layer encryption, auto-lock, audit log | Device passcode, MDM, lost-device procedures |
| Openness | Hosted policies at totus--notes.web.app | Provide patients access per org policy |
| Individual access | Export vault / audit log | Respond to access requests per org policy |
| Challenging compliance | totuslife7@gmail.com | Internal privacy officer processes |

**Do not** claim “PIPEDA certified” in store listings.

---

## FOIPPA (British Columbia) — public sector context

If BC public bodies or contractors use the app:

| Topic | App provides | Organization responsibility |
|-------|--------------|----------------------------|
| Local storage | Encrypted on personal/mobile device | Records retention schedule; whether personal devices are permitted |
| Access logging | Local audit log | FOIPPA access-to-information procedures |
| Security | Technical safeguards above | Risk assessment, breach notification, device management |
| Disclosure | No automatic disclosure | Lawful disclosure decisions |

Alberta FOIP and other provincial access laws follow similar patterns — **device-local storage shifts records-management burden to the organization**.

---

## HIPAA Security Rule (US) — technical alignment only

The app is **not** a covered entity and does **not** offer a BAA. Technical measures that align with common **§164.312** expectations:

| Safeguard | App provides | Requires BAA / org measures |
|-----------|--------------|----------------------------|
| Access control (§164.312(a)) | Master password, biometrics, auto-lock | Workforce authorization policies |
| Audit controls (§164.312(b)) | Local encrypted audit log | Central SIEM, retention policies |
| Integrity (§164.312(c)) | AES-GCM auth tags, bundle HMAC | — |
| Person/entity authentication | Master password / biometrics | — |
| Transmission security | N/A (no PHI transmission by default) | Secure channels if user exports/shares |
| Administrative safeguards | — | Policies, training, risk analysis |
| Physical safeguards | — | Facility/device controls |
| Organizational requirements | — | BAAs with vendors if applicable |

**Do not** claim “HIPAA compliant” without legal review and organizational controls.

---

## Audit log events (local, encrypted)

`vault_unlock`, `vault_lock`, `vault_unlock_failed`, `vault_export`, `vault_bundle_export`, `vault_import`, `note_save`, `note_delete`, `clipboard_copy`, `template_save`, `auto_lock`, `biometric_success`, `biometric_fail`, `policy_view`

Retention: configurable cap (default 500 entries). User can export or clear in Settings.

---

## Roadmap (not legal certification)

1. Optional per-note passphrase (field exists; full key isolation TBD)
2. Secure delete verification for attachments
3. Export redaction tools
4. Organization policy templates for healthcare employers
5. Independent security assessment before enterprise claims

---

## Store listing guidance

- Position as encrypted **personal notes / productivity**
- State that users are responsible for PHI they choose to store
- Link privacy policy URL required by Google Play / App Store
- Do not claim FDA, Health Canada, HIPAA, or PIPEDA certification
- See [HEALTH_APP_REVIEW.md](HEALTH_APP_REVIEW.md) for Play/App Store health declarations
