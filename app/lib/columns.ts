import fs from 'fs';
import path from 'path';

export * from './columnTypes';
import { CLINIC_CATEGORIES, Column, ColumnFaq, ColumnInput } from './columnTypes';

declare global {
  var __ORB_RUNTIME_COLUMNS__: Map<string, Column> | undefined;
}

export function getMemoryStore(): Map<string, Column> {
  if (!globalThis.__ORB_RUNTIME_COLUMNS__) {
    globalThis.__ORB_RUNTIME_COLUMNS__ = new Map<string, Column>();
  }
  return globalThis.__ORB_RUNTIME_COLUMNS__;
}

export function normalizeCategory(rawCat: string = ''): string {
  if (rawCat.includes('통증') || rawCat.includes('추나')) return '자율신경실조증';
  if (/뇌파|qeeg/i.test(rawCat)) return '정량화뇌파검사';
  if (rawCat.includes('브레인포그')) return '브레인포그';
  if (rawCat.includes('다이어트')) return '다이어트';
  if (rawCat.includes('위장')) return '위장관';
  if (rawCat.includes('갑상선')) return '갑상선';
  if (/초민감|hsp/i.test(rawCat)) return '초민감자(HSP)';
  if (/adhd/i.test(rawCat)) return 'ADHD';
  return CLINIC_CATEGORIES.includes(rawCat as any) ? rawCat : '자율신경실조증';
}

export function decodeTextEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&middot;/g, '·')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ');
}

export const CATEGORY_THUMBNAILS: Record<string, string> = {};

export function getCategoryFallbackThumbnail(category: string): string {
  return '';
}

export const NAVER_PLACE_SEARCH_URL =
  'https://map.naver.com/p/search/%EC%98%A4%EB%B8%8C%ED%95%9C%EC%9D%98%EC%9B%90%20%EB%A7%88%EA%B3%A1%EC%A0%90';

export function extractFirstLocalImage(content: string): string | null {
  if (!content) return null;
  // 1. Direct local column image
  const localMatch = content.match(/!\[.*?\]\((\/images\/columns\/[^\s\)]+)\)/i);
  if (localMatch && localMatch[1]) {
    return localMatch[1];
  }
  // 2. Any local /images/ path
  const anyLocal = content.match(/!\[.*?\]\((\/images\/[^\s\)]+)\)/i);
  if (anyLocal && anyLocal[1]) {
    return anyLocal[1];
  }
  // 3. Fallback to valid remote image if no local
  const httpMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i);
  if (httpMatch && httpMatch[1] && !httpMatch[1].includes('static.se2')) {
    return httpMatch[1];
  }
  return null;
}

export function cleanJsGarbageFromText(text: string): string {
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

  let cleaned = text;
  // Strip any script, style, noscript tags
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  let earliestIdx = -1;
  for (const sig of jsSignatures) {
    const idx = cleaned.indexOf(sig);
    if (idx !== -1) {
      if (earliestIdx === -1 || idx < earliestIdx) {
        earliestIdx = idx;
      }
    }
  }

  if (earliestIdx !== -1) {
    const before = cleaned.slice(0, earliestIdx);
    const lastNewline = before.lastIndexOf('\n');
    if (lastNewline !== -1) {
      return before.slice(0, lastNewline).trim();
    }
    return before.trim();
  }
  return cleaned.trim();
}

export function getQeegColumnSlug(): string {
  const store = getMemoryStore();
  const all = Array.from(store.values());

  // 1. Post with '314941' (wet QEEG measurement guide)
  const target314941 = all.find((c) => c.slug.includes('314941') || c.title.includes('습식 정량 뇌파 측정 과정'));
  if (target314941) return target314941.slug;

  // 2. Any column with category '정량화뇌파검사' that is not qeeg-guide
  const qeegNonGuide = all.find((c) => c.category === '정량화뇌파검사' && c.slug !== 'qeeg-guide');
  if (qeegNonGuide) return qeegNonGuide.slug;

  // 3. Fallback: qeeg-guide or default slug
  const qeegGuide = all.find((c) => c.slug === 'qeeg-guide');
  if (qeegGuide) return qeegGuide.slug;

  return '습식-정량-뇌파-측정-과정에-대해-안내해드립니다-314941';
}

export function cleanTableCell(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/([\u200B\s]+[•\u2022]\s+)/g, '<br>• ');
  cleaned = cleaned.replace(/\n+/g, '<br>');
  cleaned = cleaned.replace(/(?:<br\s*\/?>\s*)+/gi, '<br>');
  cleaned = cleaned.replace(/^<br\s*\/?>|<br\s*\/?>$/gi, '');
  return cleaned || '-';
}

export function repairTableText(text: string): string {
  if (!text.includes('| :---') && !text.includes('|:---') && !text.includes('| --- |')) return text;
  const lines = text.split('\n');
  const fixedLines: string[] = [];
  for (const line of lines) {
    if (
      (line.includes('| :---') || line.includes('|:---') || line.includes('| --- |')) &&
      (line.match(/\|\s*\|/g) || []).length > 1
    ) {
      const rawRows = line.split(/\|\s*\|\s*/).map((r) => r.trim()).filter(Boolean);
      const rows = rawRows.map((r) => {
        let row = r;
        if (row.startsWith('|')) row = row.slice(1).trim();
        if (row.endsWith('|')) row = row.slice(0, -1).trim();
        const cells = row.split('|').map((c) => cleanTableCell(c));
        return `| ${cells.join(' | ')} |`;
      });
      fixedLines.push(rows.join('\n'));
    } else {
      fixedLines.push(line);
    }
  }
  return fixedLines.join('\n');
}

export function splitHeadingAndBody(block: string): string {
  if (!block) return '';
  const trimmed = block.trim();
  if (!trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
    return block;
  }

  const match = trimmed.match(/^(#{2,3})\s+(.+)$/s);
  if (!match) return block;

  const hashes = match[1];
  const fullText = match[2].trim();

  // 0. Reference header with bracket index: e.g. "참고 문헌 (References) [1]" -> "## 참고 문헌 (References)\n\n[1] ..."
  const refIndexMatch = fullText.match(
    /^((?:\[?참고\s*문헌[^\]\n]*\]?|References?|참고자료|학술\s*출처(?:\s*및\s*참고\s*문헌)?)(?:\s*(?:및\s*출처\s*링크))?(?:\s*\((?:References?|참고\s*문헌|학술\s*출처|출처|근거|문헌)\))?\]?)\s*(\[\d+\])([\s\S]*)$/i
  );
  if (refIndexMatch) {
    const heading = refIndexMatch[1].trim();
    const bracketNum = refIndexMatch[2].trim();
    const rest = refIndexMatch[3].trim();
    if (rest) {
      return `${hashes} ${heading}\n\n${bracketNum} ${rest}`;
    }
    return `${hashes} ${heading}\n\n${bracketNum}`;
  }

  // If already contains newlines, ensure the first line is the heading
  if (fullText.includes('\n')) {
    const lines = fullText.split('\n');
    const firstLine = lines[0].trim();
    const rest = lines.slice(1).join('\n').trim();
    if (firstLine.length <= 80) {
      return `${hashes} ${firstLine}\n\n${rest}`;
    }
  }

  // Short clean heading without multiple sentences
  if (fullText.length <= 60 && !/(?:입니다|합니다|됩니다|있습니다|습니다|했으나|하지만|따라서)\.\s+/.test(fullText)) {
    return block;
  }

  // 1. Quoted heading: e.g. "인용구 제목" 본문... or "인용구 제목" "인용구 본문"...
  const quoteMatch = fullText.match(/^([“"'][^”"'\n]{5,90}[”"'])\s+([\s\S]+)$/);
  if (quoteMatch) {
    return `${hashes} ${quoteMatch[1].trim()}\n\n${quoteMatch[2].trim()}`;
  }

  // 2. Bold title: **1.1. 제목** 본문...
  const boldMatch = fullText.match(/^\*\*([^*]+)\*\*\s*[:\-]?\s*(.+)$/s);
  if (boldMatch) {
    const heading = boldMatch[1].trim();
    const body = boldMatch[2].trim();
    return `${hashes} ${heading}\n\n${body}`;
  }

  // 3. Question mark: e.g. "왜 내 몸은 계속 아플까요? 본문..."
  const qIdx = fullText.indexOf('?');
  if (qIdx !== -1 && qIdx <= 80 && qIdx < fullText.length - 5) {
    const heading = fullText.slice(0, qIdx + 1).trim();
    const body = fullText.slice(qIdx + 1).trim();
    if (body.length > 0) {
      return `${hashes} ${heading}\n\n${body}`;
    }
  }

  // 4. Period after subtitle: e.g. "1.1. 정량뇌파와 심박변이도 평가. 전전두엽 피질의..."
  const periodMatch = fullText.match(
    /^((?:\d+(?:\.\d+)*\.?|[①-⑩]|\d+\))\s*[^.!?\n]{3,80}\.)\s+([가-힣A-Za-z0-9"'].+)$/s
  );
  if (periodMatch) {
    return `${hashes} ${periodMatch[1].trim()}\n\n${periodMatch[2].trim()}`;
  }

  // 5. Reference header: e.g. [참고문헌] [1] ... or 참고 문헌 (References) [1] ...
  const refMatch = fullText.match(/^(\[?참고\s*문헌[^\]\n]*\]?(?:\s*\([^\)\n]+\))?)\s+([\s\S]+)$/);
  if (refMatch) {
    return `${hashes} ${refMatch[1].trim()}\n\n${refMatch[2].trim()}`;
  }

  // 6. Header with colon: e.g. "피부 저항(임피던스) 관리의 중요성: 전도성 매개체 없이..."
  const colonMatch = fullText.match(/^([^:\n]{3,50}:)\s+([가-힣A-Za-z0-9"'].+)$/s);
  if (colonMatch && colonMatch[2].length > 15) {
    return `${hashes} ${colonMatch[1].trim()}\n\n${colonMatch[2].trim()}`;
  }

  // 7. Special specific known fixed headers like "문의사항은 네이버톡톡 혹은 카카오톡으로 부탁드립니다"
  const naverTalkMatch = fullText.match(/^(문의사항은\s*네이버\s*톡톡(?:으로|\s*혹은\s*카카오톡으로)\s*부탁드립니다\.?)\s+([가-힣A-Za-z0-9"'].+)$/s);
  if (naverTalkMatch) {
    return `${hashes} ${naverTalkMatch[1].trim()}\n\n${naverTalkMatch[2].trim()}`;
  }

  // 8. Numbered subtitle ending with known noun/concept
  const nounMatch = fullText.match(
    /^((?:\d+(?:\.\d+)*\.?|[①-⑩]|\d+\))\s*[^.!?\n]{3,95}?(?:대응|기전|분석|치료|요법|시스템|원리|안내|평가|특징|원인|증상|기준|소개|방법|접근|비교|차이|역할|회복|개요|정의|프로토콜|검사|포인트|핵심|과정|이유|리셋|딜레마|가설|전략|비교|검증|보완|완화|한계|접점|메커니즘|중요성|확인))\s+([가-힣A-Za-z"'].+)$/s
  );
  if (nounMatch && nounMatch[2].length > 15) {
    return `${hashes} ${nounMatch[1].trim()}\n\n${nounMatch[2].trim()}`;
  }

  // 9. Numbered subtitle with parenthesis: e.g. "1. 극도의 불안과 불면, 심계항진 (입력 필터 강화) 복령의..."
  const numParenMatch = fullText.match(
    /^(\d+\.\s*[^(\n]{2,35}\s*\([^)\n]{2,20}\))\s+([가-힣A-Za-z0-9"'].+)$/s
  );
  if (numParenMatch) {
    return `${hashes} ${numParenMatch[1].trim()}\n\n${numParenMatch[2].trim()}`;
  }

  // 10. Numbered subtitle with colon: e.g. "1. 성상신경차단술(SGB): 강력하지만 일시적인 리셋 목 앞쪽에..."
  const numSubMatch = fullText.match(
    /^((?:\d+(?:\.\d+)*\.?|[①-⑩]|\d+\))\s*[^:\n]{2,30}:\s*[^ \n]{2,30}(?:\s+[^ \n]{2,30}){0,3})\s+([가-힣A-Za-z0-9"'].+)$/s
  );
  if (numSubMatch && numSubMatch[2].length > 15) {
    return `${hashes} ${numSubMatch[1].trim()}\n\n${numSubMatch[2].trim()}`;
  }

  // 11. General noun endings without number prefix
  const generalNounMatch = fullText.match(
    /^([^.!?\n]{3,60}?(?:대응|기전|분석|치료|요법|시스템|원리|안내|평가|특징|원인|증상|기준|소개|방법|접근|비교|차이|역할|회복|개요|정의|프로토콜|검사|포인트|핵심|과정|이유|리셋|딜레마|접점|메커니즘|중요성|확인))\s+([가-힣A-Za-z"'].+)$/s
  );
  if (generalNounMatch && generalNounMatch[2].length > 15) {
    return `${hashes} ${generalNounMatch[1].trim()}\n\n${generalNounMatch[2].trim()}`;
  }

  // 12. Fallback for long block (> 75 chars): split at first sentence ending
  if (fullText.length > 75) {
    const sentenceMatch = fullText.match(/^((?:\d+\.\d*|[①-⑩]|\d+\))?[^.!?\n]{5,70}?[.!?])\s+(.+)$/s);
    if (sentenceMatch && sentenceMatch[2].length > 15) {
      return `${hashes} ${sentenceMatch[1].trim()}\n\n${sentenceMatch[2].trim()}`;
    }
  }

  return block;
}

export function removeTopDuplicateImage(markdown: string): string {
  if (!markdown) return '';
  const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)/g;
  const matches = [...markdown.matchAll(imgRegex)];
  if (matches.length < 2) return markdown;

  const getHash = (url: string) => {
    const m = url.match(/(MDAx[a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    return url.split('?')[0].split('/').pop() || url;
  };

  const firstImg = matches[0];
  if (firstImg.index !== undefined && firstImg.index < 1200) {
    const firstHash = getHash(firstImg[2]);
    const hasDuplicateLater = matches.slice(1).some((m) => {
      const laterHash = getHash(m[2]);
      return m[2] === firstImg[2] || (firstHash && laterHash && firstHash === laterHash);
    });

    if (hasDuplicateLater) {
      const before = markdown.slice(0, firstImg.index);
      const after = markdown.slice(firstImg.index + firstImg[0].length);
      return (before + after).replace(/\n{3,}/g, '\n\n').trim();
    }
  }

  return markdown;
}

export function cleanAndRepairMarkdown(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Strip script, style, noscript tags and JS runtime signatures
  cleaned = cleanJsGarbageFromText(cleaned);

  // 1-A. Strip leaked SmartEditor JSON metadata block
  cleaned = cleaned.replace(/\{\s*"title"\s*:\s*"[\s\S]*?"logNo"\s*:\s*\d+[\s\S]*?\}/gi, '');
  cleaned = cleaned.replace(/\{\s*"title"\s*:\s*"[^"]*"[\s\S]*?"blogDisplay"\s*:\s*true[\s\S]*?\}/gi, '');

  // 1-AA. Strip empty bold markers and standalone asterisks
  cleaned = cleaned.replace(/\*\*[\s\u200B\uFEFF]*\*\*/g, '');
  cleaned = cleaned.replace(/^[ \t]*\*{2,}[ \t]*$/gm, '');
  cleaned = cleaned.replace(/\n([ \t]*\*{2,}[ \t]*\n)+/g, '\n\n');

  // 1-AC. Strip duplicate top image if the exact same image appears later in the body
  cleaned = removeTopDuplicateImage(cleaned);

  // 1-AA2. Normalize closing contact notice to "네이버톡톡 혹은 카카오톡으로 부탁드립니다"
  cleaned = cleaned.replace(
    /네이버\s*톡톡으로\s*부탁드립니다/g,
    '네이버톡톡 혹은 카카오톡으로 부탁드립니다'
  );

  // 1-AB. Fix glued medical disclaimer where "본 게시물은 was severed before the divider
  cleaned = cleaned.replace(
    /([^\n\r]+?)\s*["'“]?\s*본\s*(?:게시물|글|포스팅)은\s*(?:\r?\n\s*)*---\s*(?:\r?\n\s*)*###\s*📚\s*의학 학술 레퍼런스 및 의료법 고지\s*(?:\r?\n\s*)*(?:["'“]?\s*본\s*(?:게시물|글|포스팅)은\s*)?/gi,
    '$1\n\n---\n\n### 📚 의학 학술 레퍼런스 및 의료법 고지\n\n본 게시물은 '
  );
  cleaned = cleaned.replace(
    /(문의사항은\s*네이버\s*톡톡(?:으로|\s*혹은\s*카카오톡으로)\s*부탁드립니다[^\n]*?)\s*(?:["'“]?\s*본\s*(?:게시물|글|포스팅)은\s*의료법)/gi,
    '$1\n\n---\n\n### 📚 의학 학술 레퍼런스 및 의료법 고지\n\n본 게시물은 의료법'
  );

  // 1-B. Strip top duplicate summary blockquote and duplicate summary paragraphs
  const quoteSummaryPattern = /^(?:>\s*(?:💡\s*)?\**\s*(?:(?:전두희\s*원장의\s*)?핵심\s*(?:진료\s*)?요약|Medical\s*Summary|Summary)[^\n]*\n)(?:>[^\n]*\n*)+/i;
  cleaned = cleaned.replace(quoteSummaryPattern, '').trim();

  // If text starts with any summary blockquote
  if (cleaned.startsWith('>')) {
    const lines = cleaned.split('\n');
    let quoteEnd = 0;
    while (quoteEnd < lines.length && (lines[quoteEnd].trim().startsWith('>') || !lines[quoteEnd].trim())) {
      quoteEnd++;
    }
    const topQuote = lines.slice(0, quoteEnd).join(' ');
    if (topQuote.includes('핵심') || topQuote.includes('요약') || topQuote.includes('Summary')) {
      cleaned = lines.slice(quoteEnd).join('\n').trim();
    }
  }

  // Strip leading divider
  cleaned = cleaned.replace(/^---+[\r\n]*/, '').trim();

  // Strip duplicate bold summary paragraph directly following the quote box if present
  const firstPMatch = cleaned.match(/^\*\*(원인\s*모를[^\*]+|\s*심장내과[^\*]+|\s*집중력[^\*]+|\s*감각처리[^\*]+)\*\*/);
  if (firstPMatch && firstPMatch[1].length > 40) {
    cleaned = cleaned.replace(/^\*\*[^\*]{40,}\*\*[\r\n]*/, '').trim();
  }

  // Strip invisible empty bold tags like **​** **​**
  cleaned = cleaned.replace(/^(\*\*[\u200b\s]*\*\*[\s\r\n]*)+/g, '').trim();
  cleaned = cleaned.replace(/^---+[\r\n]*/, '').trim();

  // 2. Remove Naver Check-in & Place residual UI text
  cleaned = cleaned
    .replace(/이\s*블로그의\s*체크인\s*이\s*장소의\s*다른\s*글/gi, '')
    .replace(/이\s*블로그의\s*체크인/gi, '')
    .replace(/이\s*장소의\s*다른\s*글/gi, '')
    .replace(/MY\s*플레이스/gi, '')
    .replace(/MY플레이스/gi, '');

  // 3. Remove standalone caption lines (*설명: ...* or _설명: ..._)
  cleaned = cleaned.replace(/(?:\r?\n)\s*[\*_]설명\s*:[^\r\n\*_]*[\*_]\s*(?:\r?\n|$)/gi, '\n\n');

  // 3-B. Unwrap images inside bold tags: **... ![alt](src) ...**
  cleaned = cleaned.replace(
    /\*\*([^*]*?)!\[([^\]]*)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)([^*]*?)\*\*/g,
    '**$1**\n\n![$2]($3)\n\n**$4**'
  );

  // 4. Unwrap broken image link wrappers: [ ![alt](src) ](#) or [ ![alt](src) ](...)
  cleaned = cleaned.replace(
    /\[\s*!\[([^\]]*)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)\s*\]\([^)]*\)/gi,
    '\n\n![$1]($2)\n\n'
  );

  // 4-B. Convert bare Naver image URLs into markdown image tags
  cleaned = cleaned.replace(
    /(^|[\s\n])(https?:\/\/(?:[a-zA-Z0-9_-]+\.)*(?:phinf\.pstatic\.net|pstatic\.net)\/[^\s\)\"']+\.(?:png|jpe?g|webp|gif)(?:\?type=[^\s\)\"']*)?)([\s\n]|$)/gi,
    '$1\n\n![오브한의원 임상 칼럼]($2)\n\n$3'
  );

  // 5. Remove dummy/broken markdown images that link to # or have broken formats
  cleaned = cleaned.replace(/!\[[^\]]*\]\(#\)/gi, '');
  cleaned = cleaned.replace(/!\[[^\]]*\]\(\s*\)/gi, '');

  // 6. Convert broken !"..." or !'...' to bold text
  cleaned = cleaned.replace(/![\"']([^\"'\n\r]+)[\"']/g, '**$1**');

  // 7. Clean alt text inside any remaining ![alt](src) - remove ugly post title fallbacks
  cleaned = cleaned.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)/gi, (_, alt, src) => {
    let cleanAlt = (alt || '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/[\[\]\(\)\"#]/g, '')
      .replace(/↗/g, '')
      .replace(/\s*설명:\s*/g, '')
      .replace(/\s*-\s*오브한의원\s*$/g, '')
      .trim();
    if (cleanAlt.length > 50 || cleanAlt.includes('오브한의원')) {
      cleanAlt = '오브한의원 임상 칼럼';
    }
    return `![${cleanAlt}](${src})`;
  });

  // 8. Replace map/address links having href="#" or empty href with authentic Naver Place Search URL
  cleaned = cleaned.replace(/\[([^\]]+)\]\((?:#|javascript:[^)]*)\)/gi, (match, linkText) => {
    const lower = linkText.toLowerCase();
    if (
      lower.includes('오브한의원') ||
      lower.includes('마곡') ||
      lower.includes('강서구') ||
      lower.includes('마곡중앙로') ||
      lower.includes('르웨스트') ||
      lower.includes('지도') ||
      lower.includes('위치') ||
      lower.includes('플레이스')
    ) {
      return `[📍 **${linkText.trim().replace(/^📍\s*/, '')}**](${NAVER_PLACE_SEARCH_URL})`;
    }
    return linkText;
  });

  // 9. [문제 2] QEEG measurement guide link replacement to internal column
  const qeegSlug = getQeegColumnSlug();
  const qeegInternalUrl = `/columns/${qeegSlug}`;
  const qeegButtonText = '👉 오브한의원 습식 정량화 뇌파(QEEG) 측정 과정 및 장비 안내 보러가기';

  // Match any Naver blog link or "관련 정보 바로가기" referring to QEEG/뇌파
  cleaned = cleaned.replace(
    /\[\s*\**\s*(?:관련\s*정보\s*바로가기|정량뇌파.*?바로가기|뇌파검사.*?바로가기|뇌파.*?보러가기|[^\*\]]*뇌파[^\*\]]*)\s*\**\s*\]\((?:https?:\/\/(?:m\.)?blog\.naver\.com\/[^\)]+|[^\)]*qeeg[^\)]*|[^\)]*314941[^\)]*)\)/gi,
    `[${qeegButtonText}](${qeegInternalUrl})`
  );
  cleaned = cleaned.replace(
    /\[\s*\**\s*관련\s*정보\s*바로가기\s*\**\s*\]\((?:https?:\/\/(?:m\.)?blog\.naver\.com\/[^\)]+|[^\)]*qeeg[^\)]*)\)/gi,
    `[${qeegButtonText}](${qeegInternalUrl})`
  );
  cleaned = cleaned.replace(
    /\[([^\]]+)\]\((https?:\/\/(?:m\.)?blog\.naver\.com\/orbmed\/\d+)\)/gi,
    (m, linkText, url) => {
      const combined = `${linkText} ${url}`.toLowerCase();
      if (/qeeg|정량뇌파|정량화뇌파|뇌파/.test(combined)) {
        return `[${qeegButtonText}](${qeegInternalUrl})`;
      }
      return m;
    }
  );

  // 10. Repair squashed tables
  cleaned = repairTableText(cleaned);

  // 10-B. Reference heading & bracket index separation
  // Fix: "### 참고 문헌 (References) [1]\n\n논문제목..." -> "### 참고 문헌 (References)\n\n[1] 논문제목..."
  cleaned = cleaned.replace(
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
  cleaned = cleaned.replace(
    /(^|\n)\s*(#{0,4}\s*\[?(?:참고\s*문헌|References?|참고자료|학술\s*출처(?:\s*및\s*참고\s*문헌)?)(?:\s*(?:및\s*출처\s*링크))?(?:\s*\((?:References?|참고\s*문헌|학술\s*출처|출처|근거|문헌)\))?\]?)\s+([A-Za-z가-힣\*\"'])/gi,
    (match, p1, heading, firstChar) => {
      const cleanHeading = heading.trim();
      const formattedHeading = cleanHeading.startsWith('#')
        ? cleanHeading
        : `### ${cleanHeading.replace(/^\[\s*|\s*\]$/g, '')}`;
      return `\n\n${formattedHeading}\n\n${firstChar}`;
    }
  );

  // 11. Ensure multiple headings or headings glued to previous lines have double newlines
  cleaned = cleaned.replace(/([^\n])[\u200B\s]*(#{2,4}\s+[^\n]+)/g, '$1\n\n$2');
  cleaned = cleaned.replace(/(#{2,4}\s+[^\n]+)\n([^\n#\s])/g, '$1\n\n$2');

  // 12. Subheading and body text splitting across all blocks
  const rawBlocks = cleaned.split(/\n{2,}/);
  const processedBlocks: string[] = [];
  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const split = splitHeadingAndBody(trimmed);
    const subBlocks = split.split(/\n{2,}/);
    for (const sb of subBlocks) {
      if (sb.trim()) processedBlocks.push(sb.trim());
    }
  }

  cleaned = processedBlocks.join('\n\n').trim();

  // 13. Ensure list items, ordinals, bullets, and paragraph breaks have clean separate lines (outside table rows)
  const lines = cleaned.split('\n');
  cleaned = lines
    .map((l) => {
      if (l.trim().startsWith('|') || l.trim().startsWith('---')) return l;
      let res = l;

      // 13-1. Ordinals: 첫째, 둘째, 셋째, 넷째, 다섯째 (with or without **, comma, colon)
      res = res.replace(
        /([^\n#|])[\u200B\s]+(\**[첫둘셋넷다]째[,\s:]|\**[첫둘셋넷다]째\b\**)/g,
        '$1\n\n$2'
      );

      // 13-2. Numbered lists: 1. 2. 3. (avoid dates like 2024. 10. 1.)
      res = res.replace(
        /([.!?다요죠음임함됨]|[:;]|["'”’)]|\*{2})[\u200B\s]+([1-9]\d{0,1}\.\s+[가-힣A-Za-z])/g,
        (match, p1, p2, offset, str) => {
          const ctx = str.slice(Math.max(0, offset - 10), offset + match.length + 10);
          if (/(?:19|20)\d\d\.\s*\d+\./.test(ctx)) return match;
          return `${p1}\n\n${p2}`;
        }
      );

      // 13-3. Bullets: •, -, ▶
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

      // 13-4. Other lists like [1] or (1) or ①-⑩
      res = res.replace(
        /([.!?다요죠음임함됨]|[:;]|["'”’)]|\*{2})[\u200B\s]+([①-⑩]\s*)/g,
        '$1\n\n$2'
      );
      res = res.replace(
        /([^\n#|*\-+])[\u200B \t]+(\[\d{1,2}\]\s*[A-Za-z가-힣\"'])/g,
        '$1\n\n$2'
      );

      // 13-5. ZWS between sentences: in Naver SmartEditor, empty paragraph breaks were stored as \u200B
      res = res.replace(
        /([.!?다요죠음임함됨:;\"'”’\*\)\]])[\u200B\s]+[\u200B]+[\u200B\s]*([가-힣A-Za-z0-9"'(<📍👉📌])/g,
        '$1\n\n$2'
      );

      // Strip trailing ZWS at line ends
      res = res.replace(/[\u200B\uFEFF\s]+$/g, '');

      return res;
    })
    .join('\n');

  // 14. Deduplicate multiple footer notice headings if repeated
  const noticeMatches = [...cleaned.matchAll(/###\s*📚?\s*의학\s*학술\s*레퍼런스\s*및\s*의료법\s*고지/gi)];
  if (noticeMatches.length > 1) {
    const firstIdx = noticeMatches[0].index;
    const bodyBefore = cleaned.slice(0, firstIdx).trim();
    const noticeSec = cleaned.slice(firstIdx);

    let archiveNotice = '';
    const arcMatch = noticeSec.match(/📌\s*\[정식\s*웹\s*아카이브\s*안내\][\s\S]*$/);
    if (arcMatch) {
      archiveNotice = arcMatch[0].trim();
    }

    const cleanedNoticeBody = noticeSec
      .replace(/###\s*📚?\s*의학\s*학술\s*레퍼런스\s*및\s*의료법\s*고지/gi, '')
      .replace(/📌\s*\[정식\s*웹\s*아카이브\s*안내\][\s\S]*$/, '')
      .replace(/^---+/gm, '')
      .replace(/^[ \t]*\*{1,2}[ \t]*$/gm, '')
      .replace(/\*\*[\s\u200B\uFEFF]*\*\*/g, '')
      .trim();

    cleaned = `${bodyBefore}\n\n---\n\n### 📚 의학 학술 레퍼런스 및 의료법 고지\n\n${cleanedNoticeBody}`;
    if (archiveNotice) {
      cleaned += `\n\n---\n\n${archiveNotice}`;
    }
  }

  // 15. Final pass to remove residual empty bold markers, stray zero-width spaces, and excess blank lines
  cleaned = cleaned
    .replace(/\*\*[\s\u200B\uFEFF]*\*\*/g, '')
    .replace(/^[ \t]*\*{2,}[ \t]*$/gm, '')
    .replace(/\n([ \t]*\*{2,}[ \t]*\n)+/g, '\n\n')
    .replace(/[\u200B\uFEFF]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

export function normalizeColumn(parsed: any): Column {
  const category = normalizeCategory(parsed.category);
  const cleanedContent = cleanAndRepairMarkdown(parsed.content || '');
  const cleanedSummary = cleanAndRepairMarkdown(decodeTextEntities(parsed.summary || ''));

  let thumbnail = (parsed.thumbnail || '').trim();
  if (
    thumbnail === '#' ||
    thumbnail.includes('static.se2') ||
    thumbnail.includes('static.map') ||
    thumbnail.includes('staticmap') ||
    thumbnail.includes('blogpfthumb') ||
    thumbnail.includes('og_default') ||
    thumbnail.includes('og_270x270') ||
    thumbnail.startsWith('/images/clinic/')
  ) {
    const firstLocal = extractFirstLocalImage(cleanedContent);
    thumbnail = firstLocal && !firstLocal.includes('static.map') && !firstLocal.includes('staticmap') ? firstLocal : '';
  }

  return {
    id: parsed.id || `col-${parsed.slug}`,
    slug: parsed.slug,
    title: decodeTextEntities(parsed.title || ''),
    summary: cleanedSummary,
    content: cleanedContent,
    category,
    author: parsed.author || '오브한의원 대표원장 전두희',
    date: parsed.date || new Date().toISOString().slice(0, 10),
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    thumbnail,
    updatedAt: parsed.updatedAt,
    faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
  };
}

export const CANDIDATE_COLUMN_DIRS = [
  path.join(process.cwd(), 'content', 'columns'),
  'C:/Users/doohe/Downloads/orb-homepage-main/orb-homepage/content/columns',
  'C:/Users/doohe/Downloads/orb-homepage-main/content/columns',
  '/tmp/content/columns',
];

export function getProjectRoot(): string {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'content', 'columns'))) return cwd;
  if (fs.existsSync('C:/Users/doohe/Downloads/orb-homepage-main/orb-homepage/content/columns')) {
    return 'C:/Users/doohe/Downloads/orb-homepage-main/orb-homepage';
  }
  return cwd || process.cwd() || '.';
}

export function getColumnsDir(): string {
  for (const dir of CANDIDATE_COLUMN_DIRS) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(dir)) {
        return dir;
      }
    } catch {
      // try next candidate
    }
  }
  return CANDIDATE_COLUMN_DIRS[0];
}

export function getAllColumns(): Column[] {
  const store = getMemoryStore();

  // 1. Vite eager glob for runtime bundling (Cloudflare worker & SSR)
  try {
    const globModules = import.meta.glob<{ default?: Column; [k: string]: any }>(
      '/content/columns/*.json',
      { eager: true }
    );
    for (const [, mod] of Object.entries(globModules)) {
      const parsed = (mod.default || mod) as Column;
      if (parsed && parsed.slug && parsed.title) {
        store.set(parsed.slug, normalizeColumn(parsed));
      }
    }
  } catch (globErr) {
    console.warn('Vite glob in getAllColumns:', globErr);
  }

  // 2. Load from disk directories and auto-sanitize any JavaScript artifacts
  for (const dir of CANDIDATE_COLUMN_DIRS) {
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (file.endsWith('.json')) {
            try {
              const fileContent = fs.readFileSync(fullPath, 'utf8');
              const parsed = JSON.parse(fileContent) as Column;
              let fileDirty = false;
              if (parsed.content) {
                const cleanedContent = cleanAndRepairMarkdown(parsed.content);
                if (cleanedContent !== parsed.content) {
                  parsed.content = cleanedContent;
                  fileDirty = true;
                }
              }
              if (parsed.summary) {
                const cleanedSummary = cleanAndRepairMarkdown(parsed.summary);
                if (cleanedSummary !== parsed.summary) {
                  parsed.summary = cleanedSummary;
                  fileDirty = true;
                }
              }
              const firstLocal = extractFirstLocalImage(parsed.content || '');
              const curThumb = (parsed.thumbnail || '').trim();
              if (curThumb.startsWith('/images/clinic/')) {
                parsed.thumbnail = firstLocal || '';
                fileDirty = true;
              }
              if (fileDirty) {
                try {
                  fs.writeFileSync(fullPath, JSON.stringify(parsed, null, 2), 'utf8');
                } catch {}
              }
              if (parsed && parsed.slug && parsed.title) {
                store.set(parsed.slug, normalizeColumn(parsed));
              }
            } catch {
              // skip malformed file
            }
          } else if (file.endsWith('.md')) {
            try {
              const mdContent = fs.readFileSync(fullPath, 'utf8');
              let cleanedMd = mdContent;
              if (mdContent.startsWith('---')) {
                const secondDash = mdContent.indexOf('---', 3);
                if (secondDash !== -1) {
                  const fm = mdContent.slice(3, secondDash);
                  const body = mdContent.slice(secondDash + 3);
                  const cleanedBody = cleanAndRepairMarkdown(body);
                  cleanedMd = `---${fm}---\n\n${cleanedBody.trim()}\n`;
                } else {
                  cleanedMd = cleanAndRepairMarkdown(mdContent);
                }
              } else {
                cleanedMd = cleanAndRepairMarkdown(mdContent);
              }
              if (cleanedMd !== mdContent) {
                fs.writeFileSync(fullPath, cleanedMd, 'utf8');
              }
              const slug = file.replace(/\.md$/, '');
              const thumbMatch = mdContent.match(/^thumbnail:\s*["']([^"']+)["']/m);
              if (thumbMatch && store.has(slug)) {
                const col = store.get(slug)!;
                if (thumbMatch[1] && thumbMatch[1].trim() !== col.thumbnail) {
                  col.thumbnail = thumbMatch[1].trim();
                }
              }
            } catch {}
          }
        }
      }
    } catch {
      // directory inaccessible
    }
  }

  const columns = Array.from(store.values());
  columns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return columns;
}

export function getColumnBySlug(rawSlug: string): Column | null {
  if (!rawSlug) return null;
  const clean = rawSlug.trim();
  let decoded = clean;
  try {
    decoded = decodeURIComponent(clean);
  } catch {}
  let doubleDecoded = decoded;
  try {
    doubleDecoded = decodeURIComponent(decoded);
  } catch {}
  let encoded = clean;
  try {
    encoded = encodeURIComponent(decoded);
  } catch {}

  const store = getMemoryStore();

  // 1. Direct store lookup
  if (store.has(clean)) return store.get(clean)!;
  if (store.has(decoded)) return store.get(decoded)!;
  if (store.has(doubleDecoded)) return store.get(doubleDecoded)!;
  if (store.has(encoded)) return store.get(encoded)!;

  // 2. Lookup across all columns
  const all = getAllColumns();

  // Match 1: Exact or URI encoded/decoded
  const exact = all.find(
    (c) =>
      c.slug === clean ||
      c.slug === decoded ||
      c.slug === doubleDecoded ||
      c.slug === encoded ||
      encodeURIComponent(c.slug) === clean ||
      clean === encodeURIComponent(c.slug) ||
      decodeURIComponent(c.slug) === decoded
  );
  if (exact) return exact;

  // Match 2: Match by logNo suffix (e.g. -916066)
  const logNoMatch =
    decoded.match(/-(\d{5,12})$/) ||
    clean.match(/-(\d{5,12})$/) ||
    doubleDecoded.match(/-(\d{5,12})$/);
  if (logNoMatch) {
    const targetLogNo = logNoMatch[1];
    const foundByLogNo = all.find((c) => c.slug.endsWith(`-${targetLogNo}`));
    if (foundByLogNo) return foundByLogNo;
  }

  // Match 3: Normalized alphanumeric & Korean
  const normTarget = decoded.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
  if (normTarget.length >= 4) {
    const normMatch = all.find((c) => {
      const cNorm = c.slug.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
      return cNorm === normTarget || cNorm.includes(normTarget) || normTarget.includes(cNorm);
    });
    if (normMatch) return normMatch;
  }

  return null;
}

export function formatColumnToMarkdown(column: Column): string {
  const frontmatterLines = [
    '---',
    `title: ${JSON.stringify(column.title)}`,
    `slug: ${JSON.stringify(column.slug)}`,
    `category: ${JSON.stringify(column.category)}`,
    `author: ${JSON.stringify(column.author || '전두희 원장')}`,
    `date: ${JSON.stringify(column.date)}`,
    `thumbnail: ${JSON.stringify(column.thumbnail || '')}`,
    `summary: ${JSON.stringify(column.summary || '')}`,
    'tags:',
    ...(column.tags || []).map((t) => `  - ${JSON.stringify(t)}`),
    `updatedAt: ${JSON.stringify(column.updatedAt || column.date)}`,
    '---',
    '',
    column.content.trim(),
    '',
  ];
  return frontmatterLines.join('\n');
}

export function findLocalThumbnailForSlug(slug: string, currentThumb: string = ''): string | null {
  const thumbDirs = [
    path.join(getProjectRoot(), 'public', 'images', 'columns', 'thumbnails'),
    path.join(process.cwd(), 'public', 'images', 'columns', 'thumbnails'),
  ];

  // 1. If currentThumb is already a valid local thumb that exists on disk, keep it
  if (currentThumb.startsWith('/images/columns/thumbnails/')) {
    for (const tDir of thumbDirs) {
      const fullPath = path.join(tDir, path.basename(currentThumb));
      try {
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 3000) {
          return currentThumb;
        }
      } catch {}
    }
  }

  // 2. Known slug mappings
  const knownLogNos: Record<string, string> = {
    'qeeg-guide': '224429314941',
    'brainfog-recovery': '224421852305',
    '신경성-위경련과-뒷목-뻣뻣함-굳어버린-장기와-근육을-푸는-천연-958747': '224414958747',
  };

  const logMatch = slug.match(/(\d{6,14})/);
  const logNo = logMatch ? logMatch[1] : (knownLogNos[slug] || '');

  for (const tDir of thumbDirs) {
    try {
      if (!fs.existsSync(tDir)) continue;
      const thumbFiles = fs.readdirSync(tDir);

      if (logNo) {
        // Priority 1: .png
        const matchedPng = thumbFiles.find(
          (f) =>
            (f.includes(logNo) || (logNo.length >= 6 && f.includes(logNo.slice(-6)))) &&
            f.endsWith('.png')
        );
        if (matchedPng) {
          return `/images/columns/thumbnails/${matchedPng}`;
        }
        // Priority 2: .jpg, .webp
        const matchedOther = thumbFiles.find(
          (f) =>
            (f.includes(logNo) || (logNo.length >= 6 && f.includes(logNo.slice(-6)))) &&
            (f.endsWith('.jpg') || f.endsWith('.webp'))
        );
        if (matchedOther) {
          return `/images/columns/thumbnails/${matchedOther}`;
        }
      }
    } catch {}
  }
  return null;
}

export function saveColumn(input: ColumnInput): Column {
  const slug = (input.slug || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `column-${Date.now()}`;

  const id = input.id || `col-${slug}`;
  const now = new Date().toISOString().slice(0, 10);

  const category = normalizeCategory(input.category?.trim());
  const cleanedContent = cleanAndRepairMarkdown(input.content?.trim() || '');
  let cleanedSummary = cleanAndRepairMarkdown(input.summary?.trim() || '');
  cleanedSummary = cleanedSummary
    .replace(/^(?:💡\s*)?(?:(?:오브한의원\s*)?(?:전두희\s*원장의\s*)?(?:핵심\s*(?:진료\s*)?요약)|Medical\s*Summary|Summary)\s*[:\-\n\r]*/i, '')
    .trim();

  let thumbnail = (input.thumbnail || '').trim();
  const localMatched = findLocalThumbnailForSlug(slug, thumbnail);

  if (localMatched) {
    thumbnail = localMatched;
  } else {
    const firstLocal = extractFirstLocalImage(cleanedContent);
    if (firstLocal) {
      if (
        !thumbnail ||
        thumbnail === '#' ||
        thumbnail.startsWith('/images/clinic/') ||
        thumbnail.includes('static.se2')
      ) {
        thumbnail = firstLocal;
      }
    } else if (!thumbnail || thumbnail === '#' || thumbnail.startsWith('/images/clinic/')) {
      thumbnail = '';
    }
  }

  const column: Column = {
    id,
    slug,
    title: input.title.trim(),
    summary: cleanedSummary,
    content: cleanedContent,
    category,
    author: input.author?.trim() || '전두희 원장',
    date: input.date || now,
    tags: Array.isArray(input.tags)
      ? input.tags.map((t) => t.trim()).filter(Boolean)
      : [],
    thumbnail,
    updatedAt: now,
    faqs: Array.isArray(input.faqs)
      ? input.faqs
          .map((f) => ({ question: f.question?.trim() || '', answer: f.answer?.trim() || '' }))
          .filter((f) => f.question && f.answer)
      : [],
  };

  // 1. ALWAYS update memory store so newly saved columns are instantly available
  const store = getMemoryStore();
  store.set(slug, column);

  // 2. Attempt disk persistence across all candidate directories for BOTH .json and .md
  const mdContent = formatColumnToMarkdown(column);

  let persistedOnDisk = false;
  for (const candidateDir of CANDIDATE_COLUMN_DIRS) {
    try {
      if (!fs.existsSync(candidateDir)) {
        fs.mkdirSync(candidateDir, { recursive: true });
      }
      const jsonFilePath = path.join(candidateDir, `${slug}.json`);
      fs.writeFileSync(jsonFilePath, JSON.stringify(column, null, 2), 'utf8');

      const mdFilePath = path.join(candidateDir, `${slug}.md`);
      fs.writeFileSync(mdFilePath, mdContent, 'utf8');

      persistedOnDisk = true;
      break;
    } catch {
      // try next candidate dir
    }
  }

  if (!persistedOnDisk) {
    console.warn(`[saveColumn] Disk write skipped in read-only environment; persisted in memory store (${slug})`);
  }

  return column;
}

export function deleteColumn(slug: string): boolean {
  if (!slug) return false;
  const store = getMemoryStore();
  store.delete(slug);

  let deleted = false;
  for (const candidateDir of CANDIDATE_COLUMN_DIRS) {
    try {
      const jsonFilePath = path.join(candidateDir, `${slug}.json`);
      if (fs.existsSync(jsonFilePath)) {
        fs.unlinkSync(jsonFilePath);
        deleted = true;
      }
      const mdFilePath = path.join(candidateDir, `${slug}.md`);
      if (fs.existsSync(mdFilePath)) {
        fs.unlinkSync(mdFilePath);
        deleted = true;
      }
    } catch {
      // ignore
    }
  }
  return deleted || true;
}

export function getAllCategories(): { name: string; count: number }[] {
  const columns = getAllColumns();
  const counts: Record<string, number> = {};
  for (const c of columns) {
    counts[c.category] = (counts[c.category] || 0) + 1;
  }

  // Pre-seed all official clinic categories in strict priority order
  const result: { name: string; count: number }[] = CLINIC_CATEGORIES.map((cat) => ({
    name: cat,
    count: counts[cat] || 0,
  }));

  // Append any extra categories that have at least 1 column (excluding pain/chuna)
  for (const [name, count] of Object.entries(counts)) {
    if (
      !CLINIC_CATEGORIES.includes(name as any) &&
      count > 0 &&
      !name.includes('통증') &&
      !name.includes('추나')
    ) {
      result.push({ name, count });
    }
  }

  return result;
}

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
  ];

  for (const sig of invalidSignatures) {
    if (clean.includes(sig)) return true;
  }

  return false;
}

export function sanitizeAllExistingColumnsOnDisk(): { cleanedCount: number; scannedCount: number } {
  let cleanedCount = 0;
  let scannedCount = 0;
  const store = getMemoryStore();

  for (const dir of CANDIDATE_COLUMN_DIRS) {
    try {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (file.endsWith('.json')) {
          scannedCount++;
          try {
            const raw = fs.readFileSync(fullPath, 'utf8');
            const parsed = JSON.parse(raw);
            let modified = false;

            if (parsed.content) {
              const newContent = cleanAndRepairMarkdown(parsed.content);
              if (newContent !== parsed.content) {
                parsed.content = newContent;
                modified = true;
              }
            }

            if (parsed.summary) {
              const newSummary = cleanAndRepairMarkdown(parsed.summary);
              if (newSummary !== parsed.summary) {
                parsed.summary = newSummary;
                modified = true;
              }
            }

            const localMatched = findLocalThumbnailForSlug(parsed.slug, parsed.thumbnail || '');
            if (localMatched && parsed.thumbnail !== localMatched) {
              parsed.thumbnail = localMatched;
              modified = true;
            } else if (
              isInvalidThumbnailUrl(parsed.thumbnail) ||
              (parsed.thumbnail && parsed.thumbnail.startsWith('/images/clinic/'))
            ) {
              const firstLocal = extractFirstLocalImage(parsed.content || '');
              parsed.thumbnail = firstLocal || '';
              modified = true;
            }

            if (modified || true) {
              saveColumn(parsed);
              cleanedCount++;
            }
          } catch (e) {
            console.error(`Error sanitizing JSON file ${file}:`, e);
          }
        } else if (file.endsWith('.md')) {
          scannedCount++;
          try {
            const raw = fs.readFileSync(fullPath, 'utf8');
            let cleaned = raw;
            const slug = file.replace(/\.md$/, '');

            if (cleaned.startsWith('---')) {
              const secondDash = cleaned.indexOf('---', 3);
              if (secondDash !== -1) {
                const fm = cleaned.slice(3, secondDash);
                const body = cleaned.slice(secondDash + 3);
                const cleanedBody = cleanAndRepairMarkdown(body);
                let cleanedFm = fm;

                const thumbMatch = fm.match(/thumbnail:\s*(["']?)(.*?)\1\s*(?:\r?\n|$)/i);
                const curThumb = thumbMatch ? thumbMatch[2].trim() : '';
                const localMatched = findLocalThumbnailForSlug(slug, curThumb);

                if (localMatched && curThumb !== localMatched) {
                  if (thumbMatch) {
                    cleanedFm = fm.replace(thumbMatch[0], `thumbnail: ${JSON.stringify(localMatched)}\n`);
                  }
                } else if (isInvalidThumbnailUrl(curThumb) || curThumb.startsWith('/images/clinic/')) {
                  const firstLocal = extractFirstLocalImage(cleanedBody);
                  if (firstLocal && thumbMatch) {
                    cleanedFm = fm.replace(thumbMatch[0], `thumbnail: ${JSON.stringify(firstLocal)}\n`);
                  }
                }
                cleaned = `---${cleanedFm}---\n\n${cleanedBody.trim()}\n`;
              } else {
                cleaned = cleanAndRepairMarkdown(cleaned);
              }
            } else {
              cleaned = cleanAndRepairMarkdown(cleaned);
            }

            if (cleaned !== raw) {
              fs.writeFileSync(fullPath, cleaned, 'utf8');
              cleanedCount++;
            }
          } catch (e) {
            console.error(`Error sanitizing MD file ${file}:`, e);
          }
        }
      }
    } catch {
      // directory inaccessible
    }
  }

  // Also clean memory store directly
  for (const [slug, col] of store.entries()) {
    let changed = false;
    const cleanContent = cleanAndRepairMarkdown(col.content);
    const cleanSummary = cleanAndRepairMarkdown(col.summary);
    if (cleanContent !== col.content) {
      col.content = cleanContent;
      changed = true;
    }
    if (cleanSummary !== col.summary) {
      col.summary = cleanSummary;
      changed = true;
    }
    const localMatched = findLocalThumbnailForSlug(slug, col.thumbnail || '');
    if (localMatched && col.thumbnail !== localMatched) {
      col.thumbnail = localMatched;
      changed = true;
    } else if (
      isInvalidThumbnailUrl(col.thumbnail) ||
      (col.thumbnail && col.thumbnail.startsWith('/images/clinic/'))
    ) {
      const firstLocal = extractFirstLocalImage(col.content);
      col.thumbnail = firstLocal || '';
      changed = true;
    }
    if (changed) {
      saveColumn(col);
    }
  }

  return { cleanedCount, scannedCount };
}

export async function resyncAllColumnThumbnails(): Promise<{ updatedCount: number; totalChecked: number }> {
  let updatedCount = 0;
  const store = getMemoryStore();
  const allCols = Array.from(store.values());

  try {
    const { fetchNaverBlogPosts, downloadThumbnail } = await import('./naverImporter');
    const discovered = await fetchNaverBlogPosts('orbmed', 500);

    const thumbByLogNo = new Map<string, string>();
    const thumbByTitle = new Map<string, string>();

    for (const p of discovered) {
      if (p.thumbnailUrl && !isInvalidThumbnailUrl(p.thumbnailUrl)) {
        thumbByLogNo.set(p.logNo, p.thumbnailUrl);
        if (p.logNo.length >= 6) {
          thumbByLogNo.set(p.logNo.slice(-6), p.thumbnailUrl);
        }
        const cleanTitle = p.title.replace(/\s+/g, '').toLowerCase();
        thumbByTitle.set(cleanTitle, p.thumbnailUrl);
      }
    }

    for (const col of allCols) {
      if (col.slug === 'qeeg-guide') continue;

      let targetRemoteUrl = '';

      // Match 1: Extract logNo from slug (e.g. -916066)
      const logNoMatch = col.slug.match(/-(\d{5,12})$/);
      const logNo = logNoMatch ? logNoMatch[1] : '';
      if (logNo) {
        targetRemoteUrl = thumbByLogNo.get(logNo) || thumbByLogNo.get(logNo.slice(-6)) || '';
      }

      // Match 2: Match by title
      if (!targetRemoteUrl) {
        const normColTitle = col.title.replace(/\s+/g, '').toLowerCase();
        targetRemoteUrl = thumbByTitle.get(normColTitle) || '';
        if (!targetRemoteUrl) {
          for (const [t, u] of thumbByTitle.entries()) {
            if (t.length > 10 && (t.includes(normColTitle) || normColTitle.includes(t))) {
              targetRemoteUrl = u;
              break;
            }
          }
        }
      }

      if (targetRemoteUrl && !isInvalidThumbnailUrl(targetRemoteUrl)) {
        const fileId = logNo || col.slug;
        const localThumb = await downloadThumbnail(targetRemoteUrl, fileId);
        if (localThumb && col.thumbnail !== localThumb) {
          col.thumbnail = localThumb;
          saveColumn(col);
          updatedCount++;
        }
      } else {
        // Fallback: if current thumbnail is invalid or clinic wide image, use firstLocalImage from content
        if (isInvalidThumbnailUrl(col.thumbnail) || col.thumbnail.startsWith('/images/clinic/')) {
          const firstLocal = extractFirstLocalImage(col.content);
          if (firstLocal && col.thumbnail !== firstLocal) {
            col.thumbnail = firstLocal;
            saveColumn(col);
            updatedCount++;
          }
        }
      }
    }
  } catch (err) {
    console.error('[resyncAllColumnThumbnails] Error during thumbnail resync:', err);
  }

  return { updatedCount, totalChecked: allCols.length };
}

// Auto-run sanitation on initial module import to clean existing corrupted disk files
try {
  sanitizeAllExistingColumnsOnDisk();
  // Fire-and-forget background thumbnail sync
  resyncAllColumnThumbnails().catch((err) => {
    console.warn('Initial thumbnail resync background warning:', err);
  });
} catch (e) {
  console.warn('Initial column disk sanitation warning:', e);
}
