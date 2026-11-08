import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Card } from './card';

@Component({
  imports: [Card],
  template: `
    <app-card id="plain">Plain</app-card>
    <app-card id="live" interactive>Live</app-card>
    <app-card id="slot" variant="placeholder">Slot</app-card>
  `,
})
class Host {}

@Component({ imports: [Card], template: `<app-card variant="featured">Current</app-card>` })
class FeaturedHost {}

describe('Card', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const get = (id: string) => el.querySelector(`#${id}`) as HTMLElement;
    return { plain: get('plain'), live: get('live'), slot: get('slot') };
  }

  it('projects its content', () => {
    expect(setup().plain.textContent).toContain('Plain');
  });

  it('is the default variant and not interactive unless asked', () => {
    const { plain } = setup();
    expect(plain.getAttribute('data-variant')).toBe('default');
    expect(plain.hasAttribute('data-interactive')).toBe(false);
  });

  it('marks interactive cards', () => {
    expect(setup().live.hasAttribute('data-interactive')).toBe(true);
  });

  it('supports the placeholder variant', () => {
    expect(setup().slot.getAttribute('data-variant')).toBe('placeholder');
  });

  it('supports the featured variant (used for the current role)', () => {
    const fixture = TestBed.createComponent(FeaturedHost);
    fixture.detectChanges();
    const card = (fixture.nativeElement as HTMLElement).querySelector('app-card');
    expect(card?.getAttribute('data-variant')).toBe('featured');
  });
});
