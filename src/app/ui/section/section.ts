import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

/**
 * Page section with a heading. Renders a landmark `<section>` labelled by its
 * own `<h2>`, so screen readers announce it by name. `sectionId` is the anchor
 * target (language-neutral, e.g. "experience"); `heading` and `eyebrow` come
 * from the content files. Use the Hero's own `<h1>` for the top of the page.
 */
@Component({
  selector: 'app-section',
  templateUrl: './section.html',
  styleUrl: './section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Section {
  readonly sectionId = input.required<string>();
  readonly heading = input.required<string>();
  readonly eyebrow = input<string>();
  /** Tinted background, used to alternate sections and give the page rhythm. */
  readonly subtle = input(false, { transform: booleanAttribute });

  protected readonly headingId = computed(() => `${this.sectionId()}-heading`);
}
