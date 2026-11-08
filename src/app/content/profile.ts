import type { Locale } from '../core/i18n/locales';

/**
 * Language-independent facts. Nothing here is translated.
 * Never add a phone number, address or any other private data (CLAUDE.md).
 */
export const PROFILE = {
  name: 'Mateus de Jesus Santos',
  email: 'js.mateussantos05@gmail.com',
  linkedinUrl: 'https://linkedin.com/in/js-mateussantos/',
  githubUrl: 'https://github.com/mattyonder',
  repositoryUrl: 'https://github.com/mattyonder/ng-portifolio',
  /**
   * Public origin, used for canonical and hreflang URLs.
   * TODO(stage 7): confirm after the first Vercel deploy. This is only the
   * expected default `*.vercel.app` address; replace it with the real one
   * (or the custom domain, if one is bought).
   */
  siteUrl: 'https://ng-portifolio.vercel.app',
  photo: { src: 'photo_me.jpg', width: 400, height: 400 },
  /** Public profiles, in display order. `id` doubles as the icon name. */
  profiles: [
    {
      id: 'github',
      label: 'GitHub',
      url: 'https://github.com/mattyonder',
      display: 'github.com/mattyonder',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/js-mateussantos/',
      display: 'linkedin.com/in/js-mateussantos',
    },
  ],
} as const;

/**
 * Technologies used in the systems listed under Projects. Language-independent,
 * so it lives here and both content files reference it (they cannot diverge).
 * Confirmed by the owner: all four systems share this stack; only SISPEC also
 * uses Jest.
 */
export const WORKED_STACK = [
  'Angular',
  'RxJS',
  'Nx',
  'Java',
  'Spring Boot',
  'PostgreSQL',
  'Tailwind CSS',
] as const;

export const SISPEC_STACK = [...WORKED_STACK, 'Jest'] as const;

/** One résumé PDF per language (files live in `public/`). */
export const RESUME_PATH: Readonly<Record<Locale, string>> = {
  pt: '/curriculo_mateus_de_jesus_santos_pt_br.pdf',
  en: '/curriculo_mateus_de_jesus_santos_en.pdf',
};
