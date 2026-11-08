import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import type { SiteContent, StatId } from '../../content/types';
import { I18nService } from '../../core/i18n/i18n.service';
import { Reveal } from '../../ui/reveal/reveal';

/**
 * The count behind each stat. Every number comes from a list that is ALSO rendered somewhere on
 * the page, so the strip can never disagree with the page (a trap of hand-typed figures).
 */
export function statValue(id: StatId, content: SiteContent): number {
  switch (id) {
    case 'systems':
      return content.projects.worked.systems.length;
    case 'roles':
      return content.experience.positions.length;
    case 'technologies':
      return content.skills.groups.find((group) => group.id === 'technical')?.items.length ?? 0;
    case 'languages':
      return content.education.languages.length;
  }
}

/** "At a glance" strip under the hero: four facts, each one a count of what the page lists. */
@Component({
  selector: 'app-stats',
  imports: [Reveal],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stats {
  private readonly i18n = inject(I18nService);

  protected readonly label = computed(() => this.i18n.content().stats.label);
  protected readonly items = computed(() => {
    const content = this.i18n.content();
    return content.stats.items.map((item) => ({
      id: item.id,
      caption: item.caption,
      value: statValue(item.id, content),
    }));
  });
}
