import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { prefersReducedMotion } from '../../core/motion/motion';

/** Must match `--duration-slow` in `_tokens.scss` (the reveal transition length). */
export const REVEAL_DURATION_MS = 400;
/** Longest stagger delay; keeps long lists from feeling slow. */
export const REVEAL_MAX_DELAY_MS = 400;
/** Extra time before the temporary attributes are cleaned up. */
const CLEANUP_MARGIN_MS = 100;

/**
 * One shared IntersectionObserver that reveals elements as they scroll into view.
 *
 * Design rules (they exist so the animation can never hurt readability or speed):
 *  - The natural state of an element is VISIBLE. Prerendered HTML, no-JS,
 *    `prefers-reduced-motion`, printing and browsers without IntersectionObserver
 *    never see a hidden element.
 *  - Only elements fully BELOW the fold are hidden (`data-reveal="pending"`), so
 *    nothing already on screen flashes.
 *  - Revealing sets `data-reveal="visible"` (runs the CSS transition: transform and
 *    opacity only) and, once it ends, removes the attributes so the element's own
 *    hover transitions are not overridden.
 */
@Injectable({ providedIn: 'root' })
export class RevealObserver {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: IntersectionObserver | null = null;
  private readonly onReveal = new Map<Element, () => void>();

  /**
   * Starts watching `element`. Returns a function that stops watching and
   * restores the element to its natural state. A no-op when the element cannot
   * or should not be animated.
   */
  watch(element: HTMLElement, delayMs: number): () => void {
    const win = this.document.defaultView;
    if (
      !this.isBrowser ||
      !win ||
      prefersReducedMotion(win) ||
      typeof win.IntersectionObserver !== 'function'
    ) {
      return () => undefined;
    }
    // Already (partly) on screen: leave it alone, hiding it now would flash.
    if (element.getBoundingClientRect().top < win.innerHeight) {
      return () => undefined;
    }

    const observer = this.getObserver(win);
    let timer: number | undefined;

    const restore = () => {
      element.removeAttribute('data-reveal');
      element.style.removeProperty('--reveal-delay');
    };

    element.style.setProperty('--reveal-delay', `${delayMs}ms`);
    element.setAttribute('data-reveal', 'pending');

    this.onReveal.set(element, () => {
      element.setAttribute('data-reveal', 'visible');
      timer = win.setTimeout(restore, REVEAL_DURATION_MS + delayMs + CLEANUP_MARGIN_MS);
    });
    observer.observe(element);

    return () => {
      observer.unobserve(element);
      this.onReveal.delete(element);
      win.clearTimeout(timer);
      restore();
    };
  }

  private getObserver(win: Window & typeof globalThis): IntersectionObserver {
    this.observer ??= new win.IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            this.onReveal.get(entry.target)?.();
          }
        }
      },
      // Reveal a little before the element reaches the very bottom edge.
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );
    return this.observer;
  }
}

/**
 * `<div appReveal>` fades/slides the element in when it scrolls into view.
 * `[appReveal]="ms"` adds a delay (clamped to 0-400ms) to stagger siblings.
 */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  readonly delay = input(0, {
    alias: 'appReveal',
    transform: (value: number | string | null | undefined) =>
      Math.min(Math.max(Number(value) || 0, 0), REVEAL_MAX_DELAY_MS),
  });

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const observer = inject(RevealObserver);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      destroyRef.onDestroy(observer.watch(element, this.delay()));
    });
  }
}
