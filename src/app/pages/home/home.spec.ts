import { CONTENT } from '../../content';
import { RESUME_PATH } from '../../content/profile';
import { LOCALES } from '../../core/i18n/locales';
import { render, root, texts } from '../../testing/render';
import { Home } from './home';

describe.each(LOCALES)('Home page (%s)', (locale) => {
  const content = CONTENT[locale];

  function page() {
    return root(render(Home, locale));
  }

  it('renders every navigation target as a labelled section, in order', () => {
    const el = page();
    const ids = Array.from(el.querySelectorAll('main section[id]')).map((s) => s.id);
    // The hero has no anchor id; the rest match the navigation exactly.
    expect(ids).toEqual(content.nav.map((item) => item.id));

    for (const section of Array.from(el.querySelectorAll('main section[id]'))) {
      const labelId = section.getAttribute('aria-labelledby') as string;
      expect(el.querySelector(`#${labelId}`)?.tagName).toBe('H2');
    }
  });

  it('has exactly one h1 and never skips a heading level (WCAG 1.3.1 / 2.4.6)', () => {
    const levels = Array.from(el(page()).querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) =>
      Number(h.tagName[1]),
    );
    expect(levels.filter((level) => level === 1).length).toBe(1);
    expect(levels[0]).toBe(1);
    levels.forEach((level, index) => {
      if (index > 0) expect(level).toBeLessThanOrEqual(levels[index - 1] + 1);
    });
  });

  it('shows the numbers strip right after the hero, as its own labelled region', () => {
    const main = page().querySelector('main') as HTMLElement;
    const children = Array.from(main.children).map((child) => child.tagName.toLowerCase());
    expect(children.slice(0, 2)).toEqual(['app-hero', 'app-stats']);
    expect(main.querySelector('app-stats section')?.getAttribute('aria-label')).toBe(
      content.stats.label,
    );
  });

  it('has the landmarks: header, nav, one main and a footer', () => {
    const el = page();
    expect(el.querySelectorAll('header').length).toBeGreaterThanOrEqual(1);
    expect(el.querySelectorAll('nav').length).toBe(1);
    expect(el.querySelectorAll('main').length).toBe(1);
    expect(el.querySelectorAll('footer').length).toBe(1);
  });

  it('puts the skip link first, targeting the <main> id', () => {
    const el = page();
    const first = el.querySelector('a, button') as HTMLAnchorElement;
    expect(first.textContent?.trim()).toBe(content.a11y.skipToContent);
    expect(first.getAttribute('href')).toBe(`/${locale}#main`);
    expect(el.querySelector('main')?.id).toBe('main');
  });

  it('every link and button has an accessible name', () => {
    for (const control of Array.from(page().querySelectorAll('a, button'))) {
      const name = control.getAttribute('aria-label') ?? control.textContent?.trim();
      expect(name, control.outerHTML.slice(0, 120)).toBeTruthy();
    }
  });

  it('every image has alt text', () => {
    for (const img of Array.from(page().querySelectorAll('img'))) {
      expect(img.getAttribute('alt')?.length).toBeGreaterThan(0);
    }
  });

  it('every external link is safe (noopener noreferrer) and announced as new-tab', () => {
    const external = Array.from(page().querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'));
    expect(external.length).toBeGreaterThanOrEqual(6);
    for (const link of external) {
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.textContent).toContain(content.a11y.opensInNewTab);
    }
  });

  it('downloads the résumé of its own language and nothing exposes a phone number', () => {
    const el = page();
    expect(el.querySelector('a[download]')?.getAttribute('href')).toBe(RESUME_PATH[locale]);
    expect(el.querySelector('a[href^="tel:"]')).toBeNull();
    expect(el.textContent).not.toMatch(/\(?\d{2}\)?\s?9\s?\d{4}[-\s]?\d{4}/);
  });

  it('states availability only inside the Contact section, and never in a pushy way', () => {
    const el = page();
    const contact = el.querySelector('#contact') as HTMLElement;
    expect(contact.textContent).toContain(content.contact.intro);

    const outside = Array.from(el.querySelectorAll('main section[id]'))
      .filter((section) => section.id !== 'contact')
      .map((section) => section.textContent)
      .concat(
        el.querySelector('app-hero')?.textContent ?? '',
        el.querySelector('header')?.textContent ?? '',
      )
      .join(' ')
      .toLowerCase();
    expect(outside).not.toMatch(/oportunidade|opportunit/);
    expect(el.textContent?.toLowerCase()).not.toMatch(/contrate|hire me|open to work|opentowork/);
  });

  it('shows the section headings from the content file', () => {
    const headings = texts(page().querySelectorAll('main h2'));
    expect(headings).toEqual([
      content.about.heading,
      content.experience.heading,
      content.projects.heading,
      content.skills.heading,
      content.education.heading,
      content.contact.heading,
    ]);
  });
});

/** Helper to keep the heading test readable. */
function el(element: HTMLElement): HTMLElement {
  return element;
}
