#!/usr/bin/env node
/**
 * Build static policy HTML pages from docs/*.md for Firebase Hosting.
 * Run: node firebase/scripts/build-policy-html.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HOSTING_BASE, POLICY_MANIFEST, publicUrlForPolicy } from './policy-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const publicRoot = path.resolve(__dirname, '../public');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inList = false;
  let inTable = false;

  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  const closeTable = () => {
    if (inTable) {
      out.push('</tbody></table>');
      inTable = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith('|') && line.includes('|')) {
      closeList();
      if (/^\|[-\s|:]+\|$/.test(line.replace(/\s/g, ''))) continue;
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      if (!inTable) {
        out.push('<table><tbody>');
        inTable = true;
        out.push(
          `<tr>${cells.map((c) => `<th>${inlineMarkdown(c)}</th>`).join('')}</tr>`
        );
      } else {
        out.push(
          `<tr>${cells.map((c) => `<td>${inlineMarkdown(c)}</td>`).join('')}</tr>`
        );
      }
      continue;
    }

    closeTable();

    if (line.startsWith('---')) {
      closeList();
      continue;
    }
    if (line.startsWith('# ')) {
      closeList();
      out.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeList();
      out.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      closeList();
      out.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('- ')) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }
    if (!line.trim()) {
      closeList();
      continue;
    }
    closeList();
    out.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeList();
  closeTable();
  return out.join('\n');
}

function wrapPage(title, bodyHtml) {
  const updated = new Date().toISOString().slice(0, 10);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, Segoe UI, Roboto, sans-serif; line-height: 1.55; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; color: #111; }
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.15rem; margin-top: 1.5rem; }
    h3 { font-size: 1rem; margin-top: 1.25rem; }
    ul { padding-left: 1.25rem; }
    table { border-collapse: collapse; width: 100%; font-size: 0.95rem; margin: 1rem 0; }
    th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
    a { color: #0b57d0; }
    code { font-size: 0.9em; background: #f4f4f4; padding: 0 4px; border-radius: 3px; }
    .meta { color: #555; font-size: 0.9rem; }
    nav a { display: block; margin: 0.35rem 0; }
  </style>
</head>
<body>
  <p class="meta"><strong>Totus Secure Notes</strong> · Firebase Hosting · Built ${updated}</p>
  ${bodyHtml}
  <p class="meta"><a href="${HOSTING_BASE}/">All policies</a> · <a href="mailto:totuslife7@gmail.com">totuslife7@gmail.com</a></p>
</body>
</html>`;
}

for (const policy of POLICY_MANIFEST) {
  const source = path.join(root, 'docs', policy.file);
  const md = fs.readFileSync(source, 'utf8');
  const html = wrapPage(policy.title, markdownToHtml(md));
  const outDir = path.join(publicRoot, policy.path);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  console.log(`Wrote ${policy.id} → ${path.join(outDir, 'index.html')}`);
}

const indexLinks = POLICY_MANIFEST.map(
  (p) => `<li><a href="/${p.path}/">${escapeHtml(p.title.replace(' — Totus Secure Notes', ''))}</a> — <code>${publicUrlForPolicy(p.path)}</code></li>`
).join('\n');

const indexHtml = wrapPage(
  'Policies — Totus Secure Notes',
  `<h1>Totus Secure Notes — Legal &amp; Policy Documents</h1>
<p>Public documents for Google Play, App Store, and in-app disclosure. Package: <code>com.totuslife.TotusSecureNotes</code></p>
<h2>All policies</h2>
<ul>${indexLinks}</ul>
<h2>Play Console quick links</h2>
<ul>
<li><strong>Privacy policy URL:</strong> <a href="/privacy/">${publicUrlForPolicy('privacy')}</a></li>
<li><strong>Data deletion URL:</strong> <a href="/data-deletion/">${publicUrlForPolicy('data-deletion')}</a></li>
</ul>`
);

fs.writeFileSync(path.join(publicRoot, 'index.html'), indexHtml, 'utf8');
console.log(`Wrote index → ${path.join(publicRoot, 'index.html')}`);
console.log('Policy HTML build complete.');
