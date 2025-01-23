import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
 
const locales = ['en', 'pl'];
const defaultLocale = locales[0];
 
// Get the preferred locale, similar to the above or using a library
function getLocale(req) {
  const headers = Object.fromEntries(req.headers);
  const languages = new Negotiator({ headers }).languages();

  return match(languages, locales, defaultLocale);
}
 
export function middleware(request) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
 
  if (pathnameHasLocale) return;
 
  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  return NextResponse.redirect(request.nextUrl);
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};