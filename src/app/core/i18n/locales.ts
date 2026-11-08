export const LOCALES = ['pt', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Used when nothing else decides: unsupported browser language, and the
 * `x-default` hreflang target. English is the international fallback.
 */
export const FALLBACK_LOCALE: Locale = 'en';

export interface LocaleInfo {
  readonly code: Locale;
  /** Value for `<html lang>`. */
  readonly htmlLang: string;
  /** Value for `hreflang` attributes (BCP 47). */
  readonly hreflang: string;
  /** The language's own name (endonym). Deliberately NOT translated. */
  readonly name: string;
}

export const LOCALE_INFO: Readonly<Record<Locale, LocaleInfo>> = {
  pt: { code: 'pt', htmlLang: 'pt-BR', hreflang: 'pt-BR', name: 'Português' },
  en: { code: 'en', htmlLang: 'en', hreflang: 'en', name: 'English' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the first supported language from an ordered preference list
 * (e.g. `navigator.languages`). Regional variants match by primary subtag
 * ("pt-PT" -> pt). Falls back to FALLBACK_LOCALE.
 */
export function matchLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const primary = language.toLowerCase().split('-')[0];
    if (isLocale(primary)) {
      return primary;
    }
  }
  return FALLBACK_LOCALE;
}
