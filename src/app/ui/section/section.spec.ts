import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CONTENT } from '../../content';
import { I18nService } from '../../core/i18n/i18n.service';
import { LOCALES } from '../../core/i18n/locales';
import { Section } from './section';

@Component({
  imports: [Section],
  template: `
    <app-section [sectionId]="id()" heading="About me" [eyebrow]="eyebrow()" [subtle]="subtle()">
      <p id="content">Body</p>
    </app-section>
  `,
})
class Host {
  readonly id = signal('about');
  readonly eyebrow = signal<string | undefined>(undefined);
  readonly subtle = signal(false);
}

describe('Section', () => {
  function setup(locale: 'pt' | 'en' = 'en') {
    TestBed.inject(I18nService).setLocale(locale);
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const update = (fn: (host: Host) => void) => {
      fn(fixture.componentInstance);
      fixture.detectChanges();
    };
    return { fixture, el, update };
  }

  it('renders a landmark section with the given anchor id', () => {
    const { el } = setup();
    expect(el.querySelector('section')?.id).toBe('about');
  });

  it('labels the section by its own h2 (accessible name)', () => {
    const { el } = setup();
    const heading = el.querySelector('h2') as HTMLHeadingElement;
    expect(heading.textContent).toContain('About me');
    expect(heading.id).toBe('about-heading');
    expect(el.querySelector('section')?.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('projects the body content', () => {
    expect(setup().el.querySelector('#content')?.textContent).toBe('Body');
  });

  it('can switch to the tinted background', () => {
    const { el, update } = setup();
    expect(el.querySelector('section')?.classList.contains('subtle')).toBe(false);
    update((host) => host.subtle.set(true));
    expect(el.querySelector('section')?.classList.contains('subtle')).toBe(true);
  });

  describe('numbered header ("01 ── Profile")', () => {
    it.each(LOCALES)('%s: number and label follow the menu order of the content', (locale) => {
      const nav = CONTENT[locale].nav;
      const { el, update } = setup(locale);
      nav.forEach((item, index) => {
        update((host) => host.id.set(item.id));
        expect(el.querySelector('.num')?.textContent?.trim()).toBe(
          String(index + 1).padStart(2, '0'),
        );
        expect(el.querySelector('.label')?.textContent?.trim()).toBe(item.eyebrow);
      });
    });

    it('the number and the rule are decorative (aria-hidden); the label is plain text', () => {
      const { el } = setup();
      expect(el.querySelector('.num')?.getAttribute('aria-hidden')).toBe('true');
      expect(el.querySelector('.rule')?.getAttribute('aria-hidden')).toBe('true');
      expect(el.querySelector('.label')?.getAttribute('aria-hidden')).toBeNull();
    });

    it('the eyebrow input replaces the label but keeps the number', () => {
      const { el, update } = setup();
      update((host) => host.eyebrow.set('Custom label'));
      expect(el.querySelector('.label')?.textContent?.trim()).toBe('Custom label');
      expect(el.querySelector('.num')?.textContent?.trim()).toBe('01');
    });

    it('a section that is not in the menu has no number, and no header unless a label is given', () => {
      const { el, update } = setup();
      update((host) => host.id.set('not-in-the-menu'));
      expect(el.querySelector('.eyebrow')).toBeNull();

      update((host) => host.eyebrow.set('Showcase'));
      expect(el.querySelector('.label')?.textContent?.trim()).toBe('Showcase');
      expect(el.querySelector('.num')).toBeNull();
      expect(el.querySelector('.rule')).toBeNull();
    });
  });
});
