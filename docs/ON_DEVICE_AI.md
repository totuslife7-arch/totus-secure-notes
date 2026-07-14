# On-Device AI — Totus Secure Notes

## Hermes vs AI

| Term | Meaning |
|------|---------|
| **Hermes** | JavaScript engine bundled with React Native/Expo. Already in use. Not an AI model. |
| **On-device AI** | Native `llama.rn` + SmolLM2-360M for Template AI and Note Assist. **Requires EAS/dev build — not Expo Go.** |

## Capability matrix (v1.2.13)

| Feature | Where | Tech | Tier |
|---------|-------|------|------|
| Task digest (rules) | Notes list | `services/taskDigest.ts` | Free |
| Task digest AI summary | Notes list | `services/templateAi/taskDigestAi.ts` | Pro Lifetime |
| Template Studio AI assist | Studio paste | SmolLM2 via `llama.rn` | Pro Lifetime |
| Quick parse (rules) | Studio paste | `parsePastedForm` | Free |
| Note Assist (bulletize, shorten, expand, summarize) | Note editor | SmolLM2 via `llama.rn` | Pro Lifetime |
| Template marketplace import | Templates → Library | Curated JSON only (no vault upload) | Free |

**Entitlement:** `hasTemplateAi()` in `services/monetization.ts` — Pro Lifetime, developer unlock (`TOTUS-DEV-2026`), or store-review build.

## Readiness gate

`getTemplateAiReadiness()` in `services/templateAi/generateTemplateDraft.ts` is the single source of truth:

- Entitlement (`hasTemplateAi`)
- Platform support (not Expo Go, native llama available)
- Model bytes on disk (`verifyModelFile()` — size + GGUF header magic; rejects corrupt downloads)
- Llama context init (`getLlamaContext()` / `getLastLlamaInitError()`)

**Entitlement paths:** Pro Lifetime purchase, **Settings → About & Legal** → tap version 7× → `TOTUS-DEV-2026`, or store-review build (`EXPO_PUBLIC_STORE_REVIEW_MODE`).

Stale llama context is released when the model file fails verification so UI cannot show Ready with a broken engine.

`hooks/useTemplateAiReadiness.ts` refreshes on **every screen focus** (`useFocusEffect`). Studio paste and Settings Totus Assist both use this hook.

On failure, `services/templateAi/readinessUi.ts` shows actionable recovery (re-download, dev unlock, EAS build, copy error).

## Shipped features

### Rule-based task digest

`services/taskDigest.ts` summarizes open follow-ups, due reminders, and flagged notes. No network, no model weights.

### Enhanced task digest (optional LLM)

`buildEnhancedTaskDigest()` in `services/templateAi/taskDigestAi.ts` adds a 2–3 sentence on-device summary when AI is entitled and ready. Falls back silently to rules digest.

### Template AI (on-device LLM)

| Piece | Path |
|-------|------|
| Config (SmolLM2-360M Q4_K_M URL, n_ctx, stop words) | `constants/templateAiConfig.ts` |
| Model download / delete | `services/templateAi/modelManager.ts` |
| llama.rn context (native) | `services/templateAi/llamaContext.native.ts` |
| Web stub | `services/templateAi/llamaContext.web.ts` |
| Draft JSON schema + normalize | `services/templateAi/templateDraftSchema.ts`, `normalizeAiDraft.ts` |
| Generate draft (AI → review, rules fallback) | `services/templateAi/generateTemplateDraft.ts` |

**Model:** [SmolLM2-360M-Instruct Q4_K_M](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF) (~240 MB). Downloaded on demand to `documentDirectory/template-ai/`, not bundled in the APK.

**Flow:** Template Studio paste → AI assist (live status: Loading model → Running inference) → review (`source: 'ai'` badge) → save. User must choose Quick parse for rules-only path.

**Android:** `n_gpu_layers: 0` (CPU inference). iOS may use Metal (`n_gpu_layers: 99`).

### Note Assist

`services/templateAi/noteAssist.ts` — short prompts on note content. Rules fallback via `rulesNoteAssist()` when AI blocked.

### Totus AI hub UI

| Piece | Path |
|-------|------|
| Settings hub page | `app/(tabs)/settings/totus-ai.tsx` |
| Hub card + capability manifest + diagnostics | `components/TotusAiHubCard.tsx` |
| Inference diagnostics (last run) | `services/templateAi/inferenceDiagnostics.ts` |
| Contextual chips | `components/TotusAssistChip.tsx` |
| Post-download onboarding | `components/AiOnboardingSheet.tsx` |

### Web vault viewer (no llama, no IAP)

Export `.totus` bundle from Settings → open at `/vault` on web. Decryption uses `@noble/ciphers` in `services/vaultCrypto.web.ts`.

## Planned

### Phase B — On-device speech-to-text

Options: `expo-speech-recognition`, Whisper.cpp. Voice dictation into note editor; explicit consent; local-only audio.

### Phase 4+ — Local embeddings search, multi-turn template chat

See `docs/MASTER_GUI_ARCHITECT_PROMPT.md` and the Master AI Architect plan for roadmap detail.

## Store and compliance

- Do not claim AI provides medical advice or clinical decisions
- Position AI as **productivity assistance** (field suggestions, formatting, dictation)
- On-device only aligns with local-first encryption goals (no cloud PHI from AI)
- User must review all AI output before saving or copying to EMR

## Integration points

- Template AI: `app/(tabs)/templates/studio/paste.tsx`, `review.tsx`
- Note Assist: `app/note/[id].tsx`
- Model + hub: Settings → Totus Assist (`totus-ai.tsx`)
- Future STT: `ThemedTextInput` in note editor

## Physical device test plan

1. EAS `store-review` or dev APK on device (not Expo Go)
2. Settings → About → tap version 7× → `TOTUS-DEV-2026`
3. Settings → Totus Assist → download model (~240 MB Wi‑Fi)
4. Template Studio → paste form → AI assist → review shows AI badge → save template
5. Note editor → Note Assist → verify on-device edit
6. Attach photo → confirm system picker flow; secure delete attachment

Build: `eas build --profile store-review --platform android`
