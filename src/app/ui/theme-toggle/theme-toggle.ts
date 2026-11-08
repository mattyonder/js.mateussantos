import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';

/**
 * Light/dark switch. `label` names the control (e.g. "Dark theme") and stays
 * constant; the on/off state is exposed with `aria-pressed`, which is the
 * pattern for toggle buttons (a label that changes AND aria-pressed would be
 * announced twice). The icon is swapped by CSS from `[data-theme]`, so the
 * prerendered HTML and hydrated DOM always match.
 */
@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  private readonly themeService = inject(ThemeService);

  readonly label = input.required<string>();

  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');

  protected toggle(): void {
    this.themeService.toggle();
  }
}
