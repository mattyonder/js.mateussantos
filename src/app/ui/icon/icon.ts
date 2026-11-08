import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  'github' | 'linkedin' | 'mail' | 'download' | 'map-pin' | 'menu' | 'close' | 'code' | 'arrow-up';

/**
 * Stroke icons as inline SVG paths (no icon library, no extra request).
 * Shapes follow Lucide (https://lucide.dev, ISC licence), 24x24 grid.
 */
const PATHS: Readonly<Record<IconName, readonly string[]>> = {
  github: [
    'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4',
    'M9 18c-4.51 2-5-2-7-2',
  ],
  linkedin: [
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
    'M2 9h4v12H2z',
    'M6 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  ],
  mail: [
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',
  ],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  'map-pin': [
    'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z',
    'M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  ],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  code: ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'],
  'arrow-up': ['M12 19V5', 'm5 12 7-7 7 7'],
};

/** Decorative icon: hidden from assistive technology. Put the meaning in nearby text. */
@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();

  protected readonly paths = computed(() => PATHS[this.name()]);
}
