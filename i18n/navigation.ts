//import {createNavigation} from 'next-intl/navigation';
//import {routing} from './routing';
//
//export const {Link, redirect, usePathname, useRouter} =
//  createNavigation(routing);
//
//

// i18n/navigation.ts

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing'; 

// Extract the localized Link, redirect, useRouter, etc.
export const { Link, redirect, usePathname, useRouter, getPathname } = 
  createNavigation(routing);

// Export locales/prefix for use in middleware.ts or layout.tsx
export { locales, localePrefix, defaultLocale } from './routing';
