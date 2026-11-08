import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

export type CardVariant = 'default' | 'placeholder' | 'featured';

/**
 * Surface container. `placeholder` has a dashed border for "coming soon" slots.
 * `interactive` adds a hover affordance; it does not make the card focusable:
 * put a real link or button inside it.
 */
@Component({
  selector: 'app-card',
  template: '<ng-content />',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-interactive]': 'interactive() ? "" : null',
  },
})
export class Card {
  readonly variant = input<CardVariant>('default');
  readonly interactive = input(false, { transform: booleanAttribute });
}
