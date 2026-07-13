# In-App Purchase Setup — Totus Secure Notes



Create these **exact Product IDs** in Google Play Console and App Store Connect. They must match [`products.json`](./products.json) and the app code.



**Package:** `com.totuslife.TotusSecureNotes`



---



## Product catalog (2 paid products)



| Product ID | Type | Display name | Grants |

|------------|------|--------------|--------|

| `pro_monthly` | Auto-renewing subscription | Pro Monthly | Remove banner ads (`no_ads`) |

| `pro_lifetime` | Non-consumable (one-time) | Pro Lifetime | No ads + Trip Planner Pro + Template Studio + Template AI + premium templates |



**Free tier** keeps encrypted notes, postpartum template, basic trips (GPS, 50 stops, Open in Maps, straight-line km), and AdMob banner when ads are enabled.



---



## Google Play Console



Docs: [Getting ready with Play Billing](https://developer.android.com/google/play/billing/getting-ready) · [Subscriptions](https://support.google.com/googleplay/android-developer/answer/140504)



1. **Payments profile** — complete merchant setup

2. **Upload AAB** to internal testing (billing features unlock after first upload with billing permission)

3. **Monetize → In-app products** — create `pro_lifetime` (managed product, non-consumable)

4. **Monetize → Subscriptions** — create `pro_monthly`; add a **base plan** (e.g. `default`), set price, **Activate**

5. **Setup → License testing** — add tester Gmail accounts

6. **App content → Ads** — set **Contains ads: Yes** when AdMob is live

7. **App content → Data safety** — declare purchase history + advertising IDs per `docs/DATA_SAFETY_GOOGLE_PLAY.md`



Remove or deactivate any legacy SKUs (`pro_yearly`, `template_studio_*`, `template_ai_*`) if you created them during earlier testing.



---



## Apple App Store Connect



Docs: [Auto-renewable subscriptions](https://developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions/)



1. **Agreements, Tax, and Banking** — sign Paid Applications Agreement

2. Create app with bundle ID `com.totuslife.TotusSecureNotes`

3. **Monetize → Subscriptions** — group `totus_secure_notes_pro`; add `pro_monthly`

4. **Monetize → In-App Purchases** — non-consumable `pro_lifetime`

5. **Users and Access → Sandbox** — create sandbox testers

6. **App Privacy** — declare purchases + advertising when live



---



## AdMob



1. Create Android + iOS apps in [AdMob](https://admob.google.com/)

2. Create **banner** ad units

3. Copy IDs into `store/products.json` → `ads` section

4. Link AdMob app in Play Console (Monetize → Ads)



See also [ADMOB_SETUP.md](../docs/ADMOB_SETUP.md) for step-by-step AdMob app creation.



---



## Testing



- Android: install internal testing build; purchase with license tester account

- iOS: TestFlight or dev build; sandbox Apple ID

- Use **Restore purchases** in Settings after test purchases

- **Pro Monthly** should hide ads only; **Pro Lifetime** unlocks Trip Planner Pro and Template Studio routes

