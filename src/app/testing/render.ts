import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { I18nService } from '../core/i18n/i18n.service';
import type { Locale } from '../core/i18n/locales';

/**
 * Renders a component in the given language, with a catch-all router so
 * `routerLink` works without real routes. Shared by the component specs.
 */
export function render<T>(component: Type<T>, locale: Locale): ComponentFixture<T> {
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: '**', children: [] }])],
  });
  TestBed.inject(I18nService).setLocale(locale);
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

export function root<T>(fixture: ComponentFixture<T>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

export function texts(elements: ArrayLike<Element>): string[] {
  return Array.from(elements).map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim());
}
