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

// 7. Vinext does not emit app/sitemap.ts for static builds. Build a comprehensive sitemap
// from the canonical URLs in the pages that were actually prerendered, enriched with real lastmod, changefreq, and priority.
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

// Load real lastmod dates from content/columns/*.json
const columnDatesBySlug = new Map();
if (fs.existsSync(contentColumnsDir)) {
  for (const f of fs.readdirSync(contentColumnsDir)) {
    if (f.endsWith('.json')) {
      try {
        const rawJson = fs.readFileSync(path.join(contentColumnsDir, f), 'utf8');
        const colData = JSON.parse(rawJson);
        if (colData.slug) {
          const rawDate = colData.updatedAt || colData.date || '';
          const match = rawDate.match(/^\d{4}-\d{2}-\d{2}/);
          const dateStr = match ? match[0] : new Date().toISOString().slice(0, 10);
          columnDatesBySlug.set(colData.slug, dateStr);
        }
      } catch {}
    }
  }
}

const latestColumnDate = Array.from(columnDatesBySlug.values()).sort().reverse()[0] || new Date().toISOString().slice(0, 10);

function getUrlMetadata(urlStr) {
  const url = new URL(urlStr);
  const pathname = url.pathname;

  // 1. Column detail pages (/columns/[slug])
  const colMatch = pathname.match(/^\/columns\/([^/]+)$/);
  if (colMatch) {
    const slug = decodeURIComponent(colMatch[1]);
    const lastmod = columnDatesBySlug.get(slug) || latestColumnDate;
    const isQeegGuide = slug === 'qeeg-guide';
    return {
      loc: urlStr,
      lastmod,
      changefreq: isQeegGuide ? 'weekly' : 'monthly',
      priority: isQeegGuide ? '0.9' : '0.8',
    };
  }

  // 2. Home page
  if (pathname === '/') {
    return {
      loc: urlStr,
      lastmod: latestColumnDate,
      changefreq: 'daily',
      priority: '1.0',
    };
  }

  // 3. Columns archive listing (/columns)
  if (pathname === '/columns') {
    return {
      loc: urlStr,
      lastmod: latestColumnDate,
      changefreq: 'daily',
      priority: '0.95',
    };
  }

  // 4. Location page (/location)
  if (pathname === '/location') {
    return {
      loc: urlStr,
      lastmod: latestColumnDate,
      changefreq: 'monthly',
      priority: '0.9',
    };
  }

  // 5. English main page (/en)
  if (pathname === '/en') {
    return {
      loc: urlStr,
      lastmod: latestColumnDate,
      changefreq: 'weekly',
      priority: '0.8',
    };
  }

  // 6. Treatment pages (/diet, /qeeg, /pain, /treatments/*)
  if (
    pathname === '/diet' || pathname === '/qeeg' || pathname === '/pain' ||
    /^\/(?:en\/)?treatments\/[^/]+$/.test(pathname)
  ) {
    return {
      loc: urlStr,
      lastmod: latestColumnDate,
      changefreq: 'monthly',
      priority: '0.8',
    };
  }

  // 7. Privacy policy
  if (pathname === '/privacy' || pathname === '/en/privacy') {
    return {
      loc: urlStr,
      lastmod: '2026-01-01',
      changefreq: 'yearly',
      priority: '0.2',
    };
  }

  return {
    loc: urlStr,
    lastmod: latestColumnDate,
    changefreq: 'monthly',
    priority: '0.7',
  };
}

const xmlEscape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...[...canonicalUrls].sort().map((url) => {
    const meta = getUrlMetadata(url);
    return [
      '  <url>',
      `    <loc>${xmlEscape(meta.loc)}</loc>`,
      `    <lastmod>${meta.lastmod}</lastmod>`,
      `    <changefreq>${meta.changefreq}</changefreq>`,
      `    <priority>${meta.priority}</priority>`,
      '  </url>',
    ].join('\n');
  }),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(path.join(clientDir, 'sitemap.xml'), sitemapXml);
fs.writeFileSync(path.join(rootDir, 'public', 'sitemap.xml'), sitemapXml);
console.log(`[postbuild-cloudflare] Wrote ${canonicalUrls.size} canonical URLs with lastmod/priority/changefreq to sitemap.xml and public/sitemap.xml`);

// Ensure functions/ does NOT intercept static assets (robots.txt, sitemap.xml)
const functionsDir = path.join(rootDir, 'functions');
if (fs.existsSync(functionsDir)) {
  for (const unwanted of ['robots.txt.js', 'sitemap.xml.js', '_middleware.js']) {
    const unwantedPath = path.join(functionsDir, unwanted);
    if (fs.existsSync(unwantedPath)) {
      fs.unlinkSync(unwantedPath);
      console.log(`[postbuild-cloudflare] Removed function interceptor to guarantee pure static asset serving: ${unwanted}`);
    }
  }
}

// 7.8 Enforce Schema.org JSON-LD in index.html head
const indexPath = path.join(clientDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let indexHtml = fs.readFileSync(indexPath, 'utf8');
  const exactClinicJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": "오브한의원 마곡점",
    "alternateName": ["오브한의원", "마곡 오브한의원"],
    "url": "https://orbmed.co.kr",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "마곡 롯데캐슬 르웨스트 104동",
      "addressLocality": "강서구",
      "addressRegion": "서울특별시",
      "addressCountry": "KR"
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

// 7.9 Enforce Title, Description, and Schema.org JSON-LD in autonomic-qeeg & qeeg pages
const autonomicQeegFiles = [
  path.join(clientDir, 'treatments', 'autonomic-qeeg.html'),
  path.join(clientDir, 'treatments', 'autonomic-qeeg', 'index.html'),
  path.join(clientDir, 'qeeg.html'),
  path.join(clientDir, 'qeeg', 'index.html'),
];

const exactAutonomicJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "오브한의원 자율신경실조증 및 뇌파검사 클리닉",
  "url": "https://www.orbmed.co.kr/treatments/autonomic-qeeg",
  "about": {
    "@type": "MedicalCondition",
    "name": "자율신경실조증 (Dysautonomia)",
    "associatedAnatomy": {
      "@type": "AnatomicalStructure",
      "name": "자율신경계"
    }
  },
  "provider": {
    "@type": "MedicalClinic",
    "name": "오브한의원 마곡점"
  }
};
const autonomicJsonLdTag = `<script type="application/ld+json">\n${JSON.stringify(exactAutonomicJsonLd, null, 2)}\n</script>`;
const expectedTitleTag = '<title>마곡 자율신경실조증 치료·뇌파검사 클리닉 - 오브한의원</title>';
const expectedDescContent = '오브한의원의 정량화뇌파(QEEG) 및 자율신경 진단 시스템. 만성피로, 수면장애, 브레인포그, 가슴 두근거림 등 자율신경실조증의 근본 원인을 파악하고 맞춤 한약과 추나로 치료합니다.';

for (const filePath of autonomicQeegFiles) {
  if (fs.existsSync(filePath)) {
    let fileHtml = fs.readFileSync(filePath, 'utf8');

    // Remove any existing application/ld+json scripts to prevent duplicates
    fileHtml = fileHtml.replace(/<script type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');

    const headEnd = fileHtml.indexOf('</head>');
    if (headEnd !== -1) {
      let head = fileHtml.slice(0, headEnd);
      const rest = fileHtml.slice(headEnd);

      // Title
      if (/<title>[^<]*<\/title>/i.test(head)) {
        head = head.replace(/<title>[^<]*<\/title>/i, expectedTitleTag);
      } else {
        head += '\n' + expectedTitleTag;
      }

      // Meta Description
      if (/<meta[^>]*name=["']description["'][^>]*>/i.test(head)) {
        head = head.replace(/<meta[^>]*name=["']description["'][^>]*>/i, `<meta name="description" content="${expectedDescContent}">`);
      } else {
        head += `\n<meta name="description" content="${expectedDescContent}">`;
      }

      // Insert exact single JSON-LD into <head>
      head += '\n' + autonomicJsonLdTag;

      fileHtml = head + rest;
      fs.writeFileSync(filePath, fileHtml, 'utf8');
      console.log(`[postbuild-cloudflare] Enforced title, description, and MedicalWebPage JSON-LD in: ${path.relative(rootDir, filePath)}`);
    }
  }
}

// 8. Copy entire public/ directory directly into dist/client/
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (srcPath !== dest && destPath !== src) {
        copyDirRecursive(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  copyDirRecursive(publicDir, clientDir);
  console.log('[postbuild-cloudflare] Copied all files and folders from public/ into dist/client/');
}

// 9. Mirror dist/client directly into dist/ root so users can upload EITHER 'dist' OR 'dist/client'
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

// 10. Verify that critical static files exist in dist/client
const requiredFiles = ['robots.txt', 'sitemap.xml', '_headers', '_routes.json', '_redirects'];
for (const file of requiredFiles) {
  const targetPath = path.join(clientDir, file);
  if (!fs.existsSync(targetPath)) {
    throw new Error(`[postbuild-cloudflare] Verification failed: dist/client/${file} does not exist!`);
  }
  const stat = fs.statSync(targetPath);
  console.log(`[postbuild-cloudflare] Verified: dist/client/${file} (${stat.size} bytes)`);
}

console.log('[postbuild-cloudflare] Successfully prepared dist and dist/client for Cloudflare Pages deployment!');
