const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const postIds = [
  '224444283194',
  '224443006634',
  '224441249044',
  '224440657749',
  '224440650156',
  '224437473108',
  '224436027020',
  '224434702514',
  '224433565420',
  '224433440838',
];

const USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1';

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Referer: 'https://m.blog.naver.com/',
        },
      },
      (res) => {
        let html = '';
        res.on('data', (c) => (html += c));
        res.on('end', () => resolve(html));
      }
    ).on('error', reject);
  });
}

function downloadBinary(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Referer: 'https://m.blog.naver.com/',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(downloadBinary(res.headers.location));
        }
        if (res.statusCode !== 200) {
          return resolve(null);
        }
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }
    ).on('error', () => resolve(null));
  });
}

function decodeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x3D;/gi, '=')
    .replace(/&#61;/g, '=')
    .replace(/&amp;/g, '&')
    .replace(/&middot;/g, '·')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&bull;/g, '•');
}

function stripHtmlPreservingEntities(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function matchCategory(catName = '', title = '', content = '') {
  const normCat = (catName || '').toLowerCase().trim();
  const text = `${title} ${content.slice(0, 1500)}`.toLowerCase();

  if (/뇌파|qeeg|정량뇌파|정량화뇌파|뇌파검사/.test(normCat)) return '정량화뇌파검사';
  if (/초민감|hsp|예민|고감각|민감자/.test(normCat)) return '초민감자(HSP)';
  if (/adhd|주의력|산만|집중력|도파민/.test(normCat)) return 'ADHD';
  if (/갑상선|저하증|항진증|하시모토|씬지로이드/.test(normCat)) return '갑상선';
  if (/브레인포그|만성피로|피로|무기력|번아웃|brain\s*fog|부신/.test(normCat)) return '브레인포그';
  if (/다이어트|대사|비만|체중|감량|식욕|부종|체질|감비|퀀텀핏|마운자로|위고비/.test(normCat)) return '다이어트';
  if (/위장|소화|역류|식도|과민|담적|내과|장질환|변비|설사|위염|복부|복압/.test(normCat)) return '위장관';
  if (/자율신경|실조증|어지럼|두근거림|공황|기립성|미주신경|심계|통증|추나|목|어깨|허리|체형|상열하한/.test(normCat)) return '자율신경실조증';

  const scores = {
    '정량화뇌파검사': 0,
    '초민감자(HSP)': 0,
    'ADHD': 0,
    '갑상선': 0,
    '브레인포그': 0,
    '다이어트': 0,
    '위장관': 0,
    '자율신경실조증': 0,
  };

  const addScore = (cat, terms) => {
    for (const term of terms) {
      const lower = term.toLowerCase();
      if (title.toLowerCase().includes(lower)) scores[cat] += 3;
      if (text.includes(lower)) scores[cat] += 1;
    }
  };

  addScore('정량화뇌파검사', ['정량화뇌파', '정량뇌파', 'qeeg', '뇌파검사', '뇌파기계', '알파파', '베타파', '세타파']);
  addScore('초민감자(HSP)', ['hsp', '초민감자', '초민감', '고감각', '예민한', '감각과민', '감각처리민감성', '빛과민', '소리과민']);
  addScore('ADHD', ['adhd', '주의력결핍', '집중력저하', '주의산만', '성인adhd', '충동성', '과잉행동', '도파민']);
  addScore('갑상선', ['갑상선', '갑상선기능저하증', '갑상선기능항진증', '하시모토', '갑상선염', '티록신', 'tsh', '씬지로이드']);
  addScore('브레인포그', ['브레인포그', 'brain fog', '만성피로', '피로감', '무기력', '번아웃', '기억력', '머리가 멍', '부신피로']);
  addScore('다이어트', ['다이어트', '체중감량', '감비', '비만', '식욕', '요요', '대사증후군', '체지방', '디톡스', '퀀텀핏', '마운자로', '위고비']);
  addScore('위장관', ['위장', '역류성식도염', '소화불량', '담적', '담적병', '과민성대장증후군', '복부팽만', '가스', '속쓰림', '위염', '복압']);
  addScore('자율신경실조증', ['자율신경', '자율신경실조증', '교감신경', '부교감신경', '미주신경', '기립성', '어지럼', '두근거림', '통증', '추나', '상열하한', 'gaba']);

  let bestCat = '자율신경실조증';
  let bestScore = -1;
  for (const [c, sc] of Object.entries(scores)) {
    if (sc > bestScore) {
      bestScore = sc;
      bestCat = c;
    }
  }
  return bestCat;
}

const isInvalidImage = (s) => {
  if (!s) return true;
  const l = s.toLowerCase();
  return (
    l.includes('static.map') ||
    l.includes('staticmap') ||
    l.includes('blogpfthumb') ||
    l.includes('profile') ||
    l.includes('og_default') ||
    l.includes('og_270x270') ||
    l.includes('gfmarket') ||
    l.includes('emoticon') ||
    l.includes('dthumb-phinf') ||
    l.includes('blank.gif') ||
    l.includes('static.se2')
  );
};

async function processPost(logNo) {
  console.log(`\n================== Processing [${logNo}] ==================`);
  const html = await fetchHtml(`https://m.blog.naver.com/orbmed/${logNo}`);

  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

  // 1. Title
  let title = '';
  const ogTitleMatch = cleanHtml.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=(?:"([^"]*)"|'([^']*)')/i);
  const seTitleMatch = cleanHtml.match(/<h3[^>]*class="[^"]*se-title-text[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);
  if (ogTitleMatch) {
    title = decodeHtml(ogTitleMatch[1] || ogTitleMatch[2]).trim();
  } else if (seTitleMatch) {
    title = decodeHtml(stripHtmlPreservingEntities(seTitleMatch[1]));
  }

  // 2. Date
  let date = new Date().toISOString().slice(0, 10);
  const dateMatch =
    cleanHtml.match(/<span\s+class="[^"]*(?:se_publishDate|publishDate|date)[^"]*"[^>]*>([\s\S]*?)<\/span>/i) ||
    cleanHtml.match(/(\d{4}\.\s*\d{1,2}\.\s*\d{1,2})/);
  if (dateMatch) {
    const rawDate = stripHtmlPreservingEntities(dateMatch[1]);
    const dMatch = rawDate.match(/(\d{4})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})/);
    if (dMatch) {
      date = `${dMatch[1]}-${dMatch[2].padStart(2, '0')}-${dMatch[3].padStart(2, '0')}`;
    }
  }

  // 3. Category
  let categoryName = '';
  const catMatch = cleanHtml.match(/<a\s+[^>]*class="[^"]*category[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
  if (catMatch) categoryName = stripHtmlPreservingEntities(catMatch[1]);

  // 4. Main container
  let bodyHtml = '';
  const seStartMatch = cleanHtml.match(/<div[^>]*class="[^"]*se-main-container[^"]*"[^>]*>/i);
  if (seStartMatch && seStartMatch.index !== undefined) {
    const startIdx = seStartMatch.index + seStartMatch[0].length;
    const postFooterMatch = cleanHtml
      .slice(startIdx)
      .search(/<div[^>]*class="[^"]*(?:post_footer|btn_like|viewTypeSelector|common_post_btn|comment_wrap)[^"]*"/i);
    bodyHtml = postFooterMatch !== -1 ? cleanHtml.slice(startIdx, startIdx + postFooterMatch) : cleanHtml.slice(startIdx);
  } else {
    const postViewMatch = cleanHtml.match(/<div id="postViewArea"[^>]*>([\s\S]*?)<\/div>/i);
    bodyHtml = postViewMatch ? postViewMatch[1] : cleanHtml;
  }

  // Extract Summary from top blockquote
  let summary = '';
  const quoteRegex =
    /<blockquote[^>]*class="[^"]*(?:se_blockquote|se-quotation-container|se-quote-container|se-module-blockquote|se-quote|se-quotation|se-component-quotation)[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/i;
  const quoteMatch = bodyHtml.match(quoteRegex) || bodyHtml.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (quoteMatch) {
    let rawQuote = decodeHtml(stripHtmlPreservingEntities(quoteMatch[1])).trim();
    rawQuote = rawQuote
      .replace(/^(?:💡\s*)?(?:(?:오브한의원\s*)?(?:전두희\s*원장의\s*)?(?:핵심\s*(?:진료\s*)?요약)|Medical\s*Summary|Summary)\s*[:\-\n\r]*/i, '')
      .replace(/^[>\s💡]+/g, '')
      .trim();
    if (rawQuote.length >= 10) {
      summary = rawQuote;
      bodyHtml = bodyHtml.replace(quoteMatch[0], '');
    }
  }

  // Slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 35)
    .replace(/-+$/, '') || `post-${logNo}`;
  const slug = `${baseSlug}-${logNo.slice(-6)}`;

  // Extract Images
  const imgRegex = /<img\b[^>]*>/gi;
  let imgMatch;
  const bodyImages = [];

  while ((imgMatch = imgRegex.exec(bodyHtml)) !== null) {
    const tag = imgMatch[0];
    let src = '';
    const lazy = tag.match(/\bdata-lazy-src=["']([^"']+)["']/i) || tag.match(/\bdata-src=["']([^"']+)["']/i);
    if (lazy && lazy[1]) src = lazy[1].trim();
    else {
      const regSrc = tag.match(/\bsrc=["']([^"']+)["']/i);
      if (regSrc && regSrc[1]) src = regSrc[1].trim();
    }

    if (!src || src.startsWith('data:') || isInvalidImage(src)) continue;
    if (src.startsWith('//')) src = `https:${src}`;
    if (src.includes('?type=')) src = src.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
    src = src.replace('blogthumb.pstatic.net', 'postfiles.pstatic.net').replace('mblogthumb-phinf.pstatic.net', 'postfiles.pstatic.net');

    let alt = '';
    const altM = tag.match(/\balt=["']([^"']*)["']/i);
    if (altM && altM[1]) alt = stripHtmlPreservingEntities(altM[1]);

    bodyImages.push({ tag, src, alt });
  }

  // Candidate thumbnail URL
  let candidateThumbUrl = '';
  const ogImg = cleanHtml.match(/<meta\s+(?:property|name)=["'](?:og|twitter):image["']\s+content=(?:"([^"]*)"|'([^']*)')/i);
  if (ogImg) {
    const rawOg = (ogImg[1] || ogImg[2] || '').trim();
    if (!isInvalidImage(rawOg)) {
      let t = rawOg;
      if (t.startsWith('//')) t = `https:${t}`;
      if (t.includes('?type=')) t = t.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
      t = t.replace('blogthumb.pstatic.net', 'postfiles.pstatic.net').replace('mblogthumb-phinf.pstatic.net', 'postfiles.pstatic.net');
      candidateThumbUrl = t;
    }
  }

  if (!candidateThumbUrl && bodyImages.length > 0) {
    candidateThumbUrl = bodyImages[0].src;
  }

  // Download images locally
  const imagesDir = path.join(__dirname, '..', 'public', 'images', 'columns');
  const thumbsDir = path.join(__dirname, '..', 'public', 'images', 'columns', 'thumbnails');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

  let thumbnail = '';
  if (candidateThumbUrl && !isInvalidImage(candidateThumbUrl)) {
    console.log(`Downloading thumbnail for ${logNo}...`);
    const thumbBuf = await downloadBinary(candidateThumbUrl);
    if (thumbBuf && thumbBuf.length > 3000) {
      const thumbFileName = `thumb_${slug}.png`;
      fs.writeFileSync(path.join(thumbsDir, thumbFileName), thumbBuf);
      thumbnail = `/images/columns/thumbnails/${thumbFileName}`;
      console.log(`  -> Saved thumbnail: ${thumbnail} (${thumbBuf.length} bytes)`);
    } else {
      console.log(`  -> Thumbnail buffer too small or failed, keeping as empty string`);
    }
  } else {
    console.log(`  -> No valid thumbnail found (pure text or map only post). Setting thumbnail = ""`);
  }

  // Download body images and replace in bodyHtml
  for (let i = 0; i < bodyImages.length; i++) {
    const bImg = bodyImages[i];
    console.log(`Downloading body image ${i + 1}/${bodyImages.length}...`);
    const imgBuf = await downloadBinary(bImg.src);
    let effectiveSrc = bImg.src;
    if (imgBuf && imgBuf.length > 3000) {
      const ext = bImg.src.toLowerCase().includes('.png') ? '.png' : '.jpg';
      const imgFileName = `naver_${slug.slice(0, 20)}_${Date.now()}_${i + 1}${ext}`;
      fs.writeFileSync(path.join(imagesDir, imgFileName), imgBuf);
      effectiveSrc = `/images/columns/${imgFileName}`;
      console.log(`  -> Saved body image: ${effectiveSrc} (${imgBuf.length} bytes)`);
    }

    const safeAlt = (bImg.alt || '오브한의원 임상 칼럼').replace(/[\[\]\(\)\"#]/g, '').trim();
    bodyHtml = bodyHtml.replace(bImg.tag, `\n\n![${safeAlt}](${effectiveSrc})\n\n`);
  }

  // Naver Map & Place Module conversion
  bodyHtml = bodyHtml.replace(
    /<div[^>]*class="[^"]*(?:se-module-map|se-component-map|se-map)[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
    () => `\n\n[📍 **오브한의원 마곡점 (서울특별시 강서구 마곡중앙로 111, 롯데캐슬 르웨스트 104동 2층)**](https://map.naver.com/p/search/%EC%98%A4%EB%B8%8C%ED%95%9C%EC%9D%98%EC%9B%90%20%EB%A7%88%EA%B3%A1%EC%A0%90)\n\n`
  );

  // Strip remaining img tags (like map img or blank icons)
  bodyHtml = bodyHtml.replace(/<img\b[^>]*>/gi, '');

  // Headings
  bodyHtml = bodyHtml.replace(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi, (_, text) => `\n\n## ${stripHtmlPreservingEntities(text)}\n\n`);

  // Quotations/Callouts
  bodyHtml = bodyHtml.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => `\n\n> 💡 ${stripHtmlPreservingEntities(text)}\n\n`);

  // Paragraphs (preserve entities like &lt; so math/statistics p < 0.001 is never truncated)
  bodyHtml = bodyHtml.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => {
    const rawP = stripHtmlPreservingEntities(text);
    if (!rawP) return '';
    if (rawP.length < 50 && (rawP.endsWith('?') || rawP.endsWith('!') || /^\d+\./.test(rawP))) {
      return `\n\n### ${rawP}\n\n`;
    }
    return `\n\n${rawP}\n\n`;
  });

  // Strip remaining HTML tags FIRST, then decode entities LAST!
  let markdown = bodyHtml.replace(/<[^>]*>/g, '');
  markdown = decodeHtml(markdown).replace(/\n{3,}/g, '\n\n').trim();

  // Strip Naver checkin / place noise
  markdown = markdown
    .replace(/이\s*블로그의\s*체크인[\s\S]*?MY플레이스/gi, '')
    .replace(/MY\s*플레이스/gi, '');

  if (!summary && markdown.length > 50) {
    const p1 = markdown.split('\n\n').find(p => p.trim() && !p.startsWith('#') && !p.startsWith('!') && !p.startsWith('---'));
    summary = (p1 || markdown.slice(0, 150)).replace(/\n+/g, ' ').replace(/^[>\s💡]+/g, '').trim();
  }

  // References formatting
  markdown = markdown.replace(/(\[\d+\]\s+[^\n]+)/g, '\n\n$1\n\n');

  // Append official web archive footer
  const archiveFooter = `\n\n---\n\n📌 [정식 웹 아카이브 안내] 본 칼럼은 오브한의원 공식 네이버 블로그에 연재된 임상 칼럼을 기반으로, 의학적 근거와 최신 검사 기준을 보완하여 영구 보존·게재한 공식 웹 아카이브 문서입니다. 무단 복제 및 전재를 금합니다.`;
  if (!markdown.includes('정식 웹 아카이브 안내')) {
    markdown += archiveFooter;
  }

  const category = matchCategory(categoryName, title, markdown);
  const tags = Array.from(new Set([category, '마곡한의원', '오브한의원', '건강칼럼']));

  const col = {
    id: `col-${slug}`,
    slug,
    title,
    summary,
    content: markdown.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').replace(/\u200B/g, '').trim(),
    category,
    author: '전두희 원장',
    date,
    tags,
    thumbnail,
    faqs: [],
  };

  const mdStr = `---
title: "${col.title.replace(/"/g, '\\"')}"
slug: "${col.slug}"
category: "${col.category}"
author: "${col.author}"
date: "${col.date}"
tags: [${col.tags.map(t => `"${t}"`).join(', ')}]
thumbnail: "${col.thumbnail}"
summary: "${col.summary.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
faqs: []
---

${col.content}
`;

  const columnsDir = path.join(__dirname, '..', 'content', 'columns');
  if (!fs.existsSync(columnsDir)) fs.mkdirSync(columnsDir, { recursive: true });

  fs.writeFileSync(path.join(columnsDir, `${col.slug}.json`), JSON.stringify(col, null, 2), 'utf8');
  fs.writeFileSync(path.join(columnsDir, `${col.slug}.md`), mdStr, 'utf8');

  console.log(`[SUCCESS] Migrated: ${col.title}`);
  console.log(`  - Slug: ${col.slug}`);
  console.log(`  - Category: ${col.category}`);
  console.log(`  - Date: ${col.date}`);
  console.log(`  - Thumbnail: ${col.thumbnail || '(none)'}`);
  console.log(`  - Summary: ${col.summary.slice(0, 80)}...`);
  console.log(`  - Content length: ${col.content.length} chars`);
  console.log(`  - Check p < 0.001: ${col.content.includes('p < 0.001') ? 'YES' : 'N/A'}`);
  console.log(`  - Check > 💡 in summary: ${col.summary.includes('💡') ? 'FAIL' : 'CLEAN'}`);
}

(async () => {
  for (const id of postIds) {
    try {
      await processPost(id);
    } catch (e) {
      console.error(`[ERROR] Failed to process ${id}:`, e);
    }
  }
  console.log('\n================ All 10 posts migrated! ================');
})();
