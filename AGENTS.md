# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Project: Totus Secure Notes (v1.2.11)

**Expo SDK 56** · **Package:** `com.totuslife.TotusSecureNotes` · **EAS owner:** `totuslife` · **Android versionCode:** 40

### Architecture

- Local-first encrypted vault (`services/storage.ts`, `services/sessionCrypto.ts`, AES-256-GCM)
- No cloud backend; notes and trips encrypted on device
- `VaultContext` for session state (serialized save queue via `persistChainRef`); `ThemeContext` for light/dark/system UI
- Web vault viewer (`app/vault/`, `services/vaultCrypto.web.ts`) — read-only browser decryption of `.totus` export at https://totus--notes.web.app/vault

### Key features (v1.2.10)

| Area | Paths |
|------|--------|
| Notes editor + Note Assist | `app/note/[id].tsx`, `services/templateAi/noteAssist.ts` |
| Postpartum template (manual weight fields) | `components/templates/PostpartumForm.tsx` |
| Built-in templates | `store/builtinTemplates/`, `app/(tabs)/templates/builtin/` |
| Template marketplace (curated) | `app/(tabs)/templates/marketplace.tsx`, `services/templateMarketplace.ts` |
| Trip / mileage planner | `components/TripPlannerScreen.tsx`, `app/(tabs)/trips/`, `services/trip/` |
| Security + secure attachments | `services/attachments.ts`, `services/secureDelete.ts`, `components/AttachmentViewer.tsx` |
| Monetization + Template Studio | `services/monetization.ts`, `context/MonetizationContext.tsx`, `store/products.json`, `app/(tabs)/templates/studio/` |
| Totus AI hub + readiness | `app/(tabs)/settings/totus-ai.tsx`, `hooks/useTemplateAiReadiness.ts`, `services/templateAi/generateTemplateDraft.ts` |
| Template AI (on-device LLM) | `services/templateAi/`, `constants/templateAiConfig.ts` |
| Local reminders | `services/reminderSync.ts`, `services/notifications.ts` |
| Plexia / EMR copy | `utils/formatEmrExport.ts`, template form copy actions |
| Desktop sync (manual) | Settings → Sync to desktop; `constants/vaultWebUrl.ts`; `shareFullVaultBundle` |
| Web vault viewer | `app/vault/`, `services/vaultBundle.ts`, `services/webVaultSession.ts` |

### Monetization tiers

- **Free:** ads + core features (notes, postpartum, basic trips, built-in template preview)
- **Pro Monthly (`pro_monthly`):** no ads
- **Pro Lifetime (`pro_lifetime`):** no ads + Trip Planner Pro + Template Studio + Template AI + Note Assist + premium templates

### Trip planner tiers

- **Free:** GPS trip recording, stop list (up to 50), Open in Maps, straight-line estimate
- **Pro Lifetime (`trip_planner` entitlement):** driving route km (OSRM/Nominatim, no API key), in-app OSM map preview, external Google/Apple Maps

### Native modules requiring dev client / EAS build

`expo-location`, `expo-task-manager`, `react-native-maps`, `expo-notifications`, `expo-image-picker`, `expo-screen-capture`, `llama.rn` (Template AI — **not available in Expo Go**)

### Docs

Store/legal: `docs/` · User guide: `docs/USER_GUIDE.md` · Architecture: `docs/MEMORY.md` · Session history: `docs/AGENT_MEMORY.md` · Changelog: `CHANGELOG.md`

### Compliance

Do **not** claim HIPAA/FDA certification in store listings. Position as productivity tool with user responsibility for PHI.

### GitHub

https://github.com/totuslife7-arch/totus-secure-notes
