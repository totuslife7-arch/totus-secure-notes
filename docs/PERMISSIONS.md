# Permissions — Totus Secure Notes

**Effective date:** June 20, 2026  
**Last updated:** July 16, 2026  
**App:** Totus Secure Notes · `com.totuslife.TotusSecureNotes`  
**Public URL:** https://totus--notes.web.app/permissions  
**Contact:** totuslife7@gmail.com

---

## Summary

This document explains why Totus Secure Notes requests each Android/iOS permission, aligned with [Google Play Permissions and APIs policy](https://play.google.com/about/privacy-security-deception/permissions/). Permissions are requested **at runtime** with system dialogs. Sensitive access is **optional** unless noted.

---

## Permission table

| Permission | Required? | When requested | Purpose | Data destination |
|------------|-----------|----------------|---------|------------------|
| **Location (when in use)** | Optional | Starting GPS trip / Trips tab | Record mileage between visits | Encrypted on device only |
| **Location (background)** | Optional | Active GPS trip recording | Continue mileage if app backgrounded during trip | Encrypted on device only |
| **Microphone** | Optional | Recording voice memo in note editor | Encrypted voice memo attachment | Encrypted on device only |
| **Camera** | Optional | Adding photo attachment | Capture encrypted photo for a note | Encrypted on device only |
| **Photos / media library** | Optional | Adding photo attachment | System photo picker (Android) / library picker (iOS) — no `READ_MEDIA_*` permissions | Encrypted on device only |
| **Documents (audio/video)** | Optional | Adding audio or video attachment | System document picker | Encrypted on device only |
| **Notifications** | Optional | Setting a note reminder | Local reminder alerts | On device; via OS notification service |
| **Biometrics / Face ID** | Optional | Enabling biometric unlock | Unlock vault without typing password | Device secure enclave / Keychain |
| **Foreground service (location)** | Optional | Active GPS trip | Android requirement for background trip GPS | On device |
| **Internet** | Yes | App launch, ads, IAP, policy check | AdMob, Play Billing, Firebase Hosting/Firestore, maps API (Pro) | Third parties as described in Privacy Policy |
| **Vibrate** | Optional | Reminders | Notification alert | On device |

We do **not** request: contacts, SMS, call logs, calendar, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, or broad storage access. Microphone is used **only** when you tap Record on a voice memo in the note editor.

---

## Photo and media policy (v1.2.16)

To comply with [Google Play photo and video permissions policy](https://support.google.com/googleplay/android-developer/answer/14115180) and the [Android Photo Picker](https://android-developers.googleblog.com/2023/04/photo-picker-everywhere.html):

- **Android photos** — system **Photo Picker** via `expo-image-picker` → ActivityX `PickVisualMedia` (SDK 56+; no custom Kotlin). No `READ_MEDIA_*` permissions.
- **GMS backport** — `plugins/withAndroidPhotoPicker.js` ensures the `ModuleDependencies` manifest snippet on devices without a built-in picker (Android 4.4+ via Google Play services). `expo-image-picker` ships the same snippet; our plugin dedupes and strips legacy permissions.
- **ActivityX 1.7.0+** — handled inside `expo-image-picker` dependencies; no app-level Gradle changes required.
- **Audio / video import** — system document picker (`expo-document-picker`); no media-library scanning
- **Gallery scrub removed** — prior best-effort deletion of originals after encrypt required broad media access; removed in v1.2.13+
- **`expo-media-library` removed** — no dependency on broad gallery APIs

---

## Prominent disclosures (Google Play requirement)

Before sensitive access, the app explains usage in context:

- **Trips / GPS:** “Totus Secure Notes records trip mileage between patient visits for reimbursement logs.” (also in system location dialog)  
- **Camera / photos:** “Allow Totus Secure Notes to attach encrypted photos to notes.”  
- **Microphone:** “Allow Totus Secure Notes to record encrypted voice memos for clinical notes.”  
- **Notifications:** “Remind you about note follow-ups.”  
- **Biometrics:** “Allow Totus Secure Notes to use Face ID / fingerprint to unlock your encrypted vault.”

Navigation away from a permission dialog **does not** count as consent.

---

## Background location

Background location is used **only while a trip you started is actively recording**. It is not used for advertising or analytics. You can use the app without granting background location; GPS mileage will stop if the app is killed unless foreground service is allowed.

---

## Maps and third-party APIs (Pro)

If you enable **Trip Planner Pro** and enter a **Google Maps** or **Mapbox** API key, addresses you enter are sent to that provider for geocoding and driving distance. Billing and data handling are between you and the provider.

---

## Revoking permissions

Change permissions anytime in **Android Settings → Apps → Totus Secure Notes → Permissions** or **iOS Settings → Totus Secure Notes**.

---

**Related:** [Privacy Policy](https://totus--notes.web.app/privacy) · [Data safety summary](https://totus--notes.web.app/data-safety)
