import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { LANGUAGE_STORAGE_KEY } from '../../core/i18n/language-preference';
import type { Locale } from '../../core/i18n/locales';
import { LanguageSwitch } from './language-switch';

describe('LanguageSwitch', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      // Catch-all so the click handled by routerLink resolves instead of rejecting.
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
  });

  afterEach(() => localStorage.clear());

  function setup(current: Locale) {
    TestBed.inject(I18nService).setLocale(current);
    const fixture = TestBed.createComponent(LanguageSwitch);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a') as HTMLAnchorElement;
    return { fixture, link };
  }

  it('on the Portuguese page links to English, written in English', () => {
    const { link } = setup('pt');
    expect(link.textContent?.trim()).toBe('English');
    expect(link.getAttribute('href')).toBe('/en');
    expect(link.getAttribute('lang')).toBe('en');
    expect(link.getAttribute('hreflang')).toBe('en');
  });

  it('on the English page links to Portuguese, written in Portuguese (pt-BR)', () => {
    const { link } = setup('en');
    expect(link.textContent?.trim()).toBe('Português');
    expect(link.getAttribute('href')).toBe('/pt');
    expect(link.getAttribute('lang')).toBe('pt-BR');
    expect(link.getAttribute('hreflang')).toBe('pt-BR');
  });

  it('is a plain link with no fragment (so the scroll position is kept)', () => {
    const { link } = setup('pt');
    expect(link.getAttribute('href')).not.toContain('#');
  });

  it('remembers the chosen language when clicked', () => {
    const { link } = setup('pt');
    link.click();
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });
});
