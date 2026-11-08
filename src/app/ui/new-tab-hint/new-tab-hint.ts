import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

/**
 * Visually hidden text for links that open in a new tab, so screen reader users
 * are not surprised (WCAG G201). Place it inside the link, after its text.
 */
@Component({
  selector: 'app-new-tab-hint',
  template: '<span class="visually-hidden">{{ text() }}</span>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTabHint {
  private readonly i18n = inject(I18nService);

  // Leading space keeps it separate from the link text it follows.
  protected readonly text = computed(() => ` ${this.i18n.content().a11y.opensInNewTab}`);
}
