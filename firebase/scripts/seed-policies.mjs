#!/usr/bin/env node
/**
 * Seed Firestore policies/{id} from docs/*.md
 * Auth: firebase/service-account.json OR gcloud application-default credentials
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { POLICY_MANIFEST, publicUrlForPolicy } from './policy-manifest.mjs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const firebaseDir = path.resolve(__dirname, '..');
const PROJECT_ID = 'totus--notes';

function readEffectiveDate(md) {
  const match = md.match(/\*\*Effective date:\*\*\s*(.+)/i);
  return match ? match[1].trim() : new Date().toISOString().slice(0, 10);
}

function readVersion(md) {
  const match = md.match(/\*\*Last updated:\*\*\s*(.+)/i);
  return match ? match[1].trim() : '1.2.1';
}

function initAdmin(credential) {
  const { getApps, initializeApp } = require('firebase-admin/app');
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp({ credential, projectId: PROJECT_ID });
}

async function seedFirestore() {
  const { getFirestore, FieldValue } = require('firebase-admin/firestore');
  const db = getFirestore();
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  for (const doc of POLICY_MANIFEST) {
    const mdPath = path.join(root, 'docs', doc.file);
    const bodyMarkdown = fs.readFileSync(mdPath, 'utf8');
    const ref = db.collection('policies').doc(doc.id);
    batch.set(ref, {
      version: readVersion(bodyMarkdown),
      title: doc.title,
      bodyMarkdown,
      effectiveDate: readEffectiveDate(bodyMarkdown),
      publicUrl: publicUrlForPolicy(doc.path),
      path: doc.path,
      updatedAt: now,
    });
    console.log(`Queued policies/${doc.id}`);
  }

  await batch.commit();
  console.log(`Firestore: seeded ${POLICY_MANIFEST.length} policies.`);
}

async function main() {
  const { cert, applicationDefault } = require('firebase-admin/app');
  const saPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(firebaseDir, 'service-account.json');

  if (fs.existsSync(saPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    initAdmin(cert(serviceAccount));
    await seedFirestore();
    return;
  }

  console.log('No service-account.json — trying Application Default Credentials...');
  try {
    initAdmin(applicationDefault());
    await seedFirestore();
  } catch (adcErr) {
    console.error(`
Could not seed Firestore.

Option A — Service account (recommended):
  Firebase Console → Project settings → Service accounts → Generate new private key
  Save as firebase/service-account.json (gitignored)
  Run: npm run policies:seed

Option B — Application Default Credentials:
  gcloud auth application-default login
  Run: npm run policies:seed

Hosting is live; in-app policy links work without Firestore seed.

Error: ${adcErr.message}
`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
