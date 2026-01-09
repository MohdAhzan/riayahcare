// middleware.ts 

import createIntlMiddleware from "next-intl/middleware"
import { locales, localePrefix, defaultLocale } from "./i18n/routing"

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix,
})

export default intlMiddleware

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}

