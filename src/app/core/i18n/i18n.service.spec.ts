import { TestBed } from '@angular/core/testing';
import { CONTENT } from '../../content';
import { PROFILE } from '../../content/profile';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  const head = document.head;

  function links(selector: string): HTMLLinkElement[] {
    return Array.from(head.querySelectorAll<HTMLLinkElement>(selector));
  }

  function cleanHead(): void {
    head
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"]')
      .forEach((el) => el.remove());
    head
      .querySelectorAll('meta[name="description"], meta[name="robots"]')
      .forEach((el) => el.remove());
    document.documentElement.removeAttribute('lang');
  }

  beforeEach(cleanHead);
  afterEach(cleanHead);

  it('exposes the content of the active locale', () => {
    const i18n = TestBed.inject(I18nService);

    i18n.setLocale('pt');
    expect(i18n.locale()).toBe('pt');
    expect(i18n.content()).toBe(CONTENT.pt);

    i18n.setLocale('en');
    expect(i18n.content()).toBe(CONTENT.en);
  });

  it('sets <html lang> to pt-BR and en', () => {
    const i18n = TestBed.inject(I18nService);

    i18n.setLocale('pt');
    expect(document.documentElement.getAttribute('lang')).toBe('pt-BR');

    i18n.setLocale('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('sets the title and meta description for the language', () => {
    const i18n = TestBed.inject(I18nService);

    i18n.setLocale('pt');
    expect(document.title).toBe(CONTENT.pt.meta.title);
    expect(head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      CONTENT.pt.meta.description,
    );

    i18n.setLocale('en');
    expect(document.title).toBe(CONTENT.en.meta.title);
  });

  it('points the canonical URL at the current language', () => {
    const i18n = TestBed.inject(I18nService);

    i18n.setLocale('pt');
    expect(links('link[rel="canonical"]').map((l) => l.href)).toEqual([`${PROFILE.siteUrl}/pt`]);

    i18n.setLocale('en');
    expect(links('link[rel="canonical"]').map((l) => l.href)).toEqual([`${PROFILE.siteUrl}/en`]);
  });

  it('emits hreflang alternates for both languages plus x-default (English)', () => {
    TestBed.inject(I18nService).setLocale('pt');

    const alternates = Object.fromEntries(
      links('link[rel="alternate"]').map((l) => [
        l.getAttribute('hreflang'),
        l.getAttribute('href'),
      ]),
    );
    expect(alternates).toEqual({
      'pt-BR': `${PROFILE.siteUrl}/pt`,
      en: `${PROFILE.siteUrl}/en`,
      'x-default': `${PROFILE.siteUrl}/en`,
    });
  });

  it('does not duplicate head tags when the language changes repeatedly', () => {
    const i18n = TestBed.inject(I18nService);
    i18n.setLocale('pt');
    i18n.setLocale('en');
    i18n.setLocale('pt');

    expect(links('link[rel="canonical"]').length).toBe(1);
    expect(links('link[rel="alternate"]').length).toBe(3);
    expect(head.querySelectorAll('meta[name="description"]').length).toBe(1);
  });

  it('never publishes a robots noindex on a real page', () => {
    head.insertAdjacentHTML('beforeend', '<meta name="robots" content="noindex">');
    TestBed.inject(I18nService).setLocale('pt');
    expect(head.querySelector('meta[name="robots"]')).toBeNull();
  });
});
