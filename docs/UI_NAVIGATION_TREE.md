# UI Navigation Tree — Totus Secure Notes v1.2.16

Complete map of screens, tabs, settings controls, and deep links. Routes use Expo Router file-based paths.

---

## Root stack (`app/_layout.tsx`)

| Route | Screen | Notes |
|-------|--------|-------|
| `/(tabs)` | Tab navigator | Default after unlock |
| `/vault` | Web vault viewer (in-app) | Read-only `.totus` import |
| `/note/[id]` | Note editor | Stack card; header Save button |

---

## Tab bar (`app/(tabs)/_layout.tsx`)

| Tab | Route | Header | Auth |
|-----|-------|--------|------|
| Home | `/home` | System header | `AuthGate` inside |
| Notes | `/notes` | System header | `AuthGate` |
| Templates | `/templates` | Hidden (`headerShown: false`) | `AuthGate` |
| Trips | `/trips` | System header | `AuthGate` |
| Settings | `/settings` | Hidden | Public (vault lock UI on index) |
| *(hidden)* | `/index` | Redirect hub | `href: null` |

---

## Home (`/home`)

| Element | Action / destination |
|---------|----------------------|
| App icon | Header (right of title) |
| Vault status chip | Shows unlock + task digest |
| Pro upgrade banner | Opens paywall |
| Totus Assist compact card | → `/settings/totus-ai` |
| **SoFo Postpartum HV** | → `/templates/postpartum` |
| New note | Creates note → `/note/[id]` |
| Recent notes | → `/note/[id]` |
| Templates shortcut | → `/templates` |
| Trips shortcut | → `/trips` |

---

## Notes (`/notes`)

| Element | Action |
|---------|--------|
| Note list (`NoteList`) | Tap row → `/note/[id]` |
| Search / filter | In-list |
| New note FAB | Creates note → `/note/[id]` |

### Note editor (`/note/[id]`)

| Control | Behavior |
|---------|----------|
| **Save** (header) | Manual persist + Alert feedback |
| Preview toggle | Markdown preview |
| Flag / Follow-up / Extra notes | Draft fields |
| Note Assist chips | bulletize, shorten, expand, summarize |
| **Photo** | Camera or system photo picker → encrypted attachment |
| **Import** | Gallery audio/video import |
| **Voice memo recorder** | Record → encrypt → `voice_memo` attachment |
| Attachment list | Tap view; Shred secure delete |
| Auto-save | 2s debounce + blur/background |

---

## Templates stack (`/templates/_layout.tsx`)

| Route | Title | Entry |
|-------|-------|-------|
| `/templates` | Templates gallery | Tab |
| `/templates/postpartum` | SoFo Postpartum HV | Home, gallery pin |
| `/templates/builtin/[id]` | Built-in template | Gallery |
| `/templates/studio` | Template Studio hub | Gallery |
| `/templates/studio/paste` | Paste form | Studio |
| `/templates/studio/review` | Review AI/rules draft | Studio |
| `/templates/studio/[id]` | Fill custom template | Studio / marketplace |
| `/templates/marketplace` | Template library | Studio / Totus Assist |

### SoFo form (`/templates/postpartum`)

Copy, preview, save draft, add to trip — see `PostpartumForm.tsx`.

---

## Trips (`/trips`)

`TripPlannerScreen` — GPS recording, stops, maps (Pro routing gated).

---

## Settings stack (`/settings/_layout.tsx`)

| Route | Title |
|-------|-------|
| `/settings` | Settings hub |
| `/settings/about` | About & Legal |
| `/settings/totus-ai` | Totus Assist |

### Settings hub (`/settings/index.tsx`)

#### Hub cards (≤2 taps to About)

| Card | Destination |
|------|-------------|
| **About & Legal** | `/settings/about` |
| **Totus Assist** | `/settings/totus-ai` |

#### Appearance

| Control | Values |
|---------|--------|
| Theme | system / light / dark |

#### Security

| Control | Type |
|---------|------|
| Security policy link | External browser |
| Legal disclaimer link | External browser |
| Create / change master password | Forms + buttons |
| Lock vault | Button (when unlocked) |
| Auto-lock | 0 / 1 / 5 / 15 min chips |
| Block screenshots | Switch |
| Biometric unlock | Switch (if hardware) |
| Clipboard timeout | Input + Save |

#### Subscriptions

| Control | Action |
|---------|--------|
| Upgrade to Pro | Paywall sheet |
| Restore purchases | IAP restore |

#### Trip Planner Pro

| Control | Type |
|---------|------|
| Open routes in | Google / Apple (iOS) chips |
| In-app map preview | Switch |
| Driving distance engine | OSRM / Google / Mapbox |
| Advanced routing | Collapsible API key fields + Save |

#### Totus Assist (inline)

| Control | Action |
|---------|--------|
| Compact hub card | Status + Pro badge |
| Open Totus AI hub | → `/settings/totus-ai` |

#### Sync to desktop

| Control | Action |
|---------|--------|
| Export `.totus` | Share sheet |
| Open web vault | External URL (DuckDuck Go / default) |

#### Vault import / export

| Control | Action |
|---------|--------|
| Export encrypted vault | Share |
| Import vault file | Document picker |
| Audit log | Expand / export / clear |

---

## About & Legal (`/settings/about`)

Verified at `app/(tabs)/settings/about.tsx`.

| Item | Behavior |
|------|----------|
| App icon + name | Brand block |
| **Version row** | Tap **7×** → tester unlock entry |
| Store review banner | When `EXPO_PUBLIC_STORE_REVIEW_MODE=true` |
| Developer unlock banner | When `devUnlockActive` |
| Dev code input | `TOTUS-DEV-2026` → `toggleDevUnlock` |
| Disable developer unlock | Button when active |
| Contact support | Policy URL |
| Privacy, Terms, Data deletion, Permissions, etc. | `POLICY_LINKS` |
| Check for policy updates | Firebase fetch |
| All policies (web index) | Policy URL |
| Legal disclaimer | Policy URL |
| Package name / versionCode | Build metadata |

---

## Totus Assist (`/settings/totus-ai`)

| Item | Behavior |
|------|----------|
| ScreenHeader | Title + subtitle |
| Unlock help banner | Store review / About 7× / IAP |
| TotusAiHubCard | Status, download model, capabilities |
| Diagnostics panel | Entitlement, canRun, model bytes, llama |
| Download model | Progress %; verifies + init before “Ready” |
| Troubleshooting | EAS build, unlock, re-download |
| Browse template library | → `/templates/marketplace` |

---

## Web vault (`/vault`)

| Route | Purpose |
|-------|---------|
| `/vault` | Import `.totus`, unlock password |
| `/vault/notes` | Browse decrypted notes |
| `/vault/templates` | Browse templates |
| `/vault/template/[id]` | Template detail |

Hosted copy: https://totus--notes.web.app/vault

---

## Monetization / unlock paths

| Path | Steps |
|------|-------|
| Store review APK | Install `store-review-apk` build — Pro auto-unlocked |
| Dev unlock | Settings → About → tap version **7×** → `TOTUS-DEV-2026` |
| Production IAP | `pro_lifetime` purchase |

---

## Native capability gates

| Feature | Requires |
|---------|----------|
| Template AI | EAS build, Pro/dev/review, model download, llama init |
| Voice memos | Microphone permission, `expo-audio` |
| GPS trips | Location permissions |
| Photos | Camera / system photo picker permissions |

---

*Generated by Multi-Agent Production Engine — Agent 1*
