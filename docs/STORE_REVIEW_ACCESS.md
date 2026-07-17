# Store Review Access — Google Play & App Store

**App:** Totus Secure Notes  
**Package / Bundle ID:** `com.totuslife.TotusSecureNotes`  
**Version:** 1.2.16 (Android versionCode **62**)  
**Privacy policy:** https://totus--notes.web.app/privacy

Use this document when submitting builds for Google Play and Apple App Store review.

---

## How Pro features are unlocked for reviewers

Dedicated **store-review** EAS builds set `EXPO_PUBLIC_STORE_REVIEW_MODE=true` at compile time. In those builds only:

- All **Pro Lifetime** entitlements are active (no purchase required)
- **No banner ads**
- **Template Studio**, **Template AI**, **Note Assist**, **Trip Planner Pro**, and premium templates are unlocked
- Settings → **About & Legal** shows: *"Store review mode — Pro features unlocked for app review."*

**Production builds** (`production` profile) do **not** set this flag. Normal users must purchase `pro_monthly` or `pro_lifetime` via IAP.

### Build commands (run locally; do not commit secrets)

```bash
# Google Play — AAB for review upload
npm run build:store-review
# or: eas build --platform android --profile store-review --non-interactive

# Google Play — optional APK for sideload testing
npm run build:store-review-apk

# App Store — IPA for TestFlight / App Review
npm run build:store-review-ios
# or: eas build --platform ios --profile store-review --non-interactive

# Both platforms at once
npm run build:store-review-all
```

---

## Copy-paste: Sign-in / access (Play Console & App Store)

**Does the app require sign-in?** Yes — a **local vault password** (no cloud account).

Paste the block below into:

- **Google Play Console** → App content → **App access** → Sign-in required → Instructions
- **App Store Connect** → App Review Information → **Notes**

```
Totus Secure Notes has no cloud login. Access is a local encrypted vault on the device.

FIRST LAUNCH (new install):
1. Open the app.
2. On the vault setup screen, create a master password (minimum 12 characters).
   For this review build, use: TotusReview2026!
3. Confirm the password and complete setup.
4. Skip biometric unlock if prompted (optional).

RETURNING SESSION:
- Enter the same vault password to unlock.
- Auto-lock may require re-entry after a few minutes of inactivity (Settings → Auto-lock).

PRO FEATURES (this build):
- This is a store-review build. Pro Lifetime is pre-unlocked:
  Template Studio, Template AI, Note Assist, Trip Planner Pro, premium templates, no ads.
- Confirm in Settings → **About & Legal**: "Store review mode — Pro features unlocked for app review."
- IAP can still be tested: Settings → Pro → purchase or Restore purchases.

FREE TIER (production builds only):
- Production builds show banner ads and lock premium features until purchase.

NO TEST ACCOUNT / NO SERVER:
- All notes and trips stay on device. No username, email, or remote API for vault data.
```

**Recommended reviewer vault password:** `TotusReview2026!`  
(Meets app password policy; reviewers create this on first launch — it is not hardcoded in the app.)

---

## Developer unlock (internal testing only — not for store listings)

For QA on **production** or **development** builds (not store-review), Pro Lifetime can be unlocked without purchase:

1. Unlock vault → **Settings** → **About & Legal**
2. Tap the **version label** **7 times**
3. Enter code: `TOTUS-DEV-2026`
4. Pro Lifetime entitlements activate (Trip Planner Pro, Template Studio, Template AI, Note Assist, no ads)

**Do not document this code in public store listings.** It is for internal QA and reviewer backup testing only. Store-review builds do not need this step.

---

## Google Play checklist

| Item | Action |
|------|--------|
| **App access / Sign-in** | Yes — paste instructions above |
| **Review build** | Upload AAB from `store-review` profile (not `production` if you need Pro unlocked without purchase) |
| **Ads** | Yes — AdMob banner on **free tier** only. Review build has ads disabled via Pro unlock. `app.json` may use Google **test** AdMob IDs until production IDs are configured. |
| **In-app products** | `pro_monthly` (subscription), `pro_lifetime` (one-time). See `store/IAP_SETUP.md`. |
| **License testing** | Play Console → Setup → License testing — add reviewer Gmail(s) for sandbox IAP backup |
| **Location** | Optional — GPS trip mileage between visits. **Background location** only during active trip recording (foreground service on Android). Justification: reimbursement mileage logs. |
| **Data safety** | Follow `docs/DATA_SAFETY_GOOGLE_PLAY.md`. Privacy URL: https://totus--notes.web.app/privacy |
| **Families / children** | Not directed at children. See https://totus--notes.web.app/children |
| **Permissions** | Location (foreground + background for trips), notifications (note reminders), camera/photos (encrypted attachments), biometrics (optional unlock). See https://totus--notes.web.app/permissions |
| **Encryption** | Local AES-256-GCM vault; no custom HIPAA claims |

### IAP sandbox (optional backup)

If reviewers need to test purchase flow instead of pre-unlocked Pro:

1. Add reviewer Google account under **License testing**
2. Install the build from internal testing track
3. Settings → Pro → purchase `pro_lifetime` or `pro_monthly` (no real charge for license testers)

---

## Apple App Store checklist

| Item | Action |
|------|--------|
| **Review Notes** | Paste sign-in block above |
| **Review build** | IPA from `store-review` profile via TestFlight or direct upload |
| **Sandbox tester** | App Store Connect → Users and Access → Sandbox — create tester for IAP backup |
| **In-App Purchases** | `pro_monthly`, `pro_lifetime` — must be "Ready to Submit" with the app version |
| **Export compliance** | `usesNonExemptEncryption: false` in `app.json` (standard encryption) |
| **App Privacy** | Align with `docs/APP_STORE_REQUIREMENTS.md` — local data, optional location, purchases via Apple, ads on free tier |
| **ATT / tracking** | Request tracking only if production ads use personalized AdMob; document in privacy label |
| **Background modes** | `location` — active trip mileage recording only |
| **Sign in with Apple** | Not required — no third-party or cloud account |

### Testing Pro on iOS

1. **Preferred:** Install `store-review` IPA — Pro is automatic  
2. **Backup:** Sandbox Apple ID → Settings → Pro → purchase or Restore purchases  
3. **Internal QA:** Developer unlock `TOTUS-DEV-2026` (see above) on non-review builds

---

## What reviewers should verify

| Feature | Where | Expected in review build |
|---------|-------|--------------------------|
| Vault unlock | Launch screen | Password setup / unlock with `TotusReview2026!` |
| No ads | Notes / Settings | No banner (Pro unlocked) |
| Task digest | Notes tab | Open follow-ups, reminders, flagged notes banner |
| Assist chips | Notes, Templates, Trips | Chip opens Totus Assist or contextual help |
| Totus Assist hub | Settings → Totus Assist | Model status, capability cards, troubleshooting |
| Note Assist | Note editor | Bulletize, shorten, expand, summarize (model download may be required) |
| Template Studio | Templates tab | Create / edit custom templates |
| Template AI | Template Studio → paste flow | On-device model download + field suggestions (device-dependent) |
| Template library | Templates → Template library | Curated imports; local review only |
| Secure attachments | Note editor | System photo picker (Android), document picker, in-app viewer, secure delete |
| Local reminders | Note editor | Set reminder; notification permission in context |
| Trip Planner Pro | Trips tab | Driving routes, in-app OSM map, external Google/Apple Maps (no API key) |
| Built-in templates | Templates | Home visit, wound care, etc. |
| IAP | Settings → Pro | Products load; purchase/restore works in sandbox |
| Privacy links | Settings → About & Legal | Opens https://totus--notes.web.app/... |
| Sync to desktop | Settings → Sync to desktop | Export .totus + Open web vault link; not live sync |

---

## Security note

Store review mode **does not** bypass vault encryption. Reviewers must still set or enter the vault password. Only monetization / ads are overridden at build time.

---

## Related docs

- [PLAY_FIRST_UPLOAD_CHECKLIST.md](./PLAY_FIRST_UPLOAD_CHECKLIST.md)
- [APP_STORE_REQUIREMENTS.md](./APP_STORE_REQUIREMENTS.md)
- [DEVELOPMENT_AND_BUILDS.md](./DEVELOPMENT_AND_BUILDS.md)
- [ADS_AND_MONETIZATION.md](./ADS_AND_MONETIZATION.md)
- [DATA_SAFETY_GOOGLE_PLAY.md](./DATA_SAFETY_GOOGLE_PLAY.md)
