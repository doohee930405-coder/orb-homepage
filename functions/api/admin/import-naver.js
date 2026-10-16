const DEFAULT_REPO = 'doohee930405-coder/orb-homepage';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-github-token',
  'Content-Type': 'application/json',
};

const MOBILE_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1';

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function getGithubConfig(context) {
  const token =
    context.request.headers.get('x-github-token') ||
    (context.env && (context.env.GITHUB_TOKEN || context.env.GH_TOKEN)) ||
    '';
  const repo =
    (context.env && context.env.GITHUB_REPO) ||
    DEFAULT_REPO;
  return { token, repo };
}

async function getFileSha(repo, filePath, token) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=main`, {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Orb-Admin',
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.sha;
    }
  } catch {}
  return undefined;
}

async function commitFileToGithub(repo, filePath, contentStr, message, token) {
  const sha = await getFileSha(repo, filePath, token);
  const b64 = toBase64(contentStr);

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'Orb-Admin',
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message,
      content: b64,
      branch: 'main',
      ...(sha ? { sha } : {}),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `GitHub commit failed (${res.status})`);
  }
  return data;
}

function decodeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&middot;/g, '·')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&bull;/g, '•');
}

function stripHtml(html) {
  if (!html) return '';
  return decodeHtml(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

function matchCategory(catName = '', title = '', content = '') {
  const normCat = (catName || '').toLowerCase().trim();
  const text = `${title} ${content.slice(0, 1500)}`.toLowerCase();

  if (/뇌파|qeeg|정량뇌파|정량화뇌파|뇌파검사/.test(normCat)) return '정량화뇌파검사';
  if (/초민감|hsp|예민|고감각|민감자/.test(normCat)) return '초민감자(HSP)';
  if (/adhd|주의력|산만|집중력|도파민/.test(normCat)) return 'ADHD';
  if (/갑상선|저하증|항진증|하시모토/.test(normCat)) return '갑상선';
  if (/브레인포그|만성피로|피로|무기력|번아웃|brain\s*fog|부신/.test(normCat)) return '브레인포그';
  if (/다이어트|대사|비만|체중|감량|식욕|부종|체질|감비|퀀텀핏/.test(normCat)) return '다이어트';
  if (/위장|소화|역류|식도|과민|담적|내과|장질환|변비|설사|위염|복부/.test(normCat)) return '위장관';
  if (/자율신경|실조증|어지럼|두근거림|공황|기립성|미주신경|심계|통증|추나|목|어깨|허리|체형/.test(normCat)) return '자율신경실조증';

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
  addScore('갑상선', ['갑상선', '갑상선기능저하증', '갑상선기능항진증', '하시모토', '갑상선염', '티록신', 'tsh']);
  addScore('브레인포그', ['브레인포그', 'brain fog', '만성피로', '피로감', '무기력', '번아웃', '기억력', '머리가 멍', '부신피로']);
  addScore('다이어트', ['다이어트', '체중감량', '감비', '비만', '식욕', '요요', '대사증후군', '체지방', '디톡스', '퀀텀핏']);
  addScore('위장관', ['위장', '역류성식도염', '소화불량', '담적', '담적병', '과민성대장증후군', '복부팽만', '가스', '속쓰림', '위염']);
  addScore('자율신경실조증', ['자율신경', '자율신경실조증', '교감신경', '부교감신경', '미주신경', '기립성', '어지럼', '두근거림', '통증', '추나']);

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

function parseNaverPostHtml(html, logNo, blogId, fallbackTitle, forceCategory) {
  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

  // 1. Title
  let title = fallbackTitle || '';
  const ogTitleMatch = cleanHtml.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  const seTitleMatch = cleanHtml.match(/<h3[^>]*class="[^"]*se-title-text[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);
  if (ogTitleMatch) {
    title = decodeHtml(ogTitleMatch[1]).trim();
  } else if (seTitleMatch) {
    title = stripHtml(seTitleMatch[1]);
  }

  // 2. Date
  let date = new Date().toISOString().slice(0, 10);
  const dateMatch =
    cleanHtml.match(/<span\s+class="[^"]*(?:se_publishDate|publishDate|date)[^"]*"[^>]*>([\s\S]*?)<\/span>/i) ||
    cleanHtml.match(/(\d{4}\.\s*\d{1,2}\.\s*\d{1,2})/);
  if (dateMatch) {
    const rawDate = stripHtml(dateMatch[1]);
    const dMatch = rawDate.match(/(\d{4})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})/);
    if (dMatch) {
      date = `${dMatch[1]}-${dMatch[2].padStart(2, '0')}-${dMatch[3].padStart(2, '0')}`;
    }
  }

  // 3. Category
  let categoryName = '';
  const catMatch = cleanHtml.match(/<a\s+[^>]*class="[^"]*category[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
  if (catMatch) categoryName = stripHtml(catMatch[1]);

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
  const quoteMatch = bodyHtml.match(/<blockquote[^>]*class="[^"]*se[_-]quote[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (quoteMatch) {
    summary = stripHtml(quoteMatch[1])
      .replace(/^(?:💡\s*)?(?:(?:오브한의원\s*)?(?:전두희\s*원장의\s*)?(?:핵심\s*(?:진료\s*)?요약)|Medical\s*Summary|Summary)\s*[:\-\n\r]*/i, '')
      .trim();
    bodyHtml = bodyHtml.replace(quoteMatch[0], '');
  }

  // Extract Images
  const imgRegex = /<img\b[^>]*>/gi;
  let imgMatch;
  const images = [];
  let thumbnail = '';

  while ((imgMatch = imgRegex.exec(bodyHtml)) !== null) {
    const tag = imgMatch[0];
    let src = '';
    const lazy = tag.match(/\bdata-lazy-src=["']([^"']+)["']/i) || tag.match(/\bdata-src=["']([^"']+)["']/i);
    if (lazy && lazy[1]) src = lazy[1].trim();
    else {
      const regSrc = tag.match(/\bsrc=["']([^"']+)["']/i);
      if (regSrc && regSrc[1]) src = regSrc[1].trim();
    }

    if (!src || src.startsWith('data:') || src.includes('blank.gif') || src.includes('static.se2')) continue;
    if (src.startsWith('//')) src = `https:${src}`;
    if (src.includes('?type=')) src = src.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');

    let alt = '';
    const altM = tag.match(/\balt=["']([^"']*)["']/i);
    if (altM && altM[1]) alt = stripHtml(altM[1]);

    images.push({ src, alt });
    if (!thumbnail && (src.includes('pstatic.net') || src.includes('blogfiles'))) {
      thumbnail = src;
    }
  }

  // If thumbnail still empty, check og:image
  if (!thumbnail) {
    const ogImg = cleanHtml.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogImg && ogImg[1]) {
      let t = ogImg[1].trim();
      if (t.includes('?type=')) t = t.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
      thumbnail = t;
    }
  }

  // Parse HTML into Markdown structure
  let markdown = '';
  // Convert components:
  // Headings
  bodyHtml = bodyHtml.replace(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi, (_, text) => `\n\n## ${stripHtml(text)}\n\n`);
  // Quotations/Callouts
  bodyHtml = bodyHtml.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => `\n\n> 💡 ${stripHtml(text)}\n\n`);
  // Images
  bodyHtml = bodyHtml.replace(/<img\b[^>]*>/gi, (tag) => {
    let src = '';
    const lazy = tag.match(/\bdata-lazy-src=["']([^"']+)["']/i) || tag.match(/\bdata-src=["']([^"']+)["']/i);
    if (lazy && lazy[1]) src = lazy[1].trim();
    else {
      const regSrc = tag.match(/\bsrc=["']([^"']+)["']/i);
      if (regSrc && regSrc[1]) src = regSrc[1].trim();
    }
    if (!src || src.startsWith('data:') || src.includes('static.se2')) return '';
    if (src.startsWith('//')) src = `https:${src}`;
    if (src.includes('?type=')) src = src.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
    return `\n\n![오브한의원 임상 칼럼](${src})\n\n`;
  });
  // Paragraphs
  bodyHtml = bodyHtml.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => {
    const cleanP = stripHtml(text);
    if (!cleanP) return '';
    if (cleanP.length < 50 && (cleanP.endsWith('?') || cleanP.endsWith('!') || /^\d+\./.test(cleanP))) {
      return `\n\n### ${cleanP}\n\n`;
    }
    return `\n\n${cleanP}\n\n`;
  });

  markdown = bodyHtml.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim();

  // Strip Naver checkin / place noise
  markdown = markdown
    .replace(/이\s*블로그의\s*체크인[\s\S]*?MY플레이스/gi, '')
    .replace(/MY\s*플레이스/gi, '');

  if (!summary && markdown.length > 50) {
    summary = markdown.slice(0, 150).replace(/\n+/g, ' ').trim() + '...';
  }

  // Append official web archive footer
  const archiveFooter = `\n\n---\n\n📌 [정식 웹 아카이브 안내] 본 칼럼은 오브한의원 공식 네이버 블로그에 연재된 임상 칼럼을 기반으로, 의학적 근거와 최신 검사 기준을 보완하여 영구 보존·게재한 공식 웹 아카이브 문서입니다. 무단 복제 및 전재를 금합니다.`;
  if (!markdown.includes('정식 웹 아카이브 안내')) {
    markdown += archiveFooter;
  }

  // Tags
  const tagsSet = new Set();
  const tagRegex = /<a[^>]*class="[^"]*item_tag[^"]*"[^>]*>#?([^<]+)<\/a>/gi;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(cleanHtml)) !== null) {
    const tag = stripHtml(tagMatch[1]).replace(/^#/, '').trim();
    if (tag) tagsSet.add(tag);
  }

  const category = forceCategory || matchCategory(categoryName, title, markdown);
  tagsSet.add(category);
  tagsSet.add('마곡한의원');
  tagsSet.add('오브한의원');
  tagsSet.add('건강칼럼');

  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 35) || `post-${logNo}`;
  const slug = `${baseSlug}-${logNo.slice(-6)}`;

  return {
    id: `col-${slug}`,
    slug,
    title,
    summary,
    content: markdown,
    category,
    author: '전두희 원장',
    date,
    tags: Array.from(tagsSet),
    thumbnail,
    faqs: [],
  };
}

function formatColumnToMarkdown(col) {
  const tagsStr = Array.isArray(col.tags) ? col.tags.join(', ') : '';
  const faqsJson = Array.isArray(col.faqs) && col.faqs.length > 0 ? JSON.stringify(col.faqs) : '[]';

  return `---
title: "${(col.title || '').replace(/"/g, '\\"')}"
slug: "${col.slug}"
category: "${col.category || '자율신경실조증'}"
author: "${col.author || '전두희 원장'}"
date: "${col.date || new Date().toISOString().slice(0, 10)}"
tags: [${tagsStr ? `"${col.tags.join('", "')}"` : ''}]
thumbnail: "${col.thumbnail || ''}"
summary: "${(col.summary || '').replace(/"/g, '\\"').replace(/\n/g, ' ')}"
faqs: ${faqsJson}
---

${col.content || ''}
`;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const action = body.action || 'list';
    const { token, repo } = getGithubConfig(context);

    // ACTION 1: DISCOVER POSTS LIST
    if (action === 'list' || action === 'discover') {
      const blogId = (body.blogId || 'orbmed').trim();
      const maxPosts = body.maxPosts || 100;
      const allPosts = [];

      let page = 1;
      const countPerPage = 30;
      const maxPages = 5;

      while (page <= maxPages && allPosts.length < maxPosts) {
        const listUrl = `https://blog.naver.com/PostTitleListAsync.naver?blogId=${encodeURIComponent(blogId)}&viewdate=&currentPage=${page}&categoryNo=0&parentCategoryNo=&countPerPage=${countPerPage}`;
        const res = await fetch(listUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': `https://blog.naver.com/${blogId}`,
          },
        });

        if (!res.ok) break;

        const text = await res.text();
        let json;
        const slashQuote = String.fromCharCode(92) + "'";
        const cleanText = text.split(slashQuote).join("'");
        try {
          json = JSON.parse(cleanText);
        } catch {
          try {
            const match = cleanText.match(/"postList"\s*:\s*(\[\{.*?\}\])/s);
            if (match) {
              json = { postList: JSON.parse(match[1]) };
            }
          } catch {}
        }
        if (!json || !json.postList) break;

        const items = json.postList || [];
        if (items.length === 0) break;

        for (const item of items) {
          const logNo = item.logNo;
          let rawTitle = item.title || '';
          try {
            rawTitle = decodeURIComponent(rawTitle.replace(/\+/g, ' '));
          } catch {}

          let rawCat = item.categoryName || '';
          try {
            rawCat = decodeURIComponent(rawCat.replace(/\+/g, ' '));
          } catch {}

          let thumb = item.thumbnailUrl || (item.image ? item.image : '');
          if (thumb && thumb.includes('?type=')) {
            thumb = thumb.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
          }

          const matchedCat = matchCategory(rawCat, rawTitle, '');

          allPosts.push({
            logNo,
            blogId,
            title: rawTitle,
            categoryName: rawCat || '전체',
            matchedCategory: matchedCat,
            date: item.addDate || new Date().toISOString().slice(0, 10),
            url: `https://blog.naver.com/${blogId}/${logNo}`,
            thumbnailUrl: thumb,
          });
        }

        if (items.length < countPerPage) break;
        page++;
      }

      return new Response(
        JSON.stringify({
          success: true,
          blogId,
          totalFound: allPosts.length,
          posts: allPosts,
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // ACTION 2: IMPORT BATCH OF SELECTED POSTS
    if (action === 'import-batch') {
      const posts = body.posts;
      if (!Array.isArray(posts) || posts.length === 0) {
        return new Response(JSON.stringify({ success: false, error: '가져올 글이 없습니다.' }), { status: 400, headers: CORS_HEADERS });
      }

      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const item of posts) {
        const blogId = item.blogId || 'orbmed';
        const logNo = item.logNo || (item.url && item.url.match(/(\d{6,14})/)?.[1]);

        if (!logNo) {
          failCount++;
          results.push({ title: item.title, error: '유효한 글 번호를 찾을 수 없습니다.', success: false });
          continue;
        }

        try {
          const mobileUrl = `https://m.blog.naver.com/${encodeURIComponent(blogId)}/${encodeURIComponent(logNo)}`;
          const fetchRes = await fetch(mobileUrl, {
            headers: {
              'User-Agent': MOBILE_USER_AGENT,
              'Referer': 'https://m.blog.naver.com/',
              'Accept': 'text/html,application/xhtml+xml',
            },
          });

          if (!fetchRes.ok) {
            throw new Error(`네이버 글을 불러오지 못했습니다 (${fetchRes.status})`);
          }

          const html = await fetchRes.text();
          const col = parseNaverPostHtml(html, logNo, blogId, item.title, item.forceCategory);

          const jsonStr = JSON.stringify(col, null, 2);
          const mdStr = formatColumnToMarkdown(col);

          // Commit to GitHub
          await commitFileToGithub(repo, `content/columns/${col.slug}.json`, jsonStr, `feat(column): migrate naver post ${col.slug}.json`, token);
          await commitFileToGithub(repo, `content/columns/${col.slug}.md`, mdStr, `feat(column): migrate naver post ${col.slug}.md`, token);

          successCount++;
          results.push({
            logNo,
            title: col.title,
            slug: col.slug,
            category: col.category,
            date: col.date,
            success: true,
          });
        } catch (err) {
          failCount++;
          results.push({
            logNo,
            title: item.title,
            success: false,
            error: err.message || '가져오기 실패',
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          total: posts.length,
          successCount,
          failCount,
          results,
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // ACTION 3: IMPORT DIRECT URLS
    if (action === 'import-urls') {
      const urlsText = body.urlsText || '';
      const rawUrls = Array.isArray(body.urls) ? body.urls : urlsText.split('\n');
      const cleanUrls = rawUrls
        .map(u => u.trim())
        .filter(u => Boolean(u) && (u.includes('blog.naver.com') || /^\d{8,14}$/.test(u)));

      if (cleanUrls.length === 0) {
        return new Response(JSON.stringify({ success: false, error: '유효한 네이버 블로그 URL을 입력해 주세요.' }), { status: 400, headers: CORS_HEADERS });
      }

      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const url of cleanUrls) {
        let blogId = 'orbmed';
        let logNo = '';

        const m = url.match(/(?:blog\.naver\.com|m\.blog\.naver\.com)\/([a-zA-Z0-9_-]+)\/(\d+)/i);
        if (m) {
          blogId = m[1];
          logNo = m[2];
        } else if (/^\d{8,14}$/.test(url)) {
          logNo = url;
        } else if (url.includes('logNo=')) {
          try {
            const u = new URL(url.startsWith('http') ? url : `https://${url}`);
            blogId = u.searchParams.get('blogId') || 'orbmed';
            logNo = u.searchParams.get('logNo') || '';
          } catch {}
        }

        if (!logNo) {
          failCount++;
          results.push({ url, error: '글 번호를 추출할 수 없습니다.', success: false });
          continue;
        }

        try {
          const mobileUrl = `https://m.blog.naver.com/${encodeURIComponent(blogId)}/${encodeURIComponent(logNo)}`;
          const fetchRes = await fetch(mobileUrl, {
            headers: {
              'User-Agent': MOBILE_USER_AGENT,
              'Referer': 'https://m.blog.naver.com/',
            },
          });
          const html = await fetchRes.text();
          const col = parseNaverPostHtml(html, logNo, blogId, '', body.forceCategory === 'auto' ? '' : body.forceCategory);

          const jsonStr = JSON.stringify(col, null, 2);
          const mdStr = formatColumnToMarkdown(col);

          await commitFileToGithub(repo, `content/columns/${col.slug}.json`, jsonStr, `feat(column): import url ${col.slug}.json`, token);
          await commitFileToGithub(repo, `content/columns/${col.slug}.md`, mdStr, `feat(column): import url ${col.slug}.md`, token);

          successCount++;
          results.push({
            logNo,
            title: col.title,
            slug: col.slug,
            category: col.category,
            date: col.date,
            success: true,
          });
        } catch (err) {
          failCount++;
          results.push({ url, error: err.message || '가져오기 실패', success: false });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          total: cleanUrls.length,
          successCount,
          failCount,
          results,
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    return new Response(JSON.stringify({ success: false, error: '유효하지 않은 요청 액션입니다.' }), { status: 400, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || '처리 중 서버 오류가 발생했습니다.' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
