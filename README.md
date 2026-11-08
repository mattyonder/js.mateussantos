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

| Command                | What it does                                               |
| ---------------------- | ---------------------------------------------------------- |
| `npm ci`               | Install exact dependencies from the lockfile               |
| `npm start`            | Dev server at <http://localhost:4200>                      |
| `npm run build`        | Production build + prerender into `dist/portfolio/browser` |
| `npm run lint`         | ESLint (TypeScript and templates)                          |
| `npm test`             | Unit tests in watch mode                                   |
| `npm run test:ci`      | Unit tests, single run                                     |
| `npm run format`       | Format everything with Prettier                            |
| `npm run format:check` | Check formatting without writing                           |
| `npm run audit`        | `npm audit` for high severity and above                    |

## Project structure

```
src/app/
  core/       language, theme and SEO services
  content/    typed content files per language (single source of all visible text)
  ui/         reusable base components
  sections/   page sections (hero, about, experience, ...)
  layout/     header, footer, skip link
```

## Status

- [x] Stage 1: scaffold and tooling
- [ ] Stage 2: design system
- [ ] Stage 3: i18n
- [ ] Stage 4: sections and content
- [ ] Stage 5: animations
- [ ] Stage 6: accessibility, SEO and performance
- [ ] Stage 7: security, CI and deploy
- [ ] Stage 8: final review

## License

MIT, see [LICENSE](LICENSE).
