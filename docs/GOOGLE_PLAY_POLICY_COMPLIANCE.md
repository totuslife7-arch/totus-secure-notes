# Google Play — Developer Program Policy Compliance (Totus Secure Notes)

Use this before checking **“The application meets Developer Program Policies”** in Play Console.

**App:** Totus Secure Notes  
**Package:** `com.totuslife.TotusSecureNotes`  
**Current version:** 1.2.8 (versionCode 34)  
**Contact:** totuslife7@gmail.com  

---

## Can you confirm the policy checkbox?

### For the **current MVP** (no ads, no IAP, no Play Games in the build)

**Yes — with conditions.** The app is a local encrypted notes/productivity tool with low policy risk, **if** you:

1. Complete all **App content** declarations honestly  
2. Publish a **public Privacy Policy URL**  
3. Use accurate **store listing** text (no false medical/legal claims)  
4. Declare **Data safety** as *no data collected* (matches current build)  
5. Provide **reviewer test instructions** (master password for demo vault)  

### For a **future build** with ads + IAP + Play Games

**Not yet.** You must implement those features, update Privacy Policy / Data safety / Terms, and only then confirm compliance for that version.

---

## Advance notice to Google Play App Review — are you eligible?

**Probably not required** for Totus Secure Notes as it stands.

Google’s [Advance Notice form](https://support.google.com/googleplay/android-developer/answer/6320428) is only for specific cases, such as:

- Third-party IP permission letters (brand logos you don’t own)  
- Government or **recognized healthcare organization** affiliation with proof  
- Accessibility service explanations  
- Non-profit validation, law enforcement docs, regulators  
- COVID contact tracing / health status apps  

Totus Secure Notes is an **independent productivity app** with optional clinical-style **templates**. It is **not**:

- A government app  
- Affiliated with a named hospital or health system  
- A medical device or diagnostic tool  
- A contact tracing app  

**Action:** Skip advance notice unless you later partner with a healthcare org and have their authorization letter, or use restricted permissions that require documentation.

---

## Policy area checklist (current MVP)

| Policy area | Status | Notes |
|-------------|--------|-------|
| **User data & privacy** | ✅ Strong | Notes stay on device; policy in `PRIVACY_POLICY.md` |
| **Data safety form** | ⚠️ Complete in console | Select **no collection** for current build |
| **Privacy policy URL** | ⚠️ Required | Host at public HTTPS (not draft-only) |
| **Deceptive behavior** | ✅ OK if listing honest | Don’t claim “HIPAA certified” or “FDA approved” |
| **Health / medical claims** | ⚠️ Careful wording | Template is a **writing aid**, not medical advice |
| **Permissions** | ⚠️ Declare | Location (optional GPS mileage), camera (attachments), notifications (reminders) |
| **Restricted permissions** | ✅ N/A | No SMS, call log, accessibility abuse |
| **Monetization** | ✅ N/A now | When ads/IAP ship, use Play Billing + declare ads |
| **Families / children** | ✅ OK | Target **13+** / general audience; not Designed for Families |
| **UGC / social** | ✅ N/A | No public user content |
| **Security** | ✅ Good | Encryption, no backdoor telemetry in current build |
| **Intellectual property** | ✅ OK | MIT OSS; own branding assets |
| **Spam / impersonation** | ✅ OK | Original app name and developer identity |

---

## Store listing — policy-safe description tips

Google often suspends listings for **misleading descriptions**, not just app behavior.

### Do say

- “Encrypted notes stored **on your device**”  
- “Optional nursing **note template** for drafting text you copy elsewhere”  
- “Master password chosen by you — we cannot recover it”  
- “No account required” (true for current version)  

### Do not say

- “HIPAA compliant” (unless lawyer-validated for your specific use)  
- “FDA cleared” / “medical device” / “diagnosis” / “treatment”  
- “100% unhackable” / “military grade” hyperbole  
- “We never collect any data” **after** AdMob is live (update listing + policy)  
- “Official app of [Hospital/Employer]” without authorization  

### Suggested short description (80 chars)

See [store/GOOGLE_PLAY_LISTING.md](../store/GOOGLE_PLAY_LISTING.md).

```
Encrypted local notes, postpartum template, trip mileage — data stays on device.
```

### Suggested full description

See [store/GOOGLE_PLAY_LISTING.md](../store/GOOGLE_PLAY_LISTING.md) for the complete Play Store listing.

### Release notes (v1.2.1)

See [../store/RELEASE_NOTES.md](../store/RELEASE_NOTES.md) for Play Console copy. Key fix: postpartum WG uses last visit weight, not birth weight.

### Release notes (v1.2.0) — archive

See [store/RELEASE_NOTES.md](../store/RELEASE_NOTES.md).

---

## App content declarations (Play Console)

Complete before production:

- [ ] **Privacy policy** URL live  
- [ ] **Data safety** — accurate for this APK/AAB version  
- [ ] **Content rating** (IARC) — likely Everyone or Teen depending on questionnaire  
- [ ] **Target audience** — not primarily children  
- [ ] **Ads declaration** — “No” until AdMob is in the build  
- [ ] **Financial features** — “No” until IAP live  
- [ ] **Health apps** — only if you declare health features; use **Productivity** category if unsure  
- [ ] **App access** — provide demo password instructions for reviewers  

### Reviewer instructions (recommended)

```
This app uses a user-created master password. For review:
1. Open app → Create master password: ReviewTest1234
2. Confirm password → Create Master Password
3. Tap Notes → create a note, or Templates → Postpartum, or Trips → add stops
4. Settings → export/import, theme, trip planner, lock vault

No server login. All data is local. Biometric unlock is optional in Settings
after vault is unlocked.
```

---

## When you add ads + Pro (Phase 2)

Before checking the policy box for that release:

1. Implement **Google Play Billing** for all paid features  
2. Add **AdMob** only in free tier; Pro removes ads  
3. Update **Data safety** (device IDs, ad interactions)  
4. Update **Privacy policy** and store description  
5. Declare **contains ads** in Play Console  
6. Do **not** show interstitial ads on sensitive clinical screens if possible  

---

## Final answer for Play Console checkbox

| Release | Check “meets Developer Program Policies”? |
|---------|---------------------------------------------|
| **v1.2.0** (local notes, trips, location optional) | **Yes**, after App content + privacy URL + location disclosure done |
| **With planned ads/IAP not yet in APK** | **No** — listing must match the binary |
| **Advance notice form** | **Not needed** unless healthcare/gov partnership |

If anything in the store listing or Data safety form doesn’t match what the app actually does, **do not** check the box yet — fix the mismatch first.

---

## Links

- [Developer Program Policy](https://play.google.com/about/developer-content-policy/)  
- [Advance notice form info](https://support.google.com/googleplay/android-developer/answer/6320428)  
- [Prepare app for review](https://support.google.com/googleplay/android-developer/answer/9859455)  
- [Policy-compliant descriptions](https://support.google.com/googleplay/android-developer/answer/9859455)  
