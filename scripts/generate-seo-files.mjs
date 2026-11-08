// Generates public/sitemap.xml and public/robots.txt from the SAME data the app uses
// (PROFILE.siteUrl and the locale list), so changing the domain is a one-line edit
// in src/app/content/profile.ts. Runs before `ng build` (see the "build" npm script).
//
// It imports the TypeScript sources directly: Node >= 22.18 strips types natively.
// That works because both modules only use erasable syntax and `import type`.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LOCALES, LOCALE_INFO, FALLBACK_LOCALE } from '../src/app/core/i18n/locales.ts';
import { PROFILE } from '../src/app/content/profile.ts';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const site = PROFILE.siteUrl.replace(/\/$/, '');
const url = (locale) => `${site}/${locale}`;

const alternates = [
  ...LOCALES.map((code) => ({ hreflang: LOCALE_INFO[code].hreflang, href: url(code) })),
  { hreflang: 'x-default', href: url(FALLBACK_LOCALE) },
];

const entries = LOCALES.map(
  (code) =>
    `  <url>\n    <loc>${url(code)}</loc>\n` +
    alternates
      .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
      .join('\n') +
    '\n  </url>',
);

const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  entries.join('\n') +
  '\n</urlset>\n';

// "/" (language chooser) and "/404" are not listed on purpose; both are noindex.
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`;

writeFileSync(`${publicDir}sitemap.xml`, sitemap);
writeFileSync(`${publicDir}robots.txt`, robots);
console.log(`SEO files written for ${site} (${LOCALES.join(', ')})`);
