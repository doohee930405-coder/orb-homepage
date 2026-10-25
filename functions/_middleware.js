export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Unconditional bypass and guarantee for robots.txt, sitemap.xml, favicon.ico
  if (
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico'
  ) {
    const res = await context.next();
    const headers = new Headers(res.headers);
    if (pathname === '/robots.txt') {
      headers.set('Content-Type', 'text/plain; charset=utf-8');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('X-Robots-Tag', 'all');
    } else if (pathname === '/sitemap.xml') {
      headers.set('Content-Type', 'application/xml; charset=utf-8');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('X-Robots-Tag', 'all');
    }
    return new Response(res.body, {
      status: 200,
      statusText: 'OK',
      headers,
    });
  }

  return context.next();
}
