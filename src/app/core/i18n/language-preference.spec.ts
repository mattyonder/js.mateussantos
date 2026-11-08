import { TestBed } from '@angular/core/testing';
import { LANGUAGE_STORAGE_KEY, LanguagePreference } from './language-preference';

describe('LanguagePreference', () => {
  function create(): LanguagePreference {
    return TestBed.inject(LanguagePreference);
  }

  function browserLanguages(languages: string[]): void {
    vi.spyOn(Navigator.prototype, 'languages', 'get').mockReturnValue(languages);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('reads back a stored choice', () => {
    const preference = create();
    preference.write('pt');
    expect(preference.read()).toBe('pt');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('pt');
  });

  it('ignores an invalid stored value', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'klingon');
    expect(create().read()).toBeNull();
  });

  it('survives storage that throws on read and on write', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const preference = create();
    expect(() => preference.write('en')).not.toThrow();
    expect(preference.read()).toBeNull();
  });

  describe('detect', () => {
    it('prefers the stored choice over the browser language', () => {
      browserLanguages(['pt-BR']);
      const preference = create();
      preference.write('en');
      expect(preference.detect()).toBe('en');
    });

    it('uses the browser language when nothing is stored', () => {
      browserLanguages(['pt-BR', 'en']);
      expect(create().detect()).toBe('pt');
    });

    it('falls back to English for unsupported browser languages', () => {
      browserLanguages(['fr-FR', 'de']);
      expect(create().detect()).toBe('en');
    });
  });
});
