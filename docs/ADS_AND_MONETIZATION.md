# Ads & Monetization — Totus Secure Notes

**Effective date:** June 20, 2026  
**Last updated:** July 13, 2026  
**App:** Totus Secure Notes · `com.totuslife.TotusSecureNotes`  
**Public URL:** https://totus--notes.web.app/ads-monetization  
**Contact:** totuslife7@gmail.com

---

## Summary

This policy describes advertising, in-app purchases, and subscriptions in Totus Secure Notes, consistent with [Google Play Ads policy](https://play.google.com/about/monetization-ads/ads/) and [Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738).

---

## 1. Free tier with ads

The **free version** may display **banner advertisements** via **Google AdMob**.

| Item | Detail |
|------|--------|
| Ad format | Banner (non-intrusive) |
| Ad provider | Google AdMob |
| Personalization | Subject to Google ad settings and device ad ID preferences |
| Data | AdMob may collect device/advertising IDs and ad interaction data |

**Removing ads:** Purchase **Pro Monthly** (`pro_monthly`) or **Pro Lifetime** (`pro_lifetime`) to receive the `no_ads` entitlement.

---

## 2. In-app purchase tiers

| Tier | Product ID | Includes |
|------|------------|----------|
| **Free** | — | Encrypted notes, postpartum template, basic trips, built-in templates, banner ads |
| **Pro Monthly** | `pro_monthly` | No banner ads (subscription) |
| **Pro Lifetime** | `pro_lifetime` | No ads + Trip Planner Pro + Template Studio + Template AI + premium templates (one-time) |

Exact prices are shown in the app and store at purchase time. Subscriptions **auto-renew** unless cancelled in store settings before the renewal date.

---

## 3. Payment processing

All payments are processed by **Google Play Billing** (Android) or **Apple StoreKit** (iOS). We do not receive your credit card number. Entitlements are verified on-device and cached locally in SecureStore.

---

## 4. Refunds and cancellations

Refunds follow **Google Play** or **Apple** policies. Contact the store where you purchased. Email totuslife7@gmail.com for product questions only — we cannot process refunds directly.

---

## 5. Promotions and offers

Introductory pricing, promo codes, and regional pricing may be configured in Play Console / App Store Connect. Eligibility is determined by the store.

---

## 6. License testing (internal)

During internal testing, license testers may access IAP without charge per [Google Play license testing](https://support.google.com/googleplay/android-developer/answer/9875341).

---

## 7. Play Integrity and licensing (optional)

We may use **Google Play Integrity API** to verify that the app is installed from Google Play and that purchases are licensed. Integrity checks occur on-device; we do not sell licensing data.

Example integrity fields (informational only):

- `appLicensingVerdict`: LICENSED  
- `appRecognitionVerdict`: PLAY_RECOGNIZED  
- `deviceRecognitionVerdict`: MEETS_DEVICE_INTEGRITY  

---

## 8. Children and ads

The app is **not designed for children**. We do not target ads to children and do not participate in Designed for Families.

---

## 9. Changes

New products or ad formats will be reflected here and in the Privacy Policy before or when they ship.

---

**Related:** [Terms & Conditions](https://totus--notes.web.app/terms) · [Privacy Policy](https://totus--notes.web.app/privacy) · [store/IAP_SETUP.md](https://github.com/totuslife7-arch/totus-secure-notes)
