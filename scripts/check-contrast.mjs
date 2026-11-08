// Verifies WCAG 2.2 AA contrast for the design tokens in both themes.
//
// It compiles src/styles/_tokens.scss with Sass, resolves var() chains, and
// computes the contrast ratio of each declared foreground/background pair:
//   - 4.5:1 for text (SC 1.4.3)
//   - 3:1 for UI component boundaries and focus indicators (SC 1.4.11)
// Exits with code 1 if any pair fails, so it can gate CI.
//
// Usage: npm run check:contrast

import * as sass from 'sass';
import { fileURLToPath } from 'node:url';

const TOKENS = fileURLToPath(new URL('../src/styles/_tokens.scss', import.meta.url));

const TEXT = 4.5;
const UI = 3;

/** Background of the hero at the glow's strongest point: --hero-glow of --color-primary over --color-bg. */
const HERO_GLOW = { glow: true };

/** [foreground token, background token, minimum ratio, what it protects] */
const PAIRS = [
  ['--color-text', '--color-bg', TEXT, 'body text on page'],
  ['--color-text', '--color-surface', TEXT, 'body text on card'],
  ['--color-text', '--color-surface-raised', TEXT, 'body text on raised surface'],
  ['--color-text', '--color-bg-subtle', TEXT, 'body text on subtle background'],
  ['--color-text-muted', '--color-bg', TEXT, 'muted text on page'],
  ['--color-text-muted', '--color-surface', TEXT, 'muted text on card'],
  ['--color-text-muted', '--color-surface-raised', TEXT, 'muted text on raised surface'],
  ['--color-text-muted', '--color-bg-subtle', TEXT, 'muted text on subtle background'],
  ['--color-link', '--color-bg', TEXT, 'link on page'],
  ['--color-link', '--color-surface', TEXT, 'link on card'],
  ['--color-link', '--color-bg-subtle', TEXT, 'link on subtle background'],
  ['--color-link-hover', '--color-bg', TEXT, 'link hover on page'],
  ['--color-link-hover', '--color-surface', TEXT, 'link hover on card'],
  // Featured experience card, Contact call-to-action card and the active menu link all sit on
  // gradients that START at --color-primary-subtle (their most coloured point): the worst case.
  ['--color-text', '--color-primary-subtle', TEXT, 'text on featured/CTA cards'],
  [
    '--color-text-muted',
    '--color-primary-subtle',
    TEXT,
    'muted text (dates) on featured/CTA cards',
  ],
  [
    '--color-link',
    '--color-primary-subtle',
    TEXT,
    'company name / active menu link on featured/CTA cards',
  ],
  ['--color-link', '--color-primary-subtle', TEXT, 'ghost/secondary button hover'],
  ['--color-link-hover', '--color-primary-subtle', TEXT, 'ghost/secondary hover text'],
  ['--color-text-on-primary', '--color-primary', TEXT, 'primary button label'],
  ['--color-text-on-primary', '--color-primary-hover', TEXT, 'primary button label (hover)'],
  ['--color-text-on-primary', '--color-primary-active', TEXT, 'primary button label (active)'],
  ['--color-tag-text', '--color-tag-bg', TEXT, 'tag'],
  ['--color-tag-neutral-text', '--color-tag-neutral-bg', TEXT, 'neutral tag'],
  ['--color-success', '--color-success-bg', TEXT, 'success state'],
  ['--color-warning', '--color-warning-bg', TEXT, 'warning state'],
  ['--color-danger', '--color-danger-bg', TEXT, 'danger state'],
  // Hero text sits on a radial glow, which automated tools cannot evaluate: check the peak.
  ['--color-text', HERO_GLOW, TEXT, 'hero title on the glow peak'],
  ['--color-text-muted', HERO_GLOW, TEXT, 'hero location/tagline on the glow peak'],
  ['--color-link', HERO_GLOW, TEXT, 'hero role + secondary button on the glow peak'],
  ['--color-link-hover', HERO_GLOW, TEXT, 'hero link hover on the glow peak'],
  ['--color-focus-ring', HERO_GLOW, UI, 'focus ring on the glow peak'],
  ['--color-focus-ring', '--color-bg', UI, 'focus ring on page'],
  ['--color-focus-ring', '--color-surface', UI, 'focus ring on card'],
  ['--color-focus-ring', '--color-surface-raised', UI, 'focus ring on raised surface'],
  ['--color-border-strong', '--color-bg', UI, 'control/placeholder border on page'],
  ['--color-border-strong', '--color-surface', UI, 'control/placeholder border on card'],
];

/** Parses `selector { --a: b; }` blocks out of compiled CSS into { selector: {var: value} }. */
function parseBlocks(css) {
  const blocks = {};
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim().replace(/\s+/g, ' ');
    blocks[selector] ??= {};
    for (const decl of match[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      blocks[selector][decl[1]] = decl[2].trim();
    }
  }
  return blocks;
}

function resolve(name, vars, seen = new Set()) {
  if (seen.has(name)) throw new Error(`Circular token reference: ${name}`);
  const raw = vars[name];
  if (raw === undefined) throw new Error(`Token not found: ${name}`);
  const ref = raw.match(/^var\((--[\w-]+)\)$/);
  if (ref) return resolve(ref[1], vars, new Set([...seen, name]));
  if (!/^#[0-9a-f]{6}$/i.test(raw)) {
    throw new Error(`Token ${name} is not a 6-digit hex colour: "${raw}"`);
  }
  return raw;
}

/** Alpha-composites `fg` at `percent`% over `bg` (what `color-mix(in srgb, fg P%, transparent)` over bg paints). */
function overlay(fg, bg, percent) {
  const a = percent / 100;
  const ch = (i) =>
    Math.round(parseInt(fg.slice(i, i + 2), 16) * a + parseInt(bg.slice(i, i + 2), 16) * (1 - a));
  return `#${[1, 3, 5].map((i) => ch(i).toString(16).padStart(2, '0')).join('')}`;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const css = sass.compile(TOKENS, { style: 'expanded' }).css;
const blocks = parseBlocks(css);

const light = blocks[':root'];
const dark = { ...light, ...blocks[':root[data-theme=dark]'] };
// The no-JS media-query fallback must define the same dark values.
const fallback = { ...light, ...blocks[':root:not([data-theme])'] };

if (!light || !blocks[':root[data-theme=dark]'] || !blocks[':root:not([data-theme])']) {
  console.error('Could not find the expected theme blocks in compiled tokens.');
  process.exit(1);
}

let failures = 0;
const themes = { light, dark, 'dark (no-JS fallback)': fallback };

for (const [themeName, vars] of Object.entries(themes)) {
  console.log(`\n== ${themeName} ==`);
  for (const [fgToken, bgToken, min, what] of PAIRS) {
    const fg = resolve(fgToken, vars);
    const bg =
      bgToken === HERO_GLOW
        ? overlay(
            resolve('--color-primary', vars),
            resolve('--color-bg', vars),
            parseFloat(vars['--hero-glow']),
          )
        : resolve(bgToken, vars);
    const value = ratio(fg, bg);
    const ok = value >= min;
    if (!ok) failures++;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${value.toFixed(2).padStart(5)}:1 (min ${min})  ${what}  [${fgToken} ${fg} on ${bgToken === HERO_GLOW ? 'hero glow peak' : bgToken} ${bg}]`,
    );
  }
}

console.log(failures === 0 ? '\nAll pairs pass.' : `\n${failures} pair(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
