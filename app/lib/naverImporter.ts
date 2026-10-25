import fs from 'fs';
import path from 'path';
import {
  CLINIC_CATEGORIES,
  Column,
  ColumnFaq,
  ColumnInput,
  getAllColumns,
  getColumnsDir,
  getProjectRoot,
  saveColumn,
  splitHeadingAndBody,
  removeTopDuplicateImage,
} from './columns';

export interface NaverDiscoveredPost {
  logNo: string;
  blogId: string;
  title: string;
  categoryName: string;
  matchedCategory: string;
  date: string;
  url: string;
  readCount?: number;
  thumbnailUrl?: string;
}

export interface NaverImportResult {
  logNo: string;
  title: string;
  slug: string;
  category: string;
  success: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  imageCount?: number;
  url: string;
}

const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const MOBILE_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1';

const USER_AGENT = DESKTOP_USER_AGENT;

export const NAVER_PLACE_SEARCH_URL =
  'https://map.naver.com/p/search/%EC%98%A4%EB%B8%8C%ED%95%9C%EC%9D%98%EC%9B%90%20%EB%A7%88%EA%B3%A1%EC%A0%90';

/**
 * Decodes HTML entities commonly found in web scrapers
 */
export function decodeHtmlEntities(text: string): string {
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
    .replace(/&bull;/g, '•')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Strips HTML tags and collapses whitespace
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips HTML tags except specified allowed tags (e.g. u, b, strong, i, em)
 */
export function stripTagsExcept(html: string, allowedTags: string[] = ['u', 'b', 'strong', 'i', 'em']): string {
  const allowedSet = new Set(allowedTags.map((t) => t.toLowerCase()));
  return html.replace(/<\/?([a-zA-Z0-9_-]+)\b[^>]*>/gi, (match, tagName) => {
    if (allowedSet.has(tagName.toLowerCase())) {
      const isClosing = match.startsWith('</');
      return isClosing ? `</${tagName.toLowerCase()}>` : `<${tagName.toLowerCase()}>`;
    }
    return '';
  });
}

/**
 * Converts a Naver SmartEditor paragraph to Markdown, preserving subheadings (se-fs-fs19+),
 * bold (**...**), underline (<u>...</u>), and italics (*...*).
 */
export function convertHtmlParagraph(innerHtml: string): string {
  const isLargeFont =
    /se-fs-fs(1[89]|2[0-9]|3[0-9])/i.test(innerHtml) ||
    /font-size:\s*(1[89]|2[0-9]|3[0-9])px/i.test(innerHtml) ||
    /se-heading|se-title/i.test(innerHtml);

  const textContent = decodeHtmlEntities(innerHtml.replace(/<[^>]*>/g, ''))
    .replace(/[\s\u200B\uFEFF]/g, ' ')
    .trim();
  if (!textContent) return '';

  if (
    textContent === '오브한의원' ||
    textContent === '궁금할 땐 네이버 톡톡하세요!' ||
    textContent === 'MY플레이스' ||
    textContent === '이 블로그의 체크인' ||
    textContent === '이 장소의 다른 글'
  ) {
    return '';
  }

  // Heading detection: large font or standalone bold block
  const isEntirelyBold =
    /^[\s\u200B\uFEFF]*(?:<span[^>]*>[\s\u200B\uFEFF]*)*<(?:b|strong)\b[^>]*>([\s\S]*?)<\/(?:b|strong)>(?:[\s\u200B\uFEFF]*<\/span>)*[\s\u200B\uFEFF]*$/i.test(
      innerHtml.trim()
    );

  if (
    isLargeFont &&
    textContent.length <= 110 &&
    !/(?:습니다|합니다|입니다|됩니다|있습니다|했으나|하지만|따라서|보입니다)\.\s*$/.test(textContent)
  ) {
    return `\n\n## ${textContent}\n\n`;
  }

  // Bullet symbol heading (e.g. ■ 위장 장애와 함께 시작되는 대뇌 신경염증)
  if (
    /^[■●◆▶★]\s*[^.!?\n]{3,80}$/.test(textContent) &&
    !/(?:습니다|합니다|입니다|됩니다|있습니다|했으나)\.\s*$/.test(textContent)
  ) {
    return `\n\n## ${textContent}\n\n`;
  }

  if (
    isEntirelyBold &&
    textContent.length >= 3 &&
    textContent.length <= 80 &&
    !textContent.endsWith(',') &&
    !textContent.startsWith('※')
  ) {
    if (/^(?:\d+\.|\d+\.\d+|[①-⑩]|\[\d+단계\]|\d+단계)/.test(textContent)) {
      return `\n\n### ${textContent}\n\n`;
    }
    if (
      !/(?:습니다|합니다|입니다|됩니다|있습니다|했으나)\.\s*$/.test(textContent) &&
      !textContent.startsWith('Q.') &&
      !textContent.startsWith('A.')
    ) {
      return `\n\n## ${textContent}\n\n`;
    }
  }

  // Inline formatting:
  let parsed = innerHtml
    .replace(/<br\s*\/?>/gi, '\n\n')
    // Bold: <b> / <strong> -> **...**
    .replace(/<(?:b|strong)\b[^>]*>([\s\S]*?)<\/(?:b|strong)>/gi, (_, boldText) => {
      const clean = decodeHtmlEntities(boldText.replace(/<[^>]*>/g, '')).replace(/[\s\u200B\uFEFF]/g, '');
      if (!clean) return '';
      const innerFormatted = stripTagsExcept(boldText, ['u', 'i', 'em']);
      return `**${innerFormatted.trim()}**`;
    })
    // Italic: <i> / <em> -> *...*
    .replace(/<(?:i|em)\b[^>]*>([\s\S]*?)<\/(?:i|em)>/gi, (_, italicText) => {
      const clean = decodeHtmlEntities(italicText.replace(/<[^>]*>/g, '')).replace(/[\s\u200B\uFEFF]/g, '');
      if (!clean) return '';
      const innerFormatted = stripTagsExcept(italicText, ['u', 'b', 'strong']);
      return `*${innerFormatted.trim()}*`;
    })
    // Underline: <u> -> <u>...</u>
    .replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, (_, uText) => {
      const clean = decodeHtmlEntities(uText.replace(/<[^>]*>/g, '')).replace(/[\s\u200B\uFEFF]/g, '');
      if (!clean) return '';
      return `<u>${uText.trim()}</u>`;
    });

  // Strip remaining HTML tags except <u>, <img>, <a>
  parsed = parsed.replace(/<\/?(?!u\b|img\b|a\b)[a-zA-Z0-9_-]+\b[^>]*>/gi, '');
  parsed = decodeHtmlEntities(parsed).trim();

  // If paragraph starts with bold step subtitle like **1. HPA축...** 본문..., split into H3 + body
  const boldPrefixMatch = parsed.match(/^(\*(?:\d+\.|\d+\.\d+|[①-⑩]|\[\d+단계\]|[^\*\n]{2,50})\*\*)\s*(.+)$/s);
  if (boldPrefixMatch) {
    const heading = boldPrefixMatch[1].replace(/\*\*/g, '').trim();
    const body = boldPrefixMatch[2].trim();
    if (heading.length <= 60 && !heading.includes('니다')) {
      return `\n\n### ${heading}\n\n${body}\n\n`;
    }
  }

  return `\n\n${parsed}\n\n`;
}



/**
 * Safely replaces a nested div component (like Naver map or oglink cards)
 * by counting balanced opening and closing div tags, preventing greedy swallow of subsequent content.
 */
export function replaceBalancedDivComponent(
  htmlStr: string,
  startPattern: string,
  replacerFn: (compHtml: string) => string
): string {
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const startRegex = new RegExp(startPattern, 'gi');

  while ((match = startRegex.exec(htmlStr)) !== null) {
    const startIndex = match.index;
    result += htmlStr.substring(lastIndex, startIndex);

    let openCount = 0;
    let endIndex = -1;
    const tagRegex = /<\/?div\b[^>]*>/gi;
    tagRegex.lastIndex = startIndex;

    let tagMatch: RegExpExecArray | null;
    while ((tagMatch = tagRegex.exec(htmlStr)) !== null) {
      if (tagMatch[0].startsWith('</')) {
        openCount--;
      } else {
        openCount++;
      }
      if (openCount === 0) {
        endIndex = tagMatch.index + tagMatch[0].length;
        break;
      }
    }

    if (endIndex === -1) {
      lastIndex = startIndex + match[0].length;
    } else {
      const compHtml = htmlStr.substring(startIndex, endIndex);
      result += replacerFn(compHtml);
      lastIndex = endIndex;
      startRegex.lastIndex = endIndex;
    }
  }

  result += htmlStr.substring(lastIndex);
  return result;
}

/**
 * Parses any form of Naver blog post URL to extract blogId and logNo
 */
export function normalizeNaverUrl(inputUrl: string): { blogId: string; logNo: string } | null {
  if (!inputUrl) return null;
  const clean = inputUrl.trim();

  try {
    // 1. Check query parameters: PostView.naver?blogId=...&logNo=...
    if (clean.includes('logNo=')) {
      const parsed = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
      const blogId = parsed.searchParams.get('blogId');
      const logNo = parsed.searchParams.get('logNo');
      if (blogId && logNo) {
        return { blogId: blogId.trim(), logNo: logNo.trim() };
      }
    }

    // 2. Check path pattern: blog.naver.com/{blogId}/{logNo} or m.blog.naver.com/{blogId}/{logNo}
    const match = clean.match(/(?:blog\.naver\.com|m\.blog\.naver\.com)\/([a-zA-Z0-9_-]+)\/(\d+)/i);
    if (match) {
      return { blogId: match[1], logNo: match[2] };
    }

    // 3. Just digits passed as logNo
    if (/^\d{8,14}$/.test(clean)) {
      return { blogId: '', logNo: clean };
    }
  } catch {
    // URL parsing failed
  }
  return null;
}

/**
 * Intelligent Category Matcher:
 * Maps Naver blog category names and content to the 8 official clinic categories.
 * Note: '통증/추나' is strictly excluded from categories; any pain/structural keywords map to '자율신경실조증'.
 */
export function matchCategory(naverCategory: string = '', title: string = '', content: string = ''): string {
  const normCat = naverCategory.toLowerCase().trim();
  const text = `${title} ${content.slice(0, 1500)}`.toLowerCase();

  // 1. Direct Rule Matching on Naver Category name
  if (/뇌파|qeeg|정량뇌파|정량화뇌파|뇌파검사/.test(normCat)) {
    return '정량화뇌파검사';
  }
  if (/초민감|hsp|예민|고감각|민감자/.test(normCat)) {
    return '초민감자(HSP)';
  }
  if (/adhd|주의력|산만|집중력|도파민/.test(normCat)) {
    return 'ADHD';
  }
  if (/갑상선|저하증|항진증|하시모토/.test(normCat)) {
    return '갑상선';
  }
  if (/브레인포그|만성피로|피로|무기력|번아웃|brain\s*fog|부신/.test(normCat)) {
    return '브레인포그';
  }
  if (/다이어트|대사|비만|체중|감량|식욕|부종|체질|감비|퀀텀핏/.test(normCat)) {
    return '다이어트';
  }
  if (/위장|소화|역류|식도|과민|담적|내과|장질환|변비|설사|위염|복부|복압|장누수|장-뇌|장벽/.test(normCat)) {
    return '위장관';
  }
  if (/통증|추나|교정|재활|관절|디스크|척추|체형|목통증|허리통증|어깨통증|근골격/.test(normCat)) {
    return '통증';
  }
  if (/자율신경|실조증|어지럼|두근거림|공황|기립성|미주신경|심계|상열하한|상행성/.test(normCat)) {
    return '자율신경실조증';
  }

  // 2. Keyword scoring across Title (weight: 3) and Content (weight: 1)
  const scores: Record<string, number> = {
    '자율신경실조증': 0,
    '브레인포그': 0,
    '초민감자(HSP)': 0,
    'ADHD': 0,
    '다이어트': 0,
    '위장관': 0,
    '갑상선': 0,
    '정량화뇌파검사': 0,
    '통증': 0,
  };

  const scoreTerms = (cat: string, terms: string[]) => {
    for (const term of terms) {
      const lower = term.toLowerCase();
      if (title.toLowerCase().includes(lower)) {
        scores[cat] += 3;
      }
      if (text.includes(lower)) {
        scores[cat] += 1;
      }
    }
  };

  scoreTerms('정량화뇌파검사', [
    '정량화뇌파', '정량뇌파', 'qeeg', '뇌파검사', '뇌파기계', '뇌파장비',
    '뇌기능검사', '알파파', '베타파', '세타파', '뇌파'
  ]);

  scoreTerms('초민감자(HSP)', [
    'hsp', '초민감자', '초민감', '고감각', '예민한', '감각과민',
    '감각처리민감성', '빛과민', '소리과민', '감각수용체'
  ]);

  scoreTerms('ADHD', [
    'adhd', '주의력결핍', '집중력저하', '주의산만', '성인adhd',
    '충동성', '과잉행동', '도파민회로'
  ]);

  scoreTerms('갑상선', [
    '갑상선', '갑상선기능저하증', '갑상선기능항진증', '하시모토',
    '갑상선염', '티록신', 'tsh', '목이물감'
  ]);

  scoreTerms('브레인포그', [
    '브레인포그', 'brain fog', '만성피로', '피로감', '무기력',
    '번아웃', '기억력', '머리가 멍', '부신피로', '원기회복', '머리안개'
  ]);

  scoreTerms('다이어트', [
    '다이어트', '체중감량', '감비', '비만', '식욕', '요요', '대사증후군',
    '체지방', '디톡스', '비만치료', '인슐린', '살빼기', '식단', '체질개선', '퀀텀핏'
  ]);

  scoreTerms('위장관', [
    '위장', '역류성식도염', '소화불량', '담적', '담적병', '과민성대장증후군',
    '복부팽만', '가스', '속쓰림', '체기', '위염', '변비', '설사', '장누수', '장누수증후군', '장-뇌', '장뇌축', 'gut-brain',
    '장벽', '밀착연접', '장관', '장내', '장염', '대장', '소장', '유산균', '소화', '복통'
  ]);

  scoreTerms('통증', [
    '통증', '추나', '교정', '재활', '디스크', '척추', '골반', '경추', '요추',
    '관절', '목통증', '허리통증', '어깨통증', '체형교정', '근막', '신경통', '추나요법'
  ]);

  scoreTerms('자율신경실조증', [
    '자율신경', '자율신경실조증', '교감신경', '부교감신경', '미주신경',
    '기립성', '어지럼', '어지럼증', '심계항진', '두근거림', '식은땀', '자율신경계', '가슴답답', '상열하한', 'gaba', '상행성'
  ]);

  let maxCategory = '자율신경실조증';
  let maxScore = 0;
  for (const [cat, sc] of Object.entries(scores)) {
    if (sc > maxScore) {
      maxScore = sc;
      maxCategory = cat;
    }
  }

  return maxCategory;
}

/**
 * Discovers and lists all posts from a Naver Blog ID using Naver's async title list
 * with mandatory multi-page pagination (currentPage=1, 2, 3...) and RSS fallback.
 * Ensures all posts (e.g. 60+ posts dating back to early September) are retrieved.
 */
export async function fetchNaverBlogPosts(
  blogId: string,
  maxPosts: number = 500
): Promise<NaverDiscoveredPost[]> {
  const cleanId = blogId.trim();
  if (!cleanId) return [];

  const allPosts: NaverDiscoveredPost[] = [];
  const seenLogNos = new Set<string>();

  // Pre-fetch RSS feed to map logNo -> true Naver blog category
  const rssCatMap: Record<string, string> = {};
  try {
    const rssRes = await fetch(`https://rss.blog.naver.com/${cleanId}.xml`, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/xml,text/xml,*/*',
      },
    });
    if (rssRes.ok) {
      const xml = await rssRes.text();
      const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
      for (const it of items) {
        const linkM = it.match(/<link>([\s\S]*?)<\/link>/i);
        const catM = it.match(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/i) || it.match(/<category>([\s\S]*?)<\/category>/i);
        const logNo = linkM ? linkM[1].match(/(\d{6,14})/)?.[1] : null;
        if (logNo && catM) {
          rssCatMap[logNo] = catM[1].trim();
        }
      }
    }
  } catch (e) {
    console.error('RSS prefetch error:', e);
  }

  // 1. Mandatory Pagination Loop via PostTitleListAsync.naver
  try {
    let page = 1;
    const countPerPage = 30; // 30 items per page as specified for Naver API
    const maxPages = 25; // Supports up to 750 posts across pages

    while (page <= maxPages && allPosts.length < maxPosts) {
      const url = `https://blog.naver.com/PostTitleListAsync.naver?blogId=${encodeURIComponent(
        cleanId
      )}&viewdate=&currentPage=${page}&categoryNo=0&parentCategoryNo=&countPerPage=${countPerPage}`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Referer: `https://blog.naver.com/${cleanId}`,
          Accept: '*/*',
          'Accept-Language': 'ko-KR,ko;q=0.9',
        },
      });

      if (!res.ok) {
        break;
      }

      let rawText = await res.text();
      rawText = rawText.trim();
      if (rawText.charCodeAt(0) === 0xfeff) {
        rawText = rawText.slice(1);
      }

      const targetSlashQuote = String.fromCharCode(92) + "'";
      const cleanRawText = rawText.split(targetSlashQuote).join("'");

      let data: any = null;
      try {
        data = JSON.parse(cleanRawText);
      } catch {
        const jsonMatch = cleanRawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            data = JSON.parse(jsonMatch[0]);
          } catch {
            // ignore
          }
        }
      }

      if (!data || !Array.isArray(data.postList) || data.postList.length === 0) {
        break;
      }

      let newPostsInPage = 0;
      for (const item of data.postList) {
        const logNo = String(item.logNo || '').trim();
        if (!logNo) continue;

        // Skip duplicates
        if (seenLogNos.has(logNo)) {
          continue;
        }
        seenLogNos.add(logNo);

        let rawTitle = item.title || '';
        try {
          rawTitle = decodeURIComponent(rawTitle.replace(/\+/g, ' '));
        } catch {
          // keep as is
        }
        const title = decodeHtmlEntities(rawTitle.replace(/<[^>]*>/g, '')).trim();

        let rawCat = rssCatMap[logNo] || item.categoryName || '';
        try {
          rawCat = decodeURIComponent(rawCat.replace(/\+/g, ' '));
        } catch {
          // keep as is
        }
        const categoryName = decodeHtmlEntities(rawCat).trim();

        const date = (item.addDate || '').trim();
        const postUrl = `https://blog.naver.com/${cleanId}/${logNo}`;
        const matched = matchCategory(categoryName, title, '');

        // Extract Naver representative thumbnail from list API
        let rawThumb =
          item.thumbUrl ||
          item.thumbnailUrl ||
          item.thumbnail ||
          item.representImageUrl ||
          item.titleImage ||
          '';
        let thumbnailUrl = '';
        if (rawThumb) {
          try {
            thumbnailUrl = decodeURIComponent(rawThumb.replace(/\+/g, ' '));
          } catch {
            thumbnailUrl = rawThumb;
          }
          if (thumbnailUrl.startsWith('//')) {
            thumbnailUrl = `https:${thumbnailUrl}`;
          }
          if (thumbnailUrl.includes('?type=')) {
            thumbnailUrl = thumbnailUrl.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
          }
        }

        allPosts.push({
          logNo,
          blogId: cleanId,
          title: title || `칼럼 ${logNo}`,
          categoryName: categoryName || '미분류',
          matchedCategory: matched,
          date: date || new Date().toISOString().slice(0, 10),
          url: postUrl,
          readCount: item.readCount,
          thumbnailUrl,
        });

        newPostsInPage++;
      }

      // If no new posts were added on this page (all were duplicates from prior pages), stop loop
      if (newPostsInPage === 0) {
        break;
      }

      // If this page returned fewer than countPerPage and we are at page 2 or higher, we reached the end
      if (data.postList.length < countPerPage && page >= 2) {
        break;
      }

      page++;
    }
  } catch (err) {
    console.error('Error fetching via PostTitleListAsync:', err);
  }

  // 2. Supplement with RSS if PostTitleListAsync returned fewer than 50 posts
  if (allPosts.length < 50) {
    try {
      const rssUrl = `https://rss.blog.naver.com/${cleanId}.xml`;
      const res = await fetch(rssUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/xml,text/xml,*/*',
        },
      });

      if (res.ok) {
        const xml = await res.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match: RegExpExecArray | null;

        while ((match = itemRegex.exec(xml)) !== null) {
          const itemXml = match[1];
          const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
          const link = linkMatch ? linkMatch[1].trim() : '';
          const norm = normalizeNaverUrl(link);
          const logNo = norm?.logNo || `rss-${allPosts.length + 1}`;

          if (seenLogNos.has(logNo)) continue;
          seenLogNos.add(logNo);

          const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) ||
            itemXml.match(/<title>([\s\S]*?)<\/title>/i);
          const catMatch = itemXml.match(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/i) ||
            itemXml.match(/<category>([\s\S]*?)<\/category>/i);
          const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

          const title = decodeHtmlEntities(titleMatch ? titleMatch[1] : `칼럼 ${logNo}`).trim();
          const categoryName = decodeHtmlEntities(catMatch ? catMatch[1] : '일반건강').trim();
          let dateStr = new Date().toISOString().slice(0, 10);
          if (dateMatch) {
            const parsedD = new Date(dateMatch[1]);
            if (!isNaN(parsedD.getTime())) {
              dateStr = parsedD.toISOString().slice(0, 10);
            }
          }

          allPosts.push({
            logNo,
            blogId: cleanId,
            title,
            categoryName,
            matchedCategory: matchCategory(categoryName, title, ''),
            date: dateStr,
            url: link || `https://blog.naver.com/${cleanId}/${logNo}`,
          });
        }
      }
    } catch (rssErr) {
      console.error('Error fetching RSS:', rssErr);
    }
  }

  return allPosts;
}

/**
 * Downloads a remote image from Naver CDN and saves locally to public/images/columns/
 * to prevent 403 Forbidden / broken images (엑박 방지).
 */
export async function downloadAndSaveImage(
  imageUrl: string,
  slugPrefix: string,
  index: number
): Promise<string | null> {
  try {
    let cleanUrl = imageUrl.trim();
    if (cleanUrl.startsWith('//')) {
      cleanUrl = `https:${cleanUrl}`;
    }

    // Skip tiny stickers, emojis, profile graphics
    if (
      cleanUrl.includes('static.se2.naver.com') ||
      cleanUrl.includes('gfmarket') ||
      cleanUrl.includes('emoticon') ||
      cleanUrl.includes('dthumb-phinf') ||
      cleanUrl.includes('blogfiles.pstatic.net/data')
    ) {
      return null;
    }

    // Upgrade thumbnail resolution from w80_blur etc to high quality w966
    if (cleanUrl.includes('?type=')) {
      cleanUrl = cleanUrl.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
    }

    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://m.blog.naver.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.warn(`Failed to download image ${cleanUrl}: ${res.status}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Skip tiny icons/spacers (< 3KB)
    if (buffer.length < 3000) {
      return null;
    }

    // Determine extension
    const contentType = res.headers.get('content-type') || '';
    let ext = '.jpg';
    if (contentType.includes('webp')) ext = '.webp';
    else if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('gif')) ext = '.gif';
    else {
      const urlExtMatch = cleanUrl.match(/\.(jpe?g|png|webp|gif)/i);
      if (urlExtMatch) ext = `.${urlExtMatch[1].toLowerCase()}`;
    }

    const safeSlug = slugPrefix
      .replace(/[^a-zA-Z0-9가-힣_-]/g, '')
      .slice(0, 25);
    const fileName = `naver_${safeSlug}_img_${index + 1}${ext}`;

    const candidateImageDirs = [
      path.join(getProjectRoot(), 'public', 'images', 'columns'),
      path.join(process.cwd(), 'public', 'images', 'columns'),
    ];

    for (const uploadDir of candidateImageDirs) {
      const destination = path.join(uploadDir, fileName);
      if (fs.existsSync(destination) && fs.statSync(destination).size > 3000) {
        return `/images/columns/${fileName}`;
      }
    }

    for (const uploadDir of candidateImageDirs) {
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const destination = path.join(uploadDir, fileName);
        fs.writeFileSync(destination, buffer);
        if (fs.existsSync(destination) && fs.statSync(destination).size > 0) {
          return `/images/columns/${fileName}`;
        }
      } catch {
        // try next candidate dir
      }
    }
    return cleanUrl;
  } catch (error) {
    console.error(`Error saving image from ${imageUrl}:`, error);
    return null;
  }
}

/**
 * Downloads a remote representative thumbnail image from Naver CDN and saves to
 * public/images/columns/thumbnails/ for the column list card view.
 */
/**
 * Validates if an image URL is an invalid, generic, or Naver "N blog" default logo
 */
export function isInvalidThumbnailUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return true;
  const clean = url.trim().toLowerCase();
  if (clean === '#' || clean === '' || clean.startsWith('javascript:')) return true;

  const invalidSignatures = [
    'og_default',
    'blog_og',
    'naver_blog',
    'static.naver',
    'default_thumb',
    'blogfiles.pstatic.net/data',
    'static.se2',
    'gfmarket',
    'emoticon',
    'profile',
    'dthumb-phinf',
    'blank.gif',
    'static.map',
    'staticmap',
    'blogpfthumb',
    'og_270x270',
  ];

  for (const sig of invalidSignatures) {
    if (clean.includes(sig)) return true;
  }

  return false;
}

/**
 * Extracts unique file hash or signature from Naver image URLs (e.g. MDAxNzg5NjI1MjMzNjg5...)
 */
export function extractNaverImageHash(url: string): string {
  if (!url) return '';
  const clean = decodeURIComponent(url);
  const mdaMatch = clean.match(/(MDAx[a-zA-Z0-9_-]+)/);
  if (mdaMatch) return mdaMatch[1];
  const pathMatch = clean.match(/\/([a-zA-Z0-9_\-\.]{15,})\/(?:image|[^\/]+\.(?:png|jpe?g|webp|gif))/i);
  if (pathMatch) return pathMatch[1];
  const segMatch = clean.match(/\/([a-zA-Z0-9_\-\.]{20,})\//);
  if (segMatch) return segMatch[1];
  return '';
}

/**
 * Downloads a remote representative thumbnail image from Naver CDN and saves to
 * public/images/columns/thumbnails/ as thumb_${logNo}.png for deterministic, collision-free loading.
 */
export async function downloadThumbnail(
  imageUrl: string,
  identifier: string
): Promise<string | null> {
  try {
    let cleanUrl = (imageUrl || '').trim();
    if (!cleanUrl) return null;
    if (cleanUrl.startsWith('//')) {
      cleanUrl = `https:${cleanUrl}`;
    }

    if (isInvalidThumbnailUrl(cleanUrl)) {
      return null;
    }

    // Convert domain to postfiles.pstatic.net and set ?type=w966 to bypass blogthumb 403/404 restrictions
    if (cleanUrl.includes('pstatic.net') && !cleanUrl.includes('static.se2')) {
      cleanUrl = cleanUrl
        .replace('blogthumb.pstatic.net', 'postfiles.pstatic.net')
        .replace('mblogthumb-phinf.pstatic.net', 'postfiles.pstatic.net');
      if (cleanUrl.includes('?type=')) {
        cleanUrl = cleanUrl.replace(/\?type=[^&]+/, '?type=w966');
      } else {
        cleanUrl = `${cleanUrl}?type=w966`;
      }
    }

    // Extract logNo or clean identifier to prevent filename collision
    const logNoMatch = identifier.match(/(\d{6,14})/);
    const safeId = logNoMatch
      ? logNoMatch[1]
      : identifier.replace(/[^a-zA-Z0-9가-힣_-]/g, '').slice(0, 30) || 'thumb';

    const isJpg = cleanUrl.toUpperCase().includes('.JPG') || cleanUrl.toUpperCase().includes('.JPEG');
    const ext = isJpg ? 'jpg' : 'png';
    const altExt = ext === 'png' ? 'jpg' : 'png';
    const fileName = `thumb_${safeId}.${ext}`;
    const altFileName = `thumb_${safeId}.${altExt}`;

    const candidateThumbDirs = [
      path.join(getProjectRoot(), 'public', 'images', 'columns', 'thumbnails'),
      path.join(process.cwd(), 'public', 'images', 'columns', 'thumbnails'),
    ];

    // If already downloaded and valid on disk, return existing local path
    for (const thumbDir of candidateThumbDirs) {
      const destination = path.join(thumbDir, fileName);
      try {
        if (fs.existsSync(destination) && fs.statSync(destination).size > 3000) {
          return `/images/columns/thumbnails/${fileName}`;
        }
      } catch {}
    }

    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': DESKTOP_USER_AGENT,
        Referer: 'https://m.blog.naver.com/',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Skip tiny icons/spacers (< 3KB)
    if (buffer.length < 3000) return null;

    for (const thumbDir of candidateThumbDirs) {
      try {
        if (!fs.existsSync(thumbDir)) {
          fs.mkdirSync(thumbDir, { recursive: true });
        }
        const destination = path.join(thumbDir, fileName);
        fs.writeFileSync(destination, buffer);

        // Also save alt extension copy for seamless routing
        const altDestination = path.join(thumbDir, altFileName);
        fs.writeFileSync(altDestination, buffer);

        if (fs.existsSync(destination) && fs.statSync(destination).size > 0) {
          return `/images/columns/thumbnails/${fileName}`;
        }
      } catch {
        // try next candidate dir
      }
    }
    return `/images/columns/thumbnails/${fileName}`;
  } catch (error) {
    console.error(`Error saving thumbnail from ${imageUrl}:`, error);
    return null;
  }
}

/**
 * Master Prompt HTML -> Markdown Converter
 * Faithfully implements all specifications:
 * 1. Top 3-line quote summary extraction
 * 2. Standalone bold line & title component -> '## 소제목'
 * 3. Line break & sentence spacing retention
 * 4. Local image download & alt replacement (엑박 방지)
 * 5. QEEG device introduction post link replacement to '/columns/qeeg-guide'
 * 6. Bottom medical notice & citations styled (~60% text-xs)
 * 7. Google Duplicate Content Prevention official web archive box insertion
 * 8. FAQ extraction for AEO Schema.org
 */
export function truncateJsGarbage(text: string): string {
  if (!text) return '';
  const jsSignatures = [
    'jindo.m.patch',
    'var gUrlMap',
    'NmobilePageViewSender',
    'nhn.MobileBlog',
    'var sAppVersion',
    'var gLogNo',
    'window.__viewerData',
    'var oEffect',
    'var sServiceType',
    'var sDomain',
    'var sDmain',
    'var sUserId',
    'new NmobilePageViewSender',
    '<script',
    'jindo.m',
  ];

  let earliestIdx = -1;
  for (const sig of jsSignatures) {
    const idx = text.indexOf(sig);
    if (idx !== -1) {
      if (earliestIdx === -1 || idx < earliestIdx) {
        earliestIdx = idx;
      }
    }
  }

  if (earliestIdx !== -1) {
    const before = text.slice(0, earliestIdx);
    const lastNewline = before.lastIndexOf('\n');
    if (lastNewline !== -1) {
      return before.slice(0, lastNewline).trim();
    }
    return before.trim();
  }
  return text.trim();
}

export async function convertNaverHtmlToMasterMarkdown(
  html: string,
  postTitle: string,
  slugPrefix: string,
  initialThumbnailUrl?: string,
  logNo?: string
): Promise<{
  content: string;
  summary: string;
  thumbnail: string;
  faqs: ColumnFaq[];
  tags: string[];
}> {
  let summary = '';
  let thumbnail = '';
  const faqs: ColumnFaq[] = [];
  const tagsSet = new Set<string>();

  // Step 0: 100% completely strip <script>...</script>, <style>...</style>, and <noscript>...</noscript> tags and their contents
  let cleanHtml = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  // Step 1: Extract main article container strictly (.se-main-container / mobile / PC)
  let bodyHtml = '';
  const seStartMatch = cleanHtml.match(/<div[^>]*class="[^"]*se-main-container[^"]*"[^>]*>/i);
  if (seStartMatch && seStartMatch.index !== undefined) {
    const startIdx = seStartMatch.index + seStartMatch[0].length;
    const postFooterMatch = cleanHtml
      .slice(startIdx)
      .search(
        /<div[^>]*class="[^"]*(?:post_footer|btn_like|viewTypeSelector|common_post_btn|comment_wrap|se-module-footer)[^"]*"/i
      );
    if (postFooterMatch !== -1) {
      bodyHtml = cleanHtml.slice(startIdx, startIdx + postFooterMatch);
    } else {
      bodyHtml = cleanHtml.slice(startIdx);
    }
  } else {
    const pvaMatch =
      cleanHtml.match(/<div\b[^>]*id="postViewArea"[^>]*>/i) ||
      cleanHtml.match(/<div\b[^>]*class="[^"]*(?:se_component_wrap|post_ct|post-view)[^"]*"[^>]*>/i);
    if (pvaMatch && pvaMatch.index !== undefined) {
      const startIdx = pvaMatch.index + pvaMatch[0].length;
      let openCount = 1;
      let endIndex = cleanHtml.length;
      const divTagRegex = /<\/?div\b[^>]*>/gi;
      divTagRegex.lastIndex = startIdx;
      let m: RegExpExecArray | null;
      while ((m = divTagRegex.exec(cleanHtml)) !== null) {
        if (m[0].startsWith('</')) openCount--;
        else openCount++;
        if (openCount === 0) {
          endIndex = m.index;
          break;
        }
      }
      bodyHtml = cleanHtml.substring(startIdx, endIndex);
    } else {
      const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      bodyHtml = bodyMatch ? bodyMatch[1] : cleanHtml;
    }
  }

  // Safety cutoff: Truncate at any internal Naver JavaScript signatures immediately
  bodyHtml = truncateJsGarbage(bodyHtml);

  // Fallback: If bodyHtml has almost no text, extract all paragraphs from cleanHtml
  if (bodyHtml.replace(/<[^>]*>/g, '').trim().length < 50) {
    const pMatches = cleanHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (pMatches && pMatches.length > 0) {
      bodyHtml = pMatches.join('\n');
      bodyHtml = truncateJsGarbage(bodyHtml);
    }
  }

  // 1. Extract Top Blockquote / Summary (인용구 상단 3줄 요약)
  const quoteRegex =
    /<blockquote[^>]*class="[^"]*(?:se_blockquote|se-quotation-container|se-quote-container|se-module-blockquote|se-quote|se-quotation|se-component-quotation)[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/i;
  const quoteMatch = bodyHtml.match(quoteRegex) || bodyHtml.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);

  if (quoteMatch) {
    let rawQuote = stripHtml(quoteMatch[1]).trim();
    rawQuote = rawQuote
      .replace(/^(?:💡\s*)?(?:(?:오브한의원\s*)?(?:전두희\s*원장의\s*)?(?:핵심\s*(?:진료\s*)?요약)|Medical\s*Summary|Summary)\s*[:\-\n\r]*/i, '')
      .replace(/^[>\s💡]+/g, '')
      .trim();
    if (rawQuote.length >= 10) {
      summary = rawQuote;
      bodyHtml = bodyHtml.replace(quoteMatch[0], '');
    }
  }

  // 2. Extract FAQs if present (Q&A pattern: Q. ... / A. ...)
  const qaPattern = /(?:<p[^>]*>|\n|^)\s*(?:<b>|<strong>)?\s*(?:Q\.|질문\s*\d*[:\.]?)\s*([^<\n]+)(?:<\/b>|<\/strong>)?[\s\S]*?(?:<p[^>]*>|\n)\s*(?:<b>|<strong>)?\s*(?:A\.|답변\s*\d*[:\.]?)\s*([^<\n]+)(?:<\/b>|<\/strong>)?/gi;
  let qaMatch: RegExpExecArray | null;
  while ((qaMatch = qaPattern.exec(bodyHtml)) !== null) {
    const q = stripHtml(qaMatch[1]);
    const a = stripHtml(qaMatch[2]);
    if (q && a && q.length > 5 && a.length > 5) {
      faqs.push({ question: q, answer: a });
    }
  }

  // 3. Extract Tags (Naver post tags)
  const tagRegex = /<a[^>]*class="[^"]*item_tag[^"]*"[^>]*>#?([^<]+)<\/a>/gi;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagRegex.exec(cleanHtml)) !== null) {
    const tag = stripHtml(tagMatch[1]).replace(/^#/, '').trim();
    if (tag) tagsSet.add(tag);
  }

  // Pre-strip Naver UI noise (Check-in, other posts of this place, MY place)
  bodyHtml = bodyHtml
    .replace(/이\s*블로그의\s*체크인\s*이\s*장소의\s*다른\s*글/gi, '')
    .replace(/이\s*블로그의\s*체크인/gi, '')
    .replace(/이\s*장소의\s*다른\s*글/gi, '')
    .replace(/MY\s*플레이스/gi, '')
    .replace(/MY플레이스/gi, '');

  // Strip caption containers completely so captions and repeated titles are never emitted
  bodyHtml = bodyHtml
    .replace(/<(?:div|p|span)[^>]*class="[^"]*(?:se-caption|se-module-caption|se-image-caption)[^"]*"[^>]*>[\s\S]*?<\/(?:div|p|span)>/gi, '')
    .replace(/<p[^>]*class="[^"]*se_textarea[^"]*"[^>]*>\s*[\*_]?(?:설명\s*:|오브한의원)[^<]*<\/(?:p|span)>/gi, '');

  // Strip <a> tags wrapping images (e.g. <a href="#" class="se-module-image-link"><img ...></a>)
  // so images are never converted into [ ![alt](src) ](#)
  bodyHtml = bodyHtml.replace(/<a\b[^>]*>([\s\S]*?<img\b[\s\S]*?>[\s\S]*?)<\/a>/gi, '$1');
  bodyHtml = bodyHtml.replace(/<a\b[^>]*class="[^"]*se-module-image-link[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, '$1');
  bodyHtml = bodyHtml.replace(/<a\b[^>]*href=["'](?:#|javascript:[^"']*)["'][^>]*>(\s*<img\b[\s\S]*?<\/a>)/gi, (m) => {
    return m.replace(/<\/?a\b[^>]*>/gi, '');
  });

  // Safe identifier for thumbnail downloading
  const logNoMatch = (logNo || slugPrefix).match(/(\d{6,14})/);
  const safeLogNo = logNoMatch
    ? logNoMatch[1]
    : slugPrefix.replace(/[^a-zA-Z0-9가-힣_-]/g, '').slice(0, 30) || 'thumb';

  // 4. Extract Images prioritizing data-lazy-src over src (Naver SmartEditor Lazy Loading)
  const imageRegex = /<img\b[^>]*>/gi;
  let imgMatch: RegExpExecArray | null;
  const imagesToDownload: { originalTag: string; src: string; alt: string; index: number }[] = [];
  let imgIdx = 0;

  while ((imgMatch = imageRegex.exec(bodyHtml)) !== null) {
    const originalTag = imgMatch[0];

    // Priority 1: data-lazy-src or data-src
    let src = '';
    const lazyMatch =
      originalTag.match(/\bdata-lazy-src=["']([^"']+)["']/i) ||
      originalTag.match(/\bdata-src=["']([^"']+)["']/i);

    if (lazyMatch && lazyMatch[1]) {
      src = lazyMatch[1].trim();
    } else {
      // Priority 2: regular src
      const srcMatch = originalTag.match(/\bsrc=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        src = srcMatch[1].trim();
      }
    }

    if (!src || src.startsWith('data:image') || src.includes('blank.gif')) {
      continue;
    }

    if (src.startsWith('//')) {
      src = `https:${src}`;
    }

    // Skip tiny stickers, emojis, profile graphics
    if (
      src.includes('static.se2.naver.com') ||
      src.includes('gfmarket') ||
      src.includes('emoticon') ||
      src.includes('blogfiles.pstatic.net/data')
    ) {
      continue;
    }

    // Upgrade low-res thumbnail query params like ?type=w80 to ?type=w966
    if (src.includes('?type=')) {
      src = src.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
    }

    let alt = '';
    const altMatch = originalTag.match(/\balt=["']([^"']*)["']/i);
    if (altMatch && altMatch[1]) {
      alt = stripHtml(altMatch[1]).trim();
    }

    imagesToDownload.push({ originalTag, src, alt, index: imgIdx++ });
  }

  // -------------------------------------------------------------
  // Determine candidate representative thumbnail URL strictly according to priorities:
  // -------------------------------------------------------------
  let candidateThumbUrl = '';

  // [1순위 - A] initialThumbnailUrl passed from list API (PostTitleListAsync.naver)
  if (initialThumbnailUrl && !isInvalidThumbnailUrl(initialThumbnailUrl)) {
    let t = initialThumbnailUrl.trim();
    if (t.startsWith('//')) t = `https:${t}`;
    if (t.includes('?type=')) {
      t = t.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
    }
    candidateThumbUrl = t;
  }

  // [1순위 - B] Mobile HTML script object: newRecommendationBlockView "thumbnailUrl"
  if (!candidateThumbUrl) {
    const scriptThumbMatch =
      cleanHtml.match(/"newRecommendationBlockView"[\s\S]*?"thumbnailUrl"\s*:\s*"([^"]+)"/i) ||
      cleanHtml.match(/"thumbnailUrl"\s*:\s*"(https?:\/\/[^"]+)"/i);
    if (scriptThumbMatch && !isInvalidThumbnailUrl(scriptThumbMatch[1])) {
      let t = scriptThumbMatch[1].trim().replace(/\\u002F/g, '/').replace(/\\\//g, '/');
      if (t.startsWith('//')) t = `https:${t}`;
      if (t.includes('?type=')) {
        t = t.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
      }
      candidateThumbUrl = t;
    }
  }

  // [1순위 - C] <meta property="og:image" content="...">
  if (!candidateThumbUrl) {
    const ogMatch =
      cleanHtml.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      cleanHtml.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i) ||
      cleanHtml.match(/<meta\s+(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/i);
    if (ogMatch && !isInvalidThumbnailUrl(ogMatch[1])) {
      let t = ogMatch[1].trim();
      if (t.startsWith('//')) t = `https:${t}`;
      if (t.includes('?type=')) {
        t = t.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
      }
      candidateThumbUrl = t;
    }
  }

  // [2순위 - A] In .se-main-container: .se-thumbnail or data-is-representative="true"
  if (!candidateThumbUrl) {
    const repImgMatch =
      bodyHtml.match(/<img[^>]*(?:class="[^"]*se-thumbnail[^"]*"|data-is-representative=["']true["'])[^>]*>/i);
    if (repImgMatch) {
      const srcMatch =
        repImgMatch[0].match(/\bdata-lazy-src=["']([^"']+)["']/i) ||
        repImgMatch[0].match(/\bdata-src=["']([^"']+)["']/i) ||
        repImgMatch[0].match(/\bsrc=["']([^"']+)["']/i);
      if (srcMatch && !isInvalidThumbnailUrl(srcMatch[1])) {
        let t = srcMatch[1].trim();
        if (t.startsWith('//')) t = `https:${t}`;
        if (t.includes('?type=')) {
          t = t.replace(/\?type=[a-zA-Z0-9_]+/, '?type=w966');
        }
        candidateThumbUrl = t;
      }
    }
  }

  const candidateHash = extractNaverImageHash(candidateThumbUrl);

  // Download images in sequence and replace in HTML
  let firstLocalImage = '';
  const downloadedBodyImages: { originalTag: string; src: string; localUrl: string | null; alt: string; index: number }[] = [];

  for (const item of imagesToDownload) {
    const localUrl = await downloadAndSaveImage(item.src, slugPrefix, item.index);
    if (!firstLocalImage && localUrl && localUrl.startsWith('/images/columns/')) {
      firstLocalImage = localUrl;
    }

    downloadedBodyImages.push({
      ...item,
      localUrl,
    });

    const safeAlt = (item.alt || '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/[\[\]\(\)\"#]/g, '')
      .replace(/↗/g, '')
      .replace(/\s*설명:\s*.*$/g, '')
      .replace(/\s*-\s*오브한의원\s*$/g, '')
      .trim();

    const finalAlt = safeAlt && safeAlt.length <= 50 ? safeAlt : '오브한의원 임상 칼럼';
    const effectiveImgUrl = localUrl || item.src;

    // Pure standalone markdown image syntax with NO extra caption line
    const replacementMd = `\n\n![${finalAlt}](${effectiveImgUrl})\n\n`;
    bodyHtml = bodyHtml.replace(item.originalTag, replacementMd);
  }

  // -------------------------------------------------------------
  // [100% 성공하는 대표 이미지 매칭 로직]
  // -------------------------------------------------------------
  // [매칭 1순위 - 본문 이미지 중 대표 사진 찾기]:
  // 추출한 대표 썸네일 해시값과 일치하는 본문 이미지를 찾아 그 경로를 thumbnail로 설정
  if (candidateHash) {
    const matchedBodyItem = downloadedBodyImages.find((it) => {
      const itHash = extractNaverImageHash(it.src);
      return (itHash && itHash === candidateHash) || it.src.includes(candidateHash);
    });

    if (matchedBodyItem) {
      // Save this exact representative image to public/images/columns/thumbnails/thumb_[logNo].png
      const localThumb = await downloadThumbnail(matchedBodyItem.src, safeLogNo);
      if (localThumb) {
        thumbnail = localThumb;
      } else if (matchedBodyItem.localUrl) {
        thumbnail = matchedBodyItem.localUrl;
      } else {
        thumbnail = matchedBodyItem.src;
      }
    }
  }

  // [매칭 2순위 - 대표 이미지 도메인 변환 후 직접 다운로드]:
  // 만약 본문 이미지 목록에서 매칭이 안 될 경우, 추출한 candidateThumbUrl을 postfiles 도메인으로 변환 다운로드
  if (!thumbnail && candidateThumbUrl) {
    const localThumb = await downloadThumbnail(candidateThumbUrl, safeLogNo);
    if (localThumb) {
      thumbnail = localThumb;
    } else {
      // 절대 브라우저 403 에러를 유발하는 원격 blogthumb URL을 직접 넣지 않음
      thumbnail = '';
    }
  }

  // [매칭 3순위 - 본문 첫 번째 로컬 이미지]:
  if (!thumbnail && firstLocalImage) {
    thumbnail = firstLocalImage;
  }

  // [절대 금지]: 한의원 내부 인테리어 사진 대체 금지 - 비어있을 경우 빈 문자열 유지
  if (thumbnail && (thumbnail.startsWith('/images/clinic/') || isInvalidThumbnailUrl(thumbnail))) {
    thumbnail = '';
  }

  // Helper: Detect if a link refers to the Naver QEEG device introduction post
  const isQeegPostReference = (url: string, text: string): boolean => {
    const combined = `${url} ${text}`.toLowerCase();
    const hasQeegTerm = /qeeg|정량뇌파|정량화뇌파|뇌파검사|뇌파기계|뇌파장비|뇌파\s*측정/.test(combined);
    const isNaverOrLocal = /blog\.naver\.com|naver\.com|orbclinic|\/columns\//.test(combined);
    return hasQeegTerm && (isNaverOrLocal || /기기|소개|안내|검사|과정|장비/.test(combined));
  };

  // Naver Map & Place Module conversion to authentic place URL
  bodyHtml = replaceBalancedDivComponent(
    bodyHtml,
    '<div[^>]*class="[^"]*(?:se-component\\s+se-placesMap|se-placesMap|se-section-placesMap|se-module-map|se-component-map|se-map)[^"]*"[^>]*>',
    () => `\n\n[📍 **오브한의원 마곡점 (서울특별시 강서구 마곡중앙로 111, 롯데캐슬 르웨스트 104동 2층)**](${NAVER_PLACE_SEARCH_URL})\n\n`
  );

  // 5. OpenGraph Card Links (네이버 지도 플레이스, 톡톡, 뇌파기기 소개글 등 보존 및 치환)
  bodyHtml = replaceBalancedDivComponent(
    bodyHtml,
    '<div[^>]*class="[^"]*(?:se-component\\s+se-oglink|se-oglink|se-module-oglink)[^"]*"[^>]*>',
    (compHtml) => {
      const linkMatch = compHtml.match(/href="([^"]+)"/i);
      const titleMatch = compHtml.match(/class="[^"]*se-oglink-title[^"]*"[^>]*>([\s\S]*?)<\/strong>/i) ||
                         compHtml.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
      if (linkMatch) {
        const href = linkMatch[1];
        const linkTitle = titleMatch ? stripHtml(titleMatch[1]).trim() : '관련 정보 바로가기';

        if (isQeegPostReference(href, linkTitle)) {
          return `\n\n[👉 오브한의원 습식 정량화 뇌파(QEEG) 측정 과정 및 장비 안내 보러가기](/columns/습식-정량-뇌파-측정-과정에-대해-안내해드립니다-314941)\n\n`;
        }
        if (href.includes('booking.naver.com')) {
          return `\n\n[🗓️ **오브한의원 마곡점 네이버 빠른 예약 바로가기**](${href})\n\n`;
        }
        if (href.includes('map.naver.com') || href.includes('naver.me') || href.includes('place.naver.com')) {
          return `\n\n[📍 **오브한의원 마곡점 네이버 지도(플레이스) 바로가기**](${href})\n\n`;
        }
        if (href.includes('talk.naver.com')) {
          return `\n\n[💬 **오브한의원 네이버 톡톡 1:1 상담 바로가기**](${href})\n\n`;
        }
        if (href.includes('pf.kakao.com')) {
          return `\n\n[💬 **오브한의원 카카오톡 채널 문의 바로가기**](${href})\n\n`;
        }
        return `\n\n[🔗 **${linkTitle}**](${href})\n\n`;
      }
      return '';
    }
  );

  // Regular anchor links
  bodyHtml = bodyHtml.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    // If text contains an image markdown ![...](...), unwrap and ignore link (especially href="#")
    if (text.includes('![') && text.includes('](')) {
      return text;
    }

    const cleanText = stripHtml(text);
    if (!cleanText) return '';

    if (isQeegPostReference(href, cleanText)) {
      return `[👉 오브한의원 습식 정량화 뇌파(QEEG) 측정 과정 및 장비 안내 보러가기](/columns/습식-정량-뇌파-측정-과정에-대해-안내해드립니다-314941)`;
    }
    if (href.includes('booking.naver.com')) {
      return `[🗓️ **${cleanText}**](${href})`;
    }
    if (href.includes('map.naver.com') || href.includes('naver.me') || href.includes('place.naver.com')) {
      return `[📍 **${cleanText}**](${href})`;
    }
    if (href.includes('talk.naver.com')) {
      return `[💬 **${cleanText}**](${href})`;
    }
    if (href.includes('pf.kakao.com')) {
      return `[💬 **${cleanText}**](${href})`;
    }

    // Map & Address links with href="#" or location text -> Real Naver Place
    const lower = cleanText.toLowerCase();
    const isLocationRelated =
      lower.includes('오브한의원') ||
      lower.includes('마곡') ||
      lower.includes('강서구') ||
      lower.includes('마곡중앙로') ||
      lower.includes('르웨스트') ||
      lower.includes('지도') ||
      lower.includes('위치') ||
      lower.includes('플레이스');

    if (href === '#' || href === '' || href.startsWith('javascript:') || isLocationRelated) {
      if (isLocationRelated) {
        return `[📍 **${cleanText.replace(/^📍\s*/, '')}**](${NAVER_PLACE_SEARCH_URL})`;
      }
      return cleanText;
    }

    return `[${cleanText}](${href})`;
  });

  // 6. Tables Conversion with placeholder preservation (prevents <div>/stripHtml from squashing tables into 1 line)
  const convertedTables: string[] = [];
  const cleanTableCell = (cellInner: string): string => {
    let t = cellInner
      .replace(/<\/p>\s*<p[^>]*>/gi, '<br>')
      .replace(/<br\s*\/?>/gi, '<br>')
      .replace(/<(?:b|strong)[^>]*>([\s\S]*?)<\/(?:b|strong)>/gi, '**$1**')
      .replace(/<[^>]*>/g, '');
    t = decodeHtmlEntities(t)
      .replace(/[\u200B\uFEFF]/g, '')
      .replace(/\|/g, '\\|')
      .replace(/\s*<br>\s*/gi, '<br>')
      .replace(/^(?:<br>)+|(?:<br>)+$/gi, '')
      .replace(/([\u200B\s]+[•\u2022]\s+)/g, '<br>• ')
      .replace(/\s+/g, ' ')
      .trim();
    return t || '-';
  };

  // Match both outer .se-table wrapper and bare tables
  bodyHtml = replaceBalancedDivComponent(
    bodyHtml,
    '<div[^>]*class="[^"]*(?:se-component\\s+se-table|se-table)[^"]*"[^>]*>',
    (compHtml) => {
      const tableMatch = compHtml.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
      if (!tableMatch) return '';
      const rows = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
      if (rows.length === 0) return '';

      const mdRows: string[] = [];
      rows.forEach((row: string, rIdx: number) => {
        const cells = row.match(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi) || [];
        const cellTexts = cells.map(cleanTableCell);
        if (cellTexts.length > 0) {
          mdRows.push(`| ${cellTexts.join(' | ')} |`);
          if (rIdx === 0) {
            const sep = cellTexts.map(() => ':---').join(' | ');
            mdRows.push(`| ${sep} |`);
          }
        }
      });
      const placeholder = `%%%NAVER_TABLE_TOKEN_${convertedTables.length}%%%`;
      convertedTables.push(mdRows.join('\n'));
      return `\n\n${placeholder}\n\n`;
    }
  );

  bodyHtml = bodyHtml.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableInner) => {
    const rows = tableInner.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    if (rows.length === 0) return '';

    const mdRows: string[] = [];
    rows.forEach((row: string, rIdx: number) => {
      const cells = row.match(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi) || [];
      const cellTexts = cells.map(cleanTableCell);
      if (cellTexts.length > 0) {
        mdRows.push(`| ${cellTexts.join(' | ')} |`);
        if (rIdx === 0) {
          const sep = cellTexts.map(() => ':---').join(' | ');
          mdRows.push(`| ${sep} |`);
        }
      }
    });
    const placeholder = `%%%NAVER_TABLE_TOKEN_${convertedTables.length}%%%`;
    convertedTables.push(mdRows.join('\n'));
    return `\n\n${placeholder}\n\n`;
  });

  // 7. Subheadings & Paragraphs Conversion (H2, H3, large fonts, bold, underline, italic)
  bodyHtml = bodyHtml.replace(
    /<div[^>]*class="[^"]*(?:se-heading|se-section-documentTitle|se-title-text)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    (_, inner) => `\n\n## ${stripHtml(inner)}\n\n`
  );

  bodyHtml = bodyHtml.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, inner) => `\n\n## ${stripHtml(inner)}\n\n`);
  bodyHtml = bodyHtml.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, inner) => `\n\n### ${stripHtml(inner)}\n\n`);
  bodyHtml = bodyHtml.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, inner) => `\n\n### ${stripHtml(inner)}\n\n`);

  // Parse se-text-paragraph with full formatting retention
  bodyHtml = bodyHtml.replace(/<p[^>]*class="[^"]*se-text-paragraph[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => {
    return convertHtmlParagraph(inner);
  });

  // Standard <p> and <div>
  bodyHtml = bodyHtml.replace(/<br\s*\/?>/gi, '\n\n');
  bodyHtml = bodyHtml.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => convertHtmlParagraph(inner));
  bodyHtml = bodyHtml.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (_, inner) => convertHtmlParagraph(inner));

  // Strip remaining HTML tags except preserved <u> tags
  let markdown = decodeHtmlEntities(bodyHtml.replace(/<\/?(?!u\b)[a-zA-Z0-9_-]+\b[^>]*>/gi, ''));

  // Restore preserved tables
  if (convertedTables.length > 0) {
    markdown = markdown.replace(/%%%NAVER_TABLE_TOKEN_(\d+)%%%/g, (_, id) => {
      const tbl = convertedTables[Number(id)];
      return tbl ? `\n\n${tbl}\n\n` : '';
    });
  }

  // Reference heading & bracket index separation
  // Fix: "### 참고 문헌 (References) [1]\n\n논문제목..." -> "### 참고 문헌 (References)\n\n[1] 논문제목..."
  markdown = markdown.replace(
    /(^|\n)\s*(#{0,4}\s*\[?(?:참고\s*문헌|References?|참고자료|학술\s*출처(?:\s*및\s*참고\s*문헌)?)(?:\s*(?:및\s*출처\s*링크))?(?:\s*\((?:References?|참고\s*문헌|학술\s*출처|출처|근거|문헌)\))?\]?)\s*(\[\d+\])(?:(?:\r?\n+)|\s+)([^\n#\-📌\s])/gi,
    (match, p1, heading, index, firstChar) => {
      const cleanHeading = heading.trim();
      const formattedHeading = cleanHeading.startsWith('#')
        ? cleanHeading
        : `### ${cleanHeading.replace(/^\[\s*|\s*\]$/g, '')}`;
      return `\n\n${formattedHeading}\n\n${index} ${firstChar}`;
    }
  );

  // Fix reference heading glued directly to text without bracket index
  markdown = markdown.replace(
    /(^|\n)\s*(#{0,4}\s*\[?(?:참고\s*문헌|References?|참고자료|학술\s*출처(?:\s*및\s*참고\s*문헌)?)(?:\s*(?:및\s*출처\s*링크))?(?:\s*\((?:References?|참고\s*문헌|학술\s*출처|출처|근거|문헌)\))?\]?)\s+([A-Za-z가-힣\*\"'])/gi,
    (match, p1, heading, firstChar) => {
      const cleanHeading = heading.trim();
      const formattedHeading = cleanHeading.startsWith('#')
        ? cleanHeading
        : `### ${cleanHeading.replace(/^\[\s*|\s*\]$/g, '')}`;
      return `\n\n${formattedHeading}\n\n${firstChar}`;
    }
  );

  // Ensure headings separated with double newlines before and after
  markdown = markdown.replace(/([^\n])[\u200B\s]*(#{2,4}\s+[^\n]+)/g, '$1\n\n$2');
  markdown = markdown.replace(/(#{2,4}\s+[^\n]+)\n([^\n#\s])/g, '$1\n\n$2');

  // Split headings and body paragraphs cleanly using splitHeadingAndBody across all blocks
  const rawBlocks = markdown.split(/\n{2,}/);
  const processedBlocks: string[] = [];
  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const split = splitHeadingAndBody(trimmed);
    for (const sub of split.split(/\n{2,}/)) {
      if (sub.trim()) processedBlocks.push(sub.trim());
    }
  }
  markdown = processedBlocks.join('\n\n').trim();

  // Format list bullets, ordinals, numbers onto separate lines (outside table rows)
  const mdLines = markdown.split('\n');
  markdown = mdLines
    .map((l) => {
      if (l.trim().startsWith('|') || l.trim().startsWith('---')) return l;
      let res = l;

      // Ordinals: 첫째, 둘째, 셋째, 넷째, 다섯째 (with or without **, comma, colon)
      res = res.replace(
        /([^\n#|])[\u200B\s]+(\**[첫둘셋넷다]째[,\s:]|\**[첫둘셋넷다]째\b\**)/g,
        '$1\n\n$2'
      );

      // Numbered lists: 1. 2. 3. (avoid dates like 2024. 10. 1.)
      res = res.replace(
        /([.!?다요죠음임함됨]|[:;]|["'”’)]|\*{2})[\u200B\s]+([1-9]\d{0,1}\.\s+[가-힣A-Za-z])/g,
        (match, p1, p2, offset, str) => {
          const ctx = str.slice(Math.max(0, offset - 10), offset + match.length + 10);
          if (/(?:19|20)\d\d\.\s*\d+\./.test(ctx)) return match;
          return `${p1}\n\n${p2}`;
        }
      );

      // Bullets: •, -, ▶
      res = res.replace(
        /([.!?다요죠음임함됨]|[:;]|["'”’)]|\*{2})[\u200B\s]+([•\u2022▶]\s*[가-힣A-Za-z])/g,
        '$1\n\n• $2'
      );
      res = res.replace(
        /([.!?다요죠음임함됨]|[:;]|["'”’)]|\*{2})[\u200B\s]+(-\s+[가-힣A-Za-z])/g,
        '$1\n\n$2'
      );
      res = res.replace(
        /([가-힣\w\.\?\!\"\'\)\]])[\u200B\s]+(-\s+[A-Za-z가-힣])/g,
        '$1\n\n$2'
      );

      // Other lists like [1] or (1) or ①-⑩
      res = res.replace(
        /([.!?다요죠음임함됨]|[:;]|["'”’)]|\*{2})[\u200B\s]+([①-⑩]\s*)/g,
        '$1\n\n$2'
      );
      res = res.replace(
        /([^\n#|*\-+])[\u200B \t]+(\[\d{1,2}\]\s*[A-Za-z가-힣\"'])/g,
        '$1\n\n$2'
      );

      // ZWS between sentences: in Naver SmartEditor, empty paragraph breaks were stored as \u200B
      res = res.replace(
        /([.!?다요죠음임함됨:;\"'”’\*\)\]])[\u200B\s]+[\u200B]+[\u200B\s]*([가-힣A-Za-z0-9"'(<📍👉📌])/g,
        '$1\n\n$2'
      );

      // Strip trailing ZWS at line ends
      res = res.replace(/[\u200B\uFEFF\s]+$/g, '');

      return res;
    })
    .join('\n');

  // Strip remaining stray zero-width spaces
  markdown = markdown.replace(/[\u200B\uFEFF]/g, '');

  // If no summary was found from blockquote, extract first substantive sentences without truncation
  if (!summary) {
    const paragraphs = markdown.split('\n\n').filter((p) => {
      const tp = p.trim();
      return tp && !tp.startsWith('#') && !tp.startsWith('!') && !tp.startsWith('---') && !tp.startsWith('📌');
    });
    if (paragraphs.length > 0) {
      summary = paragraphs[0].trim();
    } else {
      summary = `${postTitle}에 대한 전두희 대표원장의 한의학적 진단과 치료 칼럼입니다.`;
    }
  }

  summary = summary
    .replace(/^(?:💡\s*)?(?:(?:오브한의원\s*)?(?:전두희\s*원장의\s*)?(?:핵심\s*(?:진료\s*)?요약)|Medical\s*Summary|Summary)\s*[:\-\n\r]*/i, '')
    .trim();

  // The summary is stored separately in the 'summary' field and rendered by the page component.
  // We do NOT prepend it into the markdown body to avoid duplicate summary boxes.

  // 9. Format Academic References & Medical Legal Disclaimer at the bottom
  // First strip any pre-existing multiple notice headers to prevent accumulation
  markdown = markdown.replace(/(?:---\s*\n+)?###\s*📚?\s*의학\s*학술\s*레퍼런스\s*및\s*의료법\s*고지\s*\n+/gi, '');

  const disclaimerPattern =
    /(?:(?:\[\s*의료법[^\n\]]*\]|["'“]?\s*본\s*(?:게시물|글|포스팅)은\s*의료법|※\s*본\s*(?:게시물|글|포스팅)은|※\s*검사\s*및\s*진료\s*안내사항|의료법\s*제\s*56조|\[References[^\]]*\]|참고문헌|references?|\[1\]\s*[A-Z가-힣]))/i;
  const discMatch = markdown.match(disclaimerPattern);
  if (discMatch && discMatch.index !== undefined && discMatch.index > markdown.length / 2) {
    let splitIdx = discMatch.index;
    let mainBody = markdown.slice(0, splitIdx);
    let tail = markdown.slice(splitIdx);

    // Clean any trailing fragment of the disclaimer opening from mainBody
    mainBody = mainBody
      .replace(/["'“]?\s*본\s*(?:게시물|글|포스팅)은\s*$/i, '')
      .replace(/\[\s*의료법\s*(?:면책\s*)?고지\s*\]?\s*$/i, '')
      .replace(/["'“]\s*$/g, '')
      .trim();

    tail = tail.trim();
    if (tail.startsWith('의료법 제56조') || tail.startsWith('제56조')) {
      tail = `본 게시물은 ${tail}`;
    }
    tail = tail.replace(/^#+\s*(?:📚\s*)?(?:의학\s*학술\s*레퍼런스\s*및\s*)?의료법\s*고지\s*[\r\n]*/i, '').trim();

    markdown = `${mainBody}\n\n---\n\n### 📚 의학 학술 레퍼런스 및 의료법 고지\n\n${tail}`;
  }

  // 10. Append Official Google Duplicate Content Prevention Archive Notice Box if not present
  if (!markdown.includes('정식 웹 아카이브 안내')) {
    markdown += `\n\n---\n\n📌 [정식 웹 아카이브 안내] 본 칼럼은 오브한의원 공식 네이버 블로그에 연재된 임상 칼럼을 기반으로, 의학적 근거와 최신 검사 기준을 보완하여 영구 보존·게재한 공식 웹 아카이브 문서입니다. 무단 복제 및 전재를 금합니다.\n`;
  }

  // Convert closing contact notice to "네이버톡톡 혹은 카카오톡으로 부탁드립니다"
  markdown = markdown.replace(
    /네이버\s*톡톡으로\s*부탁드립니다/g,
    '네이버톡톡 혹은 카카오톡으로 부탁드립니다'
  );

  markdown = truncateJsGarbage(markdown);
  summary = truncateJsGarbage(summary);

  // Final cleanup for UI noise, captions, broken wrappers, empty bold lines, and JSON leaks
  markdown = markdown
    .replace(/\{\s*"title"\s*:\s*"[\s\S]*?"logNo"\s*:\s*\d+[\s\S]*?\}/gi, '')
    .replace(/\{\s*"title"\s*:\s*"[^"]*"[\s\S]*?"blogDisplay"\s*:\s*true[\s\S]*?\}/gi, '')
    .replace(/\*\*[\s\u200B\uFEFF]*\*\*/g, '')
    .replace(/^[ \t]*\*{2,}[ \t]*$/gm, '')
    .replace(/\n([ \t]*\*{2,}[ \t]*\n)+/g, '\n\n')
    .replace(/이\s*블로그의\s*체크인\s*이\s*장소의\s*다른\s*글/gi, '')
    .replace(/이\s*블로그의\s*체크인/gi, '')
    .replace(/이\s*장소의\s*다른\s*글/gi, '')
    .replace(/MY\s*플레이스/gi, '')
    .replace(/MY플레이스/gi, '')
    .replace(/(?:\r?\n)\s*[\*_]설명\s*:[^\r\n\*_]*[\*_]\s*(?:\r?\n|$)/gi, '\n\n')
    .replace(/\[\s*!\[([^\]]*)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)\s*\]\([^)]*\)/gi, '\n\n![$1]($2)\n\n')
    .replace(/!\[[^\]]*\]\(#\)/gi, '')
    .replace(/!\[[^\]]*\]\(\s*\)/gi, '')
    .replace(/![\"']([^\"'\n\r]+)[\"']/g, '**$1**')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  markdown = removeTopDuplicateImage(markdown);

  return {
    content: markdown,
    summary,
    thumbnail,
    faqs,
    tags: Array.from(tagsSet).slice(0, 8),
  };
}

export function getCategoryFallbackThumbnail(category: string): string {
  return '';
}

/**
 * Fetches and imports a single Naver blog post by URL or metadata,
 * converting it to the Master Prompt spec and writing it to content/columns/<slug>.json.
 * Safely avoids duplicates (especially existing QEEG introduction article).
 */
export async function importSingleNaverPost(input: {
  url: string;
  blogId?: string;
  logNo?: string;
  title?: string;
  categoryName?: string;
  forceCategory?: string;
  thumbnailUrl?: string;
  overwrite?: boolean;
}): Promise<Column> {
  const norm = normalizeNaverUrl(input.url);
  const blogId = input.blogId || norm?.blogId || 'orbmed';
  const logNo = input.logNo || norm?.logNo || '';

  if (!logNo) {
    throw new Error(`유효한 네이버 글 번호(logNo)를 찾을 수 없습니다: ${input.url}`);
  }

  // Fetch post HTML using mobile or direct PostView URL
  const fetchConfigs: { url: string; headers: Record<string, string> }[] = [];

  if (blogId && logNo) {
    // 1. Mobile blog URL (Priority: MOBILE_USER_AGENT prevents 302 redirect to desktop frameset)
    fetchConfigs.push({
      url: `https://m.blog.naver.com/${encodeURIComponent(blogId)}/${encodeURIComponent(logNo)}`,
      headers: {
        'User-Agent': MOBILE_USER_AGENT,
        Referer: 'https://m.blog.naver.com/',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });

    // 2. Desktop PostView URL with full parameters & desktop UA
    fetchConfigs.push({
      url: `https://blog.naver.com/PostView.naver?blogId=${encodeURIComponent(
        blogId
      )}&logNo=${encodeURIComponent(logNo)}&redirect=Dlog&widgetTypeCall=true`,
      headers: {
        'User-Agent': DESKTOP_USER_AGENT,
        Referer: `https://blog.naver.com/${encodeURIComponent(blogId)}`,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });
  }

  if (input.url && !fetchConfigs.some((c) => c.url === input.url)) {
    fetchConfigs.push({
      url: input.url,
      headers: {
        'User-Agent': MOBILE_USER_AGENT,
        Referer: 'https://m.blog.naver.com/',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });
  }

  let html = '';
  for (const config of fetchConfigs) {
    try {
      const res = await fetch(config.url, {
        headers: config.headers,
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const text = await res.text();
        const isFrameset = text.includes('<frameset') || text.includes('var postContent = "";');
        const hasContent =
          text.includes('se-main-container') ||
          text.includes('se-viewer') ||
          text.includes('se_component_wrap') ||
          text.includes('post_ct') ||
          text.includes('postViewArea');

        if (text && text.length > 500 && !isFrameset && hasContent) {
          html = text;
          break;
        }
      }
    } catch {
      // try next URL
    }
  }

  if (!html) {
    throw new Error(`네이버 글 본문을 불러올 수 없습니다 (HTML 파싱 실패: logNo ${logNo})`);
  }

  // Extract Title: Prioritize .se-title-text, .se_title, JSON metadata, then og:title
  let title = '';
  const jsonTitleMatch = html.match(/"title"\s*:\s*"([^"]+)"\s*,\s*"source"/i);
  const seTitleMatch =
    html.match(/<div[^>]*class=["'][^"']*(?:se-title-text|se_title)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<h3[^>]*class=["']se_textarea["'][^>]*>([\s\S]*?)<\/h3>/i);
  const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']*)["']/i);
  const htmlTitleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);

  const titleCandidates = [
    seTitleMatch ? stripHtml(seTitleMatch[1]) : '',
    jsonTitleMatch ? decodeHtmlEntities(jsonTitleMatch[1]) : '',
    input.title || '',
    ogTitleMatch ? stripHtml(ogTitleMatch[1]) : '',
    htmlTitleMatch ? stripHtml(htmlTitleMatch[1]) : '',
  ]
    .map((t) =>
      t
        .replace(/\s*:\s*네이버\s*블로그\s*$/i, '')
        .replace(/^\[오브한의원\]\s*/i, '')
        .trim()
    )
    .filter((t) => t && t !== '오브한의원' && t !== '네이버 블로그');

  if (titleCandidates.length > 0) {
    title = titleCandidates.reduce((longest, curr) => (curr.length > longest.length ? curr : longest), '');
  }
  if (!title) {
    title = `네이버 칼럼 ${logNo}`;
  }

  // Check for Duplicate Prevention against content/columns/
  const existingColumns = getAllColumns();

  // Duplicate Check 1: Is this post introducing the QEEG equipment?
  const isQeegIntro =
    (/신경성입니다/i.test(title) && /정량뇌파|qeeg/i.test(title)) ||
    (/정량뇌파|정량화뇌파|qeeg/i.test(title) && /장비|기기|도입|소개|시각화|신경 피로/i.test(title));

  const existingQeeg = existingColumns.find(
    (c) => c.slug === 'qeeg-guide' || c.title.includes('정량뇌파(qEEG)검사')
  );

  if (isQeegIntro && existingQeeg && !input.overwrite) {
    return {
      ...existingQeeg,
      skipped: true,
      skipReason: '기존 등록된 정량뇌파 소개 칼럼(qeeg-guide)과 중복되어 안전하게 건너뛰었습니다.',
    };
  }

  // Duplicate Check 2: Check matching title or existing slug
  const normTitle = title.replace(/\s+/g, '').toLowerCase();
  const duplicate = existingColumns.find((c) => {
    const cNorm = c.title.replace(/\s+/g, '').toLowerCase();
    if (normTitle.length >= 6 && cNorm === normTitle) return true;
    if (cNorm.length > 15 && normTitle.length > 15 && (cNorm.includes(normTitle) || normTitle.includes(cNorm))) {
      return true;
    }
    // Also match logNo suffix in slug
    if (logNo && c.slug.endsWith(`-${logNo.slice(-6)}`)) {
      return true;
    }
    return false;
  });

  if (duplicate && !input.overwrite) {
    return {
      ...duplicate,
      skipped: true,
      skipReason: `이미 등록된 칼럼('${duplicate.title}')과 중복되어 안전하게 건너뛰었습니다.`,
    };
  }

  // Extract Category from page if not provided
  let categoryName = input.categoryName || '';
  if (!categoryName) {
    const catMatch1 = html.match(/sendClickNlog\(['"]pst\.category['"][^>]*>([^<]+)<\/a>/i);
    const catMatch2 = html.match(/href=['"][^'"]*categoryNo=\d+[^'"]*['"][^>]*class=['"][^'"]*pcol2[^'"]*['"][^>]*>([^<]+)<\/a>/i);
    const catMatch3 = html.match(/(?:baParams|nlog2Params)\.categoryName\s*=\s*['"]([^'"]+)['"]/i);
    const catMatch4 = html.match(/CategoryName\s*=\s*"([^"\r\n]+)"/i);
    const catMatch5 = html.match(/categoryName\s*=\s*"%([0-9a-fA-F%]+)"/i);
    const catMatchLegacy =
      html.match(/<span[^>]*class="[^"]*category_title[^"]*"[^>]*>([\s\S]*?)<\/span>/i) ||
      html.match(/<a[^>]*class="[^"]*blog2_series[^"]*"[^>]*>([\s\S]*?)<\/a>/i) ||
      html.match(/<a[^>]*class="[^"]*link_category[^"]*"[^>]*>([\s\S]*?)<\/a>/i);

    if (catMatch1 && catMatch1[1].trim()) {
      categoryName = stripHtml(catMatch1[1]);
    } else if (catMatch2 && catMatch2[1].trim()) {
      categoryName = stripHtml(catMatch2[1]);
    } else if (catMatch3 && catMatch3[1].trim() && catMatch3[1].trim() !== '전체보기') {
      categoryName = catMatch3[1].trim();
    } else if (catMatch4 && catMatch4[1].trim()) {
      try {
        categoryName = JSON.parse('"' + catMatch4[1] + '"').trim();
      } catch {
        categoryName = catMatch4[1].trim();
      }
    } else if (catMatch5 && catMatch5[1]) {
      try {
        categoryName = decodeURIComponent('%' + catMatch5[1]).trim();
      } catch {}
    } else if (catMatchLegacy) {
      categoryName = stripHtml(catMatchLegacy[1]);
    }
  }

  // Extract Date
  let date = new Date().toISOString().slice(0, 10);
  const dateMatch =
    html.match(/<span[^>]*class="[^"]*se_publishDate[^"]*"[^>]*>([\s\S]*?)<\/span>/i) ||
    html.match(/<p[^>]*class="[^"]*blog_date[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  if (dateMatch) {
    const rawDate = stripHtml(dateMatch[1]);
    const parsedDate = rawDate.match(/(\d{4})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})/);
    if (parsedDate) {
      date = `${parsedDate[1]}-${parsedDate[2].padStart(2, '0')}-${parsedDate[3].padStart(2, '0')}`;
    }
  }

  // Generate safe slug or preserve duplicate's slug when overwriting
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 35) || `naver-post-${logNo}`;

  const slug = duplicate ? duplicate.slug : `${baseSlug}-${logNo.slice(-6)}`;

  // Convert HTML to Master Markdown and download images & thumbnail
  const { content, summary, thumbnail, faqs, tags } = await convertNaverHtmlToMasterMarkdown(
    html,
    title,
    slug,
    input.thumbnailUrl,
    logNo
  );

  // Determine Category (must be one of the 8 official clinic categories)
  const finalCategory =
    input.forceCategory || matchCategory(categoryName, title, content);

  const finalThumbnail = thumbnail || '';

  // Construct ColumnInput
  const columnInput: ColumnInput = {
    id: duplicate?.id || `col-${slug}`,
    slug,
    title,
    summary,
    content,
    category: finalCategory,
    author: '전두희 원장',
    date,
    tags: tags.length > 0 ? tags : [finalCategory, '마곡한의원', '오브한의원', '건강칼럼'],
    thumbnail: finalThumbnail,
    faqs,
  };

  // Save to content/columns/<slug>.json AND <slug>.md
  return saveColumn(columnInput);
}
