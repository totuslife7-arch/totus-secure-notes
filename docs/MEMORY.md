# Totus Secure Notes — Architecture Memory

## Overview

Totus Secure Notes is an Expo SDK 56 React Native app that stores encrypted notes locally. There is no cloud backend. The vault is a single encrypted JSON file on device.

## Data flow

```
UI (Editor, NoteList, Settings)
  → VaultContext (session state, save queue)
  → storage.ts (vault read/write)
  → sessionCrypto.ts (cached PBKDF2 key per unlock)
  → encryption.ts (AES-256-GCM, PBKDF2 100k iterations)
  → FileSystem documentDirectory/vault/notes.enc
```

## Vault schema (v2)

```typescript
interface VaultData {
  v: 2;
  notes: Note[];
}

interface Note {
  id, title, content, templateId?, createdAt, updatedAt,
  isFlagged?, reminderAt?, extraNotes?, attachments?,
  notePasswordEnabled?, followUpStatus?: 'open' | 'done'
}
```

Legacy vaults without `v` are normalized to v2 on load.

## Session crypto

On unlock, `primeSessionVaultCrypto` derives the vault key once from the encrypted payload salt. Subsequent saves reuse the cached key via `encryptVaultJson` / `decryptVaultJson`, avoiding PBKDF2 on every autosave.

## Attachments

Binary files are encrypted with the session vault key and stored under `vault/attachments/`. Temp camera/picker files are deleted after import.

## Security features

| Feature | Location |
|---------|----------|
| Master password + biometrics | `AuthGate`, `biometrics.ts` |
| Auto-lock on background | `VaultContext`, `securitySettings.ts` |
| Audit log (local encrypted) | `auditLog.ts` |
| Clipboard timeout | `export.ts` |
| Screenshot block when unlocked | Settings + `expo-screen-capture` |
| Reminders | `notifications.ts` + `expo-notifications` |

## Theme system

`ThemeContext` persists light/dark/system in SecureStore. `ThemedTextInput` sets explicit text, placeholder, and background colors to fix invisible text in dark mode.

## Task digest (no LLM)

`taskDigest.ts` builds rule-based summaries: open follow-ups, due reminders, flagged notes. Shown on the notes list.

## On-device AI (Template AI)

See [ON_DEVICE_AI.md](./ON_DEVICE_AI.md). SmolLM2-360M via `llama.rn` suggests template fields from pasted text. Pro Lifetime entitlement. Rules fallback when model unavailable. **Requires EAS build — not Expo Go.**

## Template Studio & built-in templates

| Piece | Path |
|-------|------|
| Custom templates (paste → review → save) | `app/(tabs)/templates/studio/` |
| Built-in clinical templates | `store/builtinTemplates/`, `app/(tabs)/templates/builtin/` |
| Plexia / EMR copy format | `utils/formatEmrExport.ts` |
| Custom template storage | `services/templateStudio/templateStorage.ts` |

## Web vault viewer

Read-only browser viewer for `.totus` export bundles. No IAP, no llama, no cloud upload.

| Piece | Path |
|-------|------|
| Import + unlock UI | `app/vault/index.tsx` |
| Notes / templates list | `app/vault/notes.tsx`, `templates.tsx` |
| Browser decryption | `services/vaultCrypto.web.ts` |
| Bundle format | `services/vaultBundle.ts` |
| Web vault URL | `constants/vaultWebUrl.ts` |
| Session state | `context/WebVaultContext.tsx`, `services/webVaultSession.ts` |

Deploy via `npm run vault:prepare` then `npm run firebase:deploy`. Hosted at **https://totus--notes.web.app/vault**. In-app: Settings → **Sync to desktop** (export `.totus` + open web vault link). Not live sync — manual encrypted export only.

## Trip planner

Encrypted trip plans under `vault/trips.enc`. GPS recorder in `services/trip/gpsTripRecorder.ts`. Default routing: Nominatim + OSRM (`services/trip/providers/osrmProvider.ts`); optional Google/Mapbox in Advanced settings.

## Key paths

| Path | Purpose |
|------|---------|
| `app/note/[id].tsx` | Note editor |
| `components/templates/PostpartumForm.tsx` | Postpartum template (manual weight fields) |
| `components/TripPlannerScreen.tsx` | Mileage / trip UI |
| `context/VaultContext.tsx` | Vault state |
| `services/storage.ts` | Vault I/O |
| `services/trip/tripStorage.ts` | Encrypted trips |

## Compliance note

Technical safeguards toward PIPEDA/HIPAA/FOIP are documented in [COMPLIANCE_ROADMAP.md](./COMPLIANCE_ROADMAP.md). The app does **not** claim legal certification.

## Postpartum weight fields (v1.2.2+)

Manual entry only — BW, last visit date, previous weight, visit date, today's weight. Copy output lists raw values; no automatic WL%, WG, or gain calculations. Legacy `utils/newbornWeightCalc.ts` remains in repo but is unused.

## Monetization (v1.2.3)

- **Free:** ads + core features
- **Pro Monthly (`pro_monthly`):** no ads
- **Pro Lifetime (`pro_lifetime`):** all premium (Trip Planner Pro, Template Studio, Template AI, premium templates)
- AdMob banner when ads enabled; `expo-iap` for entitlements
- See [MONETIZATION_AND_INTEGRATIONS.md](./MONETIZATION_AND_INTEGRATIONS.md) and [AGENT_MEMORY.md](./AGENT_MEMORY.md)

## Session history

For dated milestones and release context, see [AGENT_MEMORY.md](./AGENT_MEMORY.md).
