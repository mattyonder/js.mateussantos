import { CONTENT } from '../../content';
import { LOCALES } from '../../core/i18n/locales';
import { render, root, texts } from '../../testing/render';
import { Stats, statValue } from './stats';

describe('Stats (at a glance)', () => {
  describe.each(LOCALES)('%s', (locale) => {
    const content = CONTENT[locale];

    function items() {
      return Array.from(root(render(Stats, locale)).querySelectorAll('.item'));
    }

    it('is a labelled region with four items', () => {
      const el = root(render(Stats, locale)); // render ONCE: TestBed cannot be reconfigured
      expect(el.querySelector('section')?.getAttribute('aria-label')).toBe(content.stats.label);
      expect(el.querySelectorAll('.item').length).toBe(4);
    });

    it('shows the caption of each item from the content file, in order', () => {
      expect(texts(items().map((item) => item.querySelector('.caption') as Element))).toEqual(
        content.stats.items.map((item) => item.caption),
      );
    });

    it('every NUMBER equals the length of the list it counts (it cannot disagree with the page)', () => {
      const shown = items().map((item) => Number(item.querySelector('.value')?.textContent));
      expect(shown).toEqual([
        content.projects.worked.systems.length,
        content.experience.positions.length,
        content.skills.groups.find((g) => g.id === 'technical')?.items.length,
        content.education.languages.length,
      ]);
    });
  });

  it('the numbers are identical in PT and EN (same facts, different words)', () => {
    const numbers = (locale: 'pt' | 'en') =>
      CONTENT[locale].stats.items.map((item) => statValue(item.id, CONTENT[locale]));
    expect(numbers('pt')).toEqual(numbers('en'));
  });

  it('counts what the résumé lists today: 4 systems, 2 roles, 12 technologies, 3 languages', () => {
    expect(CONTENT.pt.stats.items.map((item) => statValue(item.id, CONTENT.pt))).toEqual([
      4, 2, 12, 3,
    ]);
  });

  it('follows the data: a longer list gives a bigger number', () => {
    const more = {
      ...CONTENT.en,
      education: {
        ...CONTENT.en.education,
        languages: [...CONTENT.en.education.languages, { name: 'French', level: 'Basic' }],
      },
    };
    expect(statValue('languages', more)).toBe(statValue('languages', CONTENT.en) + 1);
  });
});
