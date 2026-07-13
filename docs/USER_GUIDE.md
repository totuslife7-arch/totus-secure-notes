# User Guide — Totus Secure Notes (v1.2.12)

Totus Secure Notes is a **local-first encrypted notes app** for mobile work. Your vault stays on your device. This guide covers everyday use, premium features, and **desktop access** via manual export (not live cloud sync).

**Productivity tool only** — not medical advice. You are responsible for accuracy and compliance with workplace privacy rules (HIPAA, PIPEDA, FOIP, etc.) in your jurisdiction.

---

## 1. Getting started

### Install the app

Do **not** use Expo Go. Install a standalone build from [Expo builds](https://expo.dev/accounts/totuslife/projects/totus-secure-notes/builds) or the app store.

### Create or unlock your vault

1. Open the app and set a **master password** (12+ characters with upper, lower, number, symbol).
2. Optionally enable **biometric unlock** (fingerprint / Face ID) in Settings after first unlock.
3. Your notes encrypt with **AES-256-GCM** on device. We cannot recover a forgotten master password.

### Themes

Settings → **Appearance** → Light, Dark, or System.

---

## 2. Notes

- Tap **+** on the Notes tab to create a markdown note.
- Use **flags**, **reminders**, **follow-up status**, and **extra notes** for workflow tracking.
- Attach **encrypted photos, audio, video, or voice memos** from the note editor. **Voice memos** use the in-app recorder (microphone permission). After import, Totus **removes the original from your gallery** when the OS allows (best-effort per platform).
- View attachments in-app only; screenshots are blocked while viewing. **Secure delete** shreds the encrypted vault copy.
- **Note Assist** (Pro Lifetime): bulletize, shorten, expand, or summarize note text on-device. Rules fallback when AI unavailable.
- Set **reminders** with an ISO date/time; Totus requests notification permission in context when you add one.
- Notes autosave while the vault is unlocked.
- The notes list shows a **task digest** (open follow-ups, due reminders, flagged notes). Pro users may see an optional **Assist summary** when the on-device model is ready.
- Tap **Assist** on the notes list to open Settings → Totus Assist.

---

## 3. SoFo Postpartum HV template

**Home → SoFo Postpartum HV** or Templates tab → **SoFo Postpartum HV** (★ Pinned).

- Structured postpartum home-visit note formatted for copy/paste into Plexia or your EMR.
- Voice dictation friendly — use your keyboard's microphone on any field.
- **Draft auto-save** while the vault is unlocked (restored when you reopen the template).
- **Preview & Copy** before pasting — clinical export skeleton aligned for nursing workflows.
- Enter **birth weight**, **last visit date**, **previous weight**, **visit date**, and **today's weight** manually.
- Optional **patient address** with “Include in today's trip” to add the visit to your trip plan.

---

## 4. Trips & GPS mileage

Trips tab → plan up to **50 patient stops** for your visit day.

### Free tier

- Add stops manually or from postpartum address field.
- **Start GPS Trip** records actual km along the route your phone took.
- **Open in Maps** launches Google/Apple Maps.
- Straight-line km estimate between stops.

### Trip Planner Pro (Pro Lifetime)

- **Driving route distance** from patient addresses (OpenStreetMap / OSRM — no API key).
- **In-app map preview** with OpenStreetMap tiles after planning a route.
- Choose **Google Maps (app)** or **Apple Maps** (iOS) to open turn-by-turn navigation externally — also no API key.

Settings → Trip Planner Pro configures external maps app and in-app preview. Optional Google/Mapbox API keys are under **Advanced routing** for power users only.

### Tips

- Grant location permission when prompted; background location is used only during an active trip.
- End the trip before switching away; the app guards against double-stop and interrupted sessions.
- Active GPS buffer clears when the vault **auto-locks**.

---

## 5. Built-in templates

Templates tab → **Built-in** (briefcase icon).

Five clinical-style forms ship with the app:

| Template | Use case |
|----------|----------|
| Home Visit Nursing | Community nursing home visit |
| Wound Care | Wound assessment and dressing |
| Psychosocial Assessment | Psychosocial screening |
| Discharge Planning | Discharge coordination |
| General Intake | General patient intake |

### Actions on each form

- **Fill** fields and save as a note.
- **Copy for Plexia / EMR** — plain `Label: value` text (empty fields omitted; checkboxes → Yes/No).
- **Save to briefcase** — store a filled instance for later.
- **Adapt form** — open Template Studio with the form structure to customize.

Built-in templates are productivity aids — review output before pasting into your EMR.

---

## 6. Template Studio (Pro Lifetime)

Templates tab → **Studio**.

Create **custom templates** from pasted form text.

### Paste workflow

1. **Paste** raw form text (labels, checkboxes, sections).
2. Optional **AI assist** (Template AI) — see section 7.
3. **Review** suggested fields — edit labels, types, and order.
4. **Save** to your briefcase; use like built-in templates.

### Without AI

Rules-based parsing (`parsePastedForm`) still works when AI is unavailable or not purchased.

### Template library (marketplace)

Templates tab → **Template library** — curated public templates (JSON metadata only). Import opens Studio review locally. Totus does **not** upload your vault.

---

## 7. Totus Assist / on-device AI (Pro Lifetime)

**Requires Pro Lifetime** and an **EAS / store build** — not Expo Go.

### Totus AI hub

Settings → **Totus Assist** shows:

- Model download status (ready / downloading / blocked)
- Entitlement (free rules vs Pro AI)
- Capability cards (Template AI, Note Assist, task digest summary)
- Troubleshooting and privacy copy

Contextual **Assist** chips appear on Notes, Templates, and Trips tabs.

### Download the model

Settings → **Totus Assist** → Download **SmolLM2-360M** (~240 MB). Stored on device in app documents; not bundled in the APK.

After first successful download, an onboarding sheet explains what you can do next.

### Template AI in Studio

1. Paste form text in Studio.
2. Tap **AI assist** — status shows Loading model → Running inference.
3. **Review every field** on the review screen (AI badge when from model).
4. On failure, follow on-screen recovery (re-download, EAS build) or choose **Quick parse** (rules).

### Note Assist

In the note editor toolbar: bulletize, shorten, expand, or summarize. Review output before saving.

### Privacy

- Inference runs **on-device only** via `llama.rn`.
- No note content or pasted text is sent to Totus Life servers.
- AI is **productivity assistance** — not clinical decision support.

See [ON_DEVICE_AI.md](./ON_DEVICE_AI.md) for capability matrix and test plan.

---

## 8. Plexia / EMR copy workflow

From any filled **built-in** or **custom** template:

1. Complete the form fields.
2. Tap **Copy for Plexia** or **Copy for EMR**.
3. Paste into Plexia, your hospital EMR, or email — format is plain text:

```
Patient name: Jane Doe
Wound location: Left heel
Dressing changed: Yes
```

Empty fields are omitted. Checkboxes show **Yes** / **No**.

Use **clipboard timeout** (Settings) to clear sensitive copies after a few seconds.

---

## 9. Sync to desktop (manual export)

View notes and templates on a PC, Mac, or Linux **without live cloud sync or uploading plaintext to Totus servers**.

**This is not automatic sync.** You export an encrypted `.totus` bundle from your phone, transfer the file yourself, and open it in the read-only web vault viewer.

### Quick path (in-app)

Settings → **Sync to desktop** shows step-by-step instructions, **Export for desktop viewer (.totus)**, **Open web vault (DuckDuck Go on Android)**, and **Open web vault (default browser)**.

### Step-by-step

#### On your phone

1. Unlock vault → **Settings** → **Sync to desktop**.
2. Tap **Export for desktop viewer (.totus)** and save or share the file.
3. Transfer the `.totus` file securely (USB, AirDrop, encrypted email, work file share).

#### On desktop

1. Open **https://totus--notes.web.app/vault** in a **private/incognito window** (Firefox or DuckDuck Go recommended).
2. **Import** the `.totus` file.
3. Enter your **master password** — decryption happens in your browser only.
4. Browse **Notes** and **Templates** read-only.
5. Copy text as needed (clipboard is system-visible; auto-clears after ~60 seconds on web).
6. Tap **Lock now** or **close the tab** when finished.

**Read-only** — no editing, no IAP, no Template AI on web. No Totus server receives your vault contents.

#### Safe browser guidance

| Platform | Recommendation |
|----------|----------------|
| **Desktop** | Firefox or DuckDuck Go **private/incognito** window. We cannot force a specific browser. |
| **Android** | Settings offers **Open web vault (DuckDuck Go on Android)** when the app is installed; otherwise default browser. |
| **iOS** | Open the URL manually in your preferred private browser — the app cannot force DuckDuck Go or private mode. |

**Do not use** the web vault on shared or public computers. Decrypted data stays in browser memory until you lock or close the tab. Malware, extensions, and screen capture are outside what we can control. **Not HIPAA/PIPEDA certified.**

### Mobile backup vs desktop export

| Action | File | Purpose |
|--------|------|---------|
| **Export Encrypted Vault** (Settings → Backup) | `.enc` | Restore full vault on another phone |
| **Export for desktop viewer** (Settings → Sync to desktop) | `.totus` | Read-only viewing on PC/Mac/Linux web viewer |

---

## 10. Pro tiers

| Tier | Product ID | What you get |
|------|------------|--------------|
| **Free** | — | Notes, postpartum, basic trips, built-in templates, banner ads |
| **Pro Monthly** | `pro_monthly` | Removes banner ads (subscription) |
| **Pro Lifetime** | `pro_lifetime` | No ads + Trip Planner Pro + Template Studio + Template AI + all premium tools |

- Prices shown in-app and in the store at purchase time.
- **Restore purchases** in Settings after reinstall.
- Pro Monthly does **not** unlock Trip Planner Pro or Template Studio — those require Pro Lifetime.

---

## 11. Security settings

Settings → **Security**

| Setting | Description |
|---------|-------------|
| **Auto-lock** | Lock vault after N minutes in background (0 = never) |
| **Clipboard timeout** | Clear copied note text after seconds |
| **Screenshot blocking** | Block screenshots while vault unlocked |
| **Biometrics** | Fingerprint / Face ID unlock |
| **Audit log** | Local encrypted log of security events (including attachment view/delete) |
| **Secure attachments** | Gallery scrub after encrypt (best-effort); secure delete shreds `.enc` files in vault |

### Export / import (mobile vault backup)

Settings → **Backup**

- **Export vault (.enc)** — encrypted full backup for restore on another phone.
- **Import vault (.enc)** — replace local vault from backup (requires export password).

These are separate from the `.totus` desktop viewer export in **Sync to desktop**.

---

## 12. About, policies & support

**Settings → About & Legal** — app version, Android build number, policy links, **Check for policy updates**, and tester unlock (tap version **7 times** → `TOTUS-DEV-2026` for Pro Lifetime testing).

Hosted policies at https://totus--notes.web.app/

- Privacy, Terms, Data deletion, Permissions, Data safety, Ads, Security, Legal disclaimer
- **Web vault viewer:** https://totus--notes.web.app/vault

**Support:** totuslife7@gmail.com (include app version from About & Legal — currently **1.2.12** / Android **49** — device model, OS — never send master password or unencrypted notes).

**GitHub issues:** https://github.com/totuslife7-arch/totus-secure-notes/issues

---

## 13. Builds & development

| Task | Command / note |
|------|----------------|
| Daily dev | `npx expo start --dev-client` (after EAS dev client install) |
| Play Store AAB | `npm run build:aab` |
| Installable APK | `npm run build:apk-prod` |
| Web vault deploy | `npm run vault:prepare` → `npm run firebase:deploy` |
| Template AI | Requires native build with `llama.rn` — not Expo Go |

See [DEVELOPMENT_AND_BUILDS.md](./DEVELOPMENT_AND_BUILDS.md) for full build matrix.

---

*Last updated: July 13, 2026 · v1.2.12 · Android versionCode 52*
