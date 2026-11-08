import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button, ButtonSize, ButtonVariant } from './button';

@Component({
  imports: [Button],
  template: `
    <button app-button [variant]="variant()" [size]="size()">Label</button>
    <a app-button href="/x">Link</a>
  `,
})
class Host {
  readonly variant = signal<ButtonVariant>('primary');
  readonly size = signal<ButtonSize>('md');
}

describe('Button', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      button: el.querySelector('button') as HTMLButtonElement,
      link: el.querySelector('a') as HTMLAnchorElement,
    };
  }

  it('keeps native semantics and projects the label', () => {
    const { button, link } = setup();
    expect(button.tagName).toBe('BUTTON');
    expect(button.textContent).toContain('Label');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/x');
  });

  it('defaults to the primary variant and md size', () => {
    const { link } = setup();
    expect(link.getAttribute('data-variant')).toBe('primary');
    expect(link.getAttribute('data-size')).toBe('md');
  });

  it('reflects variant and size inputs as attributes', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.variant.set('secondary');
    fixture.componentInstance.size.set('lg');
    fixture.detectChanges();
    expect(button.getAttribute('data-variant')).toBe('secondary');
    expect(button.getAttribute('data-size')).toBe('lg');
  });
});
