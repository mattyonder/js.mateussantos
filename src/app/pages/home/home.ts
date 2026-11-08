import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Header } from '../../layout/header/header';
import { MAIN_CONTENT_ID, SkipLink } from '../../layout/skip-link/skip-link';

/**
 * The single page, served at `/pt` and `/en`. The router reuses this component
 * when only the language changes, so switching language updates the text in
 * place and the scroll position is kept.
 *
 * Stage 3 only renders the hero basics; stage 4 adds all sections.
 */
@Component({
  selector: 'app-home',
  imports: [SkipLink, Header],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly i18n = inject(I18nService);

  protected readonly mainId = MAIN_CONTENT_ID;
  protected readonly hero = computed(() => this.i18n.content().hero);
}
