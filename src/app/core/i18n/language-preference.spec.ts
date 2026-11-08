import { TestBed } from '@angular/core/testing';
import { LANGUAGE_STORAGE_KEY, LanguagePreference } from './language-preference';

describe('LanguagePreference', () => {
  function create(): LanguagePreference {
    return TestBed.inject(LanguagePreference);
  }

  function browserLanguages(languages: string[]): void {
    vi.spyOn(Navigator.prototype, 'languages', 'get').mockReturnValue(languages);
  }

  const clearCookie = () => {
    document.cookie = `${LANGUAGE_STORAGE_KEY}=; Path=/; Max-Age=0`;
  };

  beforeEach(() => {
    localStorage.clear();
    clearCookie();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    clearCookie();
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

  it('with localStorage blocked, the choice still survives through the cookie', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const preference = create();
    expect(() => preference.write('en')).not.toThrow();
    expect(preference.read()).toBe('en');
  });

  it('with BOTH localStorage and cookies blocked it degrades to "no stored choice"', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get() {
        throw new Error('cookies blocked');
      },
      set() {
        throw new Error('cookies blocked');
      },
    });
    try {
      const preference = create();
      expect(() => preference.write('en')).not.toThrow();
      expect(preference.read()).toBeNull();
    } finally {
      Reflect.deleteProperty(document, 'cookie'); // back to the real jsdom cookie jar
    }
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
  describe('cookie (read by the host to redirect "/" before any JavaScript runs)', () => {
    it('write() also sets a lang cookie with the locale', () => {
      create().write('en');
      expect(document.cookie).toContain('lang=en');
    });

    it('sets a one-year, path-wide cookie (attributes)', () => {
      const setter = vi.spyOn(document, 'cookie', 'set');
      create().write('pt');
      const value = setter.mock.calls[0][0] as string;
      expect(value).toMatch(/^lang=pt; /);
      expect(value).toContain('Path=/');
      expect(value).toContain('Max-Age=31536000');
      expect(value).toContain('SameSite=Lax');
      // jsdom runs on http: Secure must NOT be set there, or localhost would lose the cookie.
      expect(value).not.toContain('Secure');
    });

    it('read() falls back to the cookie when storage is empty', () => {
      document.cookie = 'lang=pt; Path=/';
      expect(create().read()).toBe('pt');
    });

    it('prefers localStorage over the cookie when both exist', () => {
      document.cookie = 'lang=pt; Path=/';
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
      expect(create().read()).toBe('en');
    });

    it('ignores an invalid cookie value', () => {
      document.cookie = 'lang=klingon; Path=/';
      expect(create().read()).toBeNull();
    });

    it('survives a cookie jar that throws, keeping localStorage as the source of truth', () => {
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        get() {
          throw new Error('cookies blocked');
        },
        set() {
          throw new Error('cookies blocked');
        },
      });
      try {
        const preference = create();
        expect(() => preference.write('en')).not.toThrow();
        expect(preference.read()).toBe('en');
      } finally {
        Reflect.deleteProperty(document, 'cookie');
      }
    });
  });
});
