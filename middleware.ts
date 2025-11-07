// middleware.ts 

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
// Import your config from the correct path based on your structure
import { locales, localePrefix, defaultLocale } from './i18n/routing'; 

// 1. Define the intl middleware using your routing configuration
const handleIntlRouting = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  // 'routing' property is not needed here in v3 setup
});

// 2. Define a matcher for the admin path (this is where you'd check auth)
const protectedAdminPathnames = ['/admin'];

function isProtectedRoute(pathname: string) {
    // This checks if the pathname starts with any protected route name.
    // Note: This logic assumes you are checking the path *before* next-intl potentially modifies it,
    // which works fine in this middleware flow.
    return protectedAdminPathnames.some((p) => pathname.startsWith(p));
}

export default function middleware(request: NextRequest) {
  // A simple way to get the current localized pathname before locale is applied by next-intl
  const pathname = request.nextUrl.pathname; 

  // --- Authentication Logic (Example) ---
  // Check if the user is accessing a protected route
  // The logic below uses a simple cookie check as an example.
  if (isProtectedRoute(pathname)) {
    // Check if the user is authenticated (e.g., check a cookie or token)
    const isAuthenticated = request.cookies.has('admin_token'); // Replace with your actual auth check

    if (!isAuthenticated) {
      // Redirect unauthenticated users to the login page (e.g., home page)
      // The destination path '/' will be automatically localized by next-intl/middleware afterward.
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Internationalization Logic (If authenticated or not on admin page) ---
  // Pass the request to the next-intl handler
  return handleIntlRouting(request);
}

// 3. Configure the matcher for the middleware
// This tells Next.js which paths should run this middleware file.
export const config = {
  // Updated matcher to exclude common image extensions:
  matcher: [
    // Match all paths except those starting with:
    // - api, _next/static, _next/image (Next.js internals)
    // - favicon.ico (standard icon)
    // - Common image file extensions
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
  ],
};
