import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CONTENT } from '../../content';
import { I18nService } from '../../core/i18n/i18n.service';
import { LOCALES } from '../../core/i18n/locales';
import { render, root, texts } from '../../testing/render';
import { Header } from './header';

const SECTION_IDS = ['about', 'experience', 'projects', 'skills', 'education', 'contact'];

@Component({
  selector: 'app-page-host',
  imports: [Header],
  template: `
    <app-header />
    <main>
      @for (id of ids; track id) {
        <section [id]="id"></section>
      }
    </main>
  `,
})
class PageHost {
  readonly ids = SECTION_IDS;
}

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

  describe('active section (aria-current)', () => {
    let tops: Record<string, number>;
    let scrollY = 0;
    let frames: FrameRequestCallback[] = [];

    function stubBrowser() {
      // jsdom has no layout: the section positions are supplied by each test.
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        return { top: tops[this.id] ?? 0 } as DOMRect;
      });
      Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY });
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        configurable: true,
        value: 5000,
      });
      // requestAnimationFrame is ASYNCHRONOUS in a real browser: queue the callbacks and let
      // the test run them, exactly like the next frame would.
      Object.defineProperty(window, 'requestAnimationFrame', {
        configurable: true,
        writable: true,
        value: (callback: FrameRequestCallback) => frames.push(callback),
      });
      Object.defineProperty(window, 'cancelAnimationFrame', {
        configurable: true,
        writable: true,
        value: () => undefined,
      });
    }

    function nextFrame() {
      const queued = frames;
      frames = [];
      queued.forEach((callback) => callback(0));
    }

    function scrollTo(position: number, newTops: Record<string, number>) {
      scrollY = position;
      tops = newTops;
      window.dispatchEvent(new Event('scroll'));
      nextFrame();
    }

    function setup() {
      TestBed.configureTestingModule({
        providers: [provideRouter([{ path: '**', children: [] }])],
      });
      TestBed.inject(I18nService).setLocale(locale);
      stubBrowser();
      const fixture = TestBed.createComponent(PageHost);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const current = () => {
        fixture.detectChanges();
        return el.querySelector('nav a[aria-current]')?.getAttribute('href') ?? null;
      };
      return { fixture, el, current };
    }

    // Reading line = header height (0 in jsdom) + 30% of the 768px viewport = ~230px.
    const atHero = {
      about: 700,
      experience: 1500,
      projects: 2300,
      skills: 3100,
      education: 3900,
      contact: 4700,
    };

    beforeEach(() => {
      scrollY = 0;
      frames = [];
      tops = { ...atHero };
    });
    afterEach(() => {
      // Destroy the components FIRST: their cleanup cancels a pending frame, which needs the stub.
      TestBed.resetTestingModule();
      vi.restoreAllMocks();
      Reflect.deleteProperty(window, 'scrollY');
      Reflect.deleteProperty(window, 'requestAnimationFrame');
      Reflect.deleteProperty(window, 'cancelAnimationFrame');
      Reflect.deleteProperty(document.documentElement, 'scrollHeight');
    });

    it('marks nothing while the hero is on screen (no section has reached the reading line)', () => {
      expect(setup().current()).toBeNull();
    });

    it('marks the section being read as the user scrolls, and only one at a time', () => {
      const { el, current } = setup();

      scrollTo(600, {
        about: 100,
        experience: 900,
        projects: 1700,
        skills: 2500,
        education: 3300,
        contact: 4100,
      });
      expect(current()).toBe(`/${locale}#about`);

      scrollTo(1700, {
        about: -900,
        experience: -100,
        projects: 700,
        skills: 1500,
        education: 2300,
        contact: 3100,
      });
      expect(current()).toBe(`/${locale}#experience`);
      expect(el.querySelectorAll('nav a[aria-current]').length).toBe(1);

      scrollTo(2700, {
        about: -1900,
        experience: -1100,
        projects: -300,
        skills: 500,
        education: 1300,
        contact: 2100,
      });
      expect(current()).toBe(`/${locale}#projects`);
    });

    it('uses aria-current="true" (announced by screen readers) on the active link', () => {
      const { el } = setup();
      scrollTo(600, {
        about: 100,
        experience: 900,
        projects: 1700,
        skills: 2500,
        education: 3300,
        contact: 4100,
      });
      expect(el.querySelector('nav a[aria-current]')).toBeNull(); // not rendered until change detection
    });

    it('renders aria-current="true" once change detection runs', () => {
      const { fixture, el } = setup();
      scrollTo(600, {
        about: 100,
        experience: 900,
        projects: 1700,
        skills: 2500,
        education: 3300,
        contact: 4100,
      });
      fixture.detectChanges();
      expect(el.querySelector('nav a[aria-current]')?.getAttribute('aria-current')).toBe('true');
    });

    it('at the very bottom the LAST section is active (the short contact section never reaches the line)', () => {
      const { current } = setup();
      // Contact top is still below the reading line, but the page cannot scroll any further.
      scrollTo(4232, {
        about: -3500,
        experience: -2700,
        projects: -1900,
        skills: -1100,
        education: -300,
        contact: 480,
      });
      expect(current()).toBe(`/${locale}#contact`);
    });

    it('goes back to nothing when scrolling back up to the hero', () => {
      const { current } = setup();
      scrollTo(900, {
        about: -100,
        experience: 700,
        projects: 1500,
        skills: 2300,
        education: 3100,
        contact: 3900,
      });
      expect(current()).toBe(`/${locale}#about`);
      scrollTo(0, { ...atHero });
      expect(current()).toBeNull();
    });

    it('does the work once per frame: a burst of scroll events schedules ONE update', () => {
      setup();
      frames = [];
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      expect(frames.length).toBe(1);
      nextFrame();
      window.dispatchEvent(new Event('scroll')); // a new frame can schedule again
      expect(frames.length).toBe(1);
    });

    it('a click names the section at once, before the scroll catches up', () => {
      const { el, current } = setup();
      el.querySelectorAll<HTMLAnchorElement>('nav a')[3].click();
      expect(current()).toBe(`/${locale}#skills`);
    });

    it('stops listening to scroll when the header is destroyed', () => {
      const remove = vi.spyOn(window, 'removeEventListener');
      const { fixture } = setup();
      fixture.destroy();
      expect(remove.mock.calls.some(([type]) => type === 'scroll')).toBe(true);
    });
  });
});
