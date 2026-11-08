import { Routes } from '@angular/router';

// Compile-time flag: the Angular build replaces it with `false` in production,
// so the branch below (and the lazy chunk it imports) is removed from the bundle.
// `isDevMode()` is NOT enough: it is a runtime call, so the chunk would still ship.
declare const ngDevMode: boolean | undefined;

export const routes: Routes = [
  // Design-system showcase: development only (`ng serve`).
  ...(ngDevMode
    ? [
        {
          path: 'design-system',
          loadComponent: () => import('./design-system/design-system').then((m) => m.DesignSystem),
        },
      ]
    : []),
];
