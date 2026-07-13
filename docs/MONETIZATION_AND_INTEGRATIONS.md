# Monetization & Platform Integrations — Totus Secure Notes

This document defines the **commercial and platform architecture** for Totus Secure Notes: free with ads, Pro without ads, IAP, promotions, and Google Play / Apple services.

---

## Tier model

| Tier | Price | Ads | Features |
|------|-------|-----|----------|
| **Free** | $0 | Yes (banner on Notes/Settings) | Core notes, built-in templates, GPS trips |
| **Pro** | Monthly / annual / lifetime | No | Trip Planner Pro, premium templates |
| **Template Studio (Pro+)** | Add-on subscription or lifetime | No | Custom templates, briefcase, paste parser |
| **Template AI (Pro+AI)** | Add-on subscription or lifetime | No | On-device AI template builder (coming soon) |
| **Promotions** | Intro pricing | — | Store-managed offers |

Product IDs (configure in Play Console & App Store Connect):

See [`store/products.json`](../store/products.json) and [`store/IAP_SETUP.md`](../store/IAP_SETUP.md).

---

## SDK / library stack (Expo SDK 56)

| Capability | Package | Status |
|------------|---------|--------|
| In-app purchases | `expo-iap` | **Shipped** (requires EAS build) |
| Ads (AdMob) | `react-native-google-mobile-ads` | **Shipped** (test IDs in dev; replace for production) |
| Secure storage | `expo-secure-store` | ✅ Shipped |
| Biometrics | `expo-local-authentication` + SecureStore | ✅ Shipped |
| Play Billing | via `expo-iap` → Play Billing 8.x | Phase 2 |
| StoreKit 2 | via `expo-iap` | Phase 2 |
| Google Play Games | Native module / config plugin | **Phase 3 — optional** |
| Game Center (Apple) | Native module | Phase 3 — optional |
| EAS Update | `expo-updates` | Phase 2 (OTA JS updates) |
| Push notifications | `expo-notifications` | Phase 3 (reminders) |

**Important:** All native monetization SDKs require **custom dev builds** — not Expo Go.

---

## Implementation phases

### Phase 1 — Shipped (MVP)

- Encrypted local vault  
- Templates + postpartum form  
- Biometric unlock  
- EAS Android builds  
- Legal docs in `docs/`  

### Phase 2 — Monetization core

1. `npx expo install expo-iap`  
2. `npx expo install react-native-google-mobile-ads`  
3. Add config plugins to `app.json`  
4. Create `services/monetization.ts` — purchase flow, restore, entitlements  
5. Create `services/ads.ts` — show ads only when `!isPro`  
6. Settings screen: Upgrade to Pro, Restore purchases  
7. Rebuild: `eas build --platform all --profile production`  

### Phase 3 — Platform programs

- **Google Play Games:** Sign-in, achievements (e.g. “Created 100 notes”) — requires Play Games Services setup in Google Cloud Console  
- **Play Pass / Apple Arcade:** Separate business applications  
- **Promo codes:** Play Console / App Store Connect  
- **Telegram export/share:** Deep link or share sheet — no store SDK required  

### Phase 4 — Cross-platform expansion

- **Web:** Static export (limited crypto/storage vs native)  
- **macOS / Windows:** Expo desktop targets or companion sync app (careful: security model)  
- **Cursor / Cloud Agents:** GitHub-based remote dev (already set up)  

---

## Google Play Games — honest note

Play Games is designed for **games** (achievements, leaderboards, saved games). For a **notes app**, typical fits are:

- Optional sign-in for backup metadata (not note plaintext)  
- Achievements for engagement  

It is **not required** for Play Store listing. Enable only if you want gamification.

---

## Ads strategy (free tier)

- Show ads on note list or settings — **never inside active note editing** if possible (UX + trust)  
- Request ATT on iOS before personalized ads  
- COPPA: no personalized ads if minors targeted  

---

## Pro entitlement logic (pseudocode)

```
isPro = hasLifetimePurchase || hasActiveSubscription || promoGrantActive
showAds = !isPro && ADS_ENABLED
unlockPremiumTemplates = isPro
```

Store entitlements in SecureStore + validate with store APIs on launch.

---

## Store setup tasks

### Google Play Console

1. Create in-app products matching `store/products.json`  
2. Link AdMob app ID  
3. Enable Play Billing  
4. Upload AAB to internal testing  
5. Complete Data safety form (`docs/DATA_SAFETY_GOOGLE_PLAY.md`)  

### App Store Connect

1. Create IAP products  
2. Sign Paid Applications agreement  
3. Configure App Privacy  
4. TestFlight → production  

---

## RevenueCat (optional)

For unified IAP + analytics across iOS/Android, consider [RevenueCat](https://www.revenuecat.com/) later. Not required for v1.

---

## Contact

totuslife7@gmail.com
