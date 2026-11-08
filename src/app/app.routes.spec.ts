import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withInMemoryScrolling } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CONTENT } from './content';
import { LANGUAGE_STORAGE_KEY } from './core/i18n/language-preference';
import { routes } from './app.routes';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';

describe('routes', () => {
  const head = document.head;

  async function setup() {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled' }))],
    });
    return RouterTestingHarness.create();
  }

  function text(harness: RouterTestingHarness, selector: string): string {
    return harness.routeNativeElement?.querySelector(selector)?.textContent?.trim() ?? '';
  }

  function cleanDom(): void {
    head
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"], meta[name="robots"]')
      .forEach((el) => el.remove());
    document.documentElement.removeAttribute('lang');
    localStorage.clear();
  }

  beforeEach(cleanDom);
  afterEach(() => {
    vi.restoreAllMocks();
    cleanDom();
  });

  describe('/:lang', () => {
    it('renders the Portuguese page at /pt', async () => {
      const harness = await setup();
      await harness.navigateByUrl('/pt', Home);

      expect(text(harness, 'h1')).toBe(CONTENT.pt.hero.name);
      expect(text(harness, '.role')).toBe(CONTENT.pt.hero.role);
      expect(document.documentElement.getAttribute('lang')).toBe('pt-BR');
      expect(document.title).toBe(CONTENT.pt.meta.title);
    });

    it('renders the English page at /en', async () => {
      const harness = await setup();
      await harness.navigateByUrl('/en', Home);

      expect(text(harness, '.role')).toBe(CONTENT.en.hero.role);
      expect(document.documentElement.getAttribute('lang')).toBe('en');
      expect(document.title).toBe(CONTENT.en.meta.title);
    });

    it('reuses the same page instance and DOM when only the language changes', async () => {
      // This is what keeps the reader's scroll position on a language switch.
      const harness = await setup();
      const pt = await harness.navigateByUrl('/pt', Home);
      const mainBefore = harness.routeNativeElement?.querySelector('main');

      const en = await harness.navigateByUrl('/en', Home);
      const mainAfter = harness.routeNativeElement?.querySelector('main');

      expect(en).toBe(pt);
      expect(mainAfter).toBe(mainBefore);
      expect(text(harness, '.role')).toBe(CONTENT.en.hero.role);
      expect(document.documentElement.getAttribute('lang')).toBe('en');
    });

    it('does not scroll when the language changes (no fragment navigation)', async () => {
      const harness = await setup();
      await harness.navigateByUrl('/pt', Home);
      const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

      await harness.navigateByUrl('/en', Home);

      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('honours a direct link even when another language is stored', async () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'pt');
      const harness = await setup();
      await harness.navigateByUrl('/en', Home);

      expect(text(harness, '.role')).toBe(CONTENT.en.hero.role);
      expect(TestBed.inject(Router).url).toBe('/en');
    });
  });

  describe('/', () => {
    async function visitRoot() {
      const harness = await setup();
      await harness.navigateByUrl('/');
      await harness.fixture.whenStable();
      await harness.fixture.whenStable();
      return harness;
    }

    it('redirects to the stored language', async () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'pt');
      await visitRoot();
      expect(TestBed.inject(Router).url).toBe('/pt');
    });

    it('redirects by browser language when nothing is stored', async () => {
      vi.spyOn(Navigator.prototype, 'languages', 'get').mockReturnValue(['pt-BR', 'en']);
      await visitRoot();
      expect(TestBed.inject(Router).url).toBe('/pt');
    });

    it('falls back to English for unsupported browser languages', async () => {
      vi.spyOn(Navigator.prototype, 'languages', 'get').mockReturnValue(['fr-FR']);
      await visitRoot();
      expect(TestBed.inject(Router).url).toBe('/en');
    });
  });

  describe('404', () => {
    it.each(['/fr', '/pt/unknown', '/xyz/abc'])('%s shows the 404 page', async (url) => {
      const harness = await setup();
      await harness.navigateByUrl(url, NotFound);

      expect(text(harness, 'h1')).toBe('404');
      // The message is shown in every supported language.
      expect(text(harness, 'main')).toContain(CONTENT.pt.notFound.title);
      expect(text(harness, 'main')).toContain(CONTENT.en.notFound.title);
    });

    it('is marked noindex, and a real page afterwards is not', async () => {
      const harness = await setup();
      await harness.navigateByUrl('/fr', NotFound);
      expect(head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');

      await harness.navigateByUrl('/pt', Home);
      expect(head.querySelector('meta[name="robots"]')).toBeNull();
    });
  });
});
