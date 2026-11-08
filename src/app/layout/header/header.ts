import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SectionId } from '../../content/types';
import { I18nService } from '../../core/i18n/i18n.service';
import { Icon } from '../../ui/icon/icon';
import { LanguageSwitch } from '../../ui/language-switch/language-switch';
import { ThemeToggle } from '../../ui/theme-toggle/theme-toggle';

/**
 * Sticky header with the section navigation. From the `lg` breakpoint the links
 * are inline; below it they sit in a disclosure panel opened by a menu button
 * (`aria-expanded` + `aria-controls`). Escape closes the panel and returns focus
 * to the button. Links use `routerLink` + `fragment` because a bare `#id` would
 * resolve against `<base href="/">` and leave the page.
 *
 * The link of the section being read is marked with `aria-current="true"` and highlighted, so
 * a long page keeps its sense of place. The section is chosen from the scroll position: the last
 * one whose top has passed a reading line below the header (or the last one at the page bottom,
 * where the short contact section would never reach that line).
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, Icon, LanguageSwitch, ThemeToggle],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard()',
  },
})
export class Header {
  private readonly i18n = inject(I18nService);
  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);

  protected readonly navId = 'site-nav';
  protected readonly open = signal(false);
  /** Section currently being read; null while the hero is on screen. */
  protected readonly activeId = signal<SectionId | null>(null);

  protected readonly locale = this.i18n.locale;
  protected readonly name = computed(() => this.i18n.content().hero.name);
  protected readonly nav = computed(() => this.i18n.content().nav);
  protected readonly a11y = computed(() => this.i18n.content().a11y);

  constructor() {
    // Taken here, in the injection context: callbacks of afterNextRender may not have one.
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const win = this.document.defaultView;
      if (!win) return;

      let frame = 0;
      const schedule = () => {
        if (frame) return;
        frame = win.requestAnimationFrame(() => {
          frame = 0;
          this.updateActiveSection(win);
        });
      };
      win.addEventListener('scroll', schedule, { passive: true });
      win.addEventListener('resize', schedule, { passive: true });
      this.updateActiveSection(win);

      destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', schedule);
        win.removeEventListener('resize', schedule);
        if (frame) win.cancelAnimationFrame(frame);
      });
    });
  }

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected close(): void {
    this.open.set(false);
  }

  /** A click names the section at once; the scroll handler then confirms it. */
  protected select(id: SectionId): void {
    this.activeId.set(id);
    this.close();
  }

  protected closeFromKeyboard(): void {
    if (this.open()) {
      this.open.set(false);
      this.menuButton().nativeElement.focus();
    }
  }

  private updateActiveSection(win: Window): void {
    const sections = Array.from(this.document.querySelectorAll<HTMLElement>('main section[id]'));
    if (sections.length === 0) return;

    const readingLine = this.host.nativeElement.offsetHeight + win.innerHeight * 0.3;
    let active: HTMLElement | null = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) active = section;
    }

    const root = this.document.documentElement;
    const atBottom = win.scrollY + win.innerHeight >= root.scrollHeight - 2;
    if (atBottom) active = sections[sections.length - 1];

    this.activeId.set((active?.id as SectionId | undefined) ?? null);
  }
}
