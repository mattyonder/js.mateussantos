// Smoke test of the production build, in real Chrome, under the REAL security headers.
//
// It serves dist/portfolio/browser with a tiny static server that applies the `headers`,
// `redirects` and 404 behaviour declared in vercel.json, then drives headless Chrome over the
// DevTools Protocol (no extra dependencies: Node's built-in WebSocket + a Chrome binary).
//
// IMPORTANT LIMIT: this emulates the INTENT of vercel.json. It cannot prove how Vercel's own
// router treats it (e.g. path patterns, 404.html). `scripts/verify-deploy.mjs` checks that on a
// real deployment.
//
//   node scripts/smoke-test.mjs            (needs `npm run build` first)
//   CHROME_PATH=/path/to/chrome node scripts/smoke-test.mjs

import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const ROOT = fileURLToPath(new URL('../dist/portfolio/browser/', import.meta.url));
const config = JSON.parse(
  readFileSync(fileURLToPath(new URL('../vercel.json', import.meta.url)), 'utf8'),
);
const HTTP_PORT = Number(process.env.SMOKE_PORT ?? 4599);
const CDP_PORT = Number(process.env.SMOKE_CDP_PORT ?? 9599);

if (!existsSync(ROOT)) {
  console.error('dist/portfolio/browser not found: run `npm run build` first.');
  process.exit(1);
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    console.error('Chrome not found. Set CHROME_PATH to a Chrome/Chromium binary.');
    process.exit(1);
  }
  return found;
}

// ---------------------------------------------------------------------------------------
// Static server that emulates vercel.json
// ---------------------------------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};

const sourceRegex = (source) => new RegExp(`^${source}$`);

function conditionMet(condition, req) {
  const cookies = Object.fromEntries(
    (req.headers.cookie ?? '')
      .split(';')
      .map((c) => c.trim().split('='))
      .filter(([k]) => k)
      .map(([k, v]) => [k, v ?? '']),
  );
  const actual =
    condition.type === 'cookie' ? cookies[condition.key] : req.headers[condition.key.toLowerCase()];
  if (actual === undefined) return false;
  const v = condition.value;
  if (v === undefined) return true;
  if (typeof v === 'string') return new RegExp(v).test(actual);
  if ('eq' in v) return actual === v.eq;
  if ('pre' in v) return actual.startsWith(v.pre);
  throw new Error(`smoke test does not emulate condition ${JSON.stringify(v)}`);
}

function findRedirect(pathname, req) {
  return (config.redirects ?? []).find(
    (r) =>
      sourceRegex(r.source).test(pathname) &&
      (r.has ?? []).every((c) => conditionMet(c, req)) &&
      !(r.missing ?? []).some((c) => conditionMet(c, req)),
  );
}

function configHeaders(pathname) {
  const out = {};
  for (const rule of config.headers ?? []) {
    if (sourceRegex(rule.source).test(pathname)) for (const h of rule.headers) out[h.key] = h.value;
  }
  return out;
}

function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  for (const candidate of [join(ROOT, clean), join(ROOT, clean, 'index.html')]) {
    if (candidate.startsWith(ROOT) && existsSync(candidate) && statSync(candidate).isFile())
      return candidate;
  }
  return null;
}

const handler = (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname !== '/' && pathname.endsWith('/') && config.trailingSlash === false) {
    res.writeHead(308, { location: pathname.slice(0, -1) });
    return res.end();
  }
  const redirect = findRedirect(pathname, req);
  if (redirect) {
    res.writeHead(redirect.permanent === false ? 307 : 308, { location: redirect.destination });
    return res.end();
  }

  // Test-only pages (not part of the site) used to prove CSP/framing behaviour in a real browser.
  if (pathname.startsWith('/__')) {
    const page = (body, headers = {}) => {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', ...headers });
      res.end(body);
    };
    if (pathname === '/__eval-test')
      return page('<!doctype html><script src="/__eval-test.js"></script>', configHeaders('/x'));
    if (pathname === '/__eval-test.js') {
      res.writeHead(200, { 'content-type': 'text/javascript' });
      return res.end(
        "try { eval('1 + 1'); window.__evalResult = 'EXECUTED'; } catch { window.__evalResult = 'blocked'; }" +
          "try { document.body.innerHTML = '<b>x</b>'; window.__htmlResult = 'EXECUTED'; } catch { window.__htmlResult = 'blocked'; }",
      );
    }
    // Served WITHOUT security headers so it can be framed: the positive control.
    if (pathname === '/__plain') return page('<!doctype html><p>plain</p>');
    if (pathname === '/__frames') {
      return page(
        `<!doctype html><iframe id="site" src="http://localhost:${HTTP_PORT}/pt"></iframe><iframe id="control" src="http://localhost:${HTTP_PORT}/__plain"></iframe>`,
      );
    }
  }

  let file = resolveFile(pathname);
  let status = 200;
  if (!file) {
    file = join(ROOT, '404.html');
    status = 404;
  }
  res.writeHead(status, {
    'content-type': MIME[extname(file)] ?? 'application/octet-stream',
    ...configHeaders(pathname),
  });
  res.end(readFileSync(file));
};
const server = createServer(handler);
// A second origin (same site, other port) used only as the page that tries to frame the site.
const framerServer = createServer(handler);
await new Promise((resolve) => server.listen(HTTP_PORT, resolve));
await new Promise((resolve) => framerServer.listen(HTTP_PORT + 1, resolve));
const base = `http://localhost:${HTTP_PORT}`;

// ---------------------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------------------
const results = [];
function check(name, ok, detail) {
  results.push(ok);
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${name}${detail === undefined ? '' : '  -> ' + JSON.stringify(detail)}`,
  );
}

// ---------------------------------------------------------------------------------------
// 1. HTTP-level checks (headers, redirects, 404, caching)
// ---------------------------------------------------------------------------------------
const get = (path, init = {}) => fetch(base + path, { redirect: 'manual', ...init });
const csp = config.headers[0].headers.find((h) => h.key === 'Content-Security-Policy').value;

for (const path of ['/pt', '/en', '/', '/404']) {
  const res = await get(path, { headers: { 'accept-language': 'en-US' } });
  const h = res.headers;
  check(
    `headers ${path}: CSP, nosniff, DENY, referrer, permissions, COOP all present`,
    h.get('content-security-policy') === csp &&
      h.get('x-content-type-options') === 'nosniff' &&
      h.get('x-frame-options') === 'DENY' &&
      h.get('referrer-policy') === 'strict-origin-when-cross-origin' &&
      h.get('permissions-policy')?.includes('camera=()') &&
      h.get('cross-origin-opener-policy') === 'same-origin',
    { status: res.status },
  );
}

const notFound = await get('/this/does/not/exist');
const notFoundHtml = await notFound.text();
check(
  'unknown URL answers 404 (not a soft 200) and serves the prerendered 404 page',
  notFound.status === 404 && notFoundHtml.includes('>404<'),
  notFound.status,
);
check(
  'trailing slash is redirected: /pt/ -> /pt (no duplicate URL)',
  (await get('/pt/')).headers.get('location') === '/pt',
);

const html = await (await get('/pt')).text();
const hashedJs = html.match(/src="(main-[A-Z0-9]+\.js)"/)?.[1];
const font = html.match(/href="(media\/[^"]+\.woff2)"/)?.[1];
const cc = async (p) => (await get('/' + p)).headers.get('cache-control');
check(
  'hashed JS/CSS/fonts are cached for a year, immutable',
  [hashedJs, font].every(Boolean) &&
    (await cc(hashedJs)) === 'public, max-age=31536000, immutable' &&
    (await cc(font)) === 'public, max-age=31536000, immutable',
);
check(
  'HTML pages are NOT given the long cache',
  (await get('/pt')).headers.get('cache-control') === null,
);

const redirectOf = async (headers) => {
  const r = await get('/', { headers });
  return r.status === 200 ? '200 chooser' : `${r.status} ${r.headers.get('location')}`;
};
check(
  '"/" with cookie lang=en -> 307 /en',
  (await redirectOf({ cookie: 'lang=en' })) === '307 /en',
);
check(
  '"/" with cookie lang=pt -> 307 /pt',
  (await redirectOf({ cookie: 'lang=pt' })) === '307 /pt',
);
check(
  '"/" with Accept-Language pt-BR and no cookie -> 307 /pt',
  (await redirectOf({ 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8' })) === '307 /pt',
);
check(
  'the cookie beats Accept-Language (cookie en + browser pt -> /en)',
  (await redirectOf({ cookie: 'lang=en', 'accept-language': 'pt-BR' })) === '307 /en',
);
check(
  '"/" with another language and no cookie -> the static chooser (client detects)',
  (await redirectOf({ 'accept-language': 'fr-FR,fr;q=0.9' })) === '200 chooser',
);

// ---------------------------------------------------------------------------------------
// 2. Browser-level checks under the CSP (Chrome over CDP)
// ---------------------------------------------------------------------------------------
const profile = mkdtempSync(join(tmpdir(), 'smoke-chrome-'));
const chromeArgs = [
  '--headless=new',
  '--disable-gpu',
  `--remote-debugging-port=${CDP_PORT}`,
  `--user-data-dir=${profile}`,
  '--window-size=1280,900',
  'about:blank',
];
if (process.env.CI) chromeArgs.unshift('--no-sandbox');
const chrome = spawn(findChrome(), chromeArgs, { stdio: 'ignore' });

async function shutdown(code) {
  try {
    chrome.kill();
  } catch {
    /* already gone */
  }
  server.close();
  framerServer.close();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* chrome may still hold files */
  }
  process.exit(code);
}

let targets;
for (let i = 0; i < 60; i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json`)).json();
    if (targets.some((t) => t.type === 'page')) break;
  } catch {
    /* chrome still starting */
  }
  await sleep(250);
}
if (!targets?.some((t) => t.type === 'page')) {
  console.error('Could not connect to Chrome over the DevTools Protocol.');
  await shutdown(1);
}

const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener('open', resolve));
let nextId = 0;
const pending = new Map();
const consoleProblems = [];
const logEntries = [];
const responses = new Map();
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
    return;
  }
  if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    consoleProblems.push(
      `console.${msg.params.type}: ${msg.params.args
        .map((a) => a.value ?? a.description)
        .join(' ')
        .slice(0, 200)}`,
    );
  }
  if (msg.method === 'Runtime.exceptionThrown')
    consoleProblems.push(
      `exception: ${msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text}`.slice(
        0,
        200,
      ),
    );
  if (msg.method === 'Log.entryAdded')
    logEntries.push(`${msg.params.entry.level}: ${msg.params.entry.text}`);
  if (msg.method === 'Network.responseReceived')
    responses.set(msg.params.response.url, msg.params.response.status);
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result.exceptionDetails)
    throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result.result.value;
};
const go = async (path) => {
  await send('Page.navigate', { url: base + path });
  await sleep(1800);
};

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Network.enable');
// Installed before any page script runs. (Scripts injected through CDP are exempt from the page's CSP.)
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push({ directive: e.effectiveDirective, blocked: e.blockedURI, sample: (e.sample || '').slice(0, 40) }));`,
});

// ---- the site works under the policy ----
await go('/pt');
await evaluate(`localStorage.clear()`);
await go('/pt');
const cspBaseline = await evaluate(`window.__csp`);
check(
  '/pt loads with ZERO CSP violations and a clean console',
  cspBaseline.length === 0 && consoleProblems.length === 0,
  { violations: cspBaseline, console: consoleProblems },
);

const page = await evaluate(
  `({ h1: document.querySelector('h1')?.textContent, fonts: [...document.fonts].filter(f => f.status === 'loaded').length, photo: (() => { const i = document.querySelector('img.photo'); return i.complete && i.naturalWidth > 0; })(), jsonLd: (() => { try { return JSON.parse(document.querySelector('script#person-jsonld').textContent)['@type']; } catch { return null; } })(), styled: getComputedStyle(document.body).fontFamily.includes('Inter') })`,
);
check(
  'under the CSP: content renders, both fonts and the photo load, JSON-LD parses, CSS applies',
  page.h1 === 'Mateus de Jesus Santos' &&
    page.fonts >= 2 &&
    page.photo &&
    page.jsonLd === 'Person' &&
    page.styled,
  page,
);

await evaluate(`document.querySelector('app-theme-toggle button').click()`);
const themed = await evaluate(
  `({ theme: document.documentElement.dataset.theme, stored: localStorage.getItem('theme') })`,
);
check(
  'under the CSP: the app is interactive (Angular hydrated: theme toggle works and persists)',
  ['light', 'dark'].includes(themed.theme) && themed.stored === themed.theme,
  themed,
);

await evaluate(`window.__same = 1; document.querySelector('app-language-switch a').click()`);
await sleep(900);
const lang = await evaluate(
  `({ path: location.pathname, same: window.__same, htmlLang: document.documentElement.lang, cookie: document.cookie, role: document.querySelector('.role')?.textContent })`,
);
check(
  'under the CSP: client-side language switch works (no reload) and sets the lang cookie',
  lang.path === '/en' &&
    lang.same === 1 &&
    lang.htmlLang === 'en' &&
    lang.cookie.includes('lang=en') &&
    lang.role.startsWith('Mid-Level'),
  lang,
);

await evaluate(
  `[...document.querySelectorAll('nav a')].find(a => a.getAttribute('href') === '/en#contact').click()`,
);
await sleep(1500);
check(
  'under the CSP: anchor navigation and scroll reveal work',
  (await evaluate(`document.querySelectorAll('#contact [data-reveal]').length`)) === 0 &&
    (await evaluate(
      `Math.round(document.querySelector('#contact-heading').getBoundingClientRect().top)`,
    )) < 900,
);
check(
  'still no CSP violations or console errors after using the whole app',
  (await evaluate(`window.__csp.length`)) === 0 && consoleProblems.length === 0,
  consoleProblems,
);

// ---- the policy actually blocks attacks ----
// Each attack is tried from page context. Under `require-trusted-types-for 'script'` the browser
// refuses the dangerous assignments themselves (a TypeError) BEFORE the CSP is consulted, so
// "rejected" (threw) and "blocked" (ran but was denied) are both a successful defence.
const before = await evaluate(`window.__csp.length`);
const attacks = await evaluate(`(async () => {
  const out = {};
  const attempt = (fn) => { try { fn(); return 'ran'; } catch { return 'rejected'; } };

  // 1. inline <script> text
  const inline = document.createElement('script');
  out.inlineAssign = attempt(() => { inline.textContent = 'window.__pwn_inline = 1'; });
  document.body.appendChild(inline);
  out.inlineExecuted = window.__pwn_inline !== undefined;

  // 2. inline event-handler attribute
  const button = document.createElement('button');
  out.handlerAssign = attempt(() => button.setAttribute('onclick', 'window.__pwn_handler = 1'));
  document.body.appendChild(button); button.click();
  out.handlerExecuted = window.__pwn_handler !== undefined;

  // 3. script from another origin
  const external = document.createElement('script');
  out.externalAssign = attempt(() => { external.src = 'https://example.com/evil.js'; });
  document.body.appendChild(external);

  // 4. tracking pixel / data exfiltration through an image
  const pixel = document.createElement('img');
  pixel.src = 'https://example.com/pixel.png';
  document.body.appendChild(pixel);

  await new Promise((r) => setTimeout(r, 600));
  return out;
})()`);
const violations = await evaluate(`window.__csp.slice(${before}).map(v => v.directive)`);
check('attack: an injected INLINE script never runs', !attacks.inlineExecuted, attacks);
check('attack: an inline onclick= handler never runs', !attacks.handlerExecuted, attacks);
check(
  'defence in depth: Trusted Types rejects plain strings for script text, onclick= and script.src',
  attacks.inlineAssign === 'rejected' &&
    attacks.handlerAssign === 'rejected' &&
    attacks.externalAssign === 'rejected',
  attacks,
);
check(
  'attack: a tracking pixel to another origin is blocked by img-src',
  violations.includes('img-src'),
  violations,
);

// eval must be tried by a script the policy allows ('self'): code run through DevTools is exempt.
await go('/__eval-test');
const evalResult = await evaluate(`window.__evalResult`);
check(
  'attack: eval() from an allowed same-origin script is blocked (no unsafe-eval)',
  evalResult === 'blocked',
  evalResult,
);
const htmlResult = await evaluate(`window.__htmlResult`);
check(
  'attack: innerHTML with a plain string is rejected by Trusted Types (DOM-XSS sink)',
  htmlResult === 'blocked',
  htmlResult,
);

// ---- framing (clickjacking) ----
// A page on ANOTHER origin (same site, other port) frames the site and a header-less control page.
await send('Page.navigate', { url: `http://localhost:${HTTP_PORT + 1}/__frames` });
await sleep(2000);
const tree = await send('Page.getFrameTree');
const frames = (tree.result.frameTree.childFrames ?? []).map((f) => f.frame.url);
const siteFrame =
  frames.find((u) => u.startsWith('chrome-error')) ?? frames.find((u) => u.endsWith('/pt'));
check(
  'clickjacking: another origin CANNOT frame the site (frame-ancestors / X-Frame-Options)',
  frames.some((u) => u.startsWith('chrome-error')) && !frames.some((u) => u.endsWith('/pt')),
  frames,
);
check(
  'clickjacking control: a header-less page on the same host CAN be framed (so the test discriminates)',
  frames.some((u) => u.endsWith('/__plain')),
  frames,
);

// ---- the real 404 ----
responses.clear();
consoleProblems.length = 0;
await go('/does-not-exist');
const nf = await evaluate(
  `({ h1: document.querySelector('h1')?.textContent, robots: document.querySelector('meta[name=robots]')?.content, csp: window.__csp.length })`,
);
check(
  'unknown URL in the browser: HTTP 404 + the 404 page, noindex, no CSP violation',
  responses.get(`${base}/does-not-exist`) === 404 &&
    nf.h1 === '404' &&
    nf.robots === 'noindex' &&
    nf.csp === 0 &&
    consoleProblems.length === 0,
  { status: responses.get(`${base}/does-not-exist`), ...nf, console: consoleProblems },
);

const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
await shutdown(failed ? 1 : 0);
