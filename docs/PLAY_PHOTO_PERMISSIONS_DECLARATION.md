# Google Play — Photo and Video Permissions Declaration

**App:** Totus Secure Notes · `com.totuslife.TotusSecureNotes`  
**Policy:** [Photo and video permissions](https://support.google.com/googleplay/android-developer/answer/14115180)  
**Android Photo Picker:** [Google developers blog](https://android-developers.googleblog.com/2023/04/photo-picker-everywhere.html)  
**Current release:** v1.2.16 · Android versionCode **62**

---

## How this app complies (v1.2.13+)

Totus Secure Notes follows Google’s **permission-less photo picker** approach:

| User action | Implementation | Permissions |
|-------------|----------------|-------------|
| Attach photo from gallery | `expo-image-picker` → ActivityX **PickVisualMedia** (system Photo Picker) | **None** (`READ_MEDIA_*` stripped) |
| Take photo with camera | `expo-image-picker` → camera intent | `CAMERA` only when user taps Camera |
| Attach audio/video file | `expo-document-picker` | **None** |
| Voice memo | `expo-audio` in-app recorder | `RECORD_AUDIO` when user taps Record |

**Native config (`plugins/withAndroidPhotoPicker.js`):**

1. Removes `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`, and legacy storage permissions from the manifest via `tools:node="remove"` (survives Gradle manifest merge)  
2. Ensures Google Play services **backported Photo Picker** module dependency (works on Android 4.4+ via GMS). `expo-image-picker` (SDK 56+) also declares this snippet and uses ActivityX `PickVisualMedia` — no custom Kotlin in this app.

```xml
<service android:name="com.google.android.gms.metadata.ModuleDependencies" android:enabled="false" android:exported="false">
  <intent-filter>
    <action android:name="com.google.android.gms.metadata.MODULE_DEPENDENCIES" />
  </intent-filter>
  <meta-data android:name="photopicker_activity:0:required" android:value="" />
</service>
```

No `MediaStore` queries or broad gallery access in app code.

### ActivityX / PickVisualMedia (Expo managed workflow)

Google’s sample uses **ActivityX 1.7.0** with `PickVisualMedia` in Kotlin. In **Expo SDK 56**, you do **not** add that native code yourself:

- `expo-image-picker` → `launchImageLibraryAsync()` uses the system Photo Picker on Android 13+ (ActivityX under the hood via native modules).
- `plugins/withAndroidPhotoPicker.js` handles manifest only: strip `READ_MEDIA_*` + GMS backport `ModuleDependencies` service.

No custom Kotlin `registerForActivityResult` is required unless you eject to bare workflow.

---

## Important: do NOT justify READ_MEDIA usage

Do **not** tell Play Console that the app **needs** `READ_MEDIA_IMAGES` or `READ_MEDIA_VIDEO`. Those permissions are **removed**; access is via the **Photo Picker** only.

Gallery scrub after import was **removed** in v1.2.13 (required broad media APIs).

---

## Play Console — Photo and video permissions

### Step 1 — Upload AAB with photo-picker manifest

Use the latest **store-review** AAB (versionCode **62+**).

Remove older builds (e.g. versionCode **52**) from the release track.

### Step 2 — App content form

1. **Play Console → App content → Photo and video permissions**
2. Access pattern: **One-time or infrequent**
3. Method: **Android photo picker** (migrate / remove broad permissions)
4. **Remove** `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` from all tracks
5. Do **not** select “core functionality requires persistent access”

### Step 3 — If description fields still appear

Use **“Not used — photo picker only”** wording:

**READ_MEDIA_IMAGES:**

```
Not used. v1.2.16 attaches photos via the Android system Photo Picker (expo-image-picker / PickVisualMedia) with no READ_MEDIA_IMAGES permission. User picks one image per note; file is encrypted on device only.
```

**READ_MEDIA_VIDEO:**

```
Not used. Video files attach via the system document picker, not READ_MEDIA_VIDEO. Permission stripped from manifest. Optional encrypted vault storage on device; infrequent user-initiated access.
```

### Step 4 — Play Console “Why photo picker?” (if asked)

```
Totus Secure Notes lets users optionally attach one encrypted photo to a clinical note. Access is infrequent and user-initiated. We use the Android Photo Picker (Google Play services backport on older devices) instead of READ_MEDIA permissions, per Google Play policy.
```

---

## Data safety (related)

- **Photos:** Only if user attaches via picker — **local encrypted**, not sent to Totus servers  
- **Videos:** Document picker import — same  
- Do **not** declare persistent photo/video library access

---

## Wrong answers (do not use)

| Wrong | Why |
|-------|-----|
| “App uses READ_MEDIA_IMAGES for note photos” | Implies persistent permission; we use Photo Picker |
| “Original removed from gallery after import” | Gallery scrub removed v1.2.13 |
| “READ_MEDIA_VIDEO for note videos” | Videos use **document picker** |

---

## Troubleshooting — “Can’t delete declaration” / can’t publish

Google **does not let you delete** App content declarations. You **replace** them by completing the form again. Publishing is blocked until **both** are true:

1. Every **active track** has only a compliant AAB (no `READ_MEDIA_*`)  
2. The **Photo and video permissions** declaration says you use the **photo picker**, not broad access

### A. Check ALL tracks (most common blocker)

Play scans **every track**, not only Production:

1. **Release → Testing** — open **Internal testing**, **Closed testing**, **Open testing** (each one)
2. For each track: **Releases** → if an old release still lists versionCode **52, 55, 57**, either:
   - **Promote nothing** — create a **new release** with **only versionCode 62**, or  
   - **Discard draft** (⋮ menu on draft releases you never published)
3. **Release → Production** — same: only **61** in the release you send for review

**Artifact library:** **Release → App bundle explorer** (or **Latest releases and bundles**) → click versionCode **62** → **Permissions** tab → confirm **no** `READ_MEDIA_IMAGES` or `READ_MEDIA_VIDEO`.

If **61** still shows those permissions, do not publish — contact support or rebuild. v1.2.16 builds should **not** list them.

### B. Make a NEW declaration (update, not delete)

1. **Policy and programs → App content** (or **Monitor → Policy status** → issue link)
2. Find **Photo and video permissions** → **Manage** or **Start declaration** (not Delete)
3. Answer the questionnaire:

| Step | Choose |
|------|--------|
| How does your app use photos/videos? | **One-time or infrequent** access |
| Core functionality needs all photos on device? | **No** |
| How will you access media? | **Android photo picker** / system picker |
| Remove READ_MEDIA from app? | **Yes** — permissions removed in versionCode **62** |

4. **Save** → **Submit for review** (App content review, separate from release review)

Do **not** fill “describe use of READ_MEDIA_IMAGES” as if you need the permission. If those boxes appear, paste the “Not used” text from Step 3 above.

### C. Old submissions you “can’t delete”

| Situation | What to do |
|-----------|------------|
| **Draft release** (never published) | Release page → **Discard changes** / **Discard draft** |
| **Published release** on a test track | Upload **61** as a **new release** on that track; old version stays in history but is not “active” if superseded |
| **Production** old version | You cannot delete history; ensure the **current submission** only includes **61** |

You cannot remove old version codes from Google’s history — you only ensure **no old APK/AAB is active** on any track’s **current** rollout.

### D. Publish order

1. Fix **App content → Photo and video permissions** → Submit declaration  
2. Wait until the policy issue shows **Resolved** or **In review** (can take hours)  
3. Then **Release → Production** (or your test track) → **Send for review**

If the release page still blocks you, the banner usually links to the unfinished App content item — open that link first.

### E. Still stuck?

**Help → Contact support** → **Policy / App content** → mention:

- Package: `com.totuslife.TotusSecureNotes`  
- Only versionCode **62** is active; uses Android Photo Picker; `READ_MEDIA_*` removed per v1.2.16  
- Cannot clear Photo and video permissions declaration  

---

**Related:** [PERMISSIONS.md](./PERMISSIONS.md) · [PLAY_FIRST_UPLOAD_CHECKLIST.md](./PLAY_FIRST_UPLOAD_CHECKLIST.md)

