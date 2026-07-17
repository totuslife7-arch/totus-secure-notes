# Founder Follow-Up — Totus Secure Notes v1.2.16

**Latest release:** v1.2.17 (versionCode 63) — READ_MEDIA manifest merge fix + Photo Picker compliance. See [RELEASE_NOTES.md](../store/RELEASE_NOTES.md) v1.2.16 section.

**After the Master Development Audit** — step-by-step actions for the founder.  
**Audit report:** [AUDIT_REPORT.md](./AUDIT_REPORT.md)  
**Release notes:** [../store/RELEASE_NOTES.md](../store/RELEASE_NOTES.md)

---

## Build artifacts — where each file goes

| Artifact | EAS profile | Upload where | Purpose |
|----------|-------------|--------------|---------|
| **AAB** | `store-review` | Play Console → **Internal testing** or **Closed testing** (or Production for review) | Play Store submission; **reviewers get Pro unlocked** |
| **APK** | `store-review-apk` | **Sideload to Android phone only** — do **NOT** upload to Play Console | Founder device testing before submission |
| **AAB** | `production` | Play Console → **Production** | Public release **after** review passes (paywalls ON, ads ON for free tier) |
| **IPA / iOS** | `store-review` | App Store Connect → **TestFlight** | iOS testing and App Review |

### Commands (run from repo root)

```bash
# Play Store review AAB (Pro unlocked for reviewers)
npm run build:store-review

# Founder sideload APK (NOT for Play Console)
npm run build:store-review-apk

# iOS TestFlight / App Review
npm run build:store-review-ios
# or: eas build --platform ios --profile store-review --non-interactive

# Public release AFTER review (paywalls ON)
npm run build:aab          # Android production AAB
npm run build:ios          # iOS production IPA
```

### EAS build URLs (v1.2.12)

| Build | Profile | URL | Status |
|-------|---------|-----|--------|
| Android AAB (Play review) | `store-review` | https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds/5ce77c98-bfec-47bc-a827-7ae8697fac61 | **Success** (versionCode 52) |
| Android APK (sideload) | `store-review-apk` | — | Pending — run after AAB upload |
| iOS IPA (TestFlight) | `store-review` | — | **Blocked** — iOS credentials need interactive setup (see below) |

**AAB artifact:** https://expo.dev/artifacts/eas/rHFXBByXY-utX_8ilZSrv5PDGhf9O2XHT6yOsrhAsIc.aab

**Superseded builds (versionCode 49):**
- AAB: https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds/6fcfdf54-9705-45f9-89e6-b8ffa036d62f
- APK: https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds/8a33c14e-0d5a-4cf9-bdc3-1508aed381a5

**Prior store-review APK (v1.2.11, may still work for testing):**  
https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds/3975b88e-0d37-4a5e-b84d-725208ca7d27

**EAS dashboard:** https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds

### iOS build — founder must run interactively

Non-interactive iOS build failed: *"Credentials are not set up. Run this command again in interactive mode."*

```bash
eas login
eas build --platform ios --profile store-review
# Follow prompts to configure Apple Distribution Certificate + Provisioning Profile
```

After credentials are stored on EAS, future builds can use `--non-interactive`.

---

## Step 1 — Install and smoke-test (15 minutes)

Use the **store-review APK** (sideload) on a physical Android phone. Do **not** use Expo Go.

1. Enable **Install from unknown sources** for your file manager / browser.
2. Download the APK from the EAS build page → Install.
3. **First launch:** create vault password `TotusReview2026!` (or your choice, min 12 chars).
4. Confirm **Settings → About** shows: *"Store review mode — Pro features unlocked for app review."*
5. **Home tab** — vault status, quick actions, recent notes visible.
6. **Settings → Totus Assist** — download SmolLM2 model (~240 MB, Wi‑Fi recommended).
7. **Template Studio → paste sample text → AI assist** — wait for inference; **Review** screen must show **AI** badge (not rules only).
8. **Notes → open note → Note Assist** — try bulletize or summarize.
9. **Trips** — start a test trip, verify GPS permission prompt.
10. **Settings → Sync to desktop** — export `.totus`, open https://totus--notes.web.app/vault on PC.

**Optional dev unlock (production builds only):** Settings → About → tap version **7×** → enter `TOTUS-DEV-2026`.

---

## Step 2 — Google Play Console checklist

Before submitting the **store-review AAB**:

### App access (required)

Copy sign-in instructions from [STORE_REVIEW_ACCESS.md](./STORE_REVIEW_ACCESS.md) into:

**Play Console → App content → App access → Instructions**

Reviewer password suggestion: `TotusReview2026!`

### In-app products (IAP)

Verify in Play Console → Monetize → Products:

| Product ID | Type | Purpose |
|------------|------|---------|
| `pro_monthly` | Subscription | No ads |
| `pro_lifetime` | One-time | All premium (Template AI, Studio, Trip Pro, Note Assist) |

Setup details: [../store/IAP_SETUP.md](../store/IAP_SETUP.md)

Test IAP on **internal testing track** with a license tester account before production.

### Data safety

Complete the form using [DATA_SAFETY_GOOGLE_PLAY.md](./DATA_SAFETY_GOOGLE_PLAY.md).  
Privacy URL: https://totus--notes.web.app/privacy

### Location permissions (videos)

Google may require demonstration videos for background location:

- `assets/app store/videos/google-play-background-location-walkthrough.mp4`
- `assets/app store/videos/google-play-foreground-service-location.mp4`

Upload in Play Console → App content → Sensitive permissions.

### Release upload

1. **Internal testing** → Create release → Upload **store-review AAB** (not APK).
2. Paste release notes from [../store/RELEASE_NOTES.md](../store/RELEASE_NOTES.md) (v1.2.12 section).
3. Add testers → Install from Play Store link.
4. After review approval, ship **production AAB** (`npm run build:aab`) to Production track.

---

## Step 3 — iOS TestFlight

1. Run `npm run build:store-review-ios` (or use URL from audit).
2. Upload IPA via **EAS Submit** or **Transporter** to App Store Connect.
3. Add internal testers in TestFlight.
4. Paste What's New from [../store/RELEASE_NOTES.md](../store/RELEASE_NOTES.md).
5. App Review notes: same vault instructions as [STORE_REVIEW_ACCESS.md](./STORE_REVIEW_ACCESS.md).

iOS sideload details: [DEVELOPMENT_AND_BUILDS.md](./DEVELOPMENT_AND_BUILDS.md#ios-sideload-and-testflight)

---

## Step 4 — Firebase policies deploy

If policies or docs changed, deploy hosting + Firestore rules:

```bash
npm run policies:build
npm run firebase:deploy
```

Full deploy with policy seed (first-time or version bump):

```bash
npm run firebase:deploy:all
```

**Requires:** Firebase CLI logged in (`firebase login`) and project access to `totus--notes`.

**Verify after deploy:**

- https://totus--notes.web.app/privacy
- https://totus--notes.web.app/terms
- https://totus--notes.web.app/vault

> If deploy failed during the audit (no credentials in CI), run the commands above on your machine.

---

## Step 5 — Post-launch verification

| Check | Pass criteria |
|-------|---------------|
| Production build paywall | Upgrade sheet shows Play prices |
| IAP test purchase | Internal track — entitlement unlocks Template AI |
| Template AI on device | Review badge = **AI**, diagnostics show success |
| Note save race | Edit → back in &lt;2s → content persists |
| Ads on free tier | Banner visible on Notes (production build only) |
| Store-review build | No ads, all Pro features unlocked |

---

## Quick reference

| Resource | Location |
|----------|----------|
| Audit feature matrix | `docs/AUDIT_REPORT.md` |
| Store reviewer access | `docs/STORE_REVIEW_ACCESS.md` |
| Build commands | `docs/DEVELOPMENT_AND_BUILDS.md` |
| IAP setup | `store/IAP_SETUP.md` |
| Play listing copy | `store/GOOGLE_PLAY_LISTING.md` |
| EAS builds dashboard | https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds |

---

*Production Engine + SoFo rescue v1.2.12 — founder handoff*
