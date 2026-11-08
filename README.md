# ng-portifolio

Bilingual (PT-BR / EN) professional portfolio of Mateus de Jesus Santos, a Full Stack developer focused on Angular. Static site (prerendered), hosted on Vercel.

> Work in progress. This repository is built in stages; see the status below.

## Stack

- Angular 22 (standalone components, zoneless, signals) with static prerendering (`outputMode: "static"`)
- TypeScript 6 (strict), SCSS with design tokens
- Vitest (Angular CLI default runner) for unit tests
- ESLint (`angular-eslint`, including template accessibility rules) and Prettier

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

## Status

- [x] Stage 1: scaffold and tooling
- [x] Stage 2: design system
- [x] Stage 3: i18n
- [x] Stage 4: sections and content
- [x] Stage 5: animations
- [x] Stage 6: accessibility, SEO and performance
- [x] Stage 7: security, CI and deploy
- [ ] Stage 8: final review

## License

MIT, see [LICENSE](LICENSE).
