import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { REVEAL_DURATION_MS, Reveal } from './reveal';

/** Minimal controllable IntersectionObserver (jsdom has none). */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed = new Set<Element>();

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.add(element);
  }
  unobserve(element: Element): void {
    this.observed.delete(element);
  }
  disconnect(): void {
    this.observed.clear();
  }

  intersect(element: Element): void {
    this.callback(
      [{ target: element, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

@Component({
  imports: [Reveal],
  template: `
    <div id="below" [appReveal]="150">Below the fold</div>
    <div id="visible" appReveal>Already on screen</div>
    <div id="second-below" appReveal>Also below</div>
  `,
})
class Host {}

@Component({
  imports: [Reveal],
  template: `
    <div id="long" [appReveal]="9999">Long delay</div>
    <div id="negative" [appReveal]="-50">Negative delay</div>
  `,
})
class ClampHost {}

describe('Reveal', () => {
  const ON_SCREEN = new Set(['visible']);

  function installObserver(): void {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: FakeIntersectionObserver,
    });
  }

  function stubReducedMotion(reduced: boolean): void {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue({ matches: reduced, addEventListener: () => undefined }),
    });
  }

  /** Elements named in ON_SCREEN are inside the viewport; all others are far below it. */
  function stubLayout(): void {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      return { top: ON_SCREEN.has(this.id) ? 100 : window.innerHeight + 2000 } as DOMRect;
    });
  }

  function render<T>(component: new () => T) {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, get: (id: string) => el.querySelector(`#${id}`) as HTMLElement };
  }

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    installObserver();
    stubReducedMotion(false);
    stubLayout();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, 'IntersectionObserver');
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('hides only elements that are fully below the fold', () => {
    const { get } = render(Host);
    expect(get('below').getAttribute('data-reveal')).toBe('pending');
    expect(get('second-below').getAttribute('data-reveal')).toBe('pending');
    // Already on screen: hiding it now would make it flash.
    expect(get('visible').hasAttribute('data-reveal')).toBe(false);
  });

  it('uses ONE shared observer, with a small bottom margin and threshold 0', () => {
    render(Host);
    expect(FakeIntersectionObserver.instances.length).toBe(1);
    const [observer] = FakeIntersectionObserver.instances;
    expect(observer.options?.threshold).toBe(0);
    expect(observer.options?.rootMargin).toBe('0px 0px -8% 0px');
    expect(observer.observed.size).toBe(2); // the two below-the-fold elements
  });

  it('passes the stagger delay to CSS as a custom property', () => {
    const { get } = render(Host);
    expect(get('below').style.getPropertyValue('--reveal-delay')).toBe('150ms');
    expect(get('second-below').style.getPropertyValue('--reveal-delay')).toBe('0ms');
  });

  it('reveals on intersection, then removes the temporary attributes after the transition', () => {
    const { get } = render(Host);
    const [observer] = FakeIntersectionObserver.instances;

    observer.intersect(get('below'));
    expect(get('below').getAttribute('data-reveal')).toBe('visible');
    expect(observer.observed.has(get('below'))).toBe(false); // each element is revealed once

    // Still animating just before the transition (+ delay + margin) is over...
    vi.advanceTimersByTime(REVEAL_DURATION_MS + 150);
    expect(get('below').getAttribute('data-reveal')).toBe('visible');

    // ...and fully back to its natural state after, so hover effects work again.
    vi.advanceTimersByTime(200);
    expect(get('below').hasAttribute('data-reveal')).toBe(false);
    expect(get('below').style.getPropertyValue('--reveal-delay')).toBe('');
  });

  it('does not reveal elements that are not intersecting', () => {
    const { get } = render(Host);
    expect(get('second-below').getAttribute('data-reveal')).toBe('pending');
  });

  it('clamps the delay to 0-400ms', () => {
    const { get } = render(ClampHost);
    expect(get('long').style.getPropertyValue('--reveal-delay')).toBe('400ms');
    expect(get('negative').style.getPropertyValue('--reveal-delay')).toBe('0ms');
  });

  it('leaves everything visible with prefers-reduced-motion', () => {
    stubReducedMotion(true);
    const { get } = render(Host);
    expect(get('below').hasAttribute('data-reveal')).toBe(false);
    expect(FakeIntersectionObserver.instances.length).toBe(0);
  });

  it('leaves everything visible when IntersectionObserver is unsupported', () => {
    Reflect.deleteProperty(window, 'IntersectionObserver');
    const { get } = render(Host);
    expect(get('below').hasAttribute('data-reveal')).toBe(false);
  });

  it('stops watching and restores the element when destroyed', () => {
    const { fixture, get } = render(Host);
    const [observer] = FakeIntersectionObserver.instances;
    const below = get('below');

    fixture.destroy();

    expect(observer.observed.has(below)).toBe(false);
    expect(below.hasAttribute('data-reveal')).toBe(false);
  });
});
