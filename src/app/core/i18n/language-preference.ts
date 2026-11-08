import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { isLocale, matchLocale, type Locale } from './locales';

export const LANGUAGE_STORAGE_KEY = 'lang';

/**
 * Remembers the visitor's explicit language choice and detects a first-visit
 * default from the browser. Only the `/` entry page uses `detect()`: a direct
 * link to `/pt` or `/en` is always honoured as written.
 * Storage can throw or be absent; failures are ignored on purpose.
 */
@Injectable({ providedIn: 'root' })
export class LanguagePreference {
  private readonly window = inject(DOCUMENT).defaultView;

  read(): Locale | null {
    try {
      const value = this.window?.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return isLocale(value) ? value : null;
    } catch {
      return null;
    }
  }

  write(locale: Locale): void {
    try {
      this.window?.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch {
      // Ignore: the choice still applies to this visit.
    }
  }

  /** Stored choice first, then the browser's language list, then English. */
  detect(): Locale {
    const languages = this.window?.navigator.languages ?? [];
    return this.read() ?? matchLocale(languages);
  }
}
