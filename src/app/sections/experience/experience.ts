import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Card } from '../../ui/card/card';
import { Section } from '../../ui/section/section';

/** Timeline of positions, most recent first (the order of the content file). */
@Component({
  selector: 'app-experience',
  imports: [Section, Card],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {
  private readonly i18n = inject(I18nService);

  protected readonly experience = computed(() => this.i18n.content().experience);
}
