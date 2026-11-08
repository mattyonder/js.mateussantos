import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import type { PageMeta } from '../../content/types';
import { PROFILE } from '../../content/profile';
import { FALLBACK_LOCALE, LOCALES, LOCALE_INFO, type Locale } from '../i18n/locales';

/** Absolute URL of a language's page. No trailing slash (matches the Vercel config in stage 7). */
export function pageUrl(locale: Locale): string {
  return `${PROFILE.siteUrl}/${locale}`;
}

/**
 * Keeps the head tags that depend on the language in sync: title, description,
 * canonical and the `hreflang` alternates (including `x-default`). It runs
 * during prerender, so these end up in the static HTML crawlers read.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(locale: Locale, page: PageMeta): void {
    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    // A previous 404 may have set noindex; a real page must be indexable.
    this.meta.removeTag('name="robots"');

    this.setLink('canonical', pageUrl(locale));
    for (const code of LOCALES) {
      this.setLink('alternate', pageUrl(code), LOCALE_INFO[code].hreflang);
    }
    this.setLink('alternate', pageUrl(FALLBACK_LOCALE), 'x-default');
  }

  /** For error pages: keep them out of search results. */
  markNoIndex(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
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
