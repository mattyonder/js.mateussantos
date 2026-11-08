import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PROFILE } from '../../content/profile';
import { I18nService } from '../../core/i18n/i18n.service';
import { Icon } from '../../ui/icon/icon';
import { NewTabHint } from '../../ui/new-tab-hint/new-tab-hint';
import { Section } from '../../ui/section/section';
import { Reveal } from '../../ui/reveal/reveal';

/**
 * Public contact: e-mail, LinkedIn and GitHub. No form and no phone number.
 * The e-mail is shown in plain text on purpose (owner's decision: it is already
 * public on LinkedIn/GitHub, and obfuscation would hurt accessibility).
 */
@Component({
  selector: 'app-contact',
  imports: [Section, Icon, NewTabHint, Reveal],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly i18n = inject(I18nService);

  protected readonly contact = computed(() => this.i18n.content().contact);
  protected readonly email = PROFILE.email;
  protected readonly mailto = `mailto:${PROFILE.email}`;
  protected readonly profiles = PROFILE.profiles;
}
