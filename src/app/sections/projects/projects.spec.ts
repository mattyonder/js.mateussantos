import { CONTENT } from '../../content';
import { PROFILE } from '../../content/profile';
import { LOCALES } from '../../core/i18n/locales';
import { render, root, texts } from '../../testing/render';
import { Projects } from './projects';

describe.each(LOCALES)('Projects (%s)', (locale) => {
  const content = CONTENT[locale].projects;

  it('is the projects section with the privacy note', () => {
    const el = root(render(Projects, locale));
    expect(el.querySelector('section')?.id).toBe('projects');
    expect(el.querySelector('.note')?.textContent?.trim()).toBe(content.worked.note);
  });

  it('lists the four systems with name, role and technologies only', () => {
    const el = root(render(Projects, locale));
    const cards = Array.from(el.querySelectorAll('.systems > li'));
    expect(cards.length).toBe(4);

    content.worked.systems.forEach((system, index) => {
      const card = cards[index];
      expect(card.querySelector('h4')?.textContent?.trim()).toBe(system.name);
      expect(card.querySelector('dd')?.textContent?.trim()).toBe(system.role);
      expect(texts(card.querySelectorAll('app-tag'))).toEqual([...system.stack]);
      // Nothing else (no screenshots, links or figures) is rendered for these systems.
      expect(card.querySelector('img, a, figure, canvas')).toBeNull();
    });
  });

  it('shows the personal projects as 3 "coming soon" placeholders', () => {
    const el = root(render(Projects, locale));
    const placeholders = Array.from(el.querySelectorAll('.personal-grid > li'));
    expect(placeholders.length).toBe(3);
    for (const placeholder of placeholders) {
      expect(placeholder.textContent?.replace(/\s+/g, ' ').trim()).toBe(
        content.personal.comingSoonLabel,
      );
      expect(placeholder.querySelector('h4, a, img')).toBeNull();
    }
  });

  it('links to the owner GitHub', () => {
    const link = root(render(Projects, locale)).querySelector<HTMLAnchorElement>(
      'a[target="_blank"]',
    );
    expect(link?.getAttribute('href')).toBe(PROFILE.githubUrl);
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.textContent).toContain(content.personal.githubLabel);
  });

  it('keeps a sensible heading hierarchy (h2 > h3 > h4)', () => {
    const el = root(render(Projects, locale));
    expect(texts(el.querySelectorAll('h2'))).toEqual([content.heading]);
    expect(texts(el.querySelectorAll('h3'))).toEqual([
      content.worked.heading,
      content.personal.heading,
    ]);
    expect(el.querySelectorAll('h4').length).toBe(4);
  });
});
