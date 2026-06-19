# Totus Secure Notes

Encrypted, local-first notes app built with Expo. Phase 1 MVP includes encrypted note storage, template gallery, and a postpartum nursing form designed for copy/paste into clinical work software.

**Expo project:** https://expo.dev/accounts/totuslife/projects/totus-secure-notes

**GitHub:** https://github.com/totuslife/totus-secure-notes

## Install on Android (no Expo Go required)

This app uses **SDK 56**. If your Expo Go app from Google Play is outdated, you do **not** need Expo Go. Install the standalone APK instead:

1. Open the [Expo builds page](https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds)
2. Download the latest **production-apk** or **preview** build
3. On your phone: Settings → Security → allow installs from unknown sources (or per-browser install permission)
4. Open the downloaded `.apk` and install

For Google Play Store submission, upload the **production** profile `.aab` file in Google Play Console.

## Features

- AES-256-GCM encryption with PBKDF2 key derivation (100,000 iterations)
- Master password with secure verifier stored in `expo-secure-store`
- Encrypted vault stored locally via `expo-file-system`
- Postpartum nursing template with preview and clipboard export
- Markdown starter templates (Daily Journal, Prayer Log)
- Encrypted vault export/import (`.enc` files)

## Development (optional)

```bash
npm install
npx expo start
```

Expo Go only works if your Expo Go app supports SDK 56. Otherwise use a standalone APK/AAB build.

## Build commands

Logged in as `totuslife` on EAS. Project is already linked.

```bash
# Installable APK (sideload on any Android phone)
npm run build:apk-prod

# Google Play AAB (App Bundle)
npm run build:aab

# Quick test APK (internal)
npm run build:apk
```

Or directly:

```bash
eas build --platform android --profile production-apk   # APK
eas build --platform android --profile production       # AAB
eas build --platform android --profile preview          # test APK
```

Download finished builds from: https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds

## Google Play submission

1. Build AAB: `npm run build:aab`
2. Download the `.aab` from the Expo builds page
3. In [Google Play Console](https://play.google.com/console), create an app with package `com.totuslife.securenotes`
4. Upload the AAB under **Release → Production** (or Internal testing first)
5. Complete store listing, privacy policy, and content rating

Optional automated submit (requires Google Play service account JSON):

```bash
eas submit --platform android --profile production
```

Place your service account key at `./google-play-service-account.json` (not committed to git).

## Security Notes

- Master password is never stored in plaintext
- Session password exists in memory only while the vault is unlocked
- Exported vault files remain encrypted at rest
- No analytics or telemetry

## Privacy Policy Template

Totus Secure Notes:

- Stores all note data locally on your device
- Does not collect personal information
- Does not use third-party analytics
- Does not transmit note content unless you explicitly export/share an encrypted file

## License

MIT (open source)
