# Master SoFo Production Rescue Prompt — Totus Secure Notes

**How to use:** Copy everything below the horizontal rule into a **new Cursor agent session** with full repo access, **Multitask Mode ON**, and EAS build permissions. This prompt is written **for the AI team executing the work**, not for the founder to read.

**Companion prompts (read first, do not duplicate blindly):**
- [`MASTER_DEVELOPMENT_AUDIT_PROMPT.md`](./MASTER_DEVELOPMENT_AUDIT_PROMPT.md) — IAP, builds, audit matrix
- [`MASTER_GUI_ARCHITECT_PROMPT.md`](./MASTER_GUI_ARCHITECT_PROMPT.md) — design system, Home tab, IA
- [`FOUNDER_FOLLOWUP.md`](./FOUNDER_FOLLOWUP.md) — Play upload, store-review builds
- [`ON_DEVICE_AI.md`](./ON_DEVICE_AI.md) — SmolLM2, entitlement gates
- [`AGENT_MEMORY.md`](./AGENT_MEMORY.md) — what shipped in v1.2.8–1.2.11

---

## ROLE

You are a **principal product engineer, clinical UX designer, mobile QA lead, and on-device AI architect** rescuing **Totus Secure Notes** for **production use tomorrow morning**.

Your **#1 human success criterion** is not App Store polish in abstract — it is:

> **The founder's wife (a postpartum home-visit nurse) can open the app, tap one pinned template called "SoFo Postpartum HV", dictate every field with voice while driving between visits, copy the exact clinical block into her work computer via the encrypted web vault, and trust that saves never fail.**

Everything else serves that crown jewel workflow.

You do **not** write slide decks. You **fix, ship, and verify on device**.

Read [Expo SDK 56 docs](https://docs.expo.dev/versions/v56.0.0/) before native changes. Package: `com.totuslife.TotusSecureNotes`. Repo: `c:\Users\Admin\Documents\TotusNoteSafe\TotusNote\TotusSafe`.

---

## MULTITASK vs SINGLE AGENT — USE THIS

| Mode | When | This rescue |
|------|------|-------------|
| **Multitask Mode** | 3+ independent workstreams with clear ownership | **YES — required** |
| **Single agent** | One tight bug, one file | Only for hotfixes after P0 merge |

**Orchestration pattern for this prompt:**

1. **Parent coordinator** — owns priority, merges, device test script, does NOT re-implement sub-agent work.
2. Launch **4 background workers in parallel** (Phase 0 only):
   - **Worker A — SoFo Template & Voice** (P0 clinical)
   - **Worker B — Saves, Buttons, Vault** (P0 broken interactions)
   - **Worker C — AI, Entitlement, About** (P0 unlock + model download)
   - **Worker D — GUI polish + brand** (P1 but same sprint)
3. After Phase 0 passes device checklist → **one Bugbot subagent** + **one security-review subagent** on branch diff.
4. End with **store-review APK** sideload instructions for the queen's phone tonight.

Do **not** decompose into 12 micro-agents. Four coherent workers + parent is optimal.

---

## NORTH STAR UX (research-backed)

Study these patterns (web + open source) and **adapt**, do not clone:

| Reference | Steal this |
|-----------|------------|
| **Simplenote / Apple Notes** | Flat list → editor; zero navigation depth for daily work |
| **Field Notes** (Expo + SQLite) | Offline-first, optimistic UI, pull-to-refresh sync feedback |
| **aarnote** (RN + Expo) | Premium dark surfaces, 60fps micro-interactions, glass cards |
| **GitNotēs** | Template pins, biometric lock, on-device Llama assistant layer |
| **Joplin mobile** | Multimedia attachments, copy/export friction kept low |

**Totus-specific IA after rescue:**

```
Home → [Continue SoFo HV] [Recent notes] [Vault status]
Templates → SoFo Postpartum HV (pinned #1, always visible)
Notes → list + Assist
Trips → mileage (secondary for nurse workflow)
Settings → grouped hub with search
  ├── About & Legal  ← NEW dedicated screen (not buried scroll)
  ├── Totus Assist   ← model download, diagnostics, unlock help
  ├── Security
  ├── Sync to desktop / Web vault
  └── Subscriptions
```

**Brand:** Integrate `./assets/images/icon.png` and a **lock-overlay variant** (generate with `scripts/generate_app_icons.py` or design tool) as:
- Home vault status chip watermark (low opacity)
- Template header crest on SoFo form
- Empty states and splash-consistent primary `#2563eb` / surface `#E6F4FE`

---

## FOUNDER P0 BUGS (treat as true until disproven on physical Android)

| # | Symptom | Likely root cause | First files to open |
|---|---------|-------------------|---------------------|
| 1 | **No About / can't tap version 7×** | About exists at top of [`app/(tabs)/settings/index.tsx`](../app/(tabs)/settings/index.tsx) but Settings is 1000+ lines, `headerShown: false`, no sub-route — users never find it | Create `app/(tabs)/settings/about.tsx`, link from Settings hub card |
| 2 | **Dev unlock `TOTUS-DEV-2026` unreachable** | Same as #1; logic in settings index ~L297–306, [`constants/devUnlock.ts`](../constants/devUnlock.ts) | Surface visible "Unlock Pro for testing" in About + Totus Assist |
| 3 | **Template AI download error / AI locked** | Missing entitlement OR `llama.rn` init failure OR model path corrupt | [`services/templateAi/modelManager.ts`](../services/templateAi/modelManager.ts), [`hooks/useTemplateAiReadiness.ts`](../hooks/useTemplateAiReadiness.ts), [`app/(tabs)/settings/totus-ai.tsx`](../app/(tabs)/settings/totus-ai.tsx) |
| 4 | **Template Studio paste → incomplete sections** | Rules fallback too weak; AI JSON schema drops sections; paste parser [`services/templateStudio/parsePastedForm.ts`](../services/templateStudio/parsePastedForm.ts) | Add **SoFo seed template** — do NOT rely on AI to invent clinical layout |
| 5 | **Save / download buttons dead** | Vault locked mid-action, missing `sessionPassword`, Pressable not wired, Alert swallowed, Mapbox shadowing-class bugs | Audit every `Pressable` + `onPress` in Settings export, note editor, Template Studio, model download |
| 6 | **Postpartum template "gone"** | Renamed/demoted in gallery; user expects pinned **SoFo Postpartum HV** | [`store/templates.ts`](../store/templates.ts), [`components/TemplateGallery.tsx`](../components/TemplateGallery.tsx) |
| 7 | **Mapbox key never saved** | Fixed locally: import alias `persistMapboxApiKey` — **commit + verify** | [`app/(tabs)/settings/index.tsx`](../app/(tabs)/settings/index.tsx) |

---

## CROWN JEWEL: SoFo Postpartum HV (canonical copy format)

**Display name:** `SoFo Postpartum HV`  
**Gallery:** Pinned first under **Clinical forms — do not bury under built-ins**  
**Route:** Keep `/templates/postpartum` or alias `/templates/sofo-postpartum`  
**Type:** Dedicated form (`type: 'form'`) — **NOT** Template Studio AI output for v1 production

### Exact export skeleton (preserve punctuation, em dashes, section order)

The copy-to-clipboard output **must** match this structure. Field labels in the UI may be friendlier; export uses this verbatim layout:

```
BIRTHER | PARENT
— HX: G/P
— Date of Delivery: 
— General: 
— Vitals | BP:  
— BM:| Void:  
— Incision/Perineum: 
— Lochia: 
— Breasts | Nipples | Milk Supply:  
— Medications | Supplements:  
— Follow-up:

INFANT- Baby Girl/Boy NAME
— DOB: 
— Birth Weight: 
— Apgar: 
— HC: 
— Length:  
— PHN: 
— Complications: 

NEWBORN WEIGHT TRENDS:
— BW:
— Previous wt:

NEWBORN TcB/TSB TRENDS:
—  @ __hrs (Low Risk/Low Intermediate/High Intermediate/High Risk), DAT 
— 
— Feeding | Feeding Plan: 
— Sleeping: 
— Stools: 
— Voids:
— Exam | Vitals | Hips: 
— Color | Skin: 
— Red Reflex: 
— Umbilicus: 
— Newborn Metabolic screen result: 

DISCUSSED THE FOLLOWING WITH THE PARENT(S):
— Discussed Vitamin D drops 400 IU daily.
— Has received Health Passport and immunization information from Public Health.
— Aware of Period of 'PURPLE' Crying.

Ongoing Concerns to Follow-Up On For Mom &/or Baby: 
1. 
2. 

Next Appointment: 
1. Will be seen in ___ days at home/clinic.
```

### Implementation map (edit these)

| File | Action |
|------|--------|
| [`store/postpartumTemplate.ts`](../store/postpartumTemplate.ts) | Rename title constant `SOFO_POSTPARTUM_TITLE`; ensure all fields exist |
| [`utils/postpartumFormat.ts`](../utils/postpartumFormat.ts) | Align `formatPostpartumNote()` to skeleton above — **no extra headers** user didn't ask for unless optional toggle |
| [`components/templates/PostpartumForm.tsx`](../components/templates/PostpartumForm.tsx) | Section headers match export; voice-friendly single-line fields |
| [`store/templates.ts`](../store/templates.ts) | `title: 'SoFo Postpartum HV'`, `description: 'Postpartum home visit — voice fill, copy to EMR'` |
| [`components/TemplateGallery.tsx`](../components/TemplateGallery.tsx) | Featured card, lock icon, "Used by SoFo nurses" subtitle optional |

### Voice input requirements (P0 for nurse)

1. Every `ThemedTextInput` in SoFo form: `textContentType`, `returnKeyType`, **`keyboardType` appropriate**, and Android **`android:importantForAutofill="no"`** if needed.
2. Enable **system dictation** — do not block `TextInput` with overlays; use `KeyboardAwareScrollView` (already imported).
3. Add **"Voice tip"** banner: *"Tap any field → microphone on keyboard → speak values."*
4. **Phase 1.5 — Encrypted voice notes attachment:**
   - New attachment type `voice_memo` in [`services/storage.ts`](../services/storage.ts)
   - Record via `expo-av` (add dependency if missing) → encrypt like photos in [`services/attachments.ts`](../services/attachments.ts)
   - Attach to note OR embed reference on SoFo form "Additional audio note"
5. **Do not** require Template AI for SoFo — the dedicated form IS the product for tomorrow.

### Persist SoFo drafts

- Save in-progress SoFo form to vault as note with `templateId: 'sofo_postpartum_hv'` OR SecureStore draft key per user session.
- **Auto-save on field blur** (mirror note editor fix in [`context/VaultContext.tsx`](../context/VaultContext.tsx) `persistChainRef`).
- **Copy** button must call [`copyToClipboard`](../services/export.ts) + audit log; show success toast.

---

## WORKER A — SoFo Template & Voice (acceptance criteria)

- [ ] Templates tab opens with **SoFo Postpartum HV** as first card, impossible to miss
- [ ] Fill 5 fields via voice dictation on Android — text appears, persists after background app
- [ ] Copy output matches canonical skeleton (diff test in `utils/postpartumFormat.test.ts` optional but recommended)
- [ ] Preview modal shows exact clipboard text before copy
- [ ] Wife can complete full visit without Template Studio

---

## WORKER B — Saves, Buttons, Vault (acceptance criteria)

Audit **every** user-triggered action:

| Surface | Buttons to verify |
|---------|-------------------|
| Note editor | Save, Attach photo, Attach media, Copy, Assist chips |
| SoFo form | Copy, Preview, Add to trip, Save draft |
| Settings | Export vault, Export `.totus`, Sync desktop, Save API keys, Policy links |
| Totus Assist | Download model, Delete model, Retry |
| Template Studio | Parse, AI draft, Save template |

**Debug method:**
1. Add temporary `__DEV__` logging on failed guards (`!sessionPassword`, `!isUnlocked`).
2. Fix silent early-returns — show `Alert` with actionable text.
3. Run `npx tsc --noEmit` after each fix.

Known fix pending commit: Mapbox `persistMapboxApiKey` in settings.

- [ ] Export `.totus` from Settings produces share sheet
- [ ] Note edits survive kill-app test
- [ ] No button appears clickable but does nothing

---

## WORKER C — AI, Entitlement, About (acceptance criteria)

### About & Legal screen (NEW)

Create [`app/(tabs)/settings/about.tsx`](../app/(tabs)/settings/about.tsx):

- App icon + name + **large tappable version row** ("Tap 7 times for tester unlock")
- Store review mode banner when active
- Dev unlock code entry (move from settings index)
- Links: Privacy, Terms, Data deletion, Permissions, Support, Legal disclaimer, All policies
- Package name, versionCode, build profile hint

Update [`app/(tabs)/settings/_layout.tsx`](../app/(tabs)/settings/_layout.tsx) stack. Settings index becomes **hub cards** linking to About, Totus Assist, Security, etc. — reduce scroll wall.

### Unlock paths (document in-app)

| Path | Steps |
|------|-------|
| **Store review APK** | Install `store-review-apk` build — Pro auto-unlocked |
| **Dev unlock** | Settings → About → tap version **7×** → `TOTUS-DEV-2026` |
| **Production IAP** | `pro_lifetime` purchase |

After unlock, Totus Assist must show: entitlement ✓, model bytes, **Download model** button, test inference.

### Template AI fixes (for custom templates — secondary to SoFo)

1. [`services/templateStudio/parsePastedForm.ts`](../services/templateStudio/parsePastedForm.ts) — add **section-aware rules** for headers like `BIRTHER | PARENT`, `NEWBORN WEIGHT TRENDS:`
2. [`services/templateAi/normalizeAiDraft.ts`](../services/templateAi/normalizeAiDraft.ts) — never drop sections; merge with rules output
3. Ship bundled **`store/builtinTemplates/sofo-postpartum-reference.ts`** as Studio import example (metadata only)
4. Studio paste UI: show **"Use SoFo template instead"** deep link when paste looks clinical

### SmolLM2 "wow" features (small model, realistic scope)

Implement in [`services/templateAi/`](../services/templateAi/) as **Note Assist + Field Assist** chips:

| Feature | Prompt intent | Where |
|---------|---------------|-------|
| **Fix dictation** | Fix obvious speech-to-text garble, keep medical terms | SoFo field long-press menu |
| **Tone: clinical** | Rewrite conversational → chart-ready phrase | Note Assist |
| **Complete phrase** | User typed "BP 120/" → suggest "120/80" **only on request** | Numeric fields |
| **Summarize visit** | 3-bullet summary from filled SoFo fields | SoFo form footer |
| **Checklist nudge** | "Missing: DOB, Birth Weight" before copy | SoFo copy guard |

**Do not** promise auto-diagnosis or ICD coding — productivity only.

- [ ] About screen reachable in ≤2 taps from Settings
- [ ] Dev unlock works on production APK
- [ ] Model download completes OR shows exact error + retry on Samsung/Pixel test device
- [ ] Template AI generates ≥90% of SoFo sections when pasted (stretch; SoFo form is fallback)

---

## WORKER D — GUI polish + brand (acceptance criteria)

Execute **Phase 0.5** from [`MASTER_GUI_ARCHITECT_PROMPT.md`](./MASTER_GUI_ARCHITECT_PROMPT.md):

1. Reuse [`components/ui/ScreenHeader.tsx`](../components/ui/ScreenHeader.tsx), [`StatusBadge`](../components/ui/StatusBadge.tsx), [`EmptyState`](../components/ui/EmptyState.tsx) on Templates + SoFo + Notes
2. SoFo form: sticky **Copy to clipboard** bar above safe area (primary button always visible)
3. Tab bar: keep `theme.primary` tint
4. Generate **Totus lock crest** asset:
   - Input: `assets/images/icon.png`
   - Output: `assets/images/totus-lock-crest.png` (icon + subtle lock badge, brand colors)
   - Use in Home dashboard + SoFo header + About
5. Haptics on successful copy/save (`expo-haptics` if already in project)

- [ ] App feels "premium nursing tool" not "dev settings dump"
- [ ] Primary actions visible without scrolling on SoFo form (phone 6")

---

## BUG AGENTS (run after Phase 0 code complete)

Use Cursor subagents **once** on branch diff:

### Bugbot

```
Task description: Bugbot
Full Repository Path: c:\Users\Admin\Documents\TotusNoteSafe\TotusNote\TotusSafe
Diff: branch changes
Change Description: SoFo template restore, About screen, save/button fixes, AI entitlement UX
Custom Instructions: Focus on silent early returns, shadowed imports, vault save races, Pressable handlers
```

### Security review

```
Task description: Security Review
Full Repository Path: c:\Users\Admin\Documents\TotusNoteSafe\TotusNote\TotusSafe
Diff: branch changes
Custom Instructions: Vault crypto paths, attachment scrub, web vault export, dev unlock storage
```

---

## DEVICE TEST SCRIPT (founder / queen — tomorrow AM)

1. Install latest **store-review APK** from EAS dashboard
2. Unlock vault → **Templates** → **SoFo Postpartum HV**
3. Dictate 3 fields → background app → return → data still there
4. **Copy** → paste into Notes app → format matches skeleton
5. Settings → **About** → tap version 7× → enter `TOTUS-DEV-2026` → Totus Assist shows Pro
6. Totus Assist → Download model → run test inference OR read exact error
7. Settings → Export `.totus` → transfer to desktop → https://totus--notes.web.app/vault → decrypt read-only
8. Create plain note → type → kill app → reopen → text persisted

**Pass = all 8 green.** Ship to Play internal track only after pass.

---

## VERSION & SHIP

After P0 fixes:

| Field | Value |
|-------|--------|
| Version | **1.2.12** (bump from 1.2.11) |
| Android versionCode | **44** (increment in `app.json`) |
| Commit message style | `Fix SoFo template, About hub, and save actions for production nursing workflow.` |

Build commands:

```bash
npm run build:store-review-apk   # Queen's phone tonight
npm run build:store-review       # Play internal AAB
```

Update [`store/RELEASE_NOTES.md`](../store/RELEASE_NOTES.md) with SoFo + About + save fixes.

Push to `main` only after device script pass. Git identity: `totuslife7@gmail.com`.

---

## DO NOT

- Do not remove or replace SoFo with generic Template Studio AI for tomorrow's workflow
- Do not claim HIPAA certification in UI
- Do not add cloud sync of note content
- Do not block shipment on full GUI Phase 3 from MASTER_GUI_ARCHITECT
- Do not commit `build-log-decompressed.txt` or secrets
- Do not use Expo Go for AI testing — **dev client / EAS APK only**

---

## EXECUTION ORDER (parent agent checklist)

```
Day 0 (tonight)
├── Launch Workers A+B+C+D in parallel (Multitask)
├── Merge P0 PRs sequentially: B (saves) → A (SoFo) → C (About/AI) → D (polish)
├── Run Bugbot + security-review on diff
├── Bump 1.2.12 / versionCode 44
├── build:store-review-apk
└── Send founder: APK link + 8-step test script

Day 1 (tomorrow)
├── Queen runs SoFo on real visits
├── Collect misparsed fields / dead buttons as issues
└── Patch 1.2.12-hotfix if needed (versionCode 45)
```

---

## SUCCESS STATEMENT

When this prompt is done, the founder should say:

> *"My wife opened SoFo Postpartum HV, talked into her phone between visits, copied her note, and pasted it at work. The app saved everything. She didn't need the AI parser — but Settings → About finally made sense, and we know how to unlock Pro."*

**That is the crown.** Build for the queen. Ship tonight.

---

*Prompt version: 1.0 — 2026-07-13 — Totus Secure Notes SoFo Production Rescue*
