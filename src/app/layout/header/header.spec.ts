import { CONTENT } from '../../content';
import { LOCALES } from '../../core/i18n/locales';
import { render, root, texts } from '../../testing/render';
import { Header } from './header';

describe.each(LOCALES)('Header (%s)', (locale) => {
  const content = CONTENT[locale];

  function setup() {
    const fixture = render(Header, locale);
    const el = root(fixture);
    return {
      fixture,
      el,
      nav: el.querySelector('nav') as HTMLElement,
      button: el.querySelector('.menu-button') as HTMLButtonElement,
    };
  }

  it('has a labelled navigation landmark with every section link in order', () => {
    const { nav } = setup();
    expect(nav.getAttribute('aria-label')).toBe(content.a11y.mainNavigation);
    const links = Array.from(nav.querySelectorAll('a'));
    expect(texts(links)).toEqual(content.nav.map((item) => item.label));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(
      content.nav.map((item) => `/${locale}#${item.id}`),
    );
  });

  it('keeps the language switch and the theme toggle in the header', () => {
    const { el } = setup();
    expect(el.querySelector('app-language-switch a')).not.toBeNull();
    expect(el.querySelector('app-theme-toggle button')?.getAttribute('aria-label')).toBe(
      content.a11y.themeToggle,
    );
  });

  describe('menu button (small screens)', () => {
    it('is named and starts collapsed, controlling the nav', () => {
      const { nav, button } = setup();
      expect(button.getAttribute('aria-label')).toBe(content.a11y.menu);
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.getAttribute('aria-controls')).toBe(nav.id);
      expect(nav.classList.contains('open')).toBe(false);
    });

    it('toggles the panel and aria-expanded', () => {
      const { fixture, nav, button } = setup();

      button.click();
      fixture.detectChanges();
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(nav.classList.contains('open')).toBe(true);

      button.click();
      fixture.detectChanges();
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(nav.classList.contains('open')).toBe(false);
    });

    it('closes when a section link is chosen', () => {
      const { fixture, nav, button } = setup();
      button.click();
      fixture.detectChanges();

      (nav.querySelector('a') as HTMLAnchorElement).click();
      fixture.detectChanges();

      expect(nav.classList.contains('open')).toBe(false);
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('closes on Escape and returns focus to the menu button', () => {
      const { fixture, nav, button } = setup();
      button.click();
      fixture.detectChanges();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(nav.classList.contains('open')).toBe(false);
      expect(document.activeElement).toBe(button);
    });

    it('does not steal focus on Escape when the menu is already closed', () => {
      const { button } = setup();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(document.activeElement).not.toBe(button);
    });
  });
});
