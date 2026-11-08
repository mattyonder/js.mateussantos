import { TestBed } from '@angular/core/testing';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  const root = document.documentElement;

  beforeEach(() => {
    root.removeAttribute('data-theme');
    localStorage.clear();
  });

  afterEach(() => {
    root.removeAttribute('data-theme');
    localStorage.clear();
  });

  function setup() {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.componentRef.setInput('label', 'Dark theme');
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;
    return { fixture, button };
  }

  it('is a named button that does not submit forms', () => {
    const { button } = setup();
    expect(button.getAttribute('aria-label')).toBe('Dark theme');
    expect(button.type).toBe('button');
  });

  it('hides decorative icons from assistive technology', () => {
    const { fixture } = setup();
    const icons = (fixture.nativeElement as HTMLElement).querySelectorAll('svg');
    expect(icons.length).toBe(2);
    icons.forEach((icon) => expect(icon.getAttribute('aria-hidden')).toBe('true'));
  });

  it('exposes the state with aria-pressed and switches the theme on click', () => {
    const { fixture, button } = setup();
    expect(button.getAttribute('aria-pressed')).toBe('false');

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
