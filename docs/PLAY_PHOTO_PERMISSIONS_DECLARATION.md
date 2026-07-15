# Google Play — Photo and Video Permissions Declaration

**App:** Totus Secure Notes · `com.totuslife.TotusSecureNotes`  
**Policy:** [Photo and video permissions](https://support.google.com/googleplay/android-developer/answer/14115180)  
**Android Photo Picker:** [Google developers blog](https://android-developers.googleblog.com/2023/04/photo-picker-everywhere.html)

---

## How this app complies (v1.2.13+)

Totus Secure Notes follows Google’s **permission-less photo picker** approach:

| User action | Implementation | Permissions |
|-------------|----------------|-------------|
| Attach photo from gallery | `expo-image-picker` → **Android system Photo Picker** | **None** (`READ_MEDIA_*` stripped) |
| Take photo with camera | `expo-image-picker` → camera intent | `CAMERA` only when user taps Camera |
| Attach audio/video file | `expo-document-picker` | **None** |
| Voice memo | `expo-audio` in-app recorder | `RECORD_AUDIO` when user taps Record |

**Native config (`plugins/withAndroidPhotoPicker.js`):**

1. Removes `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, and legacy storage permissions from the manifest  
2. Adds Google Play services **backported Photo Picker** module dependency (works on Android 4.4+ via GMS):

```xml
<service android:name="com.google.android.gms.metadata.ModuleDependencies" …>
  <meta-data android:name="photopicker_activity:0:required" android:value="" />
</service>
```

No `MediaStore` queries or broad gallery access in app code.

---

## Important: do NOT justify READ_MEDIA usage

Do **not** tell Play Console that the app **needs** `READ_MEDIA_IMAGES` or `READ_MEDIA_VIDEO`. Those permissions are **removed**; access is via the **Photo Picker** only.

Gallery scrub after import was **removed** in v1.2.13 (required broad media APIs).

---

## Play Console — Photo and video permissions

### Step 1 — Upload AAB with photo-picker manifest

Use the latest **store-review** AAB (versionCode **56+**).

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
Not used. v1.2.14 attaches photos via the Android system Photo Picker (expo-image-picker) with no READ_MEDIA_IMAGES permission. User picks one image per note; file is encrypted on device only.
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

**Related:** [PERMISSIONS.md](./PERMISSIONS.md) · [PLAY_FIRST_UPLOAD_CHECKLIST.md](./PLAY_FIRST_UPLOAD_CHECKLIST.md)

