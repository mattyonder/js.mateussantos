import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

/**
 * Must match the key read by the inline no-flash script in `src/index.html`.
 * That script runs before first paint; this service takes over after bootstrap.
 */
export const THEME_STORAGE_KEY = 'theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/**
 * Owns the active colour theme.
 *
 * Source of truth for rendering is the `data-theme` attribute on `<html>`
 * (CSS reads it). The signal only mirrors it for components that need to
 * reflect the state (e.g. `aria-pressed` on the toggle).
 *
 * Resolution order on startup: attribute set by the inline script, then the
 * stored user choice, then the OS preference, then light.
 * The OS preference is followed live until the user makes an explicit choice.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly current = signal<Theme>('light');

  readonly theme = this.current.asReadonly();

  constructor() {
    if (!this.isBrowser) {
      return;
    }
    this.current.set(this.resolveInitial());
    this.apply(this.current());
    this.followSystemChanges();
  }

  /** Switches between light and dark and remembers the choice. */
  toggle(): void {
    this.set(this.current() === 'dark' ? 'light' : 'dark');
  }

  /** Sets an explicit theme and persists it as the user's choice. */
  set(theme: Theme): void {
    this.apply(theme);
    this.writeStored(theme);
  }

  private apply(theme: Theme): void {
    this.current.set(theme);
    this.document.documentElement.setAttribute('data-theme', theme);
  }

  private resolveInitial(): Theme {
    const fromAttribute = this.document.documentElement.getAttribute('data-theme');
    if (isTheme(fromAttribute)) {
      return fromAttribute;
    }
    return this.readStored() ?? (this.systemPrefersDark() ? 'dark' : 'light');
  }

  private followSystemChanges(): void {
    const query = this.document.defaultView?.matchMedia?.(DARK_QUERY);
    query?.addEventListener('change', (event) => {
      // Only follow the OS while the user has not chosen explicitly.
      if (this.readStored() === null) {
        this.apply(event.matches ? 'dark' : 'light');
      }
    });
  }

  private systemPrefersDark(): boolean {
    return this.document.defaultView?.matchMedia?.(DARK_QUERY).matches ?? false;
  }

  // Storage can throw (private mode, blocked site data) or be missing.
  // The site must keep working without persistence.
  private readStored(): Theme | null {
    try {
      const value = this.document.defaultView?.localStorage.getItem(THEME_STORAGE_KEY);
      return isTheme(value) ? value : null;
    } catch {
      return null;
    }
  }

  private writeStored(theme: Theme): void {
    try {
      this.document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore: the theme still applies for this visit.
    }
  }
}
