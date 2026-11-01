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

// 7.8 Enforce Title, Description, and Schema.org JSON-LD in index.html head
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
  const exactIndexTitle = '<title>오브한의원 마곡점 | 자율신경실조증·브레인포그·QEEG뇌파정밀검사 중점클리닉</title>';
  const exactIndexDesc = '<meta name="description" content="서울 강서구 마곡역 롯데캐슬 르웨스트 위치. 자율신경실조증, 브레인포그, 만성피로 중점 진료. 다채널 습식 정량화뇌파(qEEG)와 심박변이도(HRV) 데이터를 기반으로 한 신경-구조 융합 근원 치료.">';
  const exactOgTitle = '<meta property="og:title" content="오브한의원 마곡점 | 자율신경실조증·브레인포그·QEEG뇌파정밀검사 중점클리닉"/>';
  const exactOgDesc = '<meta property="og:description" content="서울 강서구 마곡역 롯데캐슬 르웨스트 위치. 자율신경실조증, 브레인포그, 만성피로 중점 진료. 다채널 습식 정량화뇌파(qEEG)와 심박변이도(HRV) 데이터를 기반으로 한 신경-구조 융합 근원 치료."/>';

  const exactFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://orbmed.co.kr/#faq",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "대학병원 종합검진(CT·MRI·혈액검사)에서 '이상 없음'인데 왜 계속 아프고 힘든가요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CT, MRI, 일반 혈액검사는 뇌의 형태적 파괴나 뇌출혈, 종양 같은 기질적 병변을 진단하는 장비입니다. 반면 만성피로, 어지럼증, 가슴 두근거림, 브레인포그, 소화불량 등은 신경망의 기능적 과열 및 교감·부교감신경의 조절 불균형에서 시작됩니다. 오브한의원은 다채널 습식 정량화 뇌파검사(qEEG)와 심박변이도(HRV) 자율신경 검사를 통해 눈에 보이지 않던 신경계의 기능적 과부하를 객관적 Z-score 수치로 규명합니다."
        }
      },
      {
        "@type": "Question",
        "name": "오브한의원의 '다채널 습식 정량화 뇌파검사(qEEG)'는 일반 밴드형 검사와 어떻게 다른가요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "시중의 간이 건식 밴드는 이마 부위 2~4개 채널만 측정하여 두피 저항과 땀, 잡파 노이즈에 매우 취약합니다. 오브한의원의 다채널 습식 qEEG는 국제 10-20 표준 전극 시스템을 준수하여 전두엽, 측두엽, 두정엽, 후두엽 전뇌를 커버합니다. 의료용 전도성 겔(Gel)로 임피던스를 극소화하고, 수만 건의 건강인 표준 Normative DB와 비교 대조하여 뇌 피질 신경망 과열과 저하 상태를 3차원 입체 지도로 시각화합니다."
        }
      },
      {
        "@type": "Question",
        "name": "정신과 약(항불안제, 수면제, 항우울제)을 복용 중인데 한약이나 추나 치료를 함께 받을 수 있나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "네, 충분히 병행 치료가 가능합니다. 복용 중이신 신경정신과 약물을 임의로 갑자기 중단하면 반동 현상이나 금단 증상이 발생할 수 있으므로, 기존 약물을 안정적으로 유지하면서 병행 진료를 시작합니다. 뇌 중추 과열을 식히는 1:1 맞춤 한약과 두경부 긴장을 완화하는 상부경추 뇌신경 추나요법을 통해 뇌의 자율 회복력을 높여가며, 호전 경과에 따라 안전하게 감량 및 단약(Tapering)을 돕습니다."
        }
      },
      {
        "@type": "Question",
        "name": "자율신경실조증 치료 기간과 내원 주기는 보통 어떻게 되나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "증상의 유병 기간과 신경계 피로도에 따라 차이가 있으나, 초기 신체화 증상(두근거림, 불면, 두중감, 감각과민)이 심한 4~8주 동안은 주 1~2회 내원하여 뇌신경 추나요법과 약침 치료를 병행하고 1:1 맞춤 한약을 복용합니다. 신경계 항상성이 안정권에 접어들면 내원 주기를 점진적으로 넓혀 스스로 활력을 유지할 수 있도록 돕습니다."
        }
      }
    ]
  };
  const faqJsonLdTag = `<script type="application/ld+json">\n${JSON.stringify(exactFaqJsonLd, null, 2)}\n</script>`;

  const headEndIndex = indexHtml.indexOf('</head>');
  if (headEndIndex !== -1) {
    let headPart = indexHtml.slice(0, headEndIndex);
    const restPart = indexHtml.slice(headEndIndex);

    if (/<title>[^<]*<\/title>/i.test(headPart)) {
      headPart = headPart.replace(/<title>[^<]*<\/title>/i, exactIndexTitle);
    } else {
      headPart += '\n' + exactIndexTitle;
    }

    if (/<meta[^>]*name=["']description["'][^>]*>/i.test(headPart)) {
      headPart = headPart.replace(/<meta[^>]*name=["']description["'][^>]*>/i, exactIndexDesc);
    } else {
      headPart += '\n' + exactIndexDesc;
    }

    if (/<meta[^>]*property=["']og:title["'][^>]*>/i.test(headPart)) {
      headPart = headPart.replace(/<meta[^>]*property=["']og:title["'][^>]*>/i, exactOgTitle);
    } else {
      headPart += '\n' + exactOgTitle;
    }

    if (/<meta[^>]*property=["']og:description["'][^>]*>/i.test(headPart)) {
      headPart = headPart.replace(/<meta[^>]*property=["']og:description["'][^>]*>/i, exactOgDesc);
    } else {
      headPart += '\n' + exactOgDesc;
    }

    if (/<script type="application\/ld\+json"[^>]*>[\s\S]*?MedicalClinic[\s\S]*?<\/script>/i.test(headPart)) {
      headPart = headPart.replace(
        /<script type="application\/ld\+json"[^>]*>[\s\S]*?MedicalClinic[\s\S]*?<\/script>/i,
        jsonLdTag
      );
    } else {
      headPart += '\n' + jsonLdTag;
    }

    if (/<script type="application\/ld\+json"[^>]*>[\s\S]*?FAQPage[\s\S]*?<\/script>/i.test(headPart)) {
      headPart = headPart.replace(
        /<script type="application\/ld\+json"[^>]*>[\s\S]*?FAQPage[\s\S]*?<\/script>/i,
        faqJsonLdTag
      );
    } else {
      headPart += '\n' + faqJsonLdTag;
    }

    indexHtml = headPart + '\n' + restPart;
    fs.writeFileSync(indexPath, indexHtml, 'utf8');
    console.log('[postbuild-cloudflare] Enforced title, description, and Schema.org MedicalClinic + FAQPage JSON-LD in index.html <head>');
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

// 9.5 Mirror dist/client directly into out/ directory as well so Cloudflare Pages configured with 'out' works seamlessly
const outDir = path.join(rootDir, 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
for (const entry of clientEntries) {
  const srcPath = path.join(clientDir, entry.name);
  const destPath = path.join(outDir, entry.name);
  if (entry.name === 'server' || entry.name === '.openai' || entry.name === 'client') continue;

  if (entry.isDirectory()) {
    copyDirRecursive(srcPath, destPath);
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
}
console.log('[postbuild-cloudflare] Mirrored build output to out/ directory');

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
