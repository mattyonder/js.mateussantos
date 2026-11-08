import { CONTENT } from '../../content';
import { HERO_STACK, PROFILE, RESUME_PATH } from '../../content/profile';
import { LOCALES } from '../../core/i18n/locales';
import { render, root, texts } from '../../testing/render';
import { Hero } from './hero';

describe('Hero', () => {
  describe.each(LOCALES)('%s', (locale) => {
    const content = CONTENT[locale].hero;

    it('has the only h1, with the name, plus role, tagline and location', () => {
      const el = root(render(Hero, locale));
      expect(el.querySelectorAll('h1').length).toBe(1);
      expect(el.querySelector('h1')?.textContent?.trim()).toBe(content.name);
      expect(el.querySelector('.role')?.textContent?.trim()).toBe(content.role);
      expect(el.querySelector('.tagline')?.textContent?.trim()).toBe(content.tagline);
      expect(el.querySelector('.location')?.textContent?.trim()).toBe(content.location);
    });

    it('lists the key technologies as a labelled list of chips under the tagline', () => {
      const list = root(render(Hero, locale)).querySelector('ul.stack') as HTMLElement;
      expect(list.getAttribute('aria-label')).toBe(content.stackLabel);
      expect(texts(list.querySelectorAll('app-tag'))).toEqual([...HERO_STACK]);
    });

    it('downloads the résumé in its own language', () => {
      const link = root(render(Hero, locale)).querySelector<HTMLAnchorElement>('a[download]');
      expect(link?.textContent?.trim()).toBe(content.resumeLabel);
      expect(link?.getAttribute('href')).toBe(RESUME_PATH[locale]);
    });

    it('links the contact button to the contact section of this language', () => {
      const el = root(render(Hero, locale));
      const link = Array.from(el.querySelectorAll('a')).find(
        (a) => a.textContent?.trim() === content.contactLabel,
      );
      expect(link?.getAttribute('href')).toBe(`/${locale}#contact`);
    });

    it('shows the photo with alt text and intrinsic size (no layout shift)', () => {
      const img = root(render(Hero, locale)).querySelector('img') as HTMLImageElement;
      expect(img.getAttribute('alt')).toBe(content.photoAlt);
      expect(img.getAttribute('width')).toBe(String(PROFILE.photo.width));
      expect(img.getAttribute('height')).toBe(String(PROFILE.photo.height));
      expect(img.getAttribute('src')).toContain(PROFILE.photo.src);
    });

    it('lists GitHub and LinkedIn as safe external links announced as new-tab', () => {
      const el = root(render(Hero, locale));
      const list = el.querySelector('.profiles') as HTMLElement;
      expect(list.getAttribute('aria-label')).toBe(content.profilesLabel);

      const links = Array.from(list.querySelectorAll('a'));
      expect(links.map((a) => a.getAttribute('href'))).toEqual(PROFILE.profiles.map((p) => p.url));
      for (const link of links) {
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        expect(link.textContent).toContain(CONTENT[locale].a11y.opensInNewTab);
      }
      expect(texts(links).map((t) => t.split(' ')[0])).toEqual(
        PROFILE.profiles.map((p) => p.label),
      );
    });
  });
});
