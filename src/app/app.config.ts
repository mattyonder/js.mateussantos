import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { ThemeService } from './core/theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Anchor links scroll to their section. Scroll restoration stays at the default
    // ('disabled'): 'enabled' would jump to the top on every navigation, including
    // a language switch, which must keep the reader's position.
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled' })),
    provideClientHydration(),
    // Instantiate early so the theme follows the OS preference changes from startup.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
