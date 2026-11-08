import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PROFILE } from '../../content/profile';
import type { PageMeta } from '../../content/types';
import { FALLBACK_LOCALE, LOCALES, LOCALE_INFO, type Locale } from '../i18n/locales';
import { assetUrl, buildPersonJsonLd, pageUrl, serializeJsonLd } from './person-jsonld';

export { pageUrl } from './person-jsonld';

const JSON_LD_ID = 'person-jsonld';

/**
 * Keeps the head tags that depend on the language in sync: title, description,
 * canonical, `hreflang` alternates (including `x-default`), Open Graph, Twitter
 * Card and the schema.org `Person` JSON-LD. It runs during prerender, so all of
 * it ends up in the static HTML that crawlers and link-preview bots read.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(locale: Locale, page: PageMeta): void {
    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    // A previous 404/root may have set noindex; a real page must be indexable.
    this.meta.removeTag('name="robots"');

    this.setLink('canonical', pageUrl(locale));
    for (const code of LOCALES) {
      this.setLink('alternate', pageUrl(code), LOCALE_INFO[code].hreflang);
    }
    this.setLink('alternate', pageUrl(FALLBACK_LOCALE), 'x-default');

    this.setSocialTags(locale, page);
    this.setJsonLd(locale);
  }

  /** For pages that must stay out of search results (404, language chooser). */
  markNoIndex(options: { follow?: boolean } = {}): void {
    this.meta.updateTag({
      name: 'robots',
      content: options.follow ? 'noindex, follow' : 'noindex',
    });
  }

  private setSocialTags(locale: Locale, page: PageMeta): void {
    const image = assetUrl(PROFILE.shareImage.src);
    const other = LOCALES.find((code) => code !== locale);

    const tags: Record<string, string> = {
      'og:type': 'website',
      'og:site_name': PROFILE.name,
      'og:title': page.title,
      'og:description': page.description,
      'og:url': pageUrl(locale),
      'og:locale': LOCALE_INFO[locale].ogLocale,
      'og:image': image,
      'og:image:width': String(PROFILE.shareImage.width),
      'og:image:height': String(PROFILE.shareImage.height),
      'og:image:alt': page.imageAlt,
    };
    if (other) {
      tags['og:locale:alternate'] = LOCALE_INFO[other].ogLocale;
    }
    for (const [property, content] of Object.entries(tags)) {
      this.meta.updateTag({ property, content });
    }

    const twitter: Record<string, string> = {
      'twitter:card': 'summary_large_image',
      'twitter:title': page.title,
      'twitter:description': page.description,
      'twitter:image': image,
      'twitter:image:alt': page.imageAlt,
    };
    for (const [name, content] of Object.entries(twitter)) {
      this.meta.updateTag({ name, content });
    }
  }

  private setJsonLd(locale: Locale): void {
    const head = this.document.head;
    let script = head.querySelector<HTMLScriptElement>(`script#${JSON_LD_ID}`);
    if (!script) {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', JSON_LD_ID);
      head.appendChild(script);
    }
    script.textContent = serializeJsonLd(buildPersonJsonLd(locale));
  }

  private setLink(rel: 'canonical' | 'alternate', href: string, hreflang?: string): void {
    const head = this.document.head;
    const selector =
      hreflang === undefined ? `link[rel="${rel}"]` : `link[rel="${rel}"][hreflang="${hreflang}"]`;

    let link = head.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      if (hreflang !== undefined) {
        link.setAttribute('hreflang', hreflang);
      }
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
