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

export const CATEGORY_THUMBNAILS: Record<string, string> = {
  '정량화뇌파검사': '/images/clinic/naver-qeeg-wide.webp',
  '자율신경실조증': '/images/clinic/hero-lobby-wide.webp',
  '브레인포그': '/images/clinic/care-room-wide.webp',
  '초민감자(HSP)': '/images/clinic/naver-consultation-wide.webp',
  'ADHD': '/images/clinic/detail-flower-wide.webp',
  '다이어트': '/images/clinic/diet-quantum-fit.png',
  '위장관': '/images/clinic/naver-chuna-wide.webp',
  '갑상선': '/images/clinic/heat-metabolism-diti.png',
};

export function getCategoryFallbackThumbnail(category: string): string {
  const norm = normalizeCategory(category);
  return CATEGORY_THUMBNAILS[norm] || '/images/clinic/hero-lobby-wide.webp';
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

  // 1. Bolded title at start: **1.1. 제목** 본문...
  const boldMatch = fullText.match(/^\*\*([^*]+)\*\*\s*[:\-]?\s*(.+)$/s);
  if (boldMatch) {
    const heading = boldMatch[1].trim();
    const body = boldMatch[2].trim();
    return `${hashes} ${heading}\n\n${body}`;
  }

  // 2. Question mark: e.g. "왜 내 몸은 계속 아플까요? 본문..."
  const qIdx = fullText.indexOf('?');
  if (qIdx !== -1 && qIdx <= 80 && qIdx < fullText.length - 5) {
    const heading = fullText.slice(0, qIdx + 1).trim();
    const body = fullText.slice(qIdx + 1).trim();
    if (body.length > 0) {
      return `${hashes} ${heading}\n\n${body}`;
    }
  }

  // 3. Period after subtitle: e.g. "1.1. 정량뇌파와 심박변이도 평가. 전전두엽 피질의..."
  const periodMatch = fullText.match(/^((?:\d+\.\d*|[①-⑩]|\d+\))\s*[^.!?\n]{3,60}\.)\s+([가-힣A-Za-z0-9"'].+)$/s);
  if (periodMatch) {
    return `${hashes} ${periodMatch[1].trim()}\n\n${periodMatch[2].trim()}`;
  }

  // 4. Known noun endings followed by sentence starter
  const nounMatch = fullText.match(
    /^((?:\d+\.\d*|[①-⑩]|\d+\))?[^.!?\n]{3,60}?(?:대응|기전|분석|치료|요법|시스템|원리|안내|평가|특징|원인|증상|기준|소개|방법|접근|비교|차이|역할|회복|개요|정의|프로토콜|검사|포인트|핵심|과정|이유))\s+([가-힣A-Za-z"'].+)$/s
  );
  if (nounMatch && nounMatch[2].length > 15) {
    return `${hashes} ${nounMatch[1].trim()}\n\n${nounMatch[2].trim()}`;
  }

  // 5. Fallback for long block (> 75 chars): split at first sentence ending
  if (fullText.length > 75) {
    const sentenceMatch = fullText.match(/^((?:\d+\.\d*|[①-⑩]|\d+\))?[^.!?\n]{5,70}?[.!?])\s+(.+)$/s);
    if (sentenceMatch && sentenceMatch[2].length > 15) {
      return `${hashes} ${sentenceMatch[1].trim()}\n\n${sentenceMatch[2].trim()}`;
    }
  }

  return block;
}

export function cleanAndRepairMarkdown(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Strip script, style, noscript tags and JS runtime signatures
  cleaned = cleanJsGarbageFromText(cleaned);

  // 2. Remove Naver Check-in & Place residual UI text
  cleaned = cleaned
    .replace(/이\s*블로그의\s*체크인\s*이\s*장소의\s*다른\s*글/gi, '')
    .replace(/이\s*블로그의\s*체크인/gi, '')
    .replace(/이\s*장소의\s*다른\s*글/gi, '')
    .replace(/MY\s*플레이스/gi, '')
    .replace(/MY플레이스/gi, '');

  // 3. Remove standalone caption lines (*설명: ...* or _설명: ..._)
  cleaned = cleaned.replace(/(?:\r?\n)\s*[\*_]설명\s*:[^\r\n\*_]*[\*_]\s*(?:\r?\n|$)/gi, '\n\n');

  // 4. Unwrap broken image link wrappers: [ ![alt](src) ](#) or [ ![alt](src) ](...)
  cleaned = cleaned.replace(
    /\[\s*!\[([^\]]*)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)\s*\]\([^)]*\)/gi,
    '\n\n![$1]($2)\n\n'
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

  // 10. [문제 1] Subheading and body text splitting across all blocks
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

  return cleaned;
}

export function normalizeColumn(parsed: any): Column {
  const category = normalizeCategory(parsed.category);
  const cleanedContent = cleanAndRepairMarkdown(parsed.content || '');
  const cleanedSummary = cleanAndRepairMarkdown(decodeTextEntities(parsed.summary || ''));

  let thumbnail = (parsed.thumbnail || '').trim();
  const firstLocal = extractFirstLocalImage(cleanedContent);

  if (
    !thumbnail ||
    thumbnail === '#' ||
    thumbnail.includes('static.se2') ||
    thumbnail.startsWith('/images/clinic/')
  ) {
    if (firstLocal) {
      thumbnail = firstLocal;
    } else if (!thumbnail || thumbnail === '#') {
      thumbnail = getCategoryFallbackThumbnail(category);
    }
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
  'C:/Users/doohe/Downloads/orb-homepage-main/orb-homepage-main/content/columns',
  'C:/Users/doohe/Downloads/orb-homepage-main/content/columns',
  path.join(process.cwd(), 'content', 'columns'),
  '/tmp/content/columns',
];

export function getProjectRoot(): string {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'content', 'columns'))) return cwd;
  if (fs.existsSync(path.join(cwd, 'orb-homepage-main', 'content', 'columns'))) {
    return path.join(cwd, 'orb-homepage-main');
  }
  if (fs.existsSync('C:/Users/doohe/Downloads/orb-homepage-main/orb-homepage-main')) {
    return 'C:/Users/doohe/Downloads/orb-homepage-main/orb-homepage-main';
  }
  return cwd;
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
      if (parsed && parsed.slug && parsed.title && !store.has(parsed.slug)) {
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
              if (
                firstLocal &&
                (!curThumb ||
                  curThumb === '#' ||
                  curThumb.includes('static.se2') ||
                  curThumb.startsWith('/images/clinic/'))
              ) {
                if (parsed.thumbnail !== firstLocal) {
                  parsed.thumbnail = firstLocal;
                  fileDirty = true;
                }
              }
              if (fileDirty) {
                try {
                  fs.writeFileSync(fullPath, JSON.stringify(parsed, null, 2), 'utf8');
                } catch {}
              }
              if (parsed && parsed.slug && parsed.title && !store.has(parsed.slug)) {
                store.set(parsed.slug, normalizeColumn(parsed));
              }
            } catch {
              // skip malformed file
            }
          } else if (file.endsWith('.md')) {
            try {
              const mdContent = fs.readFileSync(fullPath, 'utf8');
              const cleanedMd = cleanAndRepairMarkdown(mdContent);
              if (cleanedMd !== mdContent) {
                fs.writeFileSync(fullPath, cleanedMd, 'utf8');
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

export function saveColumn(input: ColumnInput): Column {
  const dir = getColumnsDir();

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
  const cleanedSummary = cleanAndRepairMarkdown(input.summary?.trim() || '');

  let thumbnail = (input.thumbnail || '').trim();
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
  } else if (!thumbnail || thumbnail === '#') {
    thumbnail = getCategoryFallbackThumbnail(category);
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

  // 2. Attempt disk persistence across all candidate directories
  let persistedOnDisk = false;
  for (const candidateDir of CANDIDATE_COLUMN_DIRS) {
    try {
      if (!fs.existsSync(candidateDir)) {
        fs.mkdirSync(candidateDir, { recursive: true });
      }
      const filePath = path.join(candidateDir, `${slug}.json`);
      fs.writeFileSync(filePath, JSON.stringify(column, null, 2), 'utf8');
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
      const filePath = path.join(candidateDir, `${slug}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
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

            const firstLocal = extractFirstLocalImage(parsed.content || '');
            const curThumb = (parsed.thumbnail || '').trim();
            if (
              isInvalidThumbnailUrl(curThumb) ||
              curThumb.startsWith('/images/clinic/')
            ) {
              if (firstLocal && parsed.thumbnail !== firstLocal) {
                parsed.thumbnail = firstLocal;
                modified = true;
              }
            }

            if (modified) {
              fs.writeFileSync(fullPath, JSON.stringify(parsed, null, 2), 'utf8');
              cleanedCount++;
            }

            if (parsed.slug) {
              store.set(parsed.slug, normalizeColumn(parsed));
            }
          } catch (e) {
            console.error(`Error sanitizing JSON file ${file}:`, e);
          }
        } else if (file.endsWith('.md')) {
          scannedCount++;
          try {
            const raw = fs.readFileSync(fullPath, 'utf8');
            let cleaned = raw;
            // Handle frontmatter if present
            if (cleaned.startsWith('---')) {
              const secondDash = cleaned.indexOf('---', 3);
              if (secondDash !== -1) {
                const fm = cleaned.slice(3, secondDash);
                const body = cleaned.slice(secondDash + 3);
                const cleanedBody = cleanAndRepairMarkdown(body);
                // Also clean thumbnail in frontmatter if invalid
                let cleanedFm = fm;
                const thumbMatch = fm.match(/thumbnail:\s*(["']?)(.*?)\1\s*(?:\r?\n|$)/i);
                if (thumbMatch) {
                  const thumbVal = thumbMatch[2].trim();
                  if (isInvalidThumbnailUrl(thumbVal) || thumbVal.startsWith('/images/clinic/')) {
                    const firstLocal = extractFirstLocalImage(cleanedBody);
                    if (firstLocal) {
                      cleanedFm = fm.replace(thumbMatch[0], `thumbnail: ${firstLocal}\n`);
                    }
                  }
                }
                cleaned = `---${cleanedFm}---${cleanedBody}`;
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
    const firstLocal = extractFirstLocalImage(col.content);
    if (
      isInvalidThumbnailUrl(col.thumbnail) ||
      col.thumbnail.startsWith('/images/clinic/')
    ) {
      if (firstLocal && col.thumbnail !== firstLocal) {
        col.thumbnail = firstLocal;
        changed = true;
      }
    }
    if (changed) {
      store.set(slug, col);
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
