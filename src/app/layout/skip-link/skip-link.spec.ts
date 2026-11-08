import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { I18nService } from '../../core/i18n/i18n.service';
import { MAIN_CONTENT_ID, SkipLink } from './skip-link';

@Component({
  imports: [SkipLink],
  template: `
    <app-skip-link />
    <main id="main" tabindex="-1">Content</main>
  `,
})
class Host {}

describe('SkipLink', () => {
  function setup(locale: 'pt' | 'en') {
    TestBed.inject(I18nService).setLocale(locale);
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return {
      link: root.querySelector('a') as HTMLAnchorElement,
      main: root.querySelector('main') as HTMLElement,
    };
  }

  it('targets the main landmark id', () => {
    expect(MAIN_CONTENT_ID).toBe('main');
  });

  it.each([
    ['pt', 'Pular para o conteúdo'],
    ['en', 'Skip to content'],
  ] as const)('%s: shows the translated label', (locale, label) => {
    expect(setup(locale).link.textContent?.trim()).toBe(label);
  });

  it('uses an absolute href so <base href="/"> cannot send the visitor to the root page', () => {
    expect(setup('pt').link.getAttribute('href')).toBe('/pt#main');
    expect(setup('en').link.getAttribute('href')).toBe('/en#main');
  });

  it('moves keyboard focus to <main> and cancels the default navigation', () => {
    const { link, main } = setup('en');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(main);
  });
});
