import { Title } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PROFILE } from '../../content/profile';
import { LanguagePreference } from '../../core/i18n/language-preference';
import { LOCALES, LOCALE_INFO } from '../../core/i18n/locales';

/**
 * Entry page at `/`. In the browser it redirects to the stored choice or the
 * browser language. The prerendered HTML is a plain language chooser, so it
 * also works without JavaScript and gives crawlers links to both languages.
 * (Stage 7 adds an edge redirect in vercel.json so most visitors skip this page.)
 */
@Component({
  selector: 'app-root-redirect',
  imports: [RouterLink],
  templateUrl: './root-redirect.html',
  styleUrl: './root-redirect.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootRedirect {
  private readonly router = inject(Router);
  private readonly preference = inject(LanguagePreference);

  protected readonly name = PROFILE.name;
  protected readonly locales = LOCALES.map((code) => LOCALE_INFO[code]);

  constructor() {
    inject(Title).setTitle(PROFILE.name);
    afterNextRender(() => {
      void this.router.navigate(['/', this.preference.detect()], { replaceUrl: true });
    });
  }
}
