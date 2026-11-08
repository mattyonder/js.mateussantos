import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TagTone = 'primary' | 'neutral';

/** Small pill for technologies and keywords. The text is projected. */
@Component({
  selector: 'app-tag',
  template: '<ng-content />',
  styleUrl: './tag.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'tone()',
  },
})
export class Tag {
  readonly tone = input<TagTone>('primary');
}
