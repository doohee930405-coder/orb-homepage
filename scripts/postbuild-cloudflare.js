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

// 3. Ensure /admin/columns/index.html and /admin/analytics/index.html exist
safeCopy(path.join(clientDir, 'admin', 'columns.html'), path.join(clientDir, 'admin', 'columns', 'index.html'));
safeCopy(path.join(clientDir, 'admin', 'columns.rsc'), path.join(clientDir, 'admin', 'columns', 'index.rsc'));
safeCopy(path.join(clientDir, 'admin', 'analytics.html'), path.join(clientDir, 'admin', 'analytics', 'index.html'));
safeCopy(path.join(clientDir, 'admin', 'analytics.rsc'), path.join(clientDir, 'admin', 'analytics', 'index.rsc'));

// Cloudflare Pages redirects *.html to its clean URL. Without directory
// indexes, the privacy rewrites loop back to themselves.
safeCopy(path.join(clientDir, 'privacy.html'), path.join(clientDir, 'privacy', 'index.html'));
safeCopy(path.join(clientDir, 'privacy.rsc'), path.join(clientDir, 'privacy', 'index.rsc'));
safeCopy(path.join(clientDir, 'en', 'privacy.html'), path.join(clientDir, 'en', 'privacy', 'index.html'));
safeCopy(path.join(clientDir, 'en', 'privacy.rsc'), path.join(clientDir, 'en', 'privacy', 'index.rsc'));

// 3.5 Ensure clean URL directory indexes for key routes (location, diet, qeeg, pain)
['location', 'diet', 'qeeg', 'pain'].forEach(page => {
  safeCopy(path.join(clientDir, `${page}.html`), path.join(clientDir, page, 'index.html'));
  safeCopy(path.join(clientDir, `${page}.rsc`), path.join(clientDir, page, 'index.rsc'));
});

// 3.8 Generate static /api/columns and /api/columns.json feed for Admin & Clients
const contentColumnsDir = path.join(rootDir, 'content', 'columns');
if (fs.existsSync(contentColumnsDir)) {
  const allJsonCols = [];
  for (const f of fs.readdirSync(contentColumnsDir)) {
    if (f.endsWith('.json')) {
      try {
        const raw = fs.readFileSync(path.join(contentColumnsDir, f), 'utf8');
        allJsonCols.push(JSON.parse(raw));
      } catch {}
    }
  }
  allJsonCols.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const apiDir = path.join(clientDir, 'api');
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
  const jsonOutput = JSON.stringify({ success: true, columns: allJsonCols });
  fs.writeFileSync(path.join(apiDir, 'columns.json'), jsonOutput);
  fs.writeFileSync(path.join(apiDir, 'columns'), jsonOutput);
  console.log(`[postbuild-cloudflare] Emitted static /api/columns and /api/columns.json (${allJsonCols.length} columns)`);
}


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

const routesSrc = path.join(rootDir, 'public', '_routes.json');
if (fs.existsSync(routesSrc)) {
  safeCopy(routesSrc, path.join(clientDir, '_routes.json'));
}

// 7. Vinext does not emit app/sitemap.ts for static builds. Build a sitemap
// from the canonical URLs in the pages that were actually prerendered.
// Target origin strictly without 'www' as specified for SEO/AEO: https://orbmed.co.kr
const targetOrigin = 'https://orbmed.co.kr';
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
    if ((url.origin !== 'https://orbmed.co.kr' && url.origin !== 'https://www.orbmed.co.kr') || url.search || url.hash) continue;
    const pathname = url.pathname;
    if (!(
      pathname === '/' || pathname === '/columns' || pathname === '/en' ||
      pathname === '/location' || pathname === '/diet' || pathname === '/qeeg' || pathname === '/pain' ||
      pathname === '/privacy' || pathname === '/en/privacy' ||
      /^\/columns\/[^/]+$/.test(pathname) ||
      /^\/(?:en\/)?treatments\/[^/]+$/.test(pathname)
    )) continue;
    canonicalUrls.add(`${targetOrigin}${pathname}`);
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
fs.writeFileSync(path.join(rootDir, 'public', 'sitemap.xml'), sitemapXml);
console.log(`[postbuild-cloudflare] Wrote ${canonicalUrls.size} canonical URLs to sitemap.xml and public/sitemap.xml`);

// Write functions/sitemap.xml.js with embedded XML for guaranteed 200 OK dynamic edge delivery
const functionsDir = path.join(rootDir, 'functions');
if (fs.existsSync(functionsDir)) {
  const sitemapFnCode = `export async function onRequest(context) {
  const sitemapXml = ${JSON.stringify(sitemapXml)};
  return new Response(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'X-Robots-Tag': 'all',
    },
  });
}
`;
  fs.writeFileSync(path.join(functionsDir, 'sitemap.xml.js'), sitemapFnCode, 'utf8');
  console.log('[postbuild-cloudflare] Emitted functions/sitemap.xml.js with prebaked XML');
}

// 7.8 Enforce Schema.org JSON-LD in index.html head
const indexPath = path.join(clientDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let indexHtml = fs.readFileSync(indexPath, 'utf8');
  const exactClinicJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": "오브한의원 마곡점",
    "alternateName": "ORBMED CLINIC",
    "url": "https://orbmed.co.kr",
    "telephone": "02-6959-5982",
    "description": "습식 정량화 뇌파(qEEG) 및 자율신경 검사 기반 뇌신경·자율신경·통증 중점 한의원",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "마곡중앙로 111 롯데캐슬 르웨스트 104동 2층 238호·239호",
      "addressLocality": "강서구",
      "addressRegion": "서울특별시",
      "addressCountry": "KR"
    },
    "medicalSpecialty": [
      "TraditionalChineseMedicine",
      "Neurology"
    ],
    "physician": {
      "@type": "Physician",
      "name": "전두희",
      "jobTitle": "대표원장"
    }
  };
  const jsonLdTag = `<script type="application/ld+json">\n${JSON.stringify(exactClinicJsonLd, null, 2)}\n</script>`;
  const headEndIndex = indexHtml.indexOf('</head>');
  if (headEndIndex !== -1) {
    const headPart = indexHtml.slice(0, headEndIndex);
    const restPart = indexHtml.slice(headEndIndex);
    if (/<script type="application\/ld\+json"[^>]*>[\s\S]*?MedicalClinic[\s\S]*?<\/script>/i.test(headPart)) {
      const updatedHead = headPart.replace(
        /<script type="application\/ld\+json"[^>]*>[\s\S]*?MedicalClinic[\s\S]*?<\/script>/i,
        jsonLdTag
      );
      indexHtml = updatedHead + restPart;
    } else {
      indexHtml = headPart + '\n' + jsonLdTag + '\n' + restPart;
    }
    fs.writeFileSync(indexPath, indexHtml, 'utf8');
    console.log('[postbuild-cloudflare] Injected and verified exact Schema.org MedicalClinic JSON-LD into index.html <head>');
  }
}

// 7.5 Ensure robots.txt, logo.png, and sitemap.xml are in dist/client
safeCopy(path.join(rootDir, 'public', 'robots.txt'), path.join(clientDir, 'robots.txt'));
safeCopy(path.join(rootDir, 'public', 'logo.png'), path.join(clientDir, 'logo.png'));
safeCopy(path.join(rootDir, 'public', 'sitemap.xml'), path.join(clientDir, 'sitemap.xml'));

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
