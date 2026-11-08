import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { Icon } from '../../ui/icon/icon';
import { LanguageSwitch } from '../../ui/language-switch/language-switch';
import { ThemeToggle } from '../../ui/theme-toggle/theme-toggle';

/**
 * Sticky header with the section navigation. From the `lg` breakpoint the links
 * are inline; below it they sit in a disclosure panel opened by a menu button
 * (`aria-expanded` + `aria-controls`). Escape closes the panel and returns focus
 * to the button. Links use `routerLink` + `fragment` because a bare `#id` would
 * resolve against `<base href="/">` and leave the page.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, Icon, LanguageSwitch, ThemeToggle],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard()',
  },
})
export class Header {
  private readonly i18n = inject(I18nService);
  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');

  protected readonly navId = 'site-nav';
  protected readonly open = signal(false);

  protected readonly locale = this.i18n.locale;
  protected readonly name = computed(() => this.i18n.content().hero.name);
  protected readonly nav = computed(() => this.i18n.content().nav);
  protected readonly a11y = computed(() => this.i18n.content().a11y);

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected closeFromKeyboard(): void {
    if (this.open()) {
      this.open.set(false);
      this.menuButton().nativeElement.focus();
    }
  }
}
