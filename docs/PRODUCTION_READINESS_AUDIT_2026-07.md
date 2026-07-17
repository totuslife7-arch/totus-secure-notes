# Production Readiness Audit — Totus Secure Notes

**Audit date:** July 17, 2026  
**Version:** 1.2.17 · Android **versionCode 63**  
**Package:** `com.totuslife.TotusSecureNotes`  
**Expo SDK:** 56 · **EAS owner:** `totuslife`  
**TypeScript:** `npx tsc --noEmit` — **passes**

---

## Executive summary

Code is **Play-submission ready** for permissions, vault crypto, and monetization wiring. **Production release is blocked** primarily by **manual Play Console work**, **unverified on-device AI/IAP**, and **production AdMob IDs**. This session fixed two code-level P0 gaps: **expired subscription entitlements persisting in cache** and **no user-configurable permanent template workflow** (pin-to-Home).

| Priority | Count | Theme |
|----------|-------|-------|
| **P0** | 5 | Play Console declarations, device AI proof, IAP products, AdMob production IDs, compliant AAB on all tracks |
| **P1** | 6 | iOS submit config, Firebase deploy, physical QA matrix, subscription renewal edge cases |
| **P2** | 4 | Predictive back, edge-to-edge QA, voice dictation, markdown template pinning |

---

## Top 5 blockers (action order)

| # | Blocker | Owner | Status |
|---|---------|-------|--------|
| 1 | **Play Console — Photo/video permissions** — Complete App content form; remove old `READ_MEDIA_*` declarations; ship versionCode **63+** on **all** tracks | Founder | Manual |
| 2 | **Play Console — Foreground service (location)** — FGS declaration + demo video for trip GPS | Founder | Manual |
| 3 | **IAP products not live-tested** — Create `pro_monthly` + `pro_lifetime` in Play Console; internal-test purchase on signed AAB | Founder | Manual |
| 4 | **Template AI / Note Assist unverified on device** — Requires EAS build + Pro Lifetime + ~240 MB model download; **not Expo Go** | Founder | Device test |
| 5 | **AdMob still on Google test IDs** — `store/products.json` → replace before public release | Founder | Manual |

---

## Feature matrix (Works / Gated / Broken)

Status key: **Works** = code complete, expected on EAS build · **Gated** = Pro / model / entitlement · **Broken** = defect · **Untested** = needs physical device · **Manual** = Play Console / store setup

### Core vault & security

| Feature | Tier | Status | Evidence / notes |
|---------|------|--------|------------------|
| AES-256-GCM vault | Free | **Works** | `services/storage.ts`, `services/sessionCrypto.ts` |
| Vault unlock / auto-lock / biometrics | Free | **Works** | `VaultContext`, `expo-local-authentication` |
| Note save queue (fast back) | Free | **Works** | `persistChainRef` in `context/VaultContext.tsx` |
| Encrypted attachments + voice memos | Free | **Works** | `services/attachments.ts` |
| Vault export (.totus) + web viewer | Free | **Works** | `services/vaultBundle.ts`, `app/vault/` |
| Custom templates in vault export | Free | **Works** | `customTemplates.enc` included in bundle |

### Template AI / Note Assist

| Feature | Tier | Status | Evidence / notes |
|---------|------|--------|------------------|
| SmolLM2 model download + GGUF verify | Pro Lifetime | **Gated** | `services/templateAi/modelManager.ts` |
| llama.rn inference (Template Studio) | Pro Lifetime | **Gated · Untested** | `generateTemplateDraft.ts` — EAS only; throws on Expo Go |
| Note Assist (bulletize, shorten, expand, summarize) | Pro Lifetime | **Gated · Untested** | `services/templateAi/noteAssist.ts` |
| Task digest AI summary | Pro Lifetime | **Gated · Untested** | `services/templateAi/taskDigestAi.ts` |
| Readiness + diagnostics hub | Free / Pro | **Works** | `hooks/useTemplateAiReadiness.ts`, `app/(tabs)/settings/totus-ai.tsx` |
| Quick parse (rules, no model) | Free | **Works** | `services/templateStudio/parsePastedForm.ts` |
| Expo Go | — | **Broken** (by design) | `llamaContext.native.ts` → `Constants.appOwnership === 'expo'` |

**AI on EAS builds:** Code path is complete. `generateTemplateDraft` requires: (1) `hasTemplateAi()` — Pro Lifetime, dev unlock, or store-review build; (2) model downloaded and verified; (3) `llama.rn` init success. Store-review profile sets `EXPO_PUBLIC_STORE_REVIEW_MODE=true` to unlock all entitlements for reviewers.

### Permanent template workflow

| Feature | Tier | Status | Evidence / notes |
|---------|------|--------|------------------|
| SoFo Postpartum form | Free | **Works** | `store/postpartumTemplate.ts`, `PostpartumForm.tsx` |
| Template Studio briefcase (save custom) | Pro Lifetime | **Gated** | `services/templateStudio/templateStorage.ts` |
| Built-in → briefcase copy | Free | **Works** | `app/(tabs)/templates/builtin/[id].tsx` |
| **Pin any template to Home** | Free | **Works** *(fixed this session)* | `services/pinnedTemplates.ts`, `hooks/usePinnedTemplates.ts` |
| Home quick actions (dynamic pins) | Free | **Works** *(fixed this session)* | `app/(tabs)/home/index.tsx` |
| Templates gallery — My briefcase section | Pro Lifetime | **Works** *(fixed this session)* | `components/TemplateGallery.tsx` |
| Markdown template pin | Free | **Gated** | Pins route to Templates tab only (P2) |

### IAP / monetization

| Feature | Tier | Status | Evidence / notes |
|---------|------|--------|------------------|
| Paywall sheet + restore | Free | **Works** (code) | `PaywallSheet.tsx`, `MonetizationContext.tsx` |
| `pro_monthly` → no ads | Paid | **Untested** | Needs Play Console subscription + signed build |
| `pro_lifetime` → all premium | Paid | **Untested** | Needs Play Console product + signed build |
| Dev unlock `TOTUS-DEV-2026` | Dev | **Works** | `services/devUnlock.ts` |
| Store-review mode (all unlocked) | Review | **Works** | `EXPO_PUBLIC_STORE_REVIEW_MODE` in `eas.json` |
| Expired subscription cache | — | **Works** *(fixed this session)* | `syncOwnedProductIdsFromStore()` in `iapEntitlements.ts` |
| AdMob banner (free tier) | Free | **Works** (test IDs) | `store/products.json` — **replace for production** |

### Google Play compliance (v1.2.16)

| Area | Status | Evidence / notes |
|------|--------|------------------|
| READ_MEDIA_* stripped | **Works** | `app.json` blockedPermissions + `plugins/withAndroidPhotoPicker.js` |
| Photo Picker for gallery attach | **Works** | `services/attachments.ts` |
| versionCode 63 | **Works** | `app.json` |
| targetSdk 36 (SDK 56 default) | **Works** | Expo SDK 56 — confirm in bundle explorer after build |
| Play declaration forms | **Manual** | See `docs/PLAY_PHOTO_PERMISSIONS_DECLARATION.md` |
| Location FGS declaration | **Manual** | Trip GPS — demo video required |

---

## Fixes applied this session (P0 code)

| Fix | Files | Why |
|-----|-------|-----|
| **Subscription entitlement sync** | `services/iapEntitlements.ts`, `context/MonetizationContext.tsx` | `mergeOwnedProductIds` only added SKUs; expired `pro_monthly` could keep `no_ads` forever. New `syncOwnedProductIdsFromStore()` drops stale subscriptions while preserving lifetime purchases. |
| **Pin template to Home workflow** | `services/pinnedTemplates.ts`, `hooks/usePinnedTemplates.ts`, Home, Gallery, Studio, Built-in | User-requested permanent workflow. Any form, built-in, or briefcase template can pin to Home quick actions. Default pin: SoFo Postpartum HV. |

---

## What the founder must do manually

### Play Console (before production)

1. **Photo and video permissions** — One-time/infrequent + Android Photo Picker; remove `READ_MEDIA_*` from all tracks ([PLAY_PHOTO_PERMISSIONS_DECLARATION.md](./PLAY_PHOTO_PERMISSIONS_DECLARATION.md))
2. **Foreground service — location** — Declaration + demo video (start trip → background → notification)
3. **Upload versionCode 63+ AAB** to internal testing; verify Permissions tab in App bundle explorer
4. **IAP** — Create `pro_lifetime` (non-consumable) and `pro_monthly` (subscription with active base plan) per [store/IAP_SETUP.md](../store/IAP_SETUP.md)
5. **License testers** — Add Gmail accounts; test purchase + Restore purchases
6. **Data safety** — Align with Firebase, AdMob, IAP ([DATA_SAFETY_GOOGLE_PLAY.md](./DATA_SAFETY_GOOGLE_PLAY.md))
7. **Remove old non-compliant builds** (e.g. versionCode 52) from all tracks

### AdMob

1. Create production Android/iOS apps in AdMob
2. Replace test IDs in `store/products.json` → `ads` section
3. Link AdMob in Play Console

### Device verification (15 min)

Use **store-review APK** (`npm run build:store-review-apk`):

1. Unlock vault → Settings → About → 7× version → `TOTUS-DEV-2026` (or use store-review pre-unlock)
2. Settings → Totus Assist → Download model (~240 MB) → green **Ready**
3. Template Studio → paste form → **AI assist** → review shows **AI** badge (not rules)
4. Note editor → Note Assist → bulletize changes content
5. Templates → pin custom template → Home shows it in quick actions
6. Production build: Paywall shows Play prices; test IAP on internal track

### iOS (if shipping)

- Replace `REPLACE_WITH_*` in `eas.json` submit section
- TestFlight upload via `npm run build:store-review-ios`

### Firebase policies

```bash
npm run policies:build && npm run firebase:deploy
```

Verify https://totus--notes.web.app policies load.

---

## EAS build commands

### Founder device testing (Pro unlocked, paywalls off)

```bash
# Android sideload APK — AI + full entitlements for reviewers
npm run build:store-review-apk

# Android AAB for Play internal / closed testing
npm run build:store-review

# iOS store-review IPA
npm run build:store-review-ios
```

### Production release (paywalls ON)

```bash
# Play Store AAB (autoIncrement bumps versionCode)
npm run build:aab

# Production sideload APK
npm run build:apk-prod

# iOS App Store
npm run build:ios

# Submit to Play internal track (requires google-play-service-account.json)
eas submit --platform android --profile production
```

### Dev client (native modules, debugging)

```bash
npm run build:android:dev
npm run build:ios:dev
```

---

## AI decision tree (for device debugging)

```
User taps AI assist
  → hasTemplateAi()?           NO → Paywall / dev unlock / store-review build
  → getTemplateAiReadiness()?  NO → Show block reason (Expo Go, model missing, llama error)
  → generateTemplateDraft()    → parse fail → Error (no silent rules unless Quick parse)
  → success                    → review screen source: 'ai'
```

Common false "AI doesn't work" causes:

| Symptom | Cause |
|---------|-------|
| Only Quick parse works | Running **Expo Go**, or no Pro Lifetime, or model not downloaded |
| Model says ready but AI fails | Corrupt GGUF — re-download; check Totus Assist diagnostics |
| Paywall on every AI tap | Production build without purchase; use dev unlock or store-review build |

---

## Security vault assessment

| Check | Result |
|-------|--------|
| Notes encrypted at rest | ✅ AES-256-GCM via session crypto |
| Save queue prevents race on fast back | ✅ `persistChainRef` serializes writes |
| Custom templates encrypted separately | ✅ `vault/customTemplates.enc` |
| No cloud PHI backend | ✅ Local-first architecture |
| Template AI sends data to cloud LLM | ✅ No — HuggingFace CDN is model download only |
| IAP secrets in repo | ✅ Product IDs only; no billing keys in git |

---

## P1 / P2 backlog (not fixed this session)

| Priority | Item |
|----------|------|
| P1 | Physical device sign-off on Template AI + Note Assist |
| P1 | Play internal-test IAP end-to-end |
| P1 | Production AdMob IDs |
| P1 | iOS App Store Connect setup (`eas.json` placeholders) |
| P1 | Firebase policy deploy if stale |
| P2 | Pin markdown templates → create note with template content |
| P2 | Android 16 predictive back / edge-to-edge visual QA |
| P2 | Voice dictation (manifest shows "Coming soon") |
| P2 | expo-iap subscription grace period / billing retry UX |

---

## Success criteria

Founder installs **store-review APK**, downloads model once, opens **Home** → pinned template → **Template Studio → AI assist** → review shows **AI badge** → **Note Assist** works on a note → completes **test IAP** on internal track → Play Console shows **no READ_MEDIA_*** on versionCode 63 → says:

> *"I know what this app does, AI actually works on my phone, billing works, and Play will accept the build."*

**Code gate:** passed (TypeScript clean, P0 code fixes applied).  
**Ship gate:** founder device test + Play Console forms + production AdMob/IAP.

---

*Generated by production readiness audit — July 17, 2026*
