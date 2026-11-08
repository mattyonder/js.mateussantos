import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Section } from '../../ui/section/section';

@Component({
  selector: 'app-about',
  imports: [Section],
  template: `
    <app-section sectionId="about" [heading]="about().heading">
      <p class="summary">{{ about().summary }}</p>
    </app-section>
  `,
  styles: `
    .summary {
      max-width: 48rem;
      font-size: var(--text-lg);
      line-height: var(--leading-normal);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  private readonly i18n = inject(I18nService);

  protected readonly about = computed(() => this.i18n.content().about);
}
