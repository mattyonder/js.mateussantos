import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '../ui/button/button';
import { Card } from '../ui/card/card';
import { Section } from '../ui/section/section';
import { Tag } from '../ui/tag/tag';
import { ThemeToggle } from '../ui/theme-toggle/theme-toggle';

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

/**
 * DEVELOPMENT-ONLY showcase of the design system, routed at /design-system when
 * `isDevMode()` is true. It is not part of the production build, so the
 * hard-coded English strings below are intentional and do not violate the
 * "no fixed strings in components" rule (which covers shipped UI).
 */
@Component({
  selector: 'app-design-system',
  imports: [Button, Card, Section, Tag, ThemeToggle],
  templateUrl: './design-system.html',
  styleUrl: './design-system.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignSystem {
  protected readonly purple = STEPS.map((step) => `--purple-${step}`);
  protected readonly neutral = ['0', ...STEPS].map((step) => `--neutral-${step}`);
  protected readonly semantic = [
    '--color-bg',
    '--color-bg-subtle',
    '--color-surface',
    '--color-surface-raised',
    '--color-text',
    '--color-text-muted',
    '--color-border',
    '--color-border-strong',
    '--color-primary',
    '--color-primary-hover',
    '--color-primary-active',
    '--color-primary-subtle',
    '--color-link',
    '--color-focus-ring',
    '--color-tag-bg',
    '--color-success',
    '--color-warning',
    '--color-danger',
  ];
}
