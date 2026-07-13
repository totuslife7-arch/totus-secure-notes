# Android Signing — Totus Secure Notes

> **Quick fix for your error:** Play expects SHA-1 `83:6B:31:...` but EAS uses `76:6F:7A:...`. Run `eas credentials -p android` → production → download **upload certificate** (`.pem`) → Play Console → **App integrity** → **Request upload key reset** → upload the `.pem`. See steps below.

Play Console rejected uploads because the **upload certificate** does not match what Google registered on an earlier attempt.

| Key | SHA-1 fingerprint |
|-----|-------------------|
| Play expects (old upload key) | `83:6B:31:B6:15:41:B3:B4:A9:B6:D3:4B:06:44:35:C9:8B:37:3E:BE` |
| EAS production keystore (current) | `76:6F:7A:88:12:33:C1:3C:AA:84:2A:71:1A:6E:56:FD:21:8F:90:EE` |

You do **not** need an old `.jks` file. EAS already holds a valid keystore. Register **EAS's certificate** with Play via upload key reset.

---

## Step 1 — Export EAS upload certificate

Run in PowerShell (interactive):

```powershell
cd "c:\Users\Admin\Documents\TotusNoteSafe\TotusNote\TotusSafe"
eas credentials -p android
```

Choose:

1. **production** profile  
2. **Keystore**  
3. **Download upload certificate** → save as `totus-upload-cert.pem`

Or open [Expo credentials](https://expo.dev/accounts/totuslife/projects/totus-secure-notes/credentials) → Android → production → download upload certificate.

---

## Step 2 — Back up the keystore (recommended)

Same `eas credentials` menu:

- **Download keystore** (`.jks` file)  
- Save keystore file, keystore password, and key alias/password in a password manager  
- **Never commit** `.jks` files to git (already in `.gitignore`)

This is your only copy if you leave EAS; treat it like a master key.

---

## Step 3 — Request upload key reset in Play Console

1. [Google Play Console](https://play.google.com/console) → **Totus Secure Notes**  
2. **Setup → App integrity → App signing**  
3. **Request upload key reset** (or **Register new upload key**)  
4. Upload `totus-upload-cert.pem` from Step 1  
5. Wait for Google approval (often 1–3 days for new/unpublished apps)

---

## Step 4 — Rebuild and upload

After approval:

```powershell
npm run build:aab
```

Upload the new AAB to **Testing → Internal testing**.

---

## Step 5 — Add SHA-1 to Firebase (for Analytics / Google services)

After reset, copy **SHA-1** and **SHA-256** from EAS credentials into:

**Firebase Console** → Project `totus--notes` → **Project settings** → Your Android app → **Add fingerprint**

Package: `com.totuslife.TotusSecureNotes`

---

## Verify fingerprints locally (optional)

If you downloaded the `.jks` backup:

```powershell
keytool -list -v -keystore YOUR_BACKUP.jks -alias YOUR_ALIAS
```

Compare SHA-1 to EAS credentials page and Play Console upload key after reset.

---

## Related

- [PLAY_FIRST_UPLOAD_CHECKLIST.md](./PLAY_FIRST_UPLOAD_CHECKLIST.md)  
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
