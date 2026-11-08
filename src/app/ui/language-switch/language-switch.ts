import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { LanguagePreference } from '../../core/i18n/language-preference';
import { LOCALES, LOCALE_INFO } from '../../core/i18n/locales';

/**
 * Link to the same page in the other language. It is a real `<a href>` (not a
 * button) because it navigates to another URL: crawlers and no-JS visitors can
 * follow it. Its text is the target language's own name, written in that
 * language (`lang`), so no translation is needed and it is announced correctly.
 *
 * It deliberately navigates WITHOUT a fragment: the router reuses the page
 * component when only `:lang` changes and, with no anchor to scroll to, the
 * browser keeps the scroll position.
 */
@Component({
  selector: 'app-language-switch',
  imports: [RouterLink],
  templateUrl: './language-switch.html',
  styleUrl: './language-switch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitch {
  private readonly i18n = inject(I18nService);
  private readonly preference = inject(LanguagePreference);

  protected readonly target = computed(() => {
    const current = this.i18n.locale();
    const other = LOCALES.find((code) => code !== current) ?? current;
    return LOCALE_INFO[other];
  });

  protected remember(): void {
    this.preference.write(this.target().code);
  }
}
