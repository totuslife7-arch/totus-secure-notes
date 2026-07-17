# Android 16 / 17 & Google Play Readiness (2025–2026)

**App:** Totus Secure Notes · `com.totuslife.TotusSecureNotes`  
**Current app version:** 1.2.16 (versionCode 61)  
**Expo SDK:** 56 (`expo` ~56.0.12)  
**Last reviewed:** July 16, 2026  
**Scope:** Research checklist only — no code changes in this document.

---

## Version naming (important)

Google and Expo use **API level** and **Android version** differently. Do not conflate them:

| Name | API level | Google Play target deadline (phone/tablet) |
|------|-----------|------------------------------------------|
| Android 15 | 35 | **Aug 31, 2025** — new apps & updates must target API 35+ |
| Android 16 | **36** | **Aug 31, 2026** — new apps & updates must target API 36+ |
| Android 17 (preview) | **37** | No Play deadline yet; platform behavior changes in preview |

If you see “Android 17 (API 36)” in informal notes, that pairing is **incorrect**. API 36 is **Android 16**. Android 17 is expected to be API 37.

**Official links:**

- [Target API level requirements (Play Console)](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Meet Google Play's target API level requirement (Android Developers)](https://developer.android.com/google/play/requirements/target-sdk)
- [Policy announcement: July 10, 2025](https://support.google.com/googleplay/android-developer/answer/16296680)

---

## Current project status vs requirements

| Area | Requirement | Totus status | Gap / risk |
|------|-------------|--------------|------------|
| **Target SDK (2025)** | API 35+ by Aug 31, 2025 | **Met** — Expo SDK 56 defaults to `targetSdkVersion` **36** | None for 2025 rule |
| **Target SDK (2026)** | API 36+ by Aug 31, 2026 | **Likely met** — SDK 56 compile/target **36** by default | Confirm on each EAS AAB in Play Console → App bundle explorer |
| **Photo/video permissions policy** | No broad `READ_MEDIA_*` unless core gallery use case; policy mandatory May 28, 2025 | **Strong** — permissions blocked in `app.json` (incl. `READ_MEDIA_AUDIO`) + stripped by `plugins/withAndroidPhotoPicker.js` | Play Console **declaration** must match manifest on **all tracks** |
| **Photo picker usage** | Use system Photo Picker for infrequent attachment | **Implemented** — `expo-image-picker` for photos; GMS backport manifest entry | iOS still uses library permission path (expected) |
| **GET_CONTENT takeover** | OS may route image/video `GET_CONTENT` to Photo Picker | **Low risk** — gallery flow uses `launchImageLibraryAsync`; audio/video uses `expo-document-picker` | Test document import on Android 16+ after takeover rollout |
| **Foreground service — location** | Declare type + permission for Android 14+; Play Console FGS form | **Configured** — `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION`, `expo-location` plugin | **Play Console FGS declaration** + demo video for location/trip GPS |
| **Foreground service — media playback** | Required only if audio/video continues in background | **Not declared** — voice memo playback is in-modal (`AttachmentViewer`); no background music | Correct for current design; revisit if background playback is added |
| **Android 17 background audio hardening** | API 37+: background audio needs WIU-capable `mediaPlayback` FGS | **Not applicable today** — no background audio feature | Monitor when targeting API 37 |
| **Predictive back (Android 16+)** | Target API 36 on Android 16 devices enables predictive back by default | `predictiveBackGestureEnabled: false` in `app.json` | Test back navigation on Android 16; may need migration to supported APIs |
| **Edge-to-edge (Android 16+)** | Opt-out removed for apps targeting API 36 | Not explicitly configured | Visual QA on Android 16 devices/tablets |

**Project files reviewed:** `app.json`, `eas.json`, `package.json`, `plugins/withAndroidPhotoPicker.js`, `services/attachments.ts`, `docs/PLAY_PHOTO_PERMISSIONS_DECLARATION.md`, `docs/PERMISSIONS.md`.

---

## 1. Android platform & Google Play requirements (2025–2026)

### 1.1 Target SDK requirements

**Must-do (already satisfied for Totus on SDK 56):**

- [x] Ship builds with `targetSdkVersion` ≥ **35** (2025 gate — passed)
- [ ] Before **Aug 31, 2026**: confirm production AAB reports `targetSdkVersion` ≥ **36**
- [ ] After each SDK upgrade, read [Android 16 behavior changes](https://developer.android.com/about/versions/16/behavior-changes-16) and [all-apps changes on 16](https://developer.android.com/about/versions/16/behavior-changes-all)

**Nice-to-have:**

- [ ] Request Play Console extension only if blocked on an upgrade (Nov 1, 2026 deadline for extensions per Play docs)
- [ ] Track [Android 17 preview changes](https://developer.android.com/about/versions/17) separately — no Play target deadline yet

Expo SDK 56 sets **compileSdk 36 / targetSdk 36** by default ([SDK 56 reference](https://docs.expo.dev/versions/v56.0.0)). This project does **not** override SDK levels in `expo-build-properties` (only ProGuard rules), so EAS inherits SDK 56 defaults.

### 1.2 Photo picker & GET_CONTENT takeover

**What changed (platform):**

- Android Photo Picker (API 33+) and GMS backport (API 19–32 on GMS devices) let apps pick media **without** `READ_MEDIA_*` permissions.
- Google is enabling **GET_CONTENT takeover**: for intents filtered to images/videos, the system Photo Picker can replace the old DocumentsUI file picker **without app code changes**. Controlled server-side via device config flag `take_over_get_content` on Android 12+.
- Intents with broad filters (e.g. `*/*` with non-media MIME extras) are **rerouted back to DocumentsUI** so non-media files still work.

**Totus implementation:**

```35:49:app.json
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        ...
      ],
      "blockedPermissions": [
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
        ...
      ],
```

- Gallery photos: `ImagePicker.launchImageLibraryAsync` in `services/attachments.ts` (Android skips library permission request).
- Camera: `launchCameraAsync` → `CAMERA` only.
- Audio/video import: `DocumentPicker.getDocumentAsync({ type: ['audio/*', 'video/*'] })` — document picker, not gallery scan.

**Must-do before publish:**

- [ ] Verify merged manifest in release AAB: **no** `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`
- [ ] Complete **Photo and video permissions** App content form — see [PLAY_PHOTO_PERMISSIONS_DECLARATION.md](./PLAY_PHOTO_PERMISSIONS_DECLARATION.md)
- [ ] Ensure **every active track** (internal/closed/open/production) ships only compliant AABs (versionCode 61+)

**Nice-to-have:**

- [ ] Manual test on Android 13–16: attach photo from gallery, camera, import audio/video file
- [ ] If clinical workflows ever need EXIF/location from photos, note Photo Picker may strip location tags — app already sets `exif: false` on pick

**Official links:**

- [Photo picker (Android Developers)](https://developer.android.com/training/data-storage/shared/photo-picker)
- [Permissionless storage direction (Android Developers blog)](https://medium.com/androiddevelopers/permissionless-is-the-future-of-storage-on-android-3fbceeb3d70a)
- [Photo Picker everywhere / GMS backport](https://android-developers.googleblog.com/2023/04/photo-picker-everywhere.html)

### 1.3 Foreground services — media playback

**Requirements:**

- Android 14+ (API 34+): each FGS needs a declared **type** and matching **permission** in the manifest.
- **`mediaPlayback`** type requires `FOREGROUND_SERVICE_MEDIA_PLAYBACK` and is for **continuing audio/video while the app is not visible** (music, podcast, PiP, etc.).
- Play Console: apps targeting Android 14+ must complete the [**Foreground Service Permissions**](https://support.google.com/googleplay/android-developer/answer/13392821) declaration with use case, user impact, and **demo video** per FGS type used.

**Totus today:**

- **Location FGS** only — trip GPS via `expo-location` (`FOREGROUND_SERVICE_LOCATION`).
- **Voice memos:** record in foreground UI (`VoiceMemoRecorder`); playback in full-screen modal (`AttachmentViewer`) — pauses when modal closes. **No** `FOREGROUND_SERVICE_MEDIA_PLAYBACK` in manifest.
- **Android 17 (API 37) background audio hardening:** apps playing audio in background must run a non-`SHORT_SERVICE` FGS; targeting API 37 also requires **while-in-use (WIU)** FGS started from user action. **Totus is unaffected** unless you add background playback later.

**Must-do before publish:**

- [ ] Complete Play Console **Foreground Service Permissions** for **`TYPE_LOCATION`** (trip mileage / GPS recording)
- [ ] Prepare short demo video: start trip → background app → show ongoing notification / mileage continues

**Do NOT do (unless product changes):**

- [ ] Do **not** declare `TYPE_MEDIA_PLAYBACK` — not used and would trigger extra review/video requirements

**Nice-to-have / future:**

- [ ] If adding lock-screen or background voice memo playback, plan `mediaPlayback` FGS + Media3 + Play declaration before shipping
- [ ] Read [Background audio hardening (Android 17)](https://developer.android.com/about/versions/17/changes/bg-audio)

**Official links:**

- [Foreground service types](https://developer.android.com/develop/background-work/services/fgs/service-types)
- [Declare foreground services](https://developer.android.com/develop/background-work/services/fgs/declare)
- [Android 15 FGS changes](https://developer.android.com/about/versions/15/changes/foreground-service-types)
- [Play: Device and Network Abuse / FGS policy](https://support.google.com/googleplay/android-developer/answer/16273414)
- [Understanding FGS and full-screen intent requirements](https://support.google.com/googleplay/android-developer/answer/13392821)

### 1.4 Permissions policy changes (broader 2025–2026)

| Permission / API | Play policy | Totus |
|------------------|-------------|-------|
| `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` | Restricted; gallery/core-only; declaration or removal | **Removed / blocked** |
| `READ_MEDIA_VISUAL_USER_SELECTED` | Part of partial-access model; not needed with Photo Picker | **Blocked** |
| Location (incl. background) | Prominent disclosure; justified use | Trip planner; strings in `app.json` |
| `RECORD_AUDIO` | User-initiated; no hidden capture | Voice memo button only |
| `FOREGROUND_SERVICE_*` | Must match manifest + Play declaration | Location only |
| Exact alarms / full-screen intent | Declarations for Android 14+ if used | Not used |

**Must-do:**

- [ ] Keep [PERMISSIONS.md](./PERMISSIONS.md) and Data safety form aligned with actual manifest
- [ ] Re-scan manifest after adding any dependency (some libraries inject `READ_MEDIA_*` — `withAndroidPhotoPicker.js` strips them)

**Official links:**

- [Permissions and APIs that access sensitive information](https://support.google.com/googleplay/android-developer/answer/9888170)
- [Restricted permissions & minimum-scope alternatives](https://support.google.com/googleplay/android-developer/answer/14115180)
- [Photo & Video Permissions policy actions (Jan 2025 notice)](https://support.google.com/googleplay/android-developer/answer/15800983)

---

## 2. Google Play Console — photo/video permissions (2025–2026)

**Policy timeline:**

| Date | Milestone |
|------|-----------|
| Oct 2023 | Photo & Video Permissions policy announced |
| Jan 22, 2025 | Compliance required (or extension request) |
| **May 28, 2025** | **Full compliance mandatory** — non-compliant apps subject to removal |

**Totus classification:** **One-time / infrequent** access → **Android Photo Picker** → **do not** declare broad `READ_MEDIA_*` need.

### Play Console checklist (must-do before publish)

- [ ] **App content → Photo and video permissions**
  - Access pattern: **One-time or infrequent**
  - Method: **Android photo picker**
  - Core functionality needs all photos on device: **No**
- [ ] Remove / supersede any old declaration that claims `READ_MEDIA_*` usage
- [ ] **Release → each testing track + Production:** only AABs without `READ_MEDIA_*` (see [PLAY_PHOTO_PERMISSIONS_DECLARATION.md](./PLAY_PHOTO_PERMISSIONS_DECLARATION.md))
- [ ] **App bundle explorer → Permissions tab** on versionCode 61: confirm stripped permissions

### Nice-to-have

- [ ] Keep declaration text synced when versionCode bumps
- [ ] Document reviewer path: Notes → attach photo → picker UI (no permission dialog on Android)

**Official links:**

- [Photo and video permissions (Play Console Help)](https://support.google.com/googleplay/android-developer/answer/14115180)
- [Required actions — Photo & Video policy (Jan 2025)](https://support.google.com/googleplay/android-developer/answer/15800983)

---

## 3. Expo SDK 56 compatibility notes

| Topic | Expo SDK 56 behavior | Totus impact |
|-------|----------------------|--------------|
| **Default target SDK** | compileSdk **36**, targetSdk **36** | Meets Aug 2026 Play requirement without extra `expo-build-properties` |
| **expo-image-picker** (~56.0.18) | Uses system picker on Android; no broad storage permission when configured correctly | Matches Play photo policy; plugin strips transitive permissions |
| **expo-document-picker** (~56.0.4) | System document UI (`OPEN_DOCUMENT` / `GET_CONTENT` fallbacks) | Audio/video import; may interact with GET_CONTENT takeover on some OS builds |
| **expo-location** (~56.0.18) | Adds location FGS metadata when `isAndroidForegroundServiceEnabled: true` | Requires Play FGS declaration |
| **expo-audio** (~56.0.12) | In-app record/playback | Not a background media app; no media FGS today |
| **Dev client / EAS** | Native modules (maps, location, llama.rn, ads) require dev client build | Use `production` profile AAB for Play compliance testing |
| **Override SDK** | Optional via `expo-build-properties` `targetSdkVersion` | Avoid downgrading; only pin if Expo defaults regress |

**Must-do:**

- [ ] Build with `eas build --profile production` (or `store-review`) and inspect merged manifest / Play bundle explorer — not Expo Go
- [ ] Stay on SDK 56 patch releases for security/target-SDK alignment

**Nice-to-have:**

- [ ] Watch [Expo SDK changelog](https://expo.dev/changelog/sdk-56) for Android 16/17 behavior fixes
- [ ] When SDK 57+ ships with API 37, re-run this checklist

**Official links:**

- [Expo SDK 56 reference](https://docs.expo.dev/versions/v56.0.0)
- [expo-build-properties](https://docs.expo.dev/versions/latest/sdk/build-properties/)
- [Upgrade to SDK 56](https://expo.dev/blog/upgrading-to-sdk-56)

---

## 4. AndroidX Activity 1.7.0 — managed vs bare workflow

### What Activity 1.7.0 is

[`androidx.activity:activity:1.7.0`](https://developer.android.com/jetpack/androidx/releases/activity#1.7.0) introduced the **`PickVisualMedia`** and **`PickMultipleVisualMedia`** activity result contracts — the recommended native API for launching the Android Photo Picker with automatic fallback to `ACTION_OPEN_DOCUMENT` on older devices.

This is **native Android (Gradle) dependency**, not an npm package.

### Does it apply to Expo managed workflow?

**Indirectly yes; directly no.**

| Workflow | ActivityX 1.7.0 relevance |
|----------|---------------------------|
| **Expo managed (EAS Build, no manual `android/` folder)** | You do **not** add ActivityX yourself. Native modules (`expo-image-picker`, React Native, Google Play services photo-picker backport) pull compatible AndroidX versions during Gradle resolution. Your app uses Photo Picker **through Expo APIs** (`launchImageLibraryAsync`) and `plugins/withAndroidPhotoPicker.js`. |
| **Bare / prebuild with custom native code** | ActivityX applies if **you** write Kotlin/Java that launches picking via `registerForActivityResult(PickVisualMedia...)`. You would add/update `androidx.activity` in `android/app/build.gradle`. |
| **Custom Expo config plugin only (Totus)** | `withAndroidPhotoPicker.js` edits manifest (permission strip + GMS `photopicker_activity:0:required`); it does **not** reference ActivityX — that's correct for managed workflow. |

### Practical guidance for Totus

- **No action needed** to “install ActivityX 1.7.0” in JavaScript or `app.json`.
- **Do not** implement raw `PickVisualMedia` in app code unless you eject and maintain native modules.
- **Do** keep using `expo-image-picker` + the custom manifest plugin for Play policy compliance.
- **Verify** behavior via release AAB testing, not by checking ActivityX version in JS.

**Official links:**

- [ActivityResultContracts.PickVisualMedia](https://developer.android.com/reference/androidx/activity/result/contract/ActivityResultContracts.PickVisualMedia)
- [Photo picker — integrate with ActivityX](https://developer.android.com/training/data-storage/shared/photo-picker)

---

## Prioritized action checklist

### Must-do before Play publish (P0)

1. **Photo/video policy:** Complete App content declaration; confirm versionCode **61+** on all tracks; verify no `READ_MEDIA_*` in bundle explorer ([PLAY_PHOTO_PERMISSIONS_DECLARATION.md](./PLAY_PHOTO_PERMISSIONS_DECLARATION.md)).
2. **Foreground services:** Complete Play Console FGS declaration for **location** (trip GPS) with demo video ([FGS requirements](https://support.google.com/googleplay/android-developer/answer/13392821)).
3. **Target SDK proof:** Confirm production AAB shows **targetSdkVersion 36** (Expo SDK 56 default).
4. **Data safety & privacy:** Align with Firebase/AdMob/IAP as in [DATA_SAFETY_GOOGLE_PLAY.md](./DATA_SAFETY_GOOGLE_PLAY.md) and [PLAY_FIRST_UPLOAD_CHECKLIST.md](./PLAY_FIRST_UPLOAD_CHECKLIST.md).
5. **Manifest audit after dependency changes:** Ensure `withAndroidPhotoPicker.js` still strips transitive media permissions from ads, sharing, or file libraries.

### Should-do before Aug 31, 2026 (P1)

6. **Android 16 QA:** Test edge-to-edge layout, predictive back, and tablet/large-screen layouts (API 36 targets ignore orientation lock on sw ≥ 600dp).
7. **Attachment flows on Android 16:** Regression-test gallery, camera, and document picker imports.
8. **Location disclosure:** Confirm background location rationale still matches Play prominent disclosure rules.

### Nice-to-have / forward-looking (P2)

9. **GET_CONTENT takeover monitoring:** Re-test when Android 17 stable ships; document picker paths for `audio/*` / `video/*` should still reach DocumentsUI.
10. **Android 17 (API 37):** If adding background audio playback, plan Media3 + `mediaPlayback` FGS with WIU start — see [bg-audio hardening](https://developer.android.com/about/versions/17/changes/bg-audio).
11. **Predictive back migration:** Replace legacy back handling if UX issues appear with `predictiveBackGestureEnabled: false`.
12. **Expo SDK upgrades:** Re-run this checklist on each major SDK bump.

---

## Quick reference — official documentation

| Topic | URL |
|-------|-----|
| Play target API levels | https://support.google.com/googleplay/android-developer/answer/11926878 |
| Android target SDK guide | https://developer.android.com/google/play/requirements/target-sdk |
| Photo/video permissions policy | https://support.google.com/googleplay/android-developer/answer/14115180 |
| Sensitive permissions policy | https://support.google.com/googleplay/android-developer/answer/9888170 |
| Photo picker developer guide | https://developer.android.com/training/data-storage/shared/photo-picker |
| Foreground service types | https://developer.android.com/develop/background-work/services/fgs/service-types |
| Play FGS declaration | https://support.google.com/googleplay/android-developer/answer/13392821 |
| Android 16 behavior changes | https://developer.android.com/about/versions/16/behavior-changes-16 |
| Android 17 background audio | https://developer.android.com/about/versions/17/changes/bg-audio |
| Expo SDK 56 | https://docs.expo.dev/versions/v56.0.0 |
| AndroidX Activity PickVisualMedia | https://developer.android.com/reference/androidx/activity/result/contract/ActivityResultContracts.PickVisualMedia |

---

## Related Totus docs

- [PLAY_PHOTO_PERMISSIONS_DECLARATION.md](./PLAY_PHOTO_PERMISSIONS_DECLARATION.md)
- [PERMISSIONS.md](./PERMISSIONS.md)
- [PLAY_FIRST_UPLOAD_CHECKLIST.md](./PLAY_FIRST_UPLOAD_CHECKLIST.md)
- [GOOGLE_PLAY_POLICY_COMPLIANCE.md](./GOOGLE_PLAY_POLICY_COMPLIANCE.md)
- [ANDROID_SIGNING_SETUP.md](./ANDROID_SIGNING_SETUP.md)

---

*This document is research guidance only. Policy dates and API mappings should be re-verified against Google Play Console notifications before each release.*
