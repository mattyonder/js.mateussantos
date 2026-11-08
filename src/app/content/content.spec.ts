import { LOCALES } from '../core/i18n/locales';
import { CONTENT } from './index';
import { HERO_STACK, PROFILE, RESUME_PATH } from './profile';
import type { SiteContent } from './types';

/** Flattens a value into a list of `path:type` / `path[]:length` entries describing its shape. */
function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return [
      `${path}[]:${value.length}`,
      ...value.flatMap((item, index) => shape(item, `${path}[${index}]`)),
    ];
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => shape(child, `${path}.${key}`));
  }
  return [`${path}:${typeof value}`];
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('site content', () => {
  const entries = LOCALES.map((locale) => [locale, CONTENT[locale]] as const);

  it('has the same structure in PT and EN (including the number of skills per group)', () => {
    const structure = (content: SiteContent) => shape(content);
    expect(structure(CONTENT.en)).toEqual(structure(CONTENT.pt));
  });

  it.each(entries)(
    '%s: technical skills match the résumés, including Tailwind CSS',
    (_l, content) => {
      const technical = content.skills.groups.find((g) => g.id === 'technical');
      expect([...(technical?.items ?? [])]).toEqual([
        'Angular',
        'TypeScript',
        'JavaScript',
        'RxJS',
        'Nx',
        'Tailwind CSS',
        'Jest',
        'SASS',
        'Java',
        'Spring Boot',
        'PostgreSQL',
        'SQL',
      ]);
    },
  );

  it.each(entries)('%s: has no empty strings', (_locale, content) => {
    for (const text of strings(content)) {
      expect(text.trim()).not.toBe('');
    }
  });

  it.each(entries)('%s: navigation lists every section in page order', (_locale, content) => {
    expect(content.nav.map((item) => item.id)).toEqual([
      'about',
      'experience',
      'projects',
      'skills',
      'education',
      'contact',
    ]);
  });

  it('keeps the section navigation ids identical across languages', () => {
    expect(CONTENT.pt.nav.map((n) => n.id)).toEqual(CONTENT.en.nav.map((n) => n.id));
  });

  it.each(entries)('%s: exactly one current position, listed first', (_locale, content) => {
    const { positions } = content.experience;
    expect(positions.filter((p) => p.current).length).toBe(1);
    expect(positions[0].current).toBe(true);
  });

  describe('privacy rules (CLAUDE.md)', () => {
    // Brazilian mobile numbers: optional +55, area code, leading 9 and 8 digits.
    const PHONE = /(\+?55\s?)?\(?\d{2}\)?\s?9\s?\d{4}[-\s]?\d{4}/;

    it.each(entries)('%s: no phone number anywhere in the content', (_locale, content) => {
      for (const text of strings(content)) {
        expect(text).not.toMatch(PHONE);
      }
    });

    it('no phone number in the shared profile data', () => {
      for (const text of strings(PROFILE)) {
        expect(text).not.toMatch(PHONE);
      }
    });

    // Owner's decision (2026-11-08): a professional availability sentence in Contact ONLY.
    const OPPORTUNITY = /oportunidade|opportunit/;

    it.each(entries)(
      '%s: availability is stated in the Contact intro and nowhere else',
      (_l, content) => {
        expect(content.contact.intro.toLowerCase()).toMatch(OPPORTUNITY);

        const elsewhere = strings({ ...content, contact: { ...content.contact, intro: '' } })
          .join(' ')
          .toLowerCase();
        expect(elsewhere).not.toMatch(OPPORTUNITY); // hero, about, meta description, share text...
      },
    );

    it.each(entries)('%s: the tone stays professional (no pushy wording)', (_l, content) => {
      const all = strings(content).join(' ').toLowerCase();
      expect(all).not.toMatch(
        /contrate|hire me|open to work|opentowork|procurando emprego|looking for a job|disponível para|available for hire|urgente/,
      );
    });

    it.each(entries)(
      '%s: the availability sentence covers software development with the stack (not front-end only)',
      (_l, content) => {
        const intro = content.contact.intro;
        expect(intro).toMatch(/desenvolvimento de software|software development/);
        for (const tool of ['Angular', 'TypeScript', 'Java', 'Spring Boot']) {
          expect(intro).toContain(tool);
        }
      },
    );

    it.each(entries)('%s: the availability sentence is gender-neutral', (_l, content) => {
      expect(content.contact.intro).not.toMatch(/\b(aberto|aberta)\b/i);
    });

    it('hero chips are all technologies listed in the résumé skills (nothing invented)', () => {
      for (const locale of LOCALES) {
        const technical =
          CONTENT[locale].skills.groups.find((g) => g.id === 'technical')?.items ?? [];
        for (const tech of HERO_STACK) {
          expect(technical, `${tech} in ${locale} skills`).toContain(tech);
        }
      }
    });

    it.each(entries)('%s: shows only the approved location', (_locale, content) => {
      expect(content.hero.location).toMatch(/^Sergipe, Bra[sz]il$/);
    });
  });

  describe('projects', () => {
    it.each(entries)('%s: lists exactly the four approved systems', (_locale, content) => {
      expect(content.projects.worked.systems.map((s) => s.id)).toEqual([
        'sispec',
        'almoxarifado',
        'ipe-saude',
        'regulacao',
      ]);
    });

    it.each(entries)('%s: every system has a role and a stack', (_locale, content) => {
      for (const system of content.projects.worked.systems) {
        expect(system.role.length).toBeGreaterThan(0);
        expect(system.stack.length).toBeGreaterThan(0);
      }
    });

    it.each(entries)(
      '%s: all systems share the owner-confirmed stack; only SISPEC adds Jest',
      (_locale, content) => {
        const base = ['Angular', 'RxJS', 'Nx', 'Java', 'Spring Boot', 'PostgreSQL', 'Tailwind CSS'];
        for (const system of content.projects.worked.systems) {
          const expected = system.id === 'sispec' ? [...base, 'Jest'] : base;
          expect([...system.stack]).toEqual(expected);
        }
      },
    );

    it.each(entries)(
      '%s: placeholders carry NO name, description or technology',
      (_locale, content) => {
        const { items } = content.projects.personal;
        expect(items.length).toBeGreaterThanOrEqual(2);
        expect(items.length).toBeLessThanOrEqual(3);
        for (const item of items) {
          expect(item.status).toBe('coming-soon');
          expect(Object.keys(item)).toEqual(['status']);
        }
      },
    );
  });

  describe('shared profile', () => {
    it('has the owner contact data and a résumé per language', () => {
      expect(PROFILE.email).toBe('js.mateussantos05@gmail.com');
      expect(PROFILE.githubUrl).toBe('https://github.com/mattyonder');
      expect(PROFILE.linkedinUrl).toBe('https://linkedin.com/in/js-mateussantos/');
      expect(Object.keys(RESUME_PATH).sort()).toEqual([...LOCALES].sort());
      for (const path of Object.values(RESUME_PATH)) {
        expect(path).toMatch(/^\/curriculo_.*\.pdf$/);
      }
    });

    it.each(entries)('%s: hero name matches the profile name', (_locale, content) => {
      expect(content.hero.name).toBe(PROFILE.name);
    });
  });
});
