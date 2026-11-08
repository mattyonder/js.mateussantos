import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

type ChangeListener = (event: { matches: boolean }) => void;

/** jsdom has no matchMedia: install a controllable stub. */
function stubMatchMedia(prefersDark: boolean) {
  const listeners: ChangeListener[] = [];
  const mediaQueryList = {
    matches: prefersDark,
    addEventListener: (_type: string, listener: ChangeListener) => listeners.push(listener),
  };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockReturnValue(mediaQueryList),
  });
  return { emit: (matches: boolean) => listeners.forEach((listener) => listener({ matches })) };
}

describe('ThemeService', () => {
  const root = document.documentElement;

  function create(): ThemeService {
    return TestBed.inject(ThemeService);
  }

  beforeEach(() => {
    root.removeAttribute('data-theme');
    localStorage.clear();
    Reflect.deleteProperty(window, 'matchMedia');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    root.removeAttribute('data-theme');
    localStorage.clear();
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('defaults to light when there is no attribute, storage or OS preference', () => {
    expect(create().theme()).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('adopts the theme already set by the inline script', () => {
    root.setAttribute('data-theme', 'dark');
    expect(create().theme()).toBe('dark');
  });

  it('falls back to the stored choice when the attribute is missing', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(create().theme()).toBe('dark');
  });

  it('falls back to the OS preference when nothing is stored', () => {
    stubMatchMedia(true);
    expect(create().theme()).toBe('dark');
  });

  it('ignores an invalid stored value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(create().theme()).toBe('light');
  });

  it('toggle flips the theme, updates the attribute and persists the choice', () => {
    const service = create();

    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    service.toggle();
    expect(service.theme()).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('still switches when storage throws (private mode / blocked site data)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage denied');
    });
    const service = create();

    expect(() => service.toggle()).not.toThrow();
    expect(service.theme()).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('survives storage that throws on read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage denied');
    });
    expect(create().theme()).toBe('light');
  });

  it('follows OS changes until the user makes an explicit choice', () => {
    const media = stubMatchMedia(false);
    const service = create();
    expect(service.theme()).toBe('light');

    media.emit(true);
    expect(service.theme()).toBe('dark');

    service.set('light'); // explicit choice
    media.emit(true);
    expect(service.theme()).toBe('light');
  });
});
