import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Card } from '../../ui/card/card';
import { Section } from '../../ui/section/section';
import { Tag } from '../../ui/tag/tag';
import { Reveal } from '../../ui/reveal/reveal';

@Component({
  selector: 'app-skills',
  imports: [Section, Card, Tag, Reveal],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  private readonly i18n = inject(I18nService);

  protected readonly skills = computed(() => this.i18n.content().skills);
}
