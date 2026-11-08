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
 * Name of our Trusted Types policy. It must also be listed in the CSP `trusted-types`
 * directive (scripts/csp.mjs), or the browser refuses to create it.
 */
export const JSON_LD_POLICY_NAME = 'ng-portifolio-jsonld';

// Minimal Trusted Types typings (TypeScript's lib.dom does not ship them and a whole
// `@types/trusted-types` dependency is not worth three interfaces).
interface ScriptPolicy {
  createScript(input: string): unknown;
}
interface TrustedTypesFactory {
  createPolicy(name: string, rules: { createScript(input: string): string }): ScriptPolicy;
}
type WindowWithTrustedTypes = Window & { trustedTypes?: TrustedTypesFactory };

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
  private jsonLdPolicy: ScriptPolicy | null | undefined;

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
    const json = serializeJsonLd(buildPersonJsonLd(locale));
    // With `require-trusted-types-for 'script'` the browser rejects plain strings for a script's
    // text (a classic DOM-XSS sink); it needs a TrustedScript from an allowed policy.
    // Browsers without Trusted Types (and the prerender) just take the string.
    const policy = this.getJsonLdPolicy();
    script.textContent = (policy ? policy.createScript(json) : json) as string;
  }

  /**
   * The policy only lets through text that is valid JSON, so even a bug upstream could not
   * turn it into executable script text through this one allowed door.
   */
  private getJsonLdPolicy(): ScriptPolicy | null {
    if (this.jsonLdPolicy === undefined) {
      const factory = (this.document.defaultView as WindowWithTrustedTypes | null)?.trustedTypes;
      try {
        this.jsonLdPolicy =
          factory?.createPolicy(JSON_LD_POLICY_NAME, {
            createScript: (input: string) => {
              JSON.parse(input); // throws on anything that is not JSON
              return input;
            },
          }) ?? null;
      } catch {
        this.jsonLdPolicy = null; // policy name blocked or already taken: fall back to the string
      }
    }
    return this.jsonLdPolicy;
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
