import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Section } from './section';

@Component({
  imports: [Section],
  template: `
    <app-section sectionId="about" heading="About me" [eyebrow]="eyebrow()">
      <p id="content">Body</p>
    </app-section>
  `,
})
class Host {
  readonly eyebrow = signal<string | undefined>('Profile');
}

describe('Section', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
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

  it('shows the eyebrow only when provided', () => {
    const { fixture, el } = setup();
    expect(el.querySelector('.eyebrow')?.textContent).toContain('Profile');

    fixture.componentInstance.eyebrow.set(undefined);
    fixture.detectChanges();
    expect(el.querySelector('.eyebrow')).toBeNull();
  });
});
