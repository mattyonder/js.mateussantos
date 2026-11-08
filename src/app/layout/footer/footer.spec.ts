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
});
