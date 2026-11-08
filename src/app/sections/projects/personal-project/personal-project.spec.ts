import { TestBed } from '@angular/core/testing';
import type { PersonalProject, PublishedProject } from '../../../content/types';
import { PersonalProjectCard } from './personal-project';

describe('PersonalProjectCard', () => {
  function setup(project: PersonalProject) {
    const fixture = TestBed.createComponent(PersonalProjectCard);
    fixture.componentRef.setInput('project', project);
    fixture.componentRef.setInput('comingSoonLabel', 'Coming soon');
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('a coming-soon item renders only the label', () => {
    const el = setup({ status: 'coming-soon' });
    expect(el.textContent?.replace(/\s+/g, ' ').trim()).toBe('Coming soon');
    expect(el.querySelector('app-card')?.getAttribute('data-variant')).toBe('placeholder');
    expect(el.querySelector('h4, a, app-tag')).toBeNull();
  });

  describe('a published item (what replacing a placeholder looks like)', () => {
    const published: PublishedProject = {
      status: 'published',
      name: 'Sample project',
      description: 'A sample description.',
      stack: ['Angular', 'TypeScript'],
      url: 'https://example.com/demo',
      repositoryUrl: 'https://github.com/example/repo',
    };

    it('renders name, description and stack', () => {
      const el = setup(published);
      expect(el.querySelector('h4')?.textContent?.trim()).toBe('Sample project');
      expect(el.querySelector('.description')?.textContent?.trim()).toBe('A sample description.');
      expect(Array.from(el.querySelectorAll('app-tag')).map((t) => t.textContent?.trim())).toEqual([
        'Angular',
        'TypeScript',
      ]);
      expect(el.querySelector('app-card')?.getAttribute('data-variant')).toBe('default');
    });

    it('renders its links as safe new-tab links', () => {
      const links = Array.from(setup(published).querySelectorAll('a'));
      expect(links.map((a) => a.getAttribute('href'))).toEqual([
        'https://example.com/demo',
        'https://github.com/example/repo',
      ]);
      for (const link of links) {
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      }
    });

    it('omits links that are not provided', () => {
      const el = setup({ ...published, url: undefined, repositoryUrl: undefined });
      expect(el.querySelector('a')).toBeNull();
    });
  });
});
