import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PROFILE } from '../../content/profile';
import { I18nService } from '../../core/i18n/i18n.service';
import { Button } from '../../ui/button/button';
import { Card } from '../../ui/card/card';
import { Icon } from '../../ui/icon/icon';
import { NewTabHint } from '../../ui/new-tab-hint/new-tab-hint';
import { Section } from '../../ui/section/section';
import { Tag } from '../../ui/tag/tag';
import { PersonalProjectCard } from './personal-project/personal-project';
import { Reveal } from '../../ui/reveal/reveal';

/**
 * Two parts: the (government health) systems the owner worked on, shown with
 * role and stack only, and the personal projects, currently placeholders.
 */
@Component({
  selector: 'app-projects',
  imports: [Section, Card, Tag, Button, Icon, NewTabHint, PersonalProjectCard, Reveal],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  private readonly i18n = inject(I18nService);

  protected readonly projects = computed(() => this.i18n.content().projects);
  protected readonly githubUrl = PROFILE.githubUrl;
}
