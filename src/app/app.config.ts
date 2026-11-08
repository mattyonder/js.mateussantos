import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { ThemeService } from './core/theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Anchor links scroll to their section. Scroll restoration stays at the default
    // ('disabled'): 'enabled' would jump to the top on every navigation, including
    // a language switch, which must keep the reader's position.
    // `onSameUrlNavigation: 'reload'` lets a nav link scroll again when its section is
    // already in the URL (otherwise the second click on the same anchor is ignored).
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled' }),
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
    ),
    provideClientHydration(),
    // Instantiate early so the theme follows the OS preference changes from startup.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
