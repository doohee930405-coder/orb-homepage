import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Unconditional bypass for SEO and static assets with guaranteed 200 OK and headers
  if (pathname === '/robots.txt') {
    const response = NextResponse.next();
    response.headers.set('Content-Type', 'text/plain; charset=utf-8');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('X-Robots-Tag', 'all');
    return response;
  }

  if (pathname === '/sitemap.xml') {
    const response = NextResponse.next();
    response.headers.set('Content-Type', 'application/xml; charset=utf-8');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('X-Robots-Tag', 'all');
    return response;
  }

  if (pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (SEO robots file)
     * - sitemap.xml (SEO sitemap file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
