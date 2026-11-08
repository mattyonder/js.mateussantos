import { CONTENT } from '../../content';
import { PROFILE } from '../../content/profile';
import { LOCALES } from '../../core/i18n/locales';
import { render, root } from '../../testing/render';
import { Footer } from './footer';

describe.each(LOCALES)('Footer (%s)', (locale) => {
  it('shows the current year and the owner name', () => {
    const text = root(render(Footer, locale)).querySelector('p')?.textContent;
    expect(text).toContain(String(new Date().getFullYear()));
    expect(text).toContain(PROFILE.name);
  });

  it('links to the source code of the site, safely', () => {
    const link = root(render(Footer, locale)).querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(PROFILE.repositoryUrl);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.textContent).toContain(CONTENT[locale].footer.sourceCode);
  });

  it('states the licence', () => {
    expect(root(render(Footer, locale)).textContent).toContain(CONTENT[locale].footer.license);
  });

  it('has a "back to top" link to the main landmark of THIS language, as a router link', () => {
    const link = root(render(Footer, locale)).querySelector<HTMLAnchorElement>('a.top');
    expect(link?.textContent?.trim()).toBe(CONTENT[locale].footer.backToTop);
    // routerLink + fragment, not a bare "#main": that would resolve against <base href="/">.
    expect(link?.getAttribute('href')).toBe(`/${locale}#main`);
  });

  it('keeps the source-code link as the first link of the footer', () => {
    const first = root(render(Footer, locale)).querySelector('a') as HTMLAnchorElement;
    expect(first.getAttribute('href')).toBe(PROFILE.repositoryUrl);
  });
});
