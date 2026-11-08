import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { CONTENT } from '../../content';
import { SeoService } from '../seo/seo.service';
import { FALLBACK_LOCALE, LOCALE_INFO, type Locale } from './locales';

/**
 * Holds the active language. The route (`/:lang`) is the source of truth:
 * the resolver in `locale.route.ts` calls `setLocale` before the page renders,
 * both in the browser and during prerender, so the static HTML already has the
 * right text, `<html lang>`, title and hreflang tags.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly seo = inject(SeoService);
  private readonly current = signal<Locale>(FALLBACK_LOCALE);

  readonly locale = this.current.asReadonly();
  readonly content = computed(() => CONTENT[this.current()]);
  readonly info = computed(() => LOCALE_INFO[this.current()]);

  setLocale(locale: Locale): void {
    this.current.set(locale);
    this.document.documentElement.setAttribute('lang', LOCALE_INFO[locale].htmlLang);
    this.seo.update(locale, CONTENT[locale].meta);
  }
}
