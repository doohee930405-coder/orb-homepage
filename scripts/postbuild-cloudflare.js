import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const clientDir = path.join(distDir, 'client');

if (!fs.existsSync(clientDir)) {
  console.error('[postbuild-cloudflare] dist/client directory does not exist!');
  process.exit(1);
}

console.log('[postbuild-cloudflare] Optimizing build output for Cloudflare Pages...');

// Helper: safe copy file
function safeCopy(src, dest) {
  if (fs.existsSync(src)) {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

// 1. Ensure /columns/index.html exists for Cloudflare Pages directory routing
safeCopy(path.join(clientDir, 'columns.html'), path.join(clientDir, 'columns', 'index.html'));
safeCopy(path.join(clientDir, 'columns.rsc'), path.join(clientDir, 'columns', 'index.rsc'));

// 2. Ensure /en/index.html exists
safeCopy(path.join(clientDir, 'en.html'), path.join(clientDir, 'en', 'index.html'));
safeCopy(path.join(clientDir, 'en.rsc'), path.join(clientDir, 'en', 'index.rsc'));

// 3. Ensure /admin/columns/index.html exists
safeCopy(path.join(clientDir, 'admin', 'columns.html'), path.join(clientDir, 'admin', 'columns', 'index.html'));
safeCopy(path.join(clientDir, 'admin', 'columns.rsc'), path.join(clientDir, 'admin', 'columns', 'index.rsc'));

// Cloudflare Pages redirects *.html to its clean URL. Without directory
// indexes, the privacy rewrites loop back to themselves.
safeCopy(path.join(clientDir, 'privacy.html'), path.join(clientDir, 'privacy', 'index.html'));
safeCopy(path.join(clientDir, 'privacy.rsc'), path.join(clientDir, 'privacy', 'index.rsc'));
safeCopy(path.join(clientDir, 'en', 'privacy.html'), path.join(clientDir, 'en', 'privacy', 'index.html'));
safeCopy(path.join(clientDir, 'en', 'privacy.rsc'), path.join(clientDir, 'en', 'privacy', 'index.rsc'));

// 4. Create dual routes (both slug.html and slug/index.html) for all column subpages
const columnsDir = path.join(clientDir, 'columns');
if (fs.existsSync(columnsDir)) {
  const columnFiles = fs.readdirSync(columnsDir);
  for (const file of columnFiles) {
    if (file.endsWith('.html') && file !== 'index.html') {
      const slug = file.slice(0, -5);
      const subDir = path.join(columnsDir, slug);
      safeCopy(path.join(columnsDir, file), path.join(subDir, 'index.html'));
      const rscFile = `${slug}.rsc`;
      if (fs.existsSync(path.join(columnsDir, rscFile))) {
        safeCopy(path.join(columnsDir, rscFile), path.join(subDir, 'index.rsc'));
      }
    }
  }
}

// 5. Create dual routes for treatments
const treatmentsDir = path.join(clientDir, 'treatments');
if (fs.existsSync(treatmentsDir)) {
  const treatmentFiles = fs.readdirSync(treatmentsDir);
  for (const file of treatmentFiles) {
    if (file.endsWith('.html') && file !== 'index.html') {
      const slug = file.slice(0, -5);
      const subDir = path.join(treatmentsDir, slug);
      safeCopy(path.join(treatmentsDir, file), path.join(subDir, 'index.html'));
      const rscFile = `${slug}.rsc`;
      if (fs.existsSync(path.join(treatmentsDir, rscFile))) {
        safeCopy(path.join(treatmentsDir, rscFile), path.join(subDir, 'index.rsc'));
      }
    }
  }
}

// 6. Ensure _redirects and _headers exist in dist/client
const redirectsSrc = path.join(rootDir, 'public', '_redirects');
if (fs.existsSync(redirectsSrc)) {
  safeCopy(redirectsSrc, path.join(clientDir, '_redirects'));
}

const headersSrc = path.join(rootDir, 'public', '_headers');
if (fs.existsSync(headersSrc)) {
  safeCopy(headersSrc, path.join(clientDir, '_headers'));
}

// 7. Vinext does not emit app/sitemap.ts for static builds. Build a sitemap
// from the canonical URLs in the pages that were actually prerendered.
const siteOrigin = 'https://www.orbmed.co.kr';
const canonicalUrls = new Set();

function collectCanonicalUrls(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectCanonicalUrls(filePath);
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;

    const html = fs.readFileSync(filePath, 'utf8');
    if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) continue;
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    if (!canonical) continue;

    const url = new URL(canonical);
    if (url.origin !== siteOrigin || url.search || url.hash) continue;
    const pathname = url.pathname;
    if (!(
      pathname === '/' || pathname === '/columns' || pathname === '/en' ||
      pathname === '/privacy' || pathname === '/en/privacy' ||
      /^\/columns\/[^/]+$/.test(pathname) ||
      /^\/(?:en\/)?treatments\/[^/]+$/.test(pathname)
    )) continue;
    canonicalUrls.add(url.href);
  }
}

collectCanonicalUrls(clientDir);
if (canonicalUrls.size < 50) {
  throw new Error(`[postbuild-cloudflare] Only ${canonicalUrls.size} canonical URLs found; refusing to write an incomplete sitemap.`);
}
const xmlEscape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...[...canonicalUrls].sort().map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`),
  '</urlset>',
  '',
].join('\n');
fs.writeFileSync(path.join(clientDir, 'sitemap.xml'), sitemapXml);
console.log(`[postbuild-cloudflare] Wrote ${canonicalUrls.size} canonical URLs to sitemap.xml`);

// 8. Mirror dist/client directly into dist/ root so users can upload EITHER 'dist' OR 'dist/client'
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Avoid copying into self if dest is inside src or vice versa
      if (srcPath !== dest && destPath !== src) {
        copyDirRecursive(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy client assets to dist root (except server and .openai)
const clientEntries = fs.readdirSync(clientDir, { withFileTypes: true });
for (const entry of clientEntries) {
  const srcPath = path.join(clientDir, entry.name);
  const destPath = path.join(distDir, entry.name);
  if (entry.name === 'server' || entry.name === '.openai' || entry.name === 'client') continue;

  if (entry.isDirectory()) {
    copyDirRecursive(srcPath, destPath);
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
}

console.log('[postbuild-cloudflare] Successfully prepared dist and dist/client for Cloudflare Pages deployment!');
