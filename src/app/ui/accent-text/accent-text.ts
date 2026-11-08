import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface AccentParts {
  readonly before: string;
  readonly accent: string;
  readonly after: string;
}

/**
 * Splits `text` around the FIRST occurrence of `accent`. When `accent` is missing or does not
 * occur in `text`, everything is returned as `before` (so a content mistake never hides text).
 */
export function splitAccent(text: string, accent: string | undefined): AccentParts {
  const index = accent ? text.indexOf(accent) : -1;
  if (!accent || index < 0) {
    return { before: text, accent: '', after: '' };
  }
  return {
    before: text.slice(0, index),
    accent,
    after: text.slice(index + accent.length),
  };
}

/**
 * Text with ONE word set in the accent italic. The accent is purely visual: it is a plain
 * `<span>`, not `<em>`, so screen readers read the text as one unbroken string, and the
 * element's `textContent` is exactly `text`.
 */
@Component({
  selector: 'app-accent-text',
  template:
    '{{ parts().before }}@if (parts().accent) {<span class="accent">{{ parts().accent }}</span>}{{ parts().after }}',
  styleUrl: './accent-text.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccentText {
  readonly text = input.required<string>();
  readonly accent = input<string>();

  protected readonly parts = computed(() => splitAccent(this.text(), this.accent()));
}
