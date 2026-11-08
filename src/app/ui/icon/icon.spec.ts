import { TestBed } from '@angular/core/testing';
import { Icon, IconName } from './icon';

const NAMES: IconName[] = [
  'github',
  'linkedin',
  'mail',
  'download',
  'map-pin',
  'menu',
  'close',
  'code',
  'arrow-up',
];

describe('Icon', () => {
  function setup(name: IconName) {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
    return {
      fixture,
      svg: (fixture.nativeElement as HTMLElement).querySelector('svg') as SVGElement,
    };
  }

  it.each(NAMES)('%s: draws at least one path with a valid d attribute', (name) => {
    const { svg } = setup(name);
    const paths = Array.from(svg.querySelectorAll('path'));
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path.getAttribute('d')).toMatch(/^[Mm]/);
    }
  });

  it('is decorative: hidden from assistive technology and not focusable', () => {
    const { svg } = setup('mail');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
  });

  it('redraws when the name changes', () => {
    const { fixture, svg } = setup('menu');
    const before = svg.querySelectorAll('path').length;
    fixture.componentRef.setInput('name', 'close');
    fixture.detectChanges();
    expect(before).toBe(3);
    expect(svg.querySelectorAll('path').length).toBe(2);
  });
});
