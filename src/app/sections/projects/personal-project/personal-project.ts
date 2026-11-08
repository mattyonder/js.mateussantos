import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PersonalProject } from '../../../content/types';
import { Card } from '../../../ui/card/card';
import { Icon } from '../../../ui/icon/icon';
import { NewTabHint } from '../../../ui/new-tab-hint/new-tab-hint';
import { Tag } from '../../../ui/tag/tag';

/**
 * One personal-project slot. A `coming-soon` item renders only the "coming soon"
 * label (it deliberately has no name, description or stack to show); a
 * `published` item renders the real project. Swapping one for the other is an
 * edit to the content file only.
 */
@Component({
  selector: 'app-personal-project',
  imports: [Card, Icon, NewTabHint, Tag],
  templateUrl: './personal-project.html',
  styleUrl: './personal-project.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalProjectCard {
  readonly project = input.required<PersonalProject>();
  readonly comingSoonLabel = input.required<string>();
}
