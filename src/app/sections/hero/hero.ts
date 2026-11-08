import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROFILE, RESUME_PATH } from '../../content/profile';
import { I18nService } from '../../core/i18n/i18n.service';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { NewTabHint } from '../../ui/new-tab-hint/new-tab-hint';

/**
 * Top of the page: answers "who, what area, how to reach, where is the résumé"
 * in the first screen. The only `<h1>` of the page lives here.
 */
@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, RouterLink, Button, Icon, NewTabHint],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly i18n = inject(I18nService);

  protected readonly hero = computed(() => this.i18n.content().hero);
  protected readonly locale = this.i18n.locale;
  /** Each language downloads its own résumé PDF. */
  protected readonly resumeHref = computed(() => RESUME_PATH[this.i18n.locale()]);
  protected readonly photo = PROFILE.photo;
  protected readonly profiles = PROFILE.profiles;
}
