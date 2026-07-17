# Google Play Production Checklist — Totus Secure Notes (July 2026)

**App:** Totus Secure Notes  
**Package:** `com.totuslife.TotusSecureNotes`  
**Current release:** v1.2.16 · Android versionCode **62**  
**Expo SDK:** 56 · **expo-iap:** ^4.3.1 (Play Billing Library **8.x** via OpenIAP)  
**Last reviewed:** July 17, 2026  

This is a **step-by-step dummy guide** for publishing Totus Secure Notes on Google Play with **IAP, AdMob, location FGS, and photo-picker compliance**. It does not change code — follow the links and checkboxes in Play Console.

**Related repo docs:** [`store/products.json`](../store/products.json) · [`store/IAP_SETUP.md`](../store/IAP_SETUP.md) · [`DATA_SAFETY_GOOGLE_PLAY.md`](DATA_SAFETY_GOOGLE_PLAY.md) · [`ADMOB_SETUP.md`](ADMOB_SETUP.md) · [`PLAY_PHOTO_PERMISSIONS_DECLARATION.md`](PLAY_PHOTO_PERMISSIONS_DECLARATION.md) · [`ANDROID_17_PLAY_READINESS.md`](ANDROID_17_PLAY_READINESS.md) · [`GOOGLE_PLAY_POLICY_COMPLIANCE.md`](GOOGLE_PLAY_POLICY_COMPLIANCE.md)

---

## Quick reference — official Google links

| Topic | Official documentation |
|-------|------------------------|
| Play Billing — getting started | https://developer.android.com/google/play/billing/getting-ready |
| Play Billing — integrate | https://developer.android.com/google/play/billing/integrate |
| Billing Library version deadlines | https://developer.android.com/google/play/billing/deprecation-faq |
| Create subscriptions (Console) | https://support.google.com/googleplay/android-developer/answer/140504 |
| One-time products (Console) | https://support.google.com/googleplay/android-developer/answer/16430488 |
| Subscription policy | https://support.google.com/googleplay/android-developer/answer/9900533 |
| Data safety form | https://support.google.com/googleplay/android-developer/answer/10787469 |
| Photo & video permissions | https://support.google.com/googleplay/android-developer/answer/14115180 |
| Foreground service declaration | https://support.google.com/googleplay/android-developer/answer/13392821 |
| Sensitive permissions policy | https://support.google.com/googleplay/android-developer/answer/9888170 |
| Closed testing (12 testers / 14 days) | https://support.google.com/googleplay/android-developer/answer/14151465 |
| Target API level requirements | https://support.google.com/googleplay/android-developer/answer/11926878 |
| Prepare app for review | https://support.google.com/googleplay/android-developer/answer/9859455 |
| Developer Program Policy | https://play.google.com/about/developer-content-policy/ |
| Health apps / permissions (if applicable) | https://support.google.com/googleplay/android-developer/answer/12991134 |
| Expo IAP docs | https://hyochan.github.io/expo-iap/ |
| Expo SDK 56 reference | https://docs.expo.dev/versions/v56.0.0/ |

---

## Before you start — account & build prerequisites

Complete these once. Skip steps that are already done.

| # | Step | Where | Why |
|---|------|-------|-----|
| 0.1 | Create / verify **Google Play Console** developer account | https://play.google.com/console | Required to publish |
| 0.2 | Complete **Payments profile** (merchant / tax) | Play Console → **Setup → Payments profile** | Required before paid IAP goes live |
| 0.3 | Create app entry with package **`com.totuslife.TotusSecureNotes`** | Play Console → **All apps → Create app** | Must match `app.json` |
| 0.4 | Upload first **AAB** with `BILLING` permission (via `expo-iap` plugin) | **Testing → Internal testing** | [Google requires a billing-enabled build before product setup unlocks fully](https://developer.android.com/google/play/billing/getting-ready) |
| 0.5 | Confirm **targetSdkVersion 36** on uploaded AAB | **Release → App bundle explorer → Details** | Expo SDK 56 default; [Aug 31, 2026 deadline for API 36](https://support.google.com/googleplay/android-developer/answer/11926878) |
| 0.6 | **Privacy policy URL** live | https://totus--notes.web.app/privacy | Required for production; must match Data safety |
| 0.7 | **New personal accounts only:** closed test with **≥12 testers opted in for 14 consecutive days** | [Testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465) | Required before **Apply for production access** |

**Build commands (reference only — do not run unless releasing):**

```powershell
npm run build:aab                    # production AAB
eas build --profile store-review     # reviewer build (unlocks all Pro features via EXPO_PUBLIC_STORE_REVIEW_MODE)
```

---

## Part 1 — Google Play Billing setup checklist

Google Play Billing is the **only** allowed payment system for digital goods (Pro, subscriptions, ad removal) on Android. Totus uses **`expo-iap`** → Play Billing Library **8.x** (meets the [v7+ requirement](https://developer.android.com/google/play/billing/deprecation-faq); v7 deadline **Aug 31, 2026**).

### 1.1 Merchant & console setup

- [ ] **Payments profile** complete (legal name, address, tax forms)
- [ ] App uploaded to at least **Internal testing** with billing permission in manifest
- [ ] **Setup → License testing** — add Gmail accounts you will use for test purchases ([license testers doc](https://support.google.com/googleplay/android-developer/answer/6062777))
- [ ] Test device signed into Play Store with a **license tester** account (not your primary developer account for real charges during dev)

### 1.2 Product catalog (must match code)

Totus sells **two** digital products. IDs are defined in [`store/products.json`](../store/products.json) and loaded by [`services/productCatalog.ts`](../services/productCatalog.ts):

| Product ID | Play Console type | Billing Library `ProductType` | What user gets |
|------------|-------------------|-------------------------------|----------------|
| `pro_monthly` | **Subscription** (auto-renewing base plan) | `SUBS` | `no_ads` — removes banner ads |
| `pro_lifetime` | **One-time product** (non-consumable) | `INAPP` | `no_ads`, `premium_templates`, `trip_planner`, `template_studio`, `template_ai` |

**Entitlement logic** ([`services/monetization.ts`](../services/monetization.ts)):

- **Free:** ads enabled (`ADS_CONFIG.enabledInFreeTier`), core notes/trips/templates
- **Pro Monthly:** `showAds = false` only
- **Pro Lifetime:** all premium entitlements + no ads
- Purchases stored locally in SecureStore; restored via **Restore purchases** in Settings

### 1.3 Play Console — create products (dummy walkthrough)

#### A. One-time product: `pro_lifetime`

1. Open [Play Console](https://play.google.com/console) → select **Totus Secure Notes**
2. Go to **Monetize with Play → Products → One-time products**
3. Click **Create one-time product**
4. Fill in:

   | Field | Value |
   |-------|-------|
   | **Product ID** | `pro_lifetime` *(exact — cannot change later)* |
   | **Name** | `Pro Lifetime` |
   | **Description** | `One payment — no ads, Trip Planner Pro, Template Studio, Template AI, and all premium features forever.` |

5. Click **Next** → **Purchase option**:
   - **Purchase option ID:** e.g. `lifetime-default`
   - **Purchase type:** **Buy**
   - **Product type:** **Non-consumable** (user keeps forever; survives reinstall when tied to Play account)
   - Set **price** for your primary countries (e.g. USD)
6. **Activate** the purchase option and product

Official guide: [Overview of one-time products](https://support.google.com/googleplay/android-developer/answer/16430488)

> **Note:** Google renamed legacy “managed in-app products” to **one-time products** (Billing Library 8+). Do not create `pro_lifetime` under the old “In-app products” UI if Console offers the new one-time product flow.

#### B. Subscription: `pro_monthly`

1. **Monetize with Play → Products → Subscriptions**
2. Click **Create subscription**
3. Fill in:

   | Field | Value |
   |-------|-------|
   | **Product ID** | `pro_monthly` |
   | **Name** | `Pro Monthly` |
   | **Description** | `Remove banner ads. Subscribe monthly; cancel anytime in the store.` |

4. Click **Create** → **Add base plan**:
   - **Base plan ID:** e.g. `monthly-default`
   - **Renewal type:** Auto-renewing
   - **Billing period:** 1 month
   - Set regional **price**
   - **Activate** base plan
5. Optional: **Benefits** (up to 4) — e.g. `No banner ads`
6. **Activate** subscription

Official guide: [Create and manage subscriptions](https://support.google.com/googleplay/android-developer/answer/140504)

**Product ID rules** ([Console help](https://support.google.com/googleplay/android-developer/answer/14590082)):

- Lowercase letters, numbers, underscores, periods; max 40 chars; **immutable** after creation
- Must match `androidProductId` in `store/products.json` **exactly**
- Remove/deactivate legacy test SKUs (`pro_yearly`, `template_studio_*`, etc.) if created during earlier experiments

### 1.4 App-side billing checklist (verify, don’t implement here)

- [ ] `expo-iap` listed in `app.json` **plugins** array
- [ ] EAS **production** or **store-review** build installed (not Expo Go)
- [ ] App queries SKUs: `pro_lifetime` as `in-app`, `pro_monthly` as `subs` ([`MonetizationContext.tsx`](../context/MonetizationContext.tsx))
- [ ] Purchase flow calls `finishTransaction` with `isConsumable: false` (required — unacknowledged purchases auto-refund within ~3 days)
- [ ] **Restore purchases** works on a second device / reinstall with same Play account
- [ ] Store listing mentions subscription terms if you offer `pro_monthly` ([Subscriptions policy](https://support.google.com/googleplay/android-developer/answer/9900533))

### 1.5 Real-time developer notifications (optional but recommended)

- [ ] **Monetize → Monetization setup → Real-time developer notifications** — configure Pub/Sub topic for subscription renewals, cancellations, voided purchases  
  Guide: https://developer.android.com/google/play/billing/getting-ready#configure-rtdn

Totus currently grants entitlements **client-side** (SecureStore + Play restore). RTDN is optional for v1 but helps if you add server-side validation later.

### 1.6 Testing purchases (dummy flow)

1. Add your Gmail to **License testing**
2. Install **Internal testing** build from Play Store opt-in link
3. Open app → **Settings → Upgrade / Pro**
4. Purchase **Pro Monthly** → confirm ads disappear; Trip Planner Pro **still locked**
5. Purchase **Pro Lifetime** (or use separate test account) → all premium routes unlock
6. Tap **Restore purchases** → entitlements persist after force-stop / reinstall
7. Cancel subscription in Play Store → after expiry, ads return unless Lifetime owned

---

## Part 2 — Play Console IAP ↔ `store/products.json` mapping

Use this table when creating or auditing Console products:

```json
// store/products.json (authoritative catalog)
{
  "androidPackage": "com.totuslife.TotusSecureNotes",
  "products": {
    "pro_monthly": {
      "type": "subscription",
      "androidProductId": "pro_monthly",
      "displayName": "Pro Monthly",
      "grants": ["no_ads"]
    },
    "pro_lifetime": {
      "type": "non_consumable",
      "androidProductId": "pro_lifetime",
      "displayName": "Pro Lifetime",
      "grants": ["no_ads", "premium_templates", "trip_planner", "template_studio", "template_ai"]
    }
  }
}
```

| JSON key | Console location | Console setting |
|----------|------------------|-----------------|
| `pro_monthly` / `androidProductId` | Subscriptions → Product ID | `pro_monthly` |
| `pro_monthly` / `type: subscription` | Subscriptions → Base plan | Auto-renewing, monthly |
| `pro_lifetime` / `androidProductId` | One-time products → Product ID | `pro_lifetime` |
| `pro_lifetime` / `type: non_consumable` | One-time products → Purchase option | Buy, **non-consumable** |
| `ads.*` | AdMob + `app.json` plugin | See Part 4 — **replace test IDs before production** |

**Mismatch = broken purchases.** If Console has `pro-monthly` but code queries `pro_monthly`, the paywall shows no price and purchase fails silently.

---

## Part 3 — Declarations: photo/video, FGS location, Data safety, AdMob

Complete all items under **Play Console → Policy and programs → App content** (or **Monitor and improve → App content**) **before** sending Production for review.

### 3.1 Photo and video permissions

Totus **does not** use `READ_MEDIA_IMAGES` or `READ_MEDIA_VIDEO`. Gallery attach uses **Android Photo Picker** (`expo-image-picker` / PickVisualMedia); videos use **document picker**.

**Manifest reality (v1.2.16):**

- Permissions **blocked** in `app.json` + stripped by `plugins/withAndroidPhotoPicker.js`
- Camera (`CAMERA`) only when user taps Camera
- `RECORD_AUDIO` only when user taps Record on voice memo

**Play Console dummy steps:**

1. Upload compliant AAB (**versionCode 63+**) to **every active track** (internal, closed, open, production)
2. **App content → Photo and video permissions → Manage**
3. Answer:

   | Question | Answer |
   |----------|--------|
   | How does app use photos/videos? | **One-time or infrequent** |
   | Core functionality needs all photos on device? | **No** |
   | How will you access media? | **Android photo picker** |
   | Removing READ_MEDIA permissions? | **Yes** (versionCode 63+) |

4. **App bundle explorer → versionCode 62 → Permissions tab** — confirm **no** `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO`
5. If old declaration blocks publish, **update** (you cannot delete) — see [`PLAY_PHOTO_PERMISSIONS_DECLARATION.md`](PLAY_PHOTO_PERMISSIONS_DECLARATION.md)

Official policy: https://support.google.com/googleplay/android-developer/answer/14115180

### 3.2 Foreground service — location (trip GPS)

Totus records **optional trip mileage** with background location via `expo-location`:

- Manifest: `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`
- **No** `FOREGROUND_SERVICE_MEDIA_PLAYBACK` (voice memos play in foreground modal only)

**Play Console dummy steps:**

1. **App content → Foreground service permissions → Start / Manage**
2. Declare **`location`** type only
3. Describe use case (example text):

   > Totus Secure Notes optionally records GPS trip mileage between patient visits for reimbursement logs. When the user starts a trip, a persistent notification shows recording status. Location data stays encrypted on device; not sent to Totus servers.

4. Upload **demo video** (~30–90 s): start trip → show notification → background app → return → stop trip  
   Requirements: https://support.google.com/googleplay/android-developer/answer/13392821
5. Ensure in-app **prominent disclosure** before background location request matches declaration (strings in `app.json` → `expo-location` plugin)

**Do not declare** `mediaPlayback`, `camera`, `microphone`, or other FGS types Totus does not use.

Android developer reference: https://developer.android.com/develop/background-work/services/fgs/service-types

### 3.3 Data safety form

Use [`DATA_SAFETY_GOOGLE_PLAY.md`](DATA_SAFETY_GOOGLE_PLAY.md) as the source of truth. Summary for **v1.2.16 with ads + IAP**:

**Step-by-step (Console):**

1. **App content → Data safety → Start / Manage**
2. **Does your app collect or share user data?** → **Yes**
3. **Is all user data encrypted in transit?** → **Yes** (HTTPS for Firebase, AdMob, Play Billing; notes are local-only)
4. **Do you provide a way for users to request deletion?** → **Yes** — uninstall / clear app data (no server-side note vault)

**Declare these data types:**

| Data type | Collected? | Shared? | With whom | Purpose |
|-----------|------------|---------|-----------|---------|
| **Crash logs** | Yes | Yes | Google (Firebase Crashlytics) | App functionality / analytics |
| **Diagnostics** (screen views) | Yes | Yes | Google (Firebase Analytics) | App functionality |
| **Device or other IDs** | Yes | Yes | Google (AdMob) | Advertising (free tier only) |
| **App interactions** (ad views) | Yes | Yes | Google (AdMob) | Advertising |
| **Purchase history** | Yes | Yes | Google Play | App functionality |
| **Approximate location** | Optional, on-device | No | — | User-initiated trip mileage (declare if prompted) |
| **Photos / audio** | Optional, on-device | No | — | Encrypted attachments; only if user attaches |

**Do not declare:** note plaintext, passwords, patient names — these stay on device and are **not** collected by the developer.

5. **Ads declaration:** if production AdMob is in the build → data used for **Advertising or marketing**
6. Save → Submit for review (App content review is separate from release review)

Form guide: https://support.google.com/googleplay/android-developer/answer/10787469

**Critical:** Data safety must match **Privacy policy** (https://totus--notes.web.app/privacy) and **store listing**. Do not claim “no data collected” after AdMob ships.

### 3.4 Ads (AdMob) declaration

When the production AAB includes `react-native-google-mobile-ads`:

| # | Step | Details |
|---|------|---------|
| 1 | Create AdMob Android app | [`ADMOB_SETUP.md`](ADMOB_SETUP.md) — link Firebase project `totus--notes` |
| 2 | Create **banner** ad unit | Copy production App ID + unit ID |
| 3 | Replace **test IDs** in `app.json` + `store/products.json` | Current values are Google test IDs (`ca-app-pub-3940256099942544~…`) |
| 4 | Rebuild AAB | Native AdMob requires new EAS build; `play-services-ads` pinned to **24.6.0** (SDK 56 / Kotlin 2.1) |
| 5 | **App content → Ads → Contains ads** | **Yes** |
| 6 | **Monetize → Ads** (optional) | Link AdMob app for mediation later |
| 7 | Update **Data safety** | Device IDs + ad interactions (see §3.3) |
| 8 | Update **Privacy policy** + store description | Disclose advertising; free tier shows banners, Pro removes ads |

AdMob policy: ads must comply with [Families / children policies](https://support.google.com/googleplay/android-developer/answer/9893335) if you target minors — Totus targets **13+ / general audience**, not Designed for Families.

### 3.5 Other App content items (don’t skip)

| Declaration | Totus answer |
|-------------|--------------|
| **Privacy policy** | https://totus--notes.web.app/privacy |
| **App access** | Provide demo master password for reviewers — see [`GOOGLE_PLAY_POLICY_COMPLIANCE.md`](GOOGLE_PLAY_POLICY_COMPLIANCE.md) |
| **Ads** | Yes (when AdMob in build) / No (ad-free test builds only) |
| **Content rating** | Complete IARC questionnaire — likely **Everyone** or **Teen** |
| **Target audience** | Not primarily children under 13 |
| **Financial features** | No (IAP is digital goods, not banking) |
| **Health apps** | **Careful** — see Part 5; use **Productivity** category unless declaring clinical features |
| **News / COVID** | No |
| **Government apps** | No |

---

## Part 4 — expo-iap + Google Play requirements (Expo SDK 56)

### 4.1 Stack summary

| Component | Totus version | Notes |
|-----------|---------------|-------|
| Expo SDK | 56 (`targetSdkVersion` **36**) | https://docs.expo.dev/versions/v56.0.0/ |
| expo-iap | ^4.3.1 (npm resolves 4.4.x) | OpenIAP spec; Play Billing **8.x** |
| Kotlin | 2.x (SDK 56 default) | Required for Billing Library 8+ |
| Play Billing Library | **8.x** (via expo-iap native module) | Meets v7 deadline (Aug 31, 2026) |
| Config plugin | `"expo-iap"` in `app.json` plugins | Adds `com.android.vending.BILLING` permission |

### 4.2 Requirements checklist

- [ ] **Do not use Expo Go** for IAP testing — use EAS dev client or store build ([expo-iap installation](https://hyochan.github.io/expo-iap/getting-started/installation))
- [ ] **SDK 56+** — no Kotlin downgrade plugin needed (SDK 52 required Billing Library 6 workaround; Totus is past that)
- [ ] Product IDs in code = Product IDs in Play Console (see Part 2)
- [ ] Upload billing-enabled AAB before Console product activation
- [ ] **License testers** for sandbox purchases
- [ ] **`finishTransaction`** called after successful purchase ([`MonetizationContext.tsx`](../context/MonetizationContext.tsx))
- [ ] Subscriptions: app handles `pro_monthly` via `type: 'subs'` in `requestPurchase`
- [ ] One-time: `pro_lifetime` via `type: 'in-app'`, non-consumable
- [ ] **Restore purchases** on launch / Settings tap syncs `availablePurchases` → SecureStore

### 4.3 Store review mode

EAS profile **`store-review`** sets `EXPO_PUBLIC_STORE_REVIEW_MODE=true`, which grants all entitlements without purchase ([`services/monetization.ts`](../services/monetization.ts)). Use this AAB when reviewers need Pro/Trip Planner/Template AI access without buying.

```powershell
eas build --profile store-review --platform android
```

Upload to **Internal testing** or attach instructions in **App access** declaration.

### 4.4 Billing Library version policy (July 2026)

Per [deprecation FAQ](https://developer.android.com/google/play/billing/deprecation-faq):

| Library version | New app/update deadline |
|-----------------|-------------------------|
| 6 | Aug 31, 2025 (passed) |
| 7 | Aug 31, 2026 |
| 8 | Aug 31, 2027 |

Totus on expo-iap 4.x uses **Billing 8.x** — compliant through 2027. When upgrading expo-iap, re-check release notes for Billing 9 migration (deadline 2028).

### 4.5 Known SDK 56 integration notes

| Area | Detail |
|------|--------|
| **AdMob + Kotlin** | `react-native-google-mobile-ads@16.0.0`; `play-services-ads` pinned to 24.6.0 via `plugins/withPlayServicesAdsPin.js` |
| **Photo picker** | `withAndroidPhotoPicker.js` runs **last** in plugins array so `tools:node="remove"` survives Gradle merge |
| **No server receipt validation** | Acceptable for v1; add Play Developer API verification before high-value fraud exposure |

---

## Part 5 — Common rejection reasons (productivity / health-adjacent apps)

Totus is a **local-first encrypted notes / productivity** app with **optional clinical-style templates** (SoFo postpartum). It is **not** a medical device. These are the rejection patterns most relevant to this app class (July 2026).

### 5.1 Store listing & claims

| Rejection trigger | Safe approach for Totus |
|-------------------|-------------------------|
| “HIPAA compliant,” “FDA cleared,” “diagnosis,” “treatment” | Say **encrypted local notes**, **writing template**, **user responsible for PHI** |
| “100% secure / unhackable / military grade” | Factual encryption description (AES-256-GCM on device) |
| “We never collect data” while AdMob/Firebase active | Update listing + privacy policy when ads/analytics ship |
| Misleading subscription UI | Clear price, renewal, cancel instructions per [Subscriptions policy](https://support.google.com/googleplay/android-developer/answer/9900533) |
| App name impersonating hospital/employer | Use **Totus Secure Notes** only; no “Official [Hospital] App” without authorization |

### 5.2 Privacy & Data safety mismatches

| Rejection trigger | Prevention |
|-------------------|------------|
| Data safety says “no collection” but Firebase/AdMob/IAP present | Complete form per [`DATA_SAFETY_GOOGLE_PLAY.md`](DATA_SAFETY_GOOGLE_PLAY.md) |
| Broken privacy policy URL | Verify https://totus--notes.web.app/privacy loads over HTTPS |
| SDK data not disclosed | Declare Crashlytics, Analytics, AdMob IDs — [SDK policy](https://support.google.com/googleplay/android-developer/answer/17190352) |

### 5.3 Permissions & declarations

| Rejection trigger | Totus mitigation |
|-------------------|------------------|
| `READ_MEDIA_*` in AAB but declaration says photo picker | versionCode **63+** on **all tracks**; verify bundle explorer |
| FGS location undeclared or no demo video | Complete FGS declaration with trip GPS video |
| Background location without in-app disclosure | Show rationale before requesting `ACCESS_BACKGROUND_LOCATION` |
| Requesting health sensors without health use case | Totus does **not** use Health Connect / body sensors — do not add those permissions |
| Over-broad permission list | Minimum scope: location (trips), camera (attach), mic (voice memo), notifications (reminders) |

If you later add health data APIs, review [Health apps policy](https://support.google.com/googleplay/android-developer/answer/12991134) and [Android 16+ granular health permissions](https://developer.android.com/health-and-fitness/health-services/permissions).

### 5.4 Monetization policy

| Rejection trigger | Prevention |
|-------------------|------------|
| Digital goods sold outside Play Billing | All Pro features must go through `pro_monthly` / `pro_lifetime` |
| Ads on sensitive screens | Banners on Notes list / Settings only — not inside active clinical note editor when possible |
| Subscription without sustained value | `pro_monthly` = ongoing ad-free; `pro_lifetime` = permanent premium — do not use subscription for one-time unlock |
| Unacknowledged purchases | Ensure `finishTransaction` runs (see MonetizationContext) |

### 5.5 Technical & process rejections

| Rejection trigger | Prevention |
|-------------------|------------|
| Crashes on launch / paywall / trip start | Test on Internal + Closed tracks before Production |
| **Broken functionality** / “limited content” | Demo vault + reviewer instructions in **App access** |
| **New personal account:** failed closed testing gate | 12 testers, 14 **consecutive** days — [requirements](https://support.google.com/googleplay/android-developer/answer/14151465) |
| Target SDK too low | Expo SDK 56 → API 36 (verify on each release) |
| Old non-compliant AAB on any track | Supersede with versionCode **63+** everywhere |

### 5.6 Health-adjacent specific guidance

Google scrutinizes apps that **look like medical tools**. Totus mitigations:

1. **Play Console category:** prefer **Productivity** over Medical unless you have regulatory clearance
2. **Health apps declaration:** answer honestly — template is a **documentation aid**, not clinical decision support
3. **No diagnostic output** — postpartum form is user-entered text for export/copy elsewhere
4. **Advance notice form:** **not required** for independent productivity apps ([eligibility](https://support.google.com/googleplay/android-developer/answer/6320428)) unless partnering with a recognized healthcare org
5. **Disclaimer in listing:** users responsible for compliance with employer/HIPAA policies; app is not certified HIPAA/FDA

---

## Master publish sequence (recommended order)

Use this ordered checklist the first time you ship **ads + IAP + location** together:

```
Phase A — Build & upload
  □ EAS production AAB (versionCode 63+)
  □ Internal testing release
  □ App bundle explorer: targetSdk 36, no READ_MEDIA_*

Phase B — Merchant & products
  □ Payments profile
  □ Create pro_lifetime (one-time, non-consumable)
  □ Create pro_monthly (subscription + active base plan)
  □ License testers added

Phase C — App content (submit each for review)
  □ Privacy policy URL
  □ Data safety (Firebase + AdMob + IAP)
  □ Photo and video permissions (photo picker)
  □ Foreground service permissions (location + video)
  □ Ads: Contains ads = Yes
  □ Content rating + target audience
  □ App access (reviewer password)

Phase D — AdMob production
  □ Production App ID + banner unit in app.json / products.json
  □ Rebuild AAB → upload new release

Phase E — Test
  □ Purchase pro_monthly (ads off, premium locked)
  □ Purchase pro_lifetime (all unlocked)
  □ Restore purchases
  □ Trip GPS + background notification
  □ Attach photo (picker, no READ_MEDIA prompt)

Phase F — Production
  □ Closed test 12×14 days (new personal accounts)
  □ Apply for production access
  □ Promote release → Send for review
```

---

## Troubleshooting quick hits

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Products show empty / “Item unavailable” | SKU mismatch or product inactive | Match IDs to `products.json`; activate base plan / purchase option |
| “This version of the app is not configured for billing” | No billing AAB uploaded yet | Upload internal testing build with `expo-iap` |
| Purchase succeeds but reverts / refunds | Missing `finishTransaction` | Verify MonetizationContext purchase handler |
| Publish blocked on photo permissions | Old AAB on a test track | Upload 62+ to **every** track; update declaration |
| FGS policy warning | Missing Console declaration | Complete location FGS form + video |
| Reviewer cannot test Pro | No purchase path | Upload **store-review** build or provide license test account |
| Ads not showing in production | Test IDs still in `app.json` | Replace with production AdMob IDs + rebuild |

---

## Document maintenance

Re-run this checklist when:

- Bumping **versionCode** or Expo SDK
- Adding permissions, SDKs, or new IAP SKUs
- Google Play Console shows new **Policy status** issues
- Switching AdMob from test to production IDs

**Policy dates verified against Google documentation as of July 17, 2026.** Always confirm deadlines in Play Console notifications before each release.

---

*Research-only document. No code changes. See also [`PLAY_FIRST_UPLOAD_CHECKLIST.md`](PLAY_FIRST_UPLOAD_CHECKLIST.md) for first-upload ordering.*
