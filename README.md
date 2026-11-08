# ng-portifolio

Bilingual (PT-BR / EN) professional portfolio of Mateus de Jesus Santos, a mid-level Full Stack developer focused on Angular. Static site (prerendered), hosted on Vercel.

**Live:** <https://jsmateussantos.vercel.app/pt> (Portuguese) and <https://jsmateussantos.vercel.app/en> (English).

The site is also a study lab: modern Angular, front-end security, DevOps and English. Everything on it comes from the owner's résumé; nothing is invented.

## What is on the page

Hero (name, role, key technologies, photo), a numbers strip, About, Experience, Projects (systems worked on; personal projects are "coming soon"), Skills, Education and languages, Contact and a footer. Light and dark themes (system preference, remembered, no flash), a language switch that keeps the reader on the same section, and a menu that marks the section being read.

## Stack

- Angular 22 (standalone components, zoneless, signals) with static prerendering (`outputMode: "static"`)
- TypeScript 6 (strict), SCSS with design tokens
- Vitest (Angular CLI default runner) for unit tests
- ESLint (`angular-eslint`, including template accessibility rules) and Prettier

## Design and quality notes

- **Design system:** purple palette as CSS tokens (`src/styles/_tokens.scss`); components use only the semantic tokens. Self-hosted fonts (Inter, Plus Jakarta Sans, DM Serif Display Italic for accent words), with metric-adjusted fallbacks so the font swap does not shift the layout.
- **Accessibility (WCAG 2.2 AA):** `npm run check:contrast` validates every token pair in both themes (including text over gradients). Full keyboard use, visible focus, skip link, one `h1` and ordered headings, reduced motion respected in CSS and JS. Checked with axe-core and a real Chrome (keyboard order, reflow at 200% and 400% zoom, text-spacing override).
- **Motion:** only `transform` and `opacity` (plus colour fades), nothing loops, and the hero never fades in (it holds the LCP).
- **SEO:** per-language title and description, canonical, `hreflang` (with `x-default` = `/en`), Open Graph, Twitter card, JSON-LD `Person` (no email, phone or employer), sitemap and robots generated from `PROFILE.siteUrl`.
- **Content rules:** the résumé is the source of truth (PT-BR PDF and EN PDF in `public/`). No phone number is shown on the site. Public health systems are mentioned only by name, role and stack, never screens, data or internal details. Tests in `src/app/content/content.spec.ts` enforce the parity of PT and EN and these rules.

## Requirements

- Node.js `^22.22.3`, `^24.15.0` or `>=26` (required by Angular 22, see <https://angular.dev/reference/versions>)
- npm

## Commands

| Command                  | What it does                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `npm ci`                 | Install exact dependencies from the lockfile                                                       |
| `npm start`              | Dev server at <http://localhost:4200>                                                              |
| `npm run build`          | Generates sitemap/robots, builds + prerenders into `dist/portfolio/browser`, injects font preloads |
| `npm run lint`           | ESLint (TypeScript and templates)                                                                  |
| `npm test`               | Unit tests in watch mode                                                                           |
| `npm run test:ci`        | Unit tests, single run                                                                             |
| `npm run format`         | Format everything with Prettier                                                                    |
| `npm run format:check`   | Check formatting without writing                                                                   |
| `npm run audit`          | `npm audit` for high severity and above                                                            |
| `npm run check:contrast` | WCAG 2.2 AA contrast check of every design-token pair, both themes                                 |

The design-system showcase is available at `/design-system` while running `npm start`. It is removed from production builds.

## Project structure

```
src/app/
  core/       language, theme and SEO services
  content/    typed content files per language (single source of all visible text)
  ui/         reusable base components
  sections/   page sections (hero, about, experience, ...)
  layout/     header, footer, skip link
  pages/      routed pages (home, root-redirect, not-found)
```

## Languages

The site is served at `/pt` (pt-BR) and `/en`, both prerendered. `/` redirects to the remembered language, then the browser language, then English. All visible text lives in `src/app/content/pt.ts` and `en.ts`; both implement the same `SiteContent` type, so a missing key fails the build.

## Testing and verification

| What                     | How                                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit and component tests | `npm run test:ci` (Vitest + jsdom): content parity, i18n, theme, SEO, every section and UI component                                                                                          |
| Real-browser smoke test  | `npm run smoke`: serves `dist/` under the headers of `vercel.json` and drives Chrome, including real attacks (inline script, `onclick`, `eval`, `innerHTML`, framing) that the CSP must block |
| Live deployment check    | `npm run verify:deploy [-- <url>]`: checks a real deploy (headers, CSP, SEO tags, caching, redirects, 404). Defaults to the production URL                                                    |

## Security and deployment

Hosted on Vercel as a static site. `vercel.json` sets the build (`npm ci`, `npm run build`, output
`dist/portfolio/browser`), the security headers, long caching for hashed assets, `/` to `/pt` or `/en`
redirects, and `trailingSlash: false`. `404.html` is generated at build time.

| Header                                                                       | What it does                                                                                                                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Content-Security-Policy`                                                    | Only same-origin resources load; inline scripts run only if their SHA-256 is listed (`npm run csp:update` refreshes the list); no `unsafe-eval`; no framing; no plugins. |
| `require-trusted-types-for 'script'` (inside the CSP)                        | Dangerous DOM sinks (`innerHTML`, script text, `script.src`, `onclick=`) reject plain strings, which blocks DOM-based XSS.                                               |
| `X-Content-Type-Options: nosniff`                                            | The browser must trust the declared file type, so an upload cannot be reinterpreted as a script.                                                                         |
| `X-Frame-Options: DENY`                                                      | Nobody can embed the site in a frame (clickjacking); old-browser twin of CSP `frame-ancestors`.                                                                          |
| `Referrer-Policy: strict-origin-when-cross-origin`                           | Other sites only learn the origin, never the path.                                                                                                                       |
| `Permissions-Policy`                                                         | Camera, microphone, geolocation, payment, USB and Topics are disabled; the site uses none.                                                                               |
| `Cross-Origin-Opener-Policy: same-origin`                                    | Isolates the page from windows opened by other origins (`window.opener`, Spectre-style leaks).                                                                           |
| `Strict-Transport-Security`                                                  | Sent by Vercel by default: HTTPS only.                                                                                                                                   |
| `Cache-Control: immutable` on `/main-*`, `/chunk-*`, `/styles-*`, `/media/*` | Files carry a content hash in the name, so browsers can keep them for a year.                                                                                            |

Deliberately NOT set: `X-XSS-Protection` (OWASP: omit or `0`), `Cross-Origin-Embedder-Policy` and
`Cross-Origin-Resource-Policy` (no benefit for a public site, and they can break link previews).
`style-src` allows `'unsafe-inline'` because Angular injects component styles at runtime and a static host
cannot issue per-request nonces (angular.dev/best-practices/security).

## CI

`.github/workflows/ci.yml` runs on every push to `main`, every pull request and weekly: formatting,
lint, contrast, unit tests, build, CSP hash check, the Chrome smoke test and `npm audit`. Actions are
pinned to commit SHAs; Dependabot (`.github/dependabot.yml`) keeps them and the npm packages current.

## Known limitations

- An unknown URL returns HTTP 200 with the language chooser instead of a 404 (a catch-all rewrite on the host; the page is `noindex`, so the impact is small). The prerendered `/404` page itself works.
- Lighthouse and axe numbers measured on a development machine are only indicative; re-measure on the live URL.
- Not tested on Safari, Firefox, real phones or with a screen reader.

## Status

- [x] Stage 1: scaffold and tooling
- [x] Stage 2: design system
- [x] Stage 3: i18n
- [x] Stage 4: sections and content
- [x] Stage 5: animations
- [x] Stage 6: accessibility, SEO and performance
- [x] Stage 7: security, CI and deploy
- [x] Stage 8: final review

## License

MIT, see [LICENSE](LICENSE).
