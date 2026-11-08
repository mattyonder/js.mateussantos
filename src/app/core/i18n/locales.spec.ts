import { FALLBACK_LOCALE, LOCALES, LOCALE_INFO, isLocale, matchLocale } from './locales';

describe('locales', () => {
  describe('isLocale', () => {
    it('accepts only supported codes', () => {
      expect(isLocale('pt')).toBe(true);
      expect(isLocale('en')).toBe(true);
      expect(isLocale('pt-BR')).toBe(false);
      expect(isLocale('fr')).toBe(false);
      expect(isLocale('')).toBe(false);
      expect(isLocale(null)).toBe(false);
      expect(isLocale(undefined)).toBe(false);
      expect(isLocale(42)).toBe(false);
    });
  });

  describe('matchLocale', () => {
    it('matches regional variants by primary subtag', () => {
      expect(matchLocale(['pt-BR'])).toBe('pt');
      expect(matchLocale(['pt-PT'])).toBe('pt');
      expect(matchLocale(['en-US'])).toBe('en');
      expect(matchLocale(['EN-gb'])).toBe('en');
    });

    it('honours the order of the preference list', () => {
      expect(matchLocale(['fr-FR', 'pt-BR', 'en'])).toBe('pt');
      expect(matchLocale(['en-US', 'pt-BR'])).toBe('en');
    });

    it('falls back to English when nothing is supported or the list is empty', () => {
      expect(matchLocale(['fr', 'de-DE', 'es'])).toBe(FALLBACK_LOCALE);
      expect(matchLocale([])).toBe(FALLBACK_LOCALE);
      expect(FALLBACK_LOCALE).toBe('en');
    });
  });

  describe('LOCALE_INFO', () => {
    it('describes every locale with a matching code', () => {
      for (const code of LOCALES) {
        expect(LOCALE_INFO[code].code).toBe(code);
      }
    });

    it('uses pt-BR for the Portuguese html lang and hreflang', () => {
      expect(LOCALE_INFO.pt.htmlLang).toBe('pt-BR');
      expect(LOCALE_INFO.pt.hreflang).toBe('pt-BR');
      expect(LOCALE_INFO.en.htmlLang).toBe('en');
    });
  });
});
