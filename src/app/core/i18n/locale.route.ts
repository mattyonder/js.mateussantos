import { inject } from '@angular/core';
import type { CanMatchFn, ResolveFn } from '@angular/router';
import { I18nService } from './i18n.service';
import { FALLBACK_LOCALE, isLocale, type Locale } from './locales';

/** Only `/pt` and `/en` match `/:lang`; anything else falls through to the 404 route. */
export const supportedLocaleGuard: CanMatchFn = (_route, segments) => isLocale(segments[0]?.path);

/**
 * Runs before the page activates (and again whenever `:lang` changes), so the
 * content, `<html lang>` and SEO tags are correct on the first render.
 */
export const localeResolver: ResolveFn<Locale> = (route) => {
  const param = route.paramMap.get('lang');
  const locale = isLocale(param) ? param : FALLBACK_LOCALE;
  inject(I18nService).setLocale(locale);
  return locale;
};
