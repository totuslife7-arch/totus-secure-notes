#!/usr/bin/env node
/**
 * Copy Expo web export (dist/) vault routes + shared assets into firebase/public/
 * for hosting at https://totus--notes.web.app/vault
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const firebasePublic = path.join(root, 'firebase', 'public');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source: ${src}`);
  }
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function mergeDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const from = path.join(src, entry);
    const to = path.join(dest, entry);
    if (fs.statSync(from).isDirectory()) {
      mergeDir(from, to);
    } else {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
}

if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run: npx expo export --platform web');
  process.exit(1);
}

const vaultSrc = path.join(dist, 'vault');
if (!fs.existsSync(vaultSrc)) {
  console.error('dist/vault/ not found. Ensure app/vault routes exist and re-export.');
  process.exit(1);
}

console.log('Copying vault pages → firebase/public/vault/');
copyRecursive(vaultSrc, path.join(firebasePublic, 'vault'));

for (const shared of ['_expo', 'assets']) {
  const src = path.join(dist, shared);
  if (fs.existsSync(src)) {
    console.log(`Merging dist/${shared}/ → firebase/public/${shared}/`);
    mergeDir(src, path.join(firebasePublic, shared));
  }
}

// Expo static export may reference root-level HTML helpers
for (const file of ['+not-found.html', '_sitemap.html']) {
  const src = path.join(dist, file);
  if (fs.existsSync(src)) {
    const dest = path.join(firebasePublic, file);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    }
  }
}

console.log('Vault static files ready in firebase/public/');
