import { CONTENT } from '../../content';
import { PROFILE } from '../../content/profile';
import type { Locale } from '../i18n/locales';

/** Absolute URL of a file in `public/`. */
export function assetUrl(path: string): string {
  return `${PROFILE.siteUrl}/${path}`;
}

/** Absolute URL of a language's page. No trailing slash (matches the Vercel config in stage 7). */
export function pageUrl(locale: Locale): string {
  return `${PROFILE.siteUrl}/${locale}`;
}

/**
 * schema.org `Person` for the page, built only from data the site already shows
 * (name, role, public profiles, skills, schools, state). By design it has NO
 * e-mail, phone, street address or employer: structured data is for search
 * engines and must not publish more than the visible page does.
 */
export function buildPersonJsonLd(locale: Locale): Record<string, unknown> {
  const content = CONTENT[locale];
  const technical = content.skills.groups.find((group) => group.id === 'technical');

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PROFILE.name,
    jobTitle: content.hero.role,
    description: content.meta.description,
    url: pageUrl(locale),
    image: assetUrl(PROFILE.photo.src),
    sameAs: PROFILE.profiles.map((profile) => profile.url),
    knowsAbout: technical ? [...technical.items] : [],
    alumniOf: content.education.degrees.map((degree) => ({
      '@type': 'EducationalOrganization',
      name: degree.institution,
    })),
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Sergipe',
      addressCountry: 'BR',
    },
  };
}

/**
 * JSON for an inline `<script type="application/ld+json">`. `<` is escaped so no
 * content could ever close the script element early (`</script>`).
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
