import { TestBed } from '@angular/core/testing';
import { CONTENT } from '../../content';
import { PROFILE } from '../../content/profile';
import { LOCALES, type Locale } from '../i18n/locales';
import { buildPersonJsonLd, serializeJsonLd } from './person-jsonld';
import { SeoService } from './seo.service';

describe('SeoService: social tags and structured data', () => {
  const head = document.head;

  function meta(selector: string): string | null | undefined {
    return head.querySelector(`meta[${selector}]`)?.getAttribute('content');
  }

  function jsonLd(): Record<string, unknown> {
    const script = head.querySelector('script#person-jsonld');
    return JSON.parse(script?.textContent ?? 'null') as Record<string, unknown>;
  }

  function clean(): void {
    head
      .querySelectorAll(
        'meta[property^="og:"], meta[name^="twitter:"], meta[name="description"], meta[name="robots"], link[rel="canonical"], link[rel="alternate"], script#person-jsonld',
      )
      .forEach((el) => el.remove());
  }

  function update(locale: Locale): void {
    TestBed.inject(SeoService).update(locale, CONTENT[locale].meta);
  }

  beforeEach(clean);
  afterEach(clean);

  describe.each(LOCALES)('%s', (locale) => {
    const page = CONTENT[locale].meta;

    it('sets Open Graph title, description, url, type and site name', () => {
      update(locale);
      expect(meta('property="og:title"')).toBe(page.title);
      expect(meta('property="og:description"')).toBe(page.description);
      expect(meta('property="og:url"')).toBe(`${PROFILE.siteUrl}/${locale}`);
      expect(meta('property="og:type"')).toBe('website');
      expect(meta('property="og:site_name"')).toBe(PROFILE.name);
    });

    it('sets the Open Graph locale and the other language as alternate', () => {
      update(locale);
      expect(meta('property="og:locale"')).toBe(locale === 'pt' ? 'pt_BR' : 'en_US');
      expect(meta('property="og:locale:alternate"')).toBe(locale === 'pt' ? 'en_US' : 'pt_BR');
    });

    it('uses an ABSOLUTE share image with its size and alt text (previews need absolute URLs)', () => {
      update(locale);
      expect(meta('property="og:image"')).toBe(`${PROFILE.siteUrl}/${PROFILE.shareImage.src}`);
      expect(meta('property="og:image"')).toMatch(/^https:\/\//);
      expect(meta('property="og:image:width"')).toBe('1200');
      expect(meta('property="og:image:height"')).toBe('630');
      expect(meta('property="og:image:alt"')).toBe(page.imageAlt);
    });

    it('sets a large-image Twitter card mirroring the page text', () => {
      update(locale);
      expect(meta('name="twitter:card"')).toBe('summary_large_image');
      expect(meta('name="twitter:title"')).toBe(page.title);
      expect(meta('name="twitter:description"')).toBe(page.description);
      expect(meta('name="twitter:image"')).toBe(`${PROFILE.siteUrl}/${PROFILE.shareImage.src}`);
      expect(meta('name="twitter:image:alt"')).toBe(page.imageAlt);
    });

    it('emits a schema.org Person built from the visible content', () => {
      update(locale);
      const data = jsonLd();
      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe('Person');
      expect(data['name']).toBe(PROFILE.name);
      expect(data['jobTitle']).toBe(CONTENT[locale].hero.role);
      expect(data['url']).toBe(`${PROFILE.siteUrl}/${locale}`);
      expect(data['image']).toBe(`${PROFILE.siteUrl}/${PROFILE.photo.src}`);
      expect(data['sameAs']).toEqual(PROFILE.profiles.map((p) => p.url));
    });
  });

  it('JSON-LD has no e-mail, phone, street address or employer', () => {
    for (const locale of LOCALES) {
      update(locale);
      const text = JSON.stringify(jsonLd());
      expect(text).not.toMatch(/mail|phone|telephone|tel:|streetAddress|worksFor|MMS/i);
      expect(text).not.toContain(PROFILE.email);
      expect(text).not.toMatch(/\(?\d{2}\)?\s?9\s?\d{4}[-\s]?\d{4}/);
    }
  });

  it('JSON-LD lists the technical skills and the schools, nothing invented', () => {
    update('en');
    const data = jsonLd();
    const technical = CONTENT.en.skills.groups.find((g) => g.id === 'technical')?.items;
    expect(data['knowsAbout']).toEqual(technical);
    expect(data['alumniOf']).toEqual(
      CONTENT.en.education.degrees.map((d) => ({
        '@type': 'EducationalOrganization',
        name: d.institution,
      })),
    );
    expect(data['address']).toEqual({
      '@type': 'PostalAddress',
      addressRegion: 'Sergipe',
      addressCountry: 'BR',
    });
  });

  it('serialises JSON-LD safely: "<" is escaped so "</script>" can never appear', () => {
    const text = serializeJsonLd({ name: 'x </script><script>alert(1)</script>' });
    expect(text).not.toContain('<');
    expect(JSON.parse(text)).toEqual({ name: 'x </script><script>alert(1)</script>' });
  });

  it('buildPersonJsonLd is valid JSON for every locale', () => {
    for (const locale of LOCALES) {
      expect(() => JSON.parse(serializeJsonLd(buildPersonJsonLd(locale)))).not.toThrow();
    }
  });

  it('keeps ONE of each tag when the language changes repeatedly', () => {
    update('pt');
    update('en');
    update('pt');
    expect(head.querySelectorAll('script#person-jsonld').length).toBe(1);
    expect(head.querySelectorAll('meta[property="og:title"]').length).toBe(1);
    expect(head.querySelectorAll('meta[name="twitter:card"]').length).toBe(1);
    expect(meta('property="og:locale"')).toBe('pt_BR');
  });

  describe('noindex', () => {
    it('marks error pages noindex', () => {
      TestBed.inject(SeoService).markNoIndex();
      expect(meta('name="robots"')).toBe('noindex');
    });

    it('marks the language chooser noindex but followable', () => {
      TestBed.inject(SeoService).markNoIndex({ follow: true });
      expect(meta('name="robots"')).toBe('noindex, follow');
    });

    it('a real page removes any previous noindex', () => {
      TestBed.inject(SeoService).markNoIndex();
      update('pt');
      expect(head.querySelector('meta[name="robots"]')).toBeNull();
    });
  });
});
