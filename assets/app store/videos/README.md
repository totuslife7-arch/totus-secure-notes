# Google Play — Background Location Video

**File:** `google-play-background-location-walkthrough.mp4`  
**Duration:** ~30 seconds · **1080×1920** (phone portrait) · **MP4**

Regenerate:
```bash
python scripts/generate_background_location_video.py
```

---

## What the video shows (Play requirement)

1. **Trips** tab — GPS mileage feature context  
2. **Prominent in-app disclosure** (before system prompt) explaining:
   - Background location used **only** during active GPS trip recording  
   - Not used for ads/analytics  
   - Data encrypted on device  
   - User can decline  
3. User taps **Start GPS Trip**  
4. **Android location permission** dialog (simulated) with your `app.json` permission strings  
5. **GPS recording** active with background indicator  
6. **End GPS Trip** — background location stops  

---

## Upload to YouTube

1. Go to [YouTube Studio](https://studio.youtube.com) → **Create** → **Upload video**  
2. Select: `assets/app store/videos/google-play-background-location-walkthrough.mp4`  
3. **Visibility:** **Unlisted** (recommended — only reviewers with link see it)  
4. **Title:**
   ```
   Totus Secure Notes — Background Location Disclosure Walkthrough
   ```
5. **Description:**
   ```
   In-app walkthrough for Google Play review: how Totus Secure Notes uses 
   background location ONLY during active GPS trip recording for visit-day 
   mileage reimbursement. Not used for ads. Data stays encrypted on device.

   App: Totus Secure Notes (com.totuslife.TotusSecureNotes)
   Privacy: https://totus--notes.web.app/privacy
   ```
6. **Not made for kids:** Yes (general audience / professionals)  
7. Copy the video URL → paste into Play Console **Background location** form  

---

## Play Console field

```
https://www.youtube.com/watch?v=YOUR_VIDEO_ID
```

(Replace with your unlisted YouTube link after upload.)

---

## If Google requests a live device recording

Record on a real phone with the v1.2.8 APK:

1. Open **Trips** → tap **Start GPS Trip**  
2. Show the **in-app disclosure** and Android permission dialogs  
3. Show **GPS recording** indicator  
4. Tap **End GPS Trip**  
5. Keep under 30 seconds; upload same way  

Use Android **Screen recorder** or OBS with phone mirrored via scrcpy.


h 1.2.12-hotfix if needed (versionCode 45)