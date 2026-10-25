export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Unconditional bypass for robots.txt and sitemap.xml
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
    return context.next();
  }

  return context.next();
}
