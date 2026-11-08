import { RenderMode, ServerRoute } from '@angular/ssr';
import { LOCALES } from './core/i18n/locales';

/**
 * Everything is prerendered (SSG). The `**` wildcard cannot be prerendered, so
 * the 404 page has its own concrete `404` route; unknown URLs get a client shell.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: '404', renderMode: RenderMode.Prerender },
  {
    path: ':lang',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => LOCALES.map((lang) => ({ lang })),
  },
  { path: '**', renderMode: RenderMode.Client },
];
