# Master Production Engine Prompt — Totus Secure Notes

**How to use:** Copy everything below the horizontal rule into a **new Cursor agent session** with full repo access and **Multitask Mode ON**. Launch four parallel workers (Agents 1–4), then integrate and run `npx tsc --noEmit`.

**Companion prompts:**
- [`MASTER_SOFO_PRODUCTION_RESCUE_PROMPT.md`](./MASTER_SOFO_PRODUCTION_RESCUE_PROMPT.md) — SoFo clinical workflow, crown-jewel template
- [`MASTER_DEVELOPMENT_AUDIT_PROMPT.md`](./MASTER_DEVELOPMENT_AUDIT_PROMPT.md) — IAP, builds, audit matrix
- [`MASTER_GUI_ARCHITECT_PROMPT.md`](./MASTER_GUI_ARCHITECT_PROMPT.md) — design system, Home tab, IA
- [`ON_DEVICE_AI.md`](./ON_DEVICE_AI.md) — SmolLM2, entitlement gates

---

## ROLE

You are a **principal product engineer** running the **Multi-Agent Production Engine** for **Totus Secure Notes** (Expo SDK 56, `com.totuslife.TotusSecureNotes`).

**Additive only — no destructive changes.** Do not remove routes, rename shipped templates, or break vault crypto paths.

Read [Expo SDK 56 docs](https://docs.expo.dev/versions/v56.0.0/) before native changes.

---

## ORCHESTRATION

| Agent | Ownership | Deliverable |
|-------|-----------|-------------|
| **Agent 1** | UI / IA | `docs/UI_NAVIGATION_TREE.md` + ScreenHeader polish |
| **Agent 2** | Save / vault | Note editor save reliability + error boundary |
| **Agent 3** | Entitlement / AI | Real readiness gating (no “downloaded but broken” loop) |
| **Agent 4** | Voice attachments | Encrypted voice memos in note editor (`expo-audio`) |
| **Parent** | Integration | Docs, `tsc`, deliverables summary |

Launch Agents 1–4 **in parallel**. Parent merges, documents in [`PRODUCTION_ENGINE_DELIVERABLES.md`](./PRODUCTION_ENGINE_DELIVERABLES.md), runs `npx tsc --noEmit`.

---

## AGENT 1 — UI Navigation Tree Map

**Goal:** Map every screen, tab, settings toggle, and About item. Verify About lives at `app/(tabs)/settings/about.tsx`.

**Tasks:**
1. Create `docs/UI_NAVIGATION_TREE.md` with full route tree (tabs, stacks, modals, deep links).
2. Verify Settings hub cards link to About (`/settings/about`) and Totus Assist (`/settings/totus-ai`).
3. Polish: reuse `components/ui/ScreenHeader.tsx` where headers are inconsistent (About ✓, Totus Assist, optional Settings hub).
4. **Do NOT** break existing routes or rename paths.

**Acceptance:**
- [ ] Navigation doc covers Home, Notes, Templates (SoFo, built-ins, Studio, marketplace), Trips, Settings sub-routes, Note editor, Web vault
- [ ] About reachable in ≤2 taps from Settings tab
- [ ] No route regressions

---

## AGENT 2 — Save & Parser Fixes

**Goal:** Save button and auto-save never fail silently.

**Trace:**
- `app/note/[id].tsx` — `persistDraft`, `handleSaveNow`, `persistChainRef`
- `context/VaultContext.tsx` — `saveNote`, `persistChainRef`
- Template parsers: `services/templateStudio/parsePastedForm.ts` (audit only; fix save P0 first)

**Tasks:**
1. Fix unhandled rejection chain on `persistChainRef` — return save result, surface errors.
2. Add `components/NoteEditorErrorBoundary.tsx` wrapping note editor.
3. Manual Save + vault-locked paths must show `Alert` with actionable text.
4. Optional: `utils/noteSave.test.ts` for fingerprint / save-state helpers.

**Acceptance:**
- [ ] Tap Save when vault locked → Alert, status text updates
- [ ] Save succeeds → confirmation on manual Save
- [ ] Note editor crash → error boundary with retry
- [ ] `npx tsc --noEmit` passes

---

## AGENT 3 — Entitlement & AI Readiness

**Goal:** UI must not show “ready” until llama context initializes **or** model file is verified on disk.

**Trace:**
- `services/monetization.ts`, `context/MonetizationContext.tsx`
- `services/templateAi/modelManager.ts`, `hooks/useTemplateAiReadiness.ts`
- `app/(tabs)/settings/totus-ai.tsx`, `components/TotusAiHubCard.tsx`

**Tasks:**
1. Fix “Downloaded but broken” loop: verify GGUF header + size after download; probe `getLlamaContext()` before `canRun`.
2. After download, `releaseLlamaContext()` then re-probe — only alert “Ready” when `canRun === true`.
3. Preserve dev unlock `TOTUS-DEV-2026` (About → tap version 7×) and `store-review` mode.

**Acceptance:**
- [ ] Corrupt/partial model → not `modelReady`; user sees re-download path
- [ ] Valid model + entitled + EAS build → `canRun` true after init
- [ ] Dev unlock and store-review still unlock Pro / Template AI

---

## AGENT 4 — Secure Voice Attachments

**Goal:** Record encrypted voice memos in note editor — local-only, no cloud.

**Note:** Expo SDK 56 uses **`expo-audio`** (not deprecated `expo-av`).

**Tasks:**
1. Add `expo-audio`; microphone permission in `app.json` / config plugin.
2. Add `voice_memo` attachment type in `services/storage.ts`.
3. `services/attachments.ts` — `recordAndEncryptVoiceMemo` (same encrypt path as photos).
4. `components/VoiceMemoRecorder.tsx` — record/stop, timer, waveform bars.
5. Note editor: record UI + `AttachmentViewer` playback via `useAudioPlayer`.

**Acceptance:**
- [ ] Record → encrypt → attach to note → persists after save
- [ ] Tap attachment → in-app play/pause
- [ ] No cloud upload

---

## INTEGRATION (Parent)

1. Link this prompt from `docs/README.md`.
2. Write `docs/PRODUCTION_ENGINE_DELIVERABLES.md` — files changed, key fixes, test notes.
3. Run `npx tsc --noEmit`.
4. Do **not** commit until `tsc` passes (unless user requests commit).

---

## DO NOT

- Remove SoFo Postpartum HV or replace with generic Studio AI for production nursing
- Claim HIPAA certification
- Add cloud sync of note content
- Use Expo Go for Template AI testing — dev client / EAS build only
- Force-push or destructive git operations

---

*Prompt version: 1.0 — 2026-07-13 — Multi-Agent Production Engine*
