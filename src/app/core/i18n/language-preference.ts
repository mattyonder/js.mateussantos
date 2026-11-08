import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { isLocale, matchLocale, type Locale } from './locales';

/** Key used in localStorage AND as the cookie name (vercel.json reads the cookie `lang`). */
export const LANGUAGE_STORAGE_KEY = 'lang';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Remembers the visitor's explicit language choice and detects a first-visit
 * default from the browser. Only the `/` entry page uses `detect()`: a direct
 * link to `/pt` or `/en` is always honoured as written.
 *
 * The choice is kept in localStorage (primary) and in a small first-party cookie
 * (`lang=pt|en`). The cookie exists only so the host can redirect `/` to the right
 * language BEFORE any JavaScript runs: localStorage never reaches the server.
 * It holds no identifier and no tracking data, only the two-letter language.
 *
 * Storage and cookies can throw or be absent; failures are ignored on purpose.
 */
@Injectable({ providedIn: 'root' })
export class LanguagePreference {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;

  read(): Locale | null {
    return this.readStorage() ?? this.readCookie();
  }

  write(locale: Locale): void {
    try {
      this.window?.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch {
      // Ignore: the cookie below (and this visit) still carry the choice.
    }
    this.writeCookie(locale);
  }

  /** Stored choice first, then the browser's language list, then English. */
  detect(): Locale {
    const languages = this.window?.navigator.languages ?? [];
    return this.read() ?? matchLocale(languages);
  }

  private readStorage(): Locale | null {
    try {
      const value = this.window?.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return isLocale(value) ? value : null;
    } catch {
      return null;
    }
  }

  private readCookie(): Locale | null {
    try {
      const entry = this.document.cookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${LANGUAGE_STORAGE_KEY}=`));
      const value = entry?.slice(LANGUAGE_STORAGE_KEY.length + 1);
      return isLocale(value) ? value : null;
    } catch {
      return null;
    }
  }

  private writeCookie(locale: Locale): void {
    try {
      // `Secure` only over https (the deployed site); localhost over http must still work.
      const secure = this.window?.location.protocol === 'https:' ? '; Secure' : '';
      this.document.cookie =
        `${LANGUAGE_STORAGE_KEY}=${locale}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax` +
        secure;
    } catch {
      // Ignore: cookies blocked. The redirect then falls back to Accept-Language.
    }
  }
}
