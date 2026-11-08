import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Section } from '../../ui/section/section';
import { Reveal } from '../../ui/reveal/reveal';

@Component({
  selector: 'app-education',
  imports: [Section, Reveal],
  templateUrl: './education.html',
  styleUrl: './education.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Education {
  private readonly i18n = inject(I18nService);

  protected readonly education = computed(() => this.i18n.content().education);
}
