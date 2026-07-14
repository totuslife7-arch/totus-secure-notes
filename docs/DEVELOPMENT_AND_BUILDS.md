
## Firebase config files (not in git)

google-services.json and GoogleService-Info.plist are gitignored. Download from Firebase Console and copy to the repo root before native/EAS builds. Rotate any keys that were ever committed; see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#firebase-config-files-not-in-git).
# Development SDK & Builds — Totus Secure Notes (Android + iOS)

Totus Secure Notes uses **Expo SDK 56**. You do **not** download a separate “development SDK” installer like old Android SDK packages. Your stack is:

| Piece | What it is | Where you get it |
|-------|------------|------------------|
| **Expo SDK 56** | App framework + native modules | Already in `package.json` → `npm install` |
| **Node.js** | Runs build tools | [nodejs.org](https://nodejs.org/) (LTS) |
| **EAS CLI** | Cloud builds for Android & iOS | `npm install -g eas-cli` |
| **Development client** | Replaces Expo Go on your phone | EAS `development` profile APK/IPA |
| **Apple Developer** | Required for iPhone builds & TestFlight | [developer.apple.com](https://developer.apple.com) ($99/year) |
| **Google Play Console** | Required for Play Store | [play.google.com/console](https://play.google.com/console) ($25 one-time) |

## Do not use Expo Go for this project

Expo Go on the app stores does not reliably support SDK 56 or native modules (`llama.rn` for Template AI, location, maps). Use:

1. **Development build** — daily coding with live reload  
2. **Preview / production builds** — real install testing  

## Daily development (Android or iOS)

```bash
npm install
npx expo start --dev-client
```

Install the **development** build on your device first (see build commands below).

## Current version

| | |
|--|--|
| **Version** | 1.2.13 |
| **Android versionCode** | 54 |
| **Package** | com.totuslife.TotusSecureNotes |

## Developer unlock (testing only — not for store listings)

For local testing before IAP is fully wired, you can unlock Pro Lifetime + Template AI on a device without a purchase:

1. Open **Settings → About & Legal**
2. Tap the **version line 7 times** to reveal the code entry
3. Enter the developer code (stored in `constants/devUnlock.ts`, default `TOTUS-DEV-2026`)
4. Settings shows **Developer unlock active** while enabled

The flag persists in SecureStore (`dev_unlock_active`). Enter the same code again or tap **Disable developer unlock** to turn it off.

This is separate from the EAS `store-review` build flag (`EXPO_PUBLIC_STORE_REVIEW_MODE`) and from the env override `EXPO_PUBLIC_TRIP_PLANNER_PRO=true`.

**Do not document this code in Play Store / App Store listings.**

## Template AI on device

Template AI requires:

- **Pro Lifetime** purchase, **store-review** build, **developer unlock**, or `EXPO_PUBLIC_TRIP_PLANNER_PRO=true`
- A **dev or production EAS build** with `llama.rn` — **not Expo Go**
- One-time download of SmolLM2-360M (~240 MB) to `documentDirectory/template-ai/`

Users with entitlement can download the model from **Settings → Template AI** or automatically on first **AI assist** in Template Studio. Paying users get the same flow once IAP grants `template_ai`.

## Build Android production (v1.2.8)

```bash
npm run build:aab          # AAB for Google Play
npm run build:apk-prod     # APK for direct install
```

## Store review builds (Pro unlocked for Play / App Store reviewers)

See [STORE_REVIEW_ACCESS.md](./STORE_REVIEW_ACCESS.md) for sign-in instructions and checklists.

```bash
npm run build:store-review       # Android AAB (review upload)
npm run build:store-review-apk   # Android APK (optional sideload)
npm run build:store-review-ios   # iOS IPA
npm run build:store-review-all   # Both platforms
```

Sets `EXPO_PUBLIC_STORE_REVIEW_MODE=true` at build time. **Do not use `production` profile** when reviewers need Pro without purchase.

## Web vault viewer (static export)

```bash
npm run vault:prepare
# or: npx expo export --platform web && node scripts/copy-vault-to-firebase.mjs
```

Output: `dist/` folder. Copy vault routes + shared assets to `firebase/public/` for hosting at **https://totus--notes.web.app/vault**.

Deploy hosting:

```bash
npm run firebase:deploy
```

Routes: `/vault`, `/vault/notes`, `/vault/templates`. Template AI and IAP are **not** available on web — viewer is read-only. **Not live sync** — users export `.totus` from mobile Settings → Sync to desktop.

## Build Android and iOS at the same time

```bash
# Both platforms, production store builds
eas build --platform all --profile production --non-interactive

# Both platforms, internal test builds
eas build --platform all --profile preview --non-interactive

# Both platforms, dev clients (for npx expo start --dev-client)
eas build --platform all --profile development --non-interactive
```

Or use npm scripts:

```bash
npm run build:all          # production AAB + iOS archive
npm run build:all:preview  # internal test builds
npm run build:all:dev      # development clients
```

## Platform-specific outputs

| Profile | Android | iOS |
|---------|---------|-----|
| `development` | APK (dev client) | IPA (dev client) → TestFlight / internal |
| `preview` | APK | IPA → TestFlight internal |
| `production` | AAB (Play Store) | IPA (App Store) |
| `production-apk` | APK (production signing) | — |
| `store-review` | AAB (Pro unlocked for reviewers) | IPA (Pro unlocked) |
| `store-review-apk` | APK (review / sideload) | — |

## iOS on Windows

You **cannot** compile iOS locally on Windows. **EAS Build** compiles iOS in the cloud. You still need:

1. Apple Developer account  
2. App Store Connect app record  
3. Signing credentials (EAS can manage these)  
4. TestFlight for testing on a physical iPhone  

First iOS build:

```bash
eas build --platform ios --profile development --non-interactive
```

Follow EAS prompts to set up Apple credentials if not already configured.

## iOS sideload and TestFlight

You **cannot** compile iOS locally on Windows. All iOS binaries come from **EAS Build** in the cloud. For founder testing and App Review, use these paths:

### Option 1 — TestFlight (preferred)

Best for real-device testing and App Store review.

1. Build with the **store-review** profile (Pro unlocked for reviewers):
   ```bash
   npm run build:store-review-ios
   # or: eas build --platform ios --profile store-review --non-interactive
   ```
2. Upload the IPA to **App Store Connect** via:
   - **EAS Submit:** `eas submit --platform ios --profile production` (after configuring `ascAppId` in `eas.json`), or
   - **Transporter** (macOS app) — drag the `.ipa` from the EAS build artifact page.
3. In App Store Connect → **TestFlight**, add internal testers (your Apple ID team).
4. Install **TestFlight** on your iPhone → accept invite → install build.
5. For App Review, paste vault instructions from [STORE_REVIEW_ACCESS.md](./STORE_REVIEW_ACCESS.md).

**Store-review IPA** goes to TestFlight — not sideloaded directly.

### Option 2 — Ad-hoc / internal distribution

For builds that install outside TestFlight (limited devices):

1. Register device **UDID** in [Apple Developer → Devices](https://developer.apple.com/account/resources/devices/list).
2. Build with `development` or `preview` profile:
   ```bash
   npm run build:ios:dev       # dev client (live reload with expo start --dev-client)
   npm run build:ios:preview   # internal preview IPA
   ```
3. Download IPA from EAS → install via Apple Configurator, Xcode Devices window, or a trusted MDM.

**Limitations:** Ad-hoc provisioning caps registered devices (~100). Profiles expire annually. Not suitable for public distribution.

### Option 3 — AltStore / Sideloadly (not recommended for production)

Third-party sideload tools can install ad-hoc or development IPAs if:

- The IPA is signed with a profile that includes your device UDID.
- You accept **7-day re-sign** limits on free Apple IDs, or use a paid developer account.

**Honest limitations:**

- Template AI (`llama.rn`) needs a **physical iPhone** with Metal — simulators are unreliable.
- AltStore does **not** replace TestFlight for App Review submission.
- Enterprise or consumer App Store release always goes through App Store Connect.

### iOS build artifact summary

| Profile | Output | Where it goes | Pro unlocked? |
|---------|--------|---------------|---------------|
| `store-review` | IPA | App Store Connect → TestFlight / Review | Yes |
| `production` | IPA | App Store Connect → Production | No (IAP required) |
| `development` | IPA | Registered devices / dev client | No (unless dev unlock) |
| `preview` | IPA | Internal testers (UDID) | No (unless dev unlock) |

### Template AI on iPhone

- Requires **Pro Lifetime**, store-review build, or developer unlock (`TOTUS-DEV-2026`).
- Model uses Metal (`n_gpu_layers: 99` in `llamaContext.native.ts`).
- Download SmolLM2 once from **Settings → Totus Assist** (~240 MB).
- **Not available in Expo Go** or web vault viewer.

See [FOUNDER_FOLLOWUP.md](./FOUNDER_FOLLOWUP.md) for the full founder checklist.

## When to rebuild native apps

Rebuild the dev client or store build when you:

- Add native packages (ads, IAP, Play Games, `llama.rn`, etc.)
- Change `app.json` plugins or permissions
- Change app icon, splash, or bundle ID  

JavaScript-only UI changes only need `npx expo start --dev-client` (no rebuild).

## Project links

- **EAS builds:** https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds  
- **GitHub:** https://github.com/totuslife7-arch/totus-secure-notes  
