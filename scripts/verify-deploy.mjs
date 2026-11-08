// Verifies a REAL deployment (production or a Vercel preview) against what vercel.json intends.
//
//   npm run verify:deploy                              -> checks PROFILE.siteUrl (production)
//   npm run verify:deploy -- https://xxx.vercel.app    -> checks a preview deployment
//
// Why it exists: scripts/smoke-test.mjs emulates vercel.json locally, but only Vercel's own router
// can prove how its path patterns, 404.html, redirects with cookie/header conditions and default
// headers really behave (the docs leave several of those undocumented). Read-only: it only sends
// GET requests.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PROFILE } from '../src/app/content/profile.ts';

const base = (process.argv[2] ?? PROFILE.siteUrl).replace(/\/$/, '');
const config = JSON.parse(
  readFileSync(fileURLToPath(new URL('../vercel.json', import.meta.url)), 'utf8'),
);
const expectedCsp = config.headers[0].headers.find(
  (h) => h.key === 'Content-Security-Policy',
).value;

const results = [];
const check = (name, ok, detail) => {
  results.push(ok);
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${name}${detail === undefined ? '' : '  -> ' + JSON.stringify(detail)}`,
  );
};

const get = (path, headers = {}) => fetch(base + path, { redirect: 'manual', headers });
const text = async (path, headers) => {
  const r = await get(path, headers);
  return { r, body: await r.text() };
};

console.log(`Verifying ${base}\n`);

// ---------- pages and security headers ----------
const pages = {};
for (const path of ['/pt', '/en']) {
  const { r, body } = await text(path, { 'accept-language': 'en-US' });
  pages[path] = { r, body };
  const h = r.headers;
  check(
    `${path}: 200 HTML`,
    r.status === 200 && (h.get('content-type') ?? '').includes('text/html'),
    { status: r.status, type: h.get('content-type') },
  );
  check(
    `${path}: the CSP header is exactly the one in vercel.json`,
    h.get('content-security-policy') === expectedCsp,
    h.get('content-security-policy')?.slice(0, 90) ?? null,
  );
  check(
    `${path}: nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP`,
    h.get('x-content-type-options') === 'nosniff' &&
      h.get('x-frame-options') === 'DENY' &&
      h.get('referrer-policy') === 'strict-origin-when-cross-origin' &&
      h.get('permissions-policy')?.includes('camera=()') &&
      h.get('cross-origin-opener-policy') === 'same-origin',
    Object.fromEntries(
      [
        'x-content-type-options',
        'x-frame-options',
        'referrer-policy',
        'cross-origin-opener-policy',
      ].map((k) => [k, h.get(k)]),
    ),
  );
  check(
    `${path}: HSTS is sent (Vercel default)`,
    /max-age=\d+/.test(h.get('strict-transport-security') ?? ''),
    h.get('strict-transport-security'),
  );
  check(
    `${path}: HTML is not cached for long (revalidated)`,
    !/immutable|max-age=[1-9]\d{4,}/.test(h.get('cache-control') ?? ''),
    h.get('cache-control'),
  );
}

// ---------- the CSP really covers the inline scripts that are SERVED ----------
const inlineScriptHashes = (html) =>
  [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(
      ([, attrs, body]) =>
        !/\bsrc\s*=/.test(attrs) &&
        body.trim() &&
        !/type\s*=\s*["']?application\/(ld\+)?json/i.test(attrs),
    )
    .map(([, , body]) => `sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}`);
for (const [path, { r, body }] of Object.entries(pages)) {
  const csp = r.headers.get('content-security-policy') ?? '';
  const missing = inlineScriptHashes(body).filter((hash) => !csp.includes(hash));
  check(
    `${path}: every inline script served is allowed by the served CSP (the page would break otherwise)`,
    missing.length === 0,
    missing,
  );
}

// ---------- SEO in the served HTML ----------
{
  const { body } = pages['/pt'];
  const siteUrl = PROFILE.siteUrl;
  check(
    '/pt: canonical, hreflang (pt-BR, en, x-default), Open Graph, Twitter card and JSON-LD are in the HTML',
    body.includes(`rel="canonical" href="${siteUrl}/pt"`) &&
      ['pt-BR', 'en', 'x-default'].every((l) => body.includes(`hreflang="${l}"`)) &&
      body.includes('property="og:image"') &&
      body.includes('name="twitter:card"') &&
      body.includes('"@type":"Person"'),
  );
  check(
    '/en: lang="en" and its own canonical',
    pages['/en'].body.includes('<html lang="en"') &&
      pages['/en'].body.includes(`rel="canonical" href="${siteUrl}/en"`),
  );
}

const sitemap = await text('/sitemap.xml');
check(
  'sitemap.xml is XML (not the SPA fallback) and lists /pt and /en with hreflang alternates',
  /xml/.test(sitemap.r.headers.get('content-type') ?? '') &&
    sitemap.body.includes(`<loc>${PROFILE.siteUrl}/pt</loc>`) &&
    sitemap.body.includes(`<loc>${PROFILE.siteUrl}/en</loc>`) &&
    sitemap.body.includes('hreflang="x-default"'),
  { status: sitemap.r.status, type: sitemap.r.headers.get('content-type') },
);
const robots = await text('/robots.txt');
check(
  'robots.txt is plain text (not the SPA fallback) and points to the sitemap',
  /text\/plain/.test(robots.r.headers.get('content-type') ?? '') &&
    /^Sitemap: https?:\/\//m.test(robots.body),
  { status: robots.r.status, type: robots.r.headers.get('content-type') },
);

// ---------- caching of hashed assets (proves the vercel.json path patterns work on Vercel) ----------
{
  const html = pages['/pt'].body;
  const assets = {
    js: html.match(/src="\/?(main-[A-Z0-9]+\.js)"/)?.[1],
    css: html.match(/href="\/?(styles-[A-Z0-9]+\.css)"/)?.[1],
    font: html.match(/href="\/?(media\/[^"]+\.woff2)"/)?.[1],
  };
  check(
    'found a hashed JS, CSS and font in the served HTML',
    Object.values(assets).every(Boolean),
    assets,
  );
  for (const [kind, file] of Object.entries(assets)) {
    if (!file) continue;
    const r = await get('/' + file);
    check(
      `hashed ${kind} (/${file.slice(0, 28)}…): 200 and "public, max-age=31536000, immutable"`,
      r.status === 200 && r.headers.get('cache-control') === 'public, max-age=31536000, immutable',
      { status: r.status, cache: r.headers.get('cache-control') },
    );
  }
  const photo = await get('/photo_me.webp');
  check(
    'non-hashed files (photo) are NOT immutable',
    photo.status === 200 && !/immutable/.test(photo.headers.get('cache-control') ?? ''),
    photo.headers.get('cache-control'),
  );
}

// ---------- static files ----------
for (const [path, type] of [
  ['/curriculo_mateus_de_jesus_santos_pt_br.pdf', 'application/pdf'],
  ['/curriculo_mateus_de_jesus_santos_en.pdf', 'application/pdf'],
  ['/og-image.jpg', 'image/jpeg'],
  ['/favicon.svg', 'image/svg+xml'],
  ['/favicon.ico', 'image'],
  ['/apple-touch-icon.png', 'image/png'],
]) {
  const r = await get(path);
  check(
    `${path}: 200 ${type}`,
    r.status === 200 && (r.headers.get('content-type') ?? '').includes(type),
    { status: r.status, type: r.headers.get('content-type') },
  );
}

// ---------- 404 and URL hygiene ----------
{
  const { r, body } = await text('/this-page-does-not-exist-' + Date.now());
  check('unknown URL answers HTTP 404, not a soft 200', r.status === 404, r.status);
  check(
    '...with the prerendered 404 page (h1 "404", noindex) and the security headers',
    body.includes('>404<') &&
      /name="robots" content="noindex"/.test(body) &&
      r.headers.get('content-security-policy') === expectedCsp,
    { status: r.status },
  );
  const slash = await get('/pt/');
  check(
    '/pt/ redirects to /pt (no duplicate URL)',
    [301, 308].includes(slash.status) &&
      (slash.headers.get('location') ?? '').replace(base, '') === '/pt',
    { status: slash.status, location: slash.headers.get('location') },
  );
}

// ---------- "/" language redirects (cookie / Accept-Language conditions) ----------
const rootBehaviour = async (headers) => {
  const r = await get('/', headers);
  if (r.status === 200) return '200 chooser';
  return `${r.status} ${(r.headers.get('location') ?? '').replace(base, '')}`;
};
check(
  '"/" + cookie lang=en -> 307 /en',
  (await rootBehaviour({ cookie: 'lang=en' })) === '307 /en',
  await rootBehaviour({ cookie: 'lang=en' }),
);
check(
  '"/" + cookie lang=pt -> 307 /pt',
  (await rootBehaviour({ cookie: 'lang=pt' })) === '307 /pt',
  await rootBehaviour({ cookie: 'lang=pt' }),
);
check(
  '"/" + Accept-Language pt-BR, no cookie -> 307 /pt',
  (await rootBehaviour({ 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8' })) === '307 /pt',
  await rootBehaviour({ 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8' }),
);
check(
  'the cookie wins over Accept-Language (cookie en + browser pt -> /en)',
  (await rootBehaviour({ cookie: 'lang=en', 'accept-language': 'pt-BR' })) === '307 /en',
  await rootBehaviour({ cookie: 'lang=en', 'accept-language': 'pt-BR' }),
);
check(
  '"/" + another language, no cookie -> the static chooser (JS decides)',
  (await rootBehaviour({ 'accept-language': 'fr-FR,fr;q=0.9' })) === '200 chooser',
  await rootBehaviour({ 'accept-language': 'fr-FR,fr;q=0.9' }),
);

const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed against ${base}`);
process.exit(failed ? 1 : 0);
