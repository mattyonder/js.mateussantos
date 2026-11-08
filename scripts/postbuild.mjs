// Post-build steps that need the finished `dist/` (run right after `ng build`):
//   1. Adds <link rel="preload"> for the two web fonts to every prerendered HTML file.
//   2. Copies the prerendered 404 page to `404.html` at the root, the conventional
//      name static hosts use for "page not found" (see vercel.json).
//
// --- 1. Font preloads ---
// Why: the @font-face rules live in the stylesheet, so the browser only discovers the
// fonts after CSS is parsed, which delays the swap (and text paint with the right font).
// Preloading starts the download at the very beginning. The file names carry a content
// hash that only exists after `ng build`, so this runs right after it.
//
// `crossorigin` is required for font preloads even on the same origin.

import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/portfolio/browser/', import.meta.url));

const fonts = readdirSync(join(dist, 'media')).filter((f) => f.endsWith('.woff2'));
if (fonts.length === 0) {
  console.error('No .woff2 files found in dist/portfolio/browser/media: did ng build run?');
  process.exit(1);
}
const links = fonts
  .map((f) => `<link rel="preload" href="media/${f}" as="font" type="font/woff2" crossorigin>`)
  .join('');

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'media' ? [] : htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

let patched = 0;
for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  if (html.includes('rel="preload"') && html.includes('as="font"')) continue; // idempotent
  // First thing in <head> after <meta charset>: earliest possible discovery.
  const updated = html.replace(/(<meta charset="[^"]*">)/i, `$1${links}`);
  if (updated === html) {
    console.error(`Could not find <meta charset> in ${file}`);
    process.exit(1);
  }
  writeFileSync(file, updated);
  patched++;
}
console.log(`Font preloads (${fonts.length}) injected into ${patched} HTML file(s)`);

// --- 2. 404.html ---
// The 404 route is prerendered at /404 (404/index.html). Static hosts look for 404.html.
// The page uses root-relative assets (<base href="/">), so it renders correctly from any URL.
const notFoundSource = join(dist, '404', 'index.html');
if (!existsSync(notFoundSource)) {
  console.error('404/index.html not found: the 404 route was not prerendered');
  process.exit(1);
}
copyFileSync(notFoundSource, join(dist, '404.html'));
console.log('404.html created from the prerendered 404 page');
