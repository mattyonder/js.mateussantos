import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { LanguageSwitch } from '../../ui/language-switch/language-switch';
import { ThemeToggle } from '../../ui/theme-toggle/theme-toggle';

/** Site header. Stage 4 adds the section navigation next to the controls. */
@Component({
  selector: 'app-header',
  imports: [LanguageSwitch, ThemeToggle],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly i18n = inject(I18nService);

  protected readonly name = computed(() => this.i18n.content().hero.name);
  protected readonly themeLabel = computed(() => this.i18n.content().a11y.themeToggle);
}
