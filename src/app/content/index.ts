import type { Locale } from '../core/i18n/locales';
import { EN } from './en';
import { PT } from './pt';
import type { SiteContent } from './types';

export const CONTENT: Readonly<Record<Locale, SiteContent>> = { pt: PT, en: EN };
