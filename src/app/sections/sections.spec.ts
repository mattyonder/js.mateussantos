import { CONTENT } from '../content';
import { PROFILE, RESUME_PATH } from '../content/profile';
import { LOCALES } from '../core/i18n/locales';
import { render, root, texts } from '../testing/render';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { Education } from './education/education';
import { Experience } from './experience/experience';
import { Skills } from './skills/skills';

describe.each(LOCALES)('content sections (%s)', (locale) => {
  const content = CONTENT[locale];

  describe('About', () => {
    it('renders the heading and the full summary', () => {
      const el = root(render(About, locale));
      expect(el.querySelector('section')?.id).toBe('about');
      expect(el.querySelector('h2')?.textContent?.trim()).toBe(content.about.heading);
      expect(el.querySelector('.summary')?.textContent?.trim()).toBe(content.about.summary);
    });
  });

  describe('About highlights (bento)', () => {
    it('keeps the full résumé summary in its own card', () => {
      const el = root(render(About, locale));
      expect(el.querySelector('.summary')?.textContent?.trim()).toBe(content.about.summary);
    });

    it('shows one card per highlight with its title as an h3', () => {
      const cards = Array.from(root(render(About, locale)).querySelectorAll('.highlight'));
      expect(cards.length).toBe(content.about.highlights.length);
      content.about.highlights.forEach((item, index) => {
        expect(cards[index].querySelector('h3')?.textContent?.trim()).toBe(item.title);
        expect(cards[index].querySelector('p')?.textContent?.trim()).toBe(item.text);
      });
    });
  });

  describe('Experience', () => {
    it('renders every position in order, with all its highlights', () => {
      const el = root(render(Experience, locale));
      expect(el.querySelector('section')?.id).toBe('experience');

      const entries = Array.from(el.querySelectorAll('.timeline > li'));
      expect(entries.length).toBe(content.experience.positions.length);

      content.experience.positions.forEach((position, index) => {
        const entry = entries[index];
        expect(entry.querySelector('h3')?.textContent?.trim()).toBe(position.role);
        expect(entry.querySelector('.company')?.textContent?.trim()).toBe(position.company);
        expect(entry.querySelector('.period')?.textContent?.trim()).toBe(position.period);
        expect(texts(entry.querySelectorAll('.highlights li'))).toEqual([...position.highlights]);
      });
    });

    it('marks only the current position as current, and it is first', () => {
      const entries = Array.from(
        root(render(Experience, locale)).querySelectorAll<HTMLElement>('.timeline > li'),
      );
      expect(entries.map((e) => e.classList.contains('current'))).toEqual([true, false]);
    });

    it('highlights only the current role with the featured card', () => {
      const variants = Array.from(
        root(render(Experience, locale)).querySelectorAll('.timeline app-card'),
      ).map((card) => card.getAttribute('data-variant'));
      expect(variants).toEqual(['featured', 'default']);
    });

    it('uses an ordered list (the timeline has a sequence)', () => {
      expect(root(render(Experience, locale)).querySelector('ol.timeline')).not.toBeNull();
    });
  });

  describe('Skills', () => {
    it('renders every group with all its items', () => {
      const el = root(render(Skills, locale));
      const cards = Array.from(el.querySelectorAll('app-card'));
      expect(cards.length).toBe(content.skills.groups.length);

      content.skills.groups.forEach((group, index) => {
        expect(cards[index].querySelector('h3')?.textContent?.trim()).toBe(group.title);
        expect(texts(cards[index].querySelectorAll('app-tag'))).toEqual([...group.items]);
      });
    });

    it('highlights only the technical group (primary tags)', () => {
      const tones = Array.from(root(render(Skills, locale)).querySelectorAll('app-card')).map(
        (card) => card.querySelector('app-tag')?.getAttribute('data-tone'),
      );
      expect(tones).toEqual(['primary', 'neutral', 'neutral', 'neutral']);
    });
  });

  describe('Education', () => {
    it('renders degrees and spoken languages', () => {
      const el = root(render(Education, locale));
      expect(el.querySelector('section')?.id).toBe('education');
      expect(texts(el.querySelectorAll('h3'))).toEqual([
        content.education.degreesHeading,
        content.education.languagesHeading,
      ]);
      expect(texts(el.querySelectorAll('.degree'))).toEqual(
        content.education.degrees.map((d) => d.title),
      );
      // Name/level are a term/description pair (dl), so assistive tech announces them as such.
      expect(texts(el.querySelectorAll('.languages dt'))).toEqual(
        content.education.languages.map((l) => l.name),
      );
      expect(texts(el.querySelectorAll('.languages dd'))).toEqual(
        content.education.languages.map((l) => l.level),
      );
    });
  });

  describe('Contact', () => {
    it('shows the e-mail in plain text and as a mailto link card', () => {
      const el = root(render(Contact, locale));
      const mail = el.querySelector<HTMLAnchorElement>('a.link[href^="mailto:"]');
      expect(mail?.getAttribute('href')).toBe(`mailto:${PROFILE.email}`);
      expect(mail?.textContent).toContain(PROFILE.email);
      expect(mail?.textContent).toContain(content.contact.emailLabel);
    });

    it('opens with the professional availability statement', () => {
      const el = root(render(Contact, locale));
      expect(el.querySelector('.intro')?.textContent?.trim()).toBe(content.contact.intro);
    });

    it('offers the two main actions: write an e-mail and download the résumé of this language', () => {
      const el = root(render(Contact, locale));
      const email = el.querySelector<HTMLAnchorElement>('.actions a[href^="mailto:"]');
      expect(email?.textContent?.trim()).toBe(content.contact.emailCta);
      expect(email?.getAttribute('href')).toBe(`mailto:${PROFILE.email}`);

      const resume = el.querySelector<HTMLAnchorElement>('.actions a[download]');
      expect(resume?.textContent?.trim()).toBe(content.hero.resumeLabel);
      expect(resume?.getAttribute('href')).toBe(RESUME_PATH[locale]);
    });

    it('links LinkedIn and GitHub safely in new tabs', () => {
      const links = Array.from(
        root(render(Contact, locale)).querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'),
      );
      expect(links.map((a) => a.getAttribute('href'))).toEqual(PROFILE.profiles.map((p) => p.url));
      for (const link of links) {
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        expect(link.textContent).toContain(content.a11y.opensInNewTab);
      }
    });

    it('has no form, no phone link and no phone number', () => {
      const el = root(render(Contact, locale));
      expect(el.querySelector('form, input, textarea')).toBeNull();
      expect(el.querySelector('a[href^="tel:"]')).toBeNull();
      expect(el.textContent).not.toMatch(/\(?\d{2}\)?\s?9\s?\d{4}[-\s]?\d{4}/);
    });
  });
});
