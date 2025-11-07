
import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'ar'] as const;
export const localePrefix = 'always'; // or 'as-needed' depending on your preference
export const defaultLocale = 'en';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  // You don't need a specific pathnames map if paths are identical across locales
});

//import {defineRouting} from 'next-intl/routing';
//
//export const routing = defineRouting({
//  locales: ['en', 'ar'],
//  defaultLocale: 'en'
//});
