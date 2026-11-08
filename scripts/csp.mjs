// Content Security Policy: computes the hashes of every inline script in the BUILT html and
// keeps the CSP header in vercel.json in sync with them.
//
//   node scripts/csp.mjs           -> check: exit 1 if vercel.json is out of date (used by CI)
//   node scripts/csp.mjs --write   -> rewrite the Content-Security-Policy header in vercel.json
//
// Why hashes: this is a static site, so there is no server to generate a per-request nonce.
// A hash allows exactly one script text and nothing else (MDN: "capitalization and whitespace
// matter"), so the hash is computed from the exact text between <script> and </script>.
// Inline scripts come from: our theme bootstrap (src/index.html) and Angular (event dispatch /
// hydration contract, critical-CSS media swap). They only change when we edit the theme script or
// upgrade Angular, which is exactly when this check fails and asks for `--write`.
//
// JSON blocks (type="application/json" / "application/ld+json") are data, not executed, so
// script-src does not apply to them and they need no hash.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist/portfolio/browser/', import.meta.url));
const vercelPath = fileURLToPath(new URL('../vercel.json', import.meta.url));
const write = process.argv.includes('--write');

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

const EXECUTABLE_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'module']);

/** Bodies of inline scripts that the browser would execute. */
function inlineScripts(html) {
  const bodies = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const [, attrs, body] = match;
    if (/\bsrc\s*=/.test(attrs)) continue;
    const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? '').toLowerCase();
    if (!EXECUTABLE_TYPES.has(type)) continue; // data block: never executed
    if (body.trim() === '') continue;
    bodies.push(body);
  }
  return bodies;
}

const sha256 = (text) => `sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}`;

if (!existsSync(distDir)) {
  console.error('dist/portfolio/browser not found: run `npm run build` first.');
  process.exit(1);
}

const hashes = new Set();
const problems = [];
for (const file of htmlFiles(distDir)) {
  const html = readFileSync(file, 'utf8');
  for (const body of inlineScripts(html)) hashes.add(sha256(body));

  // Things this policy would break or that must never appear in the built pages:
  const handler = html.match(/\s(on[a-z]+)\s*=\s*["']/i);
  if (handler)
    problems.push(`${file}: inline event handler attribute "${handler[1]}" (blocked by CSP)`);
  if (/\sstyle\s*=\s*"/i.test(html)) problems.push(`${file}: inline style="" attribute in markup`);
  const external = html.match(
    /<(?:script|link|img|iframe)\b[^>]*\s(?:src|href)\s*=\s*"(https?:)?\/\/[^"]*"/i,
  );
  if (external && !/rel="(canonical|alternate)"/.test(external[0])) {
    problems.push(`${file}: loads an external resource: ${external[0].slice(0, 90)}`);
  }
}

// Order is irrelevant to browsers; sorting keeps diffs of vercel.json stable.
const scriptHashes = [...hashes].sort();

const policy = [
  "default-src 'self'",
  `script-src 'self' ${scriptHashes.map((h) => `'${h}'`).join(' ')}`,
  // Angular injects component <style> elements at runtime and a static host cannot issue nonces
  // (angular.dev/best-practices/security): inline styles are allowed, inline scripts are not.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "manifest-src 'self'",
  // Trusted Types: DOM sinks (innerHTML, script text, ...) refuse plain strings. Angular's own
  // policies plus ours for the JSON-LD (src/app/core/seo/seo.service.ts). Browsers without
  // Trusted Types ignore these two directives and fall back to Angular's sanitiser.
  'trusted-types angular angular#bundler ng-portifolio-jsonld',
  "require-trusted-types-for 'script'",
].join('; ');

const config = JSON.parse(readFileSync(vercelPath, 'utf8'));
const rule = config.headers?.find((entry) =>
  entry.headers?.some((h) => h.key === 'Content-Security-Policy'),
);
const header = rule?.headers.find((h) => h.key === 'Content-Security-Policy');
if (!header) {
  console.error('vercel.json has no Content-Security-Policy header to check or update.');
  process.exit(1);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

if (header.value === policy) {
  console.log(
    `CSP is up to date: ${scriptHashes.length} inline script hash(es) match the built pages.`,
  );
  process.exit(0);
}

if (write) {
  header.value = policy;
  writeFileSync(vercelPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`vercel.json updated with ${scriptHashes.length} script hash(es):`);
  scriptHashes.forEach((h) => console.log(`  ${h}`));
  process.exit(0);
}

console.error('vercel.json CSP is OUT OF DATE for the current build.');
console.error('Expected inline script hashes:\n  ' + scriptHashes.join('\n  '));
console.error(
  'Run `npm run csp:update` and commit vercel.json (the page would otherwise break in production).',
);
process.exit(1);
