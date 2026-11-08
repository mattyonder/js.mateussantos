import { Title } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTENT } from '../../content';
import { LOCALES, LOCALE_INFO } from '../../core/i18n/locales';
import { SeoService } from '../../core/seo/seo.service';

/**
 * 404 page. A missing URL has no language to infer, so the message is shown in
 * every supported language (each block has its own `lang`), with a link home in each.
 */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  protected readonly entries = LOCALES.map((code) => ({
    info: LOCALE_INFO[code],
    text: CONTENT[code].notFound,
  }));

  constructor() {
    inject(Title).setTitle('404');
    inject(SeoService).markNoIndex();
  }
}
