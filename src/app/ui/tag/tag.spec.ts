import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tag } from './tag';

@Component({
  imports: [Tag],
  template: `
    <app-tag id="a">Angular</app-tag>
    <app-tag id="b" tone="neutral">Scrum</app-tag>
  `,
})
class Host {}

describe('Tag', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return {
      a: el.querySelector('#a') as HTMLElement,
      b: el.querySelector('#b') as HTMLElement,
    };
  }

  it('projects its text', () => {
    expect(setup().a.textContent).toContain('Angular');
  });

  it('defaults to the primary tone and supports neutral', () => {
    const { a, b } = setup();
    expect(a.getAttribute('data-tone')).toBe('primary');
    expect(b.getAttribute('data-tone')).toBe('neutral');
  });
});
