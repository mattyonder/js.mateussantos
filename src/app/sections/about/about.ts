import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Card } from '../../ui/card/card';
import { Reveal } from '../../ui/reveal/reveal';
import { Section } from '../../ui/section/section';

/**
 * About, laid out as a "bento" grid: the résumé summary (kept word for word) in one large card
 * and four small highlight cards next to it. Each highlight is a fragment of the résumé, so the
 * section is easier to scan without adding any claim that the résumé does not make.
 */
@Component({
  selector: 'app-about',
  imports: [Section, Card, Reveal],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  private readonly i18n = inject(I18nService);

  protected readonly about = computed(() => this.i18n.content().about);
}
