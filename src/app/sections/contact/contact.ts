import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PROFILE, RESUME_PATH } from '../../content/profile';
import { I18nService } from '../../core/i18n/i18n.service';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { NewTabHint } from '../../ui/new-tab-hint/new-tab-hint';
import { Reveal } from '../../ui/reveal/reveal';
import { Section } from '../../ui/section/section';

/**
 * Public contact: a short professional statement, the two main actions (e-mail, résumé) and the
 * public links. No form and no phone number.
 *
 * The statement says conversations about opportunities are welcome. That is the owner's decision
 * (2026-11-08) and it lives ONLY here: not in the hero, the meta tags or the structured data.
 * The e-mail is shown in plain text on purpose (it is already public on LinkedIn/GitHub, and
 * obfuscation would hurt accessibility).
 */
@Component({
  selector: 'app-contact',
  imports: [Section, Button, Icon, NewTabHint, Reveal],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly i18n = inject(I18nService);

  protected readonly contact = computed(() => this.i18n.content().contact);
  /** Same label as the hero's résumé button: one wording for one action. */
  protected readonly resumeLabel = computed(() => this.i18n.content().hero.resumeLabel);
  protected readonly resumeHref = computed(() => RESUME_PATH[this.i18n.locale()]);
  protected readonly email = PROFILE.email;
  protected readonly mailto = `mailto:${PROFILE.email}`;
  protected readonly profiles = PROFILE.profiles;
}
