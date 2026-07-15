# Support — Totus Secure Notes

**Public URL:** https://totus--notes.web.app/support

## Contact

**Email:** totuslife7@gmail.com  

We aim to respond within **3–5 business days**.

---

## What to include in support requests

1. App version (**Settings → About & Legal** — currently **1.2.14**, Android versionCode **56**)  
2. Device model and OS version (Android / iOS)  
3. Description of the issue  
4. Steps to reproduce  

**Do not email your master password or unencrypted note content.**

---

## Common issues

### Trip / GPS mileage not recording

Grant location permission when prompted. Start trip from the **Trips** tab before driving. Background location is used only during an active trip.

### Maps route planning (Pro)

Requires Trip Planner Pro (Pro Lifetime). Driving routes use OpenStreetMap by default — no API key. Optional Google/Mapbox keys under Settings → Advanced routing.

### Forgot master password

We cannot recover it. The vault is encrypted on your device only. If you have an encrypted export (`.enc`) and remember that password, you may restore from backup.

### App locked / biometrics not working

Try master password unlock. Re-enable biometrics in Settings after unlocking. Biometric data changes (new fingerprint) may require re-enabling.

### Lost data after uninstall

Local data is removed on uninstall unless you exported an encrypted vault first.

### Purchase / Pro not unlocking

Use **Restore purchases** in Settings (when available). If still failing, contact us with your store order ID from Google Play or Apple.

### Template AI not working

Requires **Pro Lifetime** (or store-review / tester unlock) and a **store/EAS build** (not Expo Go). Open **Settings → Totus Assist** — download SmolLM2 when entitled. **Ready** appears only when the model file passes verification and the on-device engine initializes. For testing: **Settings → About & Legal** → tap version **7 times** → enter `TOTUS-DEV-2026`. Studio still works with rules-based **Quick parse** when AI is unavailable.

### Voice memos not recording

Grant **microphone** permission when prompted. Unlock the vault first. Voice memos encrypt into your vault as attachments — they are not uploaded to Totus servers.

### SoFo Postpartum HV template

**Home** quick action or **Templates → SoFo Postpartum HV**. Draft auto-saves while unlocked. Use **Preview & Copy** before pasting into your EMR.

### Web vault viewer

Export `.totus` from Settings on mobile. Open the web build at `/vault`, select the file, enter master password. Viewer is read-only and decrypts in-browser only. Auto-locks after 5 minutes.

### Plexia / EMR copy

Use **Copy for Plexia** or **Copy for EMR** on filled templates. Output is plain `Label: value` text. Enable clipboard timeout in Settings for sensitive copies.

---

## Bug reports & feature requests

GitHub: https://github.com/totuslife7-arch/totus-secure-notes/issues  

---

## Security reports

Email totuslife7@gmail.com with subject **Security — Totus Secure Notes**. We appreciate responsible disclosure.

---

*Use this page URL or email in Google Play and App Store Connect “Support” fields.*
