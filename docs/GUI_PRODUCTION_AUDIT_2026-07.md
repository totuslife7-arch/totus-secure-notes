# GUI Production Audit — Totus Secure Notes

**Date:** 2026-07-17  
**Version audited:** v1.2.16 (Expo SDK 56)  
**Scope:** Home, Notes, Templates/Studio, Note editor, Settings, Assist/AI, Trips, theme system  
**Method:** Code review against `docs/MASTER_GUI_ARCHITECT_PROMPT.md` and `docs/UI_NAVIGATION_TREE.md` — no implementation changes.

---

## Executive summary

Totus Secure Notes is **functionally mature** but still **visually and structurally uneven**. Phase 0 improvements landed (Home tab, Notes relocation, partial `components/ui/*`), yet the app does not yet feel like a *premium secure clinical companion* within three seconds of unlock.

The largest product UX gap is the **“permanent workflow template”** model: SoFo Postpartum HV is hard-pinned in marketing and Home, but there is no general **“My workflow”** affordance — no resume-draft card on Home, no user-chosen default template, and Studio briefcase templates are buried two+ taps deep. Assist/AI remains administratively nested under Settings while chips on other tabs route users into that dead-end IA.

This audit recommends **finishing Phase 0 IA cleanup**, then **P0 redesign of Home + Template picker + Note editor** before broader design-system migration.

---

## Progress since MASTER_GUI_ARCHITECT_PROMPT

| Item | Status | Evidence |
|------|--------|----------|
| Home dashboard tab | **Done (partial)** | `app/(tabs)/home/index.tsx` — digest, quick actions, recent notes, compact Assist card |
| Notes relocated from default tab | **Done** | `app/(tabs)/notes/index.tsx`, redirect in `app/(tabs)/index.tsx` |
| Tab bar uses `theme.primary` | **Done** | `app/(tabs)/_layout.tsx` |
| `ScreenHeader`, `EmptyState`, `StatusBadge` | **Partial** | `components/ui/` — 3 of ~15 planned primitives |
| Digest moved off Notes only | **Not done** | Duplicated in `components/NoteList.tsx` and Home |
| Assist as own tab | **Not done** | Still `app/(tabs)/settings/totus-ai.tsx` |
| Settings collapsible sections | **Not done** | ~930 lines flat scroll in `app/(tabs)/settings/index.tsx` |
| Notes FAB + search | **Not done** | Full-width “+ New Note” button, no search |
| Unified AuthGate copy | **Not done** | Per-tab titles still differ |
| Theme typography/spacing tokens | **Not done** | `constants/theme.ts` unchanged |
| Template segmented Gallery/Studio/Library | **Not done** | Long `ScrollView` in `components/TemplateGallery.tsx` |

---

## Before / after information architecture

### Current IA (5 tabs)

```
Home → digest + quick actions + Assist card (routes to Settings)
Notes → digest (duplicate) + filters + Assist chip → Settings
Templates → long gallery scroll; Studio/Marketplace nested in stack
Trips → monolithic TripPlannerScreen
Settings → security + subscriptions + trip maps + Assist duplicate + desktop sync essay + audit log
Assist hub → Settings → Totus AI (2 taps from any chip)
```

**Pain points:** Assist is a product pillar living inside admin Settings. Marketplace (`/templates/marketplace`) is reachable only from Totus AI settings or deep links — not from Templates gallery. Home and Notes both show task digest. No “workflow slot” on Home beyond hard-coded SoFo.

### Recommended IA (target)

**Option A — 5 tabs (preferred for AI differentiation)**

| # | Tab | Primary screen | Change |
|---|-----|----------------|--------|
| 1 | **Home** | Dashboard with **WorkflowCard** + vault + digest (single source) | Add lock/settings header actions; remove duplicate Assist quick action |
| 2 | **Notes** | Pure list + search + FAB | Strip digest/Assist; add swipe delete (Phase 2) |
| 3 | **Templates** | Segmented **Gallery \| My briefcase \| Library** | Promote Studio + pinned workflow |
| 4 | **Trips** | List → detail (Phase 2); polish monolith now | ScreenHeader + section cards |
| 5 | **Assist** | Promoted `totus-ai` experience | Model status, capabilities, onboarding |

**Settings** → pushed from Home gear (stack), slimmed to Account/Pro, Security, Appearance, Data, About.

**Option B — Keep Settings tab (lower churn)**

Same as above but retain Settings tab; promote Totus Assist to **top hub card** and remove inline duplicate body + dev unlock banner from production builds.

### Route depth budget (target: ≤2 taps)

| Feature | Current taps | Target |
|---------|--------------|--------|
| SoFo Postpartum | 1 (Home) or 2 (Templates) | 1 via **WorkflowCard** on Home |
| Resume SoFo draft | 2+ (must open form; draft invisible on Home) | **1** — “Resume visit draft” on Home |
| Template Studio paste | 2 (Home → paste) | 1–2 |
| Template library | 3+ (Settings → AI → library) | **2** (Templates → Library tab) |
| Totus AI model download | 2 (Settings → AI) | **1** (Assist tab) |
| Note Assist | 1 in editor; chip routes away to Settings | **0 extra** — actions stay in editor |
| Lock vault | 2 (Settings scroll) | **1** (Home header) |

---

## Findings by category

### 1. Clutter / wall-of-text

| Screen | Problem | File(s) |
|--------|---------|---------|
| **Settings hub** | Single ~930-line scroll: 3-layer encryption essay, Trip Planner Pro + API keys, desktop sync 5-step list, audit log inline, duplicate Assist block | `app/(tabs)/settings/index.tsx` |
| **Totus AI hub** | Full capability manifest table (9 rows × 3 columns) reads like internal docs | `components/TotusAiHubCard.tsx`, `app/(tabs)/settings/totus-ai.tsx` |
| **Notes list** | Digest banner + Assist chip + filter chips + full-width new button **above** list — ~120px chrome before first note | `components/NoteList.tsx` |
| **Note editor** | Reminder field exposes raw ISO format; Assist chips, attachments, voice recorder appear **above** main content; equal-weight primary buttons | `app/note/[id].tsx` |
| **Postpartum form** | 40+ fields, no section collapse; long ALL-CAPS section titles; footer packs 4 actions | `components/templates/PostpartumForm.tsx` |
| **Template gallery** | Three sections each with heading + hint paragraph; built-in categories repeat pattern | `components/TemplateGallery.tsx` |
| **Studio paste** | Model status card + compare row + upgrade card + two CTAs — high vertical cost before paste area | `app/(tabs)/templates/studio/paste.tsx` |

### 2. Navigation confusion

| Issue | Detail | File(s) |
|-------|--------|---------|
| **Assist routing inconsistency** | Notes/Trips chips → Settings AI; Templates chip → Studio paste | `components/TotusAssistChip.tsx` |
| **Assist triple entry** | Home quick action + compact card + Settings section + chips on 3 tabs | `app/(tabs)/home/index.tsx`, `app/(tabs)/settings/index.tsx` |
| **Marketplace hidden** | Not linked from Template gallery; only Totus AI footer link | `components/TemplateGallery.tsx`, `app/(tabs)/templates/marketplace.tsx` |
| **Per-tab AuthGate titles** | “Unlock Notes” vs “Unlock Vault” vs “Unlock SoFo Postpartum HV” fragments brand | `components/AuthGate.tsx`, tab screen wrappers |
| **Header inconsistency** | Home uses `ScreenHeader`; Notes uses system tab header; Templates stack headers inside hidden tab header | `app/(tabs)/_layout.tsx`, `app/(tabs)/templates/_layout.tsx` |
| **Home header missing actions** | No lock icon, no settings gear — only decorative app icon | `app/(tabs)/home/index.tsx` |
| **Empty state misroutes** | Notes empty → “Explore Totus Assist” (Settings) instead of Postpartum/Studio | `components/NoteList.tsx` |
| **Note Assist chip on Notes** | Sends user to Settings, not into an open note | `components/TotusAssistChip.tsx` |

### 3. Missing visual hierarchy, icons, spacing

| Gap | Detail | File(s) |
|-----|--------|---------|
| **Text-only quick actions** | Home grid has no icons, uneven 47%/100% widths | `app/(tabs)/home/index.tsx` |
| **No FAB on Notes** | Full-width primary button competes with list | `components/NoteList.tsx` |
| **Badge inconsistency** | Gallery uses inline `Text` badges (`★ Pinned`, `Built-in`); Home uses `StatusBadge` | `components/TemplateGallery.tsx`, `components/ui/StatusBadge.tsx` |
| **Hard-coded colors** | `#2563eb`, `#e5e7eb`, `#059669` in Postpartum footer; `#b45309` warn dot; map polyline not themed | `components/templates/PostpartumForm.tsx`, `components/TotusAiHubCard.tsx`, `components/TripPlannerScreen.tsx`, `app/note/[id].tsx` |
| **No spacing/typography scale** | Ad-hoc `fontSize: 13/14/16/22` everywhere | `constants/theme.ts`, all major screens |
| **ProUpgradeBanner on Home + Notes + Templates + Trips** | Correct monetization, but adds repetitive chrome | `components/ProUpgradeBanner.tsx` |
| **Ad banner separation** | Hidden for Pro (good) but no divider when shown | `components/AdBanner.tsx`, `components/NoteList.tsx` |

### 4. Onboarding gaps (AI and templates)

| Gap | Current behavior | Recommendation |
|-----|------------------|----------------|
| **AI first-run** | `AiOnboardingSheet` only after model download on Totus AI screen | Also trigger from Home when `canRun` first becomes true; link to Studio paste |
| **Template Studio intro** | No first-run; empty briefcase shows text + link to Settings AI | `EmptyState` with “Paste your clinic form” + 30s explainer sheet |
| **SoFo workflow intro** | Voice tip card only; no first-visit modal | Optional one-time “Voice fill → Copy → EMR” sheet |
| **Dev unlock in production UI** | Visible on Totus AI screen | Hide behind About 7× tap only; keep in `about.tsx` |
| **Capability discovery** | Manifest table on AI hub — dense | Assist tab: 3–5 illustrated capability cards max |
| **Expo Go warning** | Only on paste screen | Also on Assist hub status row |

**Relevant files:** `components/AiOnboardingSheet.tsx`, `app/(tabs)/settings/totus-ai.tsx`, `app/(tabs)/templates/studio/index.tsx`, `app/(tabs)/templates/studio/paste.tsx`

### 5. “Permanent template for workflow” UX gap

**Product intent:** A field clinician opens the app and immediately continues their **primary repeated workflow** (e.g. SoFo Postpartum HV) — voice fill, auto-save draft, copy to EMR — without hunting through Templates.

**What exists today:**

- SoFo is **hard-pinned** on Home (featured quick action) and Template gallery (`★ Pinned`).
- Draft auto-save works (`SOFO_DRAFT_TITLE`, blur persist) but is **invisible until user opens the form**.
- Template Studio briefcase stores custom templates but **never surfaces on Home**.
- No user setting for “default workflow template” or “pin template to Home”.
- Markdown templates create disposable notes — not a persistent form workflow.

**What's missing:**

1. **WorkflowCard on Home** — shows pinned template, draft resume (“Continue visit — Birther name”), last saved time, primary CTA.
2. **Template picker redesign** — top section: “My workflow” (1 slot, user-configurable) + “Resume draft” + pinned clinical forms; below: browse.
3. **Draft visibility** — Home should read vault for `SOFO_DRAFT_TITLE` or briefcase in-progress state.
4. **Generalized pin model** — `SecureStore` or vault preference: `pinnedWorkflowTemplateId` → route resolver for form/studio/builtin.
5. **Studio ↔ Home bridge** — last-used custom template appears on Home quick actions.

**Screens needing redesign for this gap:**

| Priority | Screen | Why |
|----------|--------|-----|
| P0 | **Home** | Must be the workflow front door, not a generic dashboard |
| P0 | **Template picker / gallery** | Choose and pin permanent workflow; de-emphasize markdown wall |
| P1 | **Postpartum form** | Add section collapse, sticky progress; expose draft status in header |
| P1 | **Studio index** | “Set as Home workflow” on each briefcase template |
| P2 | **Settings → Workflow** | Optional admin: default template, clear draft |

---

## Priority screen list for redesign

### P0 — Ship before next store screenshot pass

| Screen | Goal | Primary files |
|--------|------|---------------|
| **Home dashboard** | WorkflowCard + single digest + header lock/settings + icon quick actions; remove Assist duplication | `app/(tabs)/home/index.tsx`, new `components/WorkflowCard.tsx`, `components/ui/QuickActionGrid.tsx` |
| **Template picker** | Segmented control; pin workflow; Library tab; collapse built-in list | `components/TemplateGallery.tsx`, `app/(tabs)/templates/index.tsx`, `app/(tabs)/templates/_layout.tsx` |
| **Notes list** | Remove digest/Assist; add FAB + search; fix empty state CTAs | `components/NoteList.tsx`, `app/(tabs)/notes/index.tsx` |
| **Assist elevation** | New tab OR top-level Settings hub; remove duplicate from Settings scroll | `app/(tabs)/assist/index.tsx` (new) OR `app/(tabs)/settings/index.tsx`, `app/(tabs)/_layout.tsx` |

### P1 — Clinical workflow quality

| Screen | Goal | Primary files |
|--------|------|---------------|
| **Note editor** | Tiered layout: content first; accordion for metadata; date picker for reminder; Note Assist sheet | `app/note/[id].tsx` |
| **Postpartum form** | Section collapse; themed footer; draft badge in header; “Resume” from Home | `components/templates/PostpartumForm.tsx`, `store/postpartumTemplate.ts` |
| **Settings hub** | `SectionGroup` collapsibles; move Trip maps + audit to sub-screens; cut scroll ≥40% | `app/(tabs)/settings/index.tsx`, new `components/ui/SectionGroup.tsx` |
| **Auth / unlock** | Unified “Totus Secure Notes” brand moment; app icon; privacy link | `components/AuthGate.tsx` |

### P2 — Polish and parity

| Screen | Goal | Primary files |
|--------|------|---------------|
| **Template Studio** | Empty briefcase `EmptyState`; “Set as workflow” action | `app/(tabs)/templates/studio/index.tsx`, `studio/[id].tsx` |
| **Studio paste** | Sticky dual CTA; model status collapsed by default | `app/(tabs)/templates/studio/paste.tsx` |
| **Trips** | ScreenHeader; trip history list; themed map polyline | `components/TripPlannerScreen.tsx`, `app/(tabs)/trips/index.tsx` |
| **Design system** | Typography, spacing, `ListRow`, `FAB`, `ProCompareStrip` | `constants/theme.ts`, `components/ui/*` |
| **Marketplace** | Skeleton loader; import preview | `app/(tabs)/templates/marketplace.tsx` |

---

## Component / file change map

### New components (recommended)

| Component | Purpose |
|-----------|---------|
| `components/WorkflowCard.tsx` | Pinned template + draft resume + primary CTA |
| `components/ui/QuickActionGrid.tsx` | Icon + label tiles for Home |
| `components/ui/SectionGroup.tsx` | Collapsible Settings/Templates sections |
| `components/ui/FAB.tsx` | Notes new-note |
| `components/ui/ListRow.tsx` | Unified list item |
| `components/ui/SearchField.tsx` | Notes search |
| `components/NoteAssistSheet.tsx` | Collapsed assist actions in editor |
| `components/TemplateOnboardingSheet.tsx` | First Studio visit |
| `services/workflowPreferences.ts` | `pinnedWorkflowTemplateId`, last-used |

### Modify existing

| File | Changes |
|------|---------|
| `app/(tabs)/_layout.tsx` | Add Assist tab OR reorder; hide Settings from tab bar if using gear navigation |
| `app/(tabs)/home/index.tsx` | WorkflowCard, header actions, strip duplicate digest on Notes |
| `components/NoteList.tsx` | Remove digest, Assist, full-width button; add FAB, search, better empty state |
| `components/TemplateGallery.tsx` | Segmented tabs; pin UI; marketplace link |
| `components/TotusAssistChip.tsx` | Route Notes to editor assist or Assist tab, not Settings |
| `app/note/[id].tsx` | Reorder blocks; reminder UX; assist sheet |
| `app/(tabs)/settings/index.tsx` | SectionGroup; remove Assist body duplicate |
| `constants/theme.ts` | Add typography, spacing, radius, status tokens per architect spec |
| `components/AuthGate.tsx` | Unified title, icon, policy link |
| `components/templates/PostpartumForm.tsx` | Section collapse; theme footer colors |

---

## Figma-ready screen briefs (text only)

### Brief 1 — Home dashboard

**Frame:** iPhone 15 Pro, light + dark variants  
**Safe area:** Respect top notch; bottom clears tab bar (49pt + inset)

**Header row**

- Left: time-aware greeting (“Good morning”) + `headline` “Totus Secure Notes”
- Right: lock icon (tap → lock vault), gear icon (tap → Settings stack)
- No large app icon in header — move brand to AuthGate only

**Zone A — WorkflowCard (featured, full width)**

- Variant A: **Resume draft** — subtitle “SoFo Postpartum HV · Birther: [name] · Draft saved 2h ago” + primary button “Continue visit” + ghost “Start new visit”
- Variant B: **No draft** — subtitle “Pin a template for one-tap access” + primary “SoFo Postpartum HV” + link “Choose workflow →”
- Left accent bar: `primary` 4px; background `surface`; radius 12

**Zone B — VaultStatusChip (compact)**

- Green dot + “Vault unlocked” OR amber “Locked”
- One line task digest (`buildTaskDigest`) — `successSurface` background
- Optional second line: AI summary muted, truncated 2 lines

**Zone C — QuickActionGrid (2×2)**

- Icons + labels: New note, Template Studio, Trips, Template library
- Equal tile size; `surface` cards; icon tint `primary`

**Zone D — Recent notes (horizontal scroll)**

- 3 cards, width ~72% screen; title + 1-line preview + relative time
- “See all →” links to Notes tab

**Zone E — Assist status (compact row)**

- Dot + “Totus Assist · Model ready” → tap opens Assist tab
- Pro badge if free tier

**Footer**

- `caption` muted: “Productivity tool — you are responsible for workplace compliance.”

**Do not include:** Pro upgrade banner above fold (move to Assist or after Recent notes); duplicate Totus Assist quick action tile

---

### Brief 2 — Note editor

**Frame:** Stack screen with nav bar “Edit Note” + Save text action

**Tier 1 — Sticky sub-toolbar (below nav)**

- Left: auto-save status (“Saved 2:34 PM” / spinner)
- Right: Preview toggle (icon), Flag toggle (icon, filled when active)

**Tier 2 — Primary writing (hero)**

- Title field: `display` weight, single line, no border
- Content area: min 50% viewport; markdown editor OR preview swap
- Placeholder: “Write notes…” — **not** “Write markdown notes…”

**Tier 3 — Note Assist (collapsed bar)**

- Collapsed: “Note Assist ▾” + sparkle icon; tap expands bottom sheet
- Expanded sheet: 4 actions as list rows with icons — Bulletize, Shorten, Expand, Summarize
- Footer line: “On-device · Pro” or “Rules fallback · Free”
- Status line during run: inline under bar

**Tier 4 — Secondary accordion (“Details”)**

- Collapsed by default
- Contains: Follow-up status (segmented Open/Done), Reminder (native date/time picker — **not** ISO text field), Extra notes (multiline)
- Compliance: “You are responsible for PHI in this note.”

**Tier 5 — Attachments strip**

- Horizontal chip row: Photo, Import, Voice memo
- Thumbnails below when present; tap view, long-press shred

**Visual rules**

- Content appears **before** assist and attachments (invert current code order)
- Max 1 primary-colored button visible outside sheet (Save in nav only)
- Chips use `surfaceSecondary`, not equal to Photo primary button

---

### Brief 3 — Template picker

**Frame:** Templates tab root; custom header “Templates” + subtitle “Clinical workflows & briefcase”

**Segmented control (pinned below header)**

- **Gallery** | **My briefcase** | **Library**
- Active segment: `primary` underline

**Gallery tab content (top to bottom)**

1. **My workflow** (single card, featured border)
   - Shows pinned template name + description + “Change” link
   - If SoFo pinned: “Voice fill · Copy to EMR · Auto-save draft”
   - CTA: “Open workflow”

2. **Resume draft** (conditional card, amber left bar)
   - Only if draft exists in vault
   - “Continue SoFo draft — [birther]” 

3. **Clinical forms** (1–2 rows max above fold)
   - SoFo Postpartum HV with `StatusBadge` “Pinned”
   - Tap → form route

4. **Template Studio** row
   - Badge: “Pro” or “Briefcase”
   - Subtitle: “Paste clinic forms → reusable templates”

5. **Built-in** — collapsed `SectionGroup` per category (Postpartum, Pediatrics, …)
   - Show count badge; expand on tap

6. **Markdown starters** — collapsed by default at bottom

**My briefcase tab**

- List from `listCustomTemplates`
- Empty: illustration placeholder + “Paste your first form” → Studio paste
- Row actions: Fill, Edit, **Pin to Home**

**Library tab**

- Embed marketplace list (curated templates)
- Import → review flow

**Header assist**

- Single “Totus Assist” text button top-right → Assist tab (replace mid-scroll chip)

**Remove from this screen**

- Long hint paragraphs under every section heading
- `TotusAssistChip` floating row
- Pro upgrade banner above workflow cards (relocate below fold or contextual)

---

## Acceptance criteria (audit complete when shipped)

1. Home shows **WorkflowCard** with draft resume when SoFo draft exists in vault.
2. Task digest appears **once** (Home only).
3. Assist reachable in **1 tap** from tab bar.
4. Template library reachable in **≤2 taps** from Templates tab.
5. Note editor content field is **first substantive block** after title.
6. Settings scroll reduced **≥40%** via collapsible sections.
7. AuthGate uses **one consistent title** across tabs.
8. No hard-coded `#2563eb` / `#e5e7eb` in Postpartum footer or note chips — use `theme.*`.
9. Pro users see **zero** ad banner layout shift.
10. Store screenshots captured from Home + Postpartum + Note editor match briefs above.

---

## References

- `docs/MASTER_GUI_ARCHITECT_PROMPT.md` — north star and phased plan
- `docs/UI_NAVIGATION_TREE.md` — v1.2.16 route map
- `docs/MASTER_SOFO_PRODUCTION_RESCUE_PROMPT.md` — SoFo workflow requirements
- `docs/ON_DEVICE_AI.md` — AI onboarding hooks

*Audit produced for production GUI planning — implementation not included in this document.*
