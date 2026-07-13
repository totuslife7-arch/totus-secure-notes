# AdMob Setup — Totus Secure Notes

AdMob cannot be created via CLI. Follow these steps, then paste IDs into the repo.

**Package:** `com.totuslife.TotusSecureNotes`  
**Firebase project:** `totus--notes` (link AdMob to this project)

---

## Step 1 — Create AdMob account / app

1. Open [admob.google.com](https://admob.google.com) (same Google account as Play/Firebase is fine)
2. **Apps → Add app**
3. Platform: **Android**
4. **Is the app published?** → **No** (until Play internal testing is live)
5. App name: **Totus Secure Notes**
6. Link to Firebase project **totus--notes** when prompted

Repeat for **iOS** when you build for App Store.

---

## Step 2 — Create banner ad unit

1. Open your Totus Secure Notes app in AdMob
2. **Ad units → Add ad unit → Banner**
3. Name: e.g. `Settings Banner`
4. Copy the **Ad unit ID**: `ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN`

---

## Step 3 — Copy App ID

In AdMob → App settings, copy **App ID** (not the ad unit):

- Android: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`
- iOS: `ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ`

---

## Step 4 — Wire into the project

Replace Google **test** IDs in:

| File | Fields |
|------|--------|
| [`app.json`](../app.json) | `react-native-google-mobile-ads` plugin → `androidAppId`, `iosAppId` |
| [`store/products.json`](../store/products.json) | `ads.androidAdMobAppId`, `ads.iosAdMobAppId`, `bannerUnitIdAndroid`, `bannerUnitIdIos` |

Current values are Google test IDs (safe for dev; not for production revenue).

---

## Step 5 — Play Console

- **App content → Ads** → **Contains ads: Yes**
- **Monetize → Ads** → link AdMob app (optional mediation later)

Update [`docs/DATA_SAFETY_GOOGLE_PLAY.md`](DATA_SAFETY_GOOGLE_PLAY.md) declarations for advertising IDs.

---

## Step 6 — Rebuild

Native AdMob requires a new EAS build:

```powershell
npm run build:aab
```

### Kotlin / play-services-ads pin (Expo SDK 56)

EAS builds pin `play-services-ads` to **24.6.0** via `plugins/withPlayServicesAdsPin.js` because Google Ads SDK 25.x requires Kotlin 2.3 metadata while Expo SDK 56 compiles with Kotlin 2.1. `react-native-google-mobile-ads` is pinned to **16.0.0** for the same reason. Remove the pin when Expo ships Kotlin 2.3 compiler support.

---

## Testing without AdMob

- Free tier hides ads when user owns Pro (`no_ads` entitlement)
- Dev override: `EXPO_PUBLIC_TRIP_PLANNER_PRO=true` unlocks all tiers locally
- Test IDs in dev builds show Google sample ads only

---

## Paste IDs here for agent update

When you have them, provide:

```
Android App ID:
Android Banner unit ID:
iOS App ID:
iOS Banner unit ID:
```
