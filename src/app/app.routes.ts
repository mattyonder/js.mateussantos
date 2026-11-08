import { Routes } from '@angular/router';
import { localeResolver, supportedLocaleGuard } from './core/i18n/locale.route';
import { Home } from './pages/home/home';

// Compile-time flag: the Angular build replaces it with `false` in production,
// so the branch below (and the lazy chunk it imports) is removed from the bundle.
// `isDevMode()` is NOT enough: it is a runtime call, so the chunk would still ship.
declare const ngDevMode: boolean | undefined;

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/root-redirect/root-redirect').then((m) => m.RootRedirect),
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
  // `/pt` and `/en`. The guard rejects any other value so it reaches the 404 route.
  {
    path: ':lang',
    canMatch: [supportedLocaleGuard],
    resolve: { locale: localeResolver },
    component: Home,
  },
  // Design-system showcase: development only (`ng serve`).
  ...(ngDevMode
    ? [
        {
          path: 'design-system',
          loadComponent: () => import('./design-system/design-system').then((m) => m.DesignSystem),
        },
      ]
    : []),
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
