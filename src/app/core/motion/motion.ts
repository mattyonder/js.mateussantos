const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * True when the visitor asked the OS/browser for less motion
 * (WCAG 2.2 SC 2.3.3). Every JS-driven animation must check this first;
 * CSS animations are also neutralised by a global rule in `_base.scss`.
 */
export function prefersReducedMotion(win: Window | null | undefined): boolean {
  return win?.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false;
}
