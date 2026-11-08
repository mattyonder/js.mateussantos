import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

export const MAIN_CONTENT_ID = 'main';

/**
 * "Skip to content" link, the first focusable element on the page
 * (WCAG 2.2 SC 2.4.1 Bypass Blocks). Visible only while focused.
 *
 * The `href` is absolute (`/pt#main`) because the document has `<base href="/">`:
 * a bare `#main` would resolve to `/#main` and leave the page. The click handler
 * moves keyboard focus to <main>, which anchor scrolling alone does not do.
 */
@Component({
  selector: 'app-skip-link',
  templateUrl: './skip-link.html',
  styleUrl: './skip-link.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkipLink {
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(I18nService);

  protected readonly href = computed(() => `/${this.i18n.locale()}#${MAIN_CONTENT_ID}`);
  protected readonly label = computed(() => this.i18n.content().a11y.skipToContent);

  protected skip(event: Event): void {
    const target = this.document.getElementById(MAIN_CONTENT_ID);
    if (target) {
      event.preventDefault();
      target.focus();
    }
  }
}
