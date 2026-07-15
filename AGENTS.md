# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Project: Totus Secure Notes (v1.2.14)

**Expo SDK 56** · **Package:** `com.totuslife.TotusSecureNotes` · **EAS owner:** `totuslife` · **Android versionCode:** 56

### Architecture

- Local-first encrypted vault (`services/storage.ts`, `services/sessionCrypto.ts`, AES-256-GCM)
- No cloud backend; notes and trips encrypted on device
- `VaultContext` for session state (serialized save queue via `persistChainRef`); `ThemeContext` for light/dark/system UI
- Web vault viewer (`app/vault/`, `services/vaultCrypto.web.ts`) — read-only browser decryption of `.totus` export at https://totus--notes.web.app/vault
- Firebase client configs gitignored; EAS file secrets + `scripts/inject-firebase-config.mjs` for cloud builds

### Key features (v1.2.14)

| Area | Paths |
|------|--------|
| Home + SoFo quick action | `app/(tabs)/home/index.tsx` |
| SoFo Postpartum HV template | `components/templates/PostpartumForm.tsx`, `store/postpartumTemplate.ts` |
| Notes editor + voice memos | `app/note/[id].tsx`, `components/VoiceMemoRecorder.tsx`, `services/attachments.ts` |
| Note Assist | `services/templateAi/noteAssist.ts` |
| About & Legal + dev unlock | `app/(tabs)/settings/about.tsx`, `services/devUnlock.ts` |
| Totus AI hub + readiness | `app/(tabs)/settings/totus-ai.tsx`, `hooks/useTemplateAiReadiness.ts`, `services/templateAi/modelManager.ts` |
| Trip / mileage planner | `components/TripPlannerScreen.tsx`, `app/(tabs)/trips/`, `services/trip/` |
| Monetization + Template Studio | `services/monetization.ts`, `app/(tabs)/templates/studio/` |
| Policy links (hosted) | `constants/policyUrls.ts` → https://totus--notes.web.app/* |

### Monetization tiers

- **Free:** ads + core features (notes, SoFo postpartum, basic trips, built-in template preview)
- **Pro Monthly (`pro_monthly`):** no ads
- **Pro Lifetime (`pro_lifetime`):** no ads + Trip Planner Pro + Template Studio + Template AI + Note Assist + premium templates

### Trip planner tiers

- **Free:** GPS trip recording, stop list (up to 50), Open in Maps, straight-line estimate
- **Pro Lifetime (`trip_planner` entitlement):** driving route km (OSRM/Nominatim), in-app OSM map preview, external Google/Apple Maps

### Native modules requiring dev client / EAS build

`expo-location`, `expo-task-manager`, `react-native-maps`, `expo-notifications`, `expo-image-picker`, `expo-screen-capture`, `expo-audio`, `llama.rn` (Template AI — **not available in Expo Go**)

### Docs

Store/legal: `docs/` · User guide: `docs/USER_GUIDE.md` · Navigation map: `docs/UI_NAVIGATION_TREE.md` · Changelog: `CHANGELOG.md` · Release notes: `store/RELEASE_NOTES.md`

### Compliance

Do **not** claim HIPAA/FDA certification in store listings. Position as productivity tool with user responsibility for PHI.

### GitHub

https://github.com/totuslife7-arch/totus-secure-notes
