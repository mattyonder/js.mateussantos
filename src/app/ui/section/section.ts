import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { AccentText } from '../accent-text/accent-text';
import { Reveal } from '../reveal/reveal';

/**
 * Page section with a numbered header: `02 ── CAREER` above the `<h2>`.
 *
 * Renders a landmark `<section>` labelled by its own `<h2>`, so screen readers announce it by
 * name. `sectionId` is the anchor target (language-neutral, e.g. "experience"); `heading` comes
 * from the content files.
 *
 * The number and the small label come from the navigation list of the content file
 * (`nav[].eyebrow`), so the header always matches the menu order. The `eyebrow` input overrides
 * the label (used by the design-system showcase). The number is decorative (`aria-hidden`);
 * the label is plain text. Use the Hero's own `<h1>` for the top of the page.
 */
@Component({
  selector: 'app-section',
  imports: [Reveal, AccentText],
  templateUrl: './section.html',
  styleUrl: './section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Section {
  private readonly i18n = inject(I18nService);

  readonly sectionId = input.required<string>();
  readonly heading = input.required<string>();
  /** Word or phrase INSIDE `heading` shown in the accent italic (visual only). */
  readonly accent = input<string>();
  /** Optional override of the small label above the heading. */
  readonly eyebrow = input<string>();
  /** Tinted background, used to alternate sections and give the page rhythm. */
  readonly subtle = input(false, { transform: booleanAttribute });

  protected readonly headingId = computed(() => `${this.sectionId()}-heading`);

  private readonly navIndex = computed(() =>
    this.i18n.content().nav.findIndex((item) => item.id === this.sectionId()),
  );

  /** "01", "02"... following the menu order; null for sections that are not in the menu. */
  protected readonly number = computed(() => {
    const index = this.navIndex();
    return index < 0 ? null : String(index + 1).padStart(2, '0');
  });

  protected readonly label = computed(
    () => this.eyebrow() ?? this.i18n.content().nav[this.navIndex()]?.eyebrow ?? null,
  );
}
