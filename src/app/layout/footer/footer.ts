import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PROFILE } from '../../content/profile';
import { I18nService } from '../../core/i18n/i18n.service';
import { NewTabHint } from '../../ui/new-tab-hint/new-tab-hint';

@Component({
  selector: 'app-footer',
  imports: [NewTabHint],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  private readonly i18n = inject(I18nService);

  protected readonly footer = computed(() => this.i18n.content().footer);
  protected readonly name = PROFILE.name;
  protected readonly repositoryUrl = PROFILE.repositoryUrl;
  // Evaluated when the page is built/prerendered, then again in the browser.
  protected readonly year = new Date().getFullYear();
}
