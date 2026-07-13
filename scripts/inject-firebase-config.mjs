/**
 * Copies Firebase client configs from EAS file env vars into the repo root
 * before prebuild. Local dev can skip env vars when files already exist.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function injectFromEnv(envVar, destFile) {
  const dest = path.join(root, destFile);
  const src = process.env[envVar];

  if (src && fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[firebase-config] Wrote ${destFile} from ${envVar}`);
    return true;
  }

  if (fs.existsSync(dest)) {
    console.log(`[firebase-config] Using existing ${destFile}`);
    return true;
  }

  console.warn(`[firebase-config] Missing ${destFile} (set EAS file secret ${envVar} or add locally)`);
  return false;
}

const androidOk = injectFromEnv('GOOGLE_SERVICES_JSON', 'google-services.json');
const iosOk = injectFromEnv('GOOGLE_SERVICE_INFO_PLIST', 'GoogleService-Info.plist');

if (process.env.EAS_BUILD === 'true' && !androidOk) {
  console.error(
    '[firebase-config] EAS build requires GOOGLE_SERVICES_JSON file secret. See docs/FIREBASE_SETUP.md',
  );
  process.exit(1);
}

if (process.env.EAS_BUILD === 'true' && !iosOk) {
  console.warn('[firebase-config] iOS plist missing; Android-only builds may still succeed.');
}
