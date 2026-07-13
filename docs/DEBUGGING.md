# Debugging Totus Secure Notes

## Dev client

Expo Go is not supported for SDK 56. Use a development build:

```bash
npm run start:dev
npm run build:android:dev
```

Install the dev APK from EAS, then connect Metro.

## TypeScript check

```bash
npx tsc --noEmit
```

## Android logcat

With device connected via USB:

```bash
adb logcat *:S ReactNative:V ReactNativeJS:V AndroidRuntime:E
```

Reproduce crash while typing or saving, then search for `FATAL` or `ReactNativeJS`.

## React Native DevTools

Shake device or press `j` in Metro terminal to open DevTools. Inspect component state in `VaultContext` and note editor draft.

## Common issues

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| White text on white input | Missing theme colors | Use `ThemedTextInput` |
| Cursor jumps while typing | Save resets local state | Editor uses fingerprint save + id-only init |
| Lost edits after leaving note | Concurrent saves / no blur flush | `VaultContext.persistChainRef` serializes writes; editor snapshots draft on blur and background |
| Save never completes | Vault locked / error | Check `saveError` in editor; unlock vault |
| Slow save | Large vault | Session crypto caches PBKDF2 key |
| Reminder not firing | Permissions denied | Settings → allow notifications |

## Local error logging

The app does not send crash data to third parties. Errors during save appear in the note editor status line. Vault operations log to the encrypted audit log (Settings → Audit log).

## EAS builds

```bash
npm run build:apk        # preview APK
npm run build:aab        # Play Store AAB
```

See `docs/DEVELOPMENT_AND_BUILDS.md` for full build matrix.

## Testing checklist

- [ ] Type in light and dark mode — text visible
- [ ] Rapid typing 30+ seconds — no cursor jump
- [ ] Leave editor before 2s debounce — changes persist after return (blur snapshot)
- [ ] Rapid edits + navigate away — no dropped saves (serialized vault queue)
- [ ] Android edge-to-edge — footer buttons above nav bar
- [ ] Flag, reminder, extra notes persist after reload
- [ ] Photo attachment encrypts and survives lock/unlock
- [ ] Auto-lock after configured background time
