'use client';

import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
  summary?: string;
}

const NAVER_PLACE_SEARCH_URL =
  'https://map.naver.com/p/search/%EC%98%A4%EB%B8%8C%ED%95%9C%EC%9D%98%EC%9B%90%20%EB%A7%88%EA%B3%A1%EC%A0%90';

export function stripTopDuplicateSummary(rawContent: string, summary?: string): string {
  if (!rawContent) return '';
  let text = rawContent.trim();

  // 1. Strip top blockquote containing "핵심 진료 요약" or "Medical Summary"
  const quoteSummaryPattern = /^(?:>\s*(?:💡\s*)?\**\s*(?:(?:전두희\s*원장의\s*)?핵심\s*진료\s*요약|Medical\s*Summary)[^\n]*\n)(?:>[^\n]*\n*)+/i;
  text = text.replace(quoteSummaryPattern, '').trim();

  // If text still starts with a blockquote (> ...)
  if (text.startsWith('>')) {
    const lines = text.split('\n');
    let quoteEnd = 0;
    while (quoteEnd < lines.length && (lines[quoteEnd].trim().startsWith('>') || !lines[quoteEnd].trim())) {
      quoteEnd++;
    }
    const topQuote = lines.slice(0, quoteEnd).join(' ');
    if (
      topQuote.includes('핵심') ||
      topQuote.includes('요약') ||
      topQuote.includes('Summary') ||
      (summary && summary.length >= 15 && topQuote.replace(/[^가-힣a-zA-Z0-9]/g, '').includes(summary.slice(0, 25).replace(/[^가-힣a-zA-Z0-9]/g, '')))
    ) {
      text = lines.slice(quoteEnd).join('\n').trim();
    }
  }

  // 2. Strip leading horizontal rule (---)
  text = text.replace(/^---+[\r\n]*/, '').trim();

  // 3. Strip duplicate identical paragraph directly following the quote box
  if (summary) {
    const normSummary = summary.replace(/[*_#\s\u200b]/g, '').slice(0, 35);
    const paragraphs = text.split(/\n{2,}/);
    if (paragraphs.length > 0) {
      const firstP = paragraphs[0].replace(/[*_#\s\u200b]/g, '').slice(0, 35);
      if (firstP && normSummary && (firstP.includes(normSummary) || normSummary.includes(firstP))) {
        paragraphs.shift();
        text = paragraphs.join('\n\n').trim();
      }
    }
  }

  // 4. Strip invisible bold artifacts and empty bold lines
  text = text.replace(/\*\*[\s\u200B\uFEFF]*\*\*/g, '');
  text = text.replace(/^[ \t]*\*{2,}[ \t]*$/gm, '');
  text = text.replace(/\n([ \t]*\*{2,}[ \t]*\n)+/g, '\n\n');
  text = text.replace(/^(\*\*[\u200b\s]*\*\*[\s\r\n]*)+/g, '').trim();

  // 5. Strip any leftover leading horizontal rules
  text = text.replace(/^---+[\r\n]*/, '').trim();

  return text;
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

  const match = trimmed.match(/^(#{2,3})\s+([\s\S]+)$/);
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

  // If already contains newlines, ensure first line is heading
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
  const boldMatch = fullText.match(/^\*\*([^*]+)\*\*\s*[:\-]?\s*([\s\S]+)$/);
  if (boldMatch) {
    return `${hashes} ${boldMatch[1].trim()}\n\n${boldMatch[2].trim()}`;
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
    /^((?:\d+(?:\.\d+)*\.?|[①-⑩]|\d+\))\s*[^.!?\n]{3,80}\.)\s+([가-힣A-Za-z0-9"'][\s\S]+)$/
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
  const colonMatch = fullText.match(/^([^:\n]{3,50}:)\s+([가-힣A-Za-z0-9"'][\s\S]+)$/);
  if (colonMatch && colonMatch[2].length > 15) {
    return `${hashes} ${colonMatch[1].trim()}\n\n${colonMatch[2].trim()}`;
  }

  // 7. Special specific known fixed headers like "문의사항은 네이버톡톡으로 부탁드립니다"
  const naverTalkMatch = fullText.match(/^(문의사항은\s*네이버톡톡으로\s*부탁드립니다)\s+([가-힣A-Za-z0-9"'][\s\S]+)$/);
  if (naverTalkMatch) {
    return `${hashes} ${naverTalkMatch[1].trim()}\n\n${naverTalkMatch[2].trim()}`;
  }

  // 8. Numbered subtitle ending with known noun/concept
  const nounMatch = fullText.match(
    /^((?:\d+(?:\.\d+)*\.?|[①-⑩]|\d+\))\s*[^.!?\n]{3,95}?(?:대응|기전|분석|치료|요법|시스템|원리|안내|평가|특징|원인|증상|기준|소개|방법|접근|비교|차이|역할|회복|개요|정의|프로토콜|검사|포인트|핵심|과정|이유|리셋|딜레마|가설|전략|비교|검증|보완|완화|한계|접점|메커니즘|중요성|확인))\s+([가-힣A-Za-z][\s\S]+)$/
  );
  if (nounMatch && nounMatch[2].length > 15) {
    return `${hashes} ${nounMatch[1].trim()}\n\n${nounMatch[2].trim()}`;
  }

  // 9. Numbered subtitle with parenthesis: e.g. "1. 극도의 불안과 불면, 심계항진 (입력 필터 강화) 복령의..."
  const numParenMatch = fullText.match(
    /^(\d+\.\s*[^(\n]{2,35}\s*\([^)\n]{2,20}\))\s+([가-힣A-Za-z0-9"'][\s\S]+)$/
  );
  if (numParenMatch) {
    return `${hashes} ${numParenMatch[1].trim()}\n\n${numParenMatch[2].trim()}`;
  }

  // 10. Numbered subtitle with colon: e.g. "1. 성상신경차단술(SGB): 강력하지만 일시적인 리셋 목 앞쪽에..."
  const numSubMatch = fullText.match(
    /^((?:\d+(?:\.\d+)*\.?|[①-⑩]|\d+\))\s*[^:\n]{2,30}:\s*[^ \n]{2,30}(?:\s+[^ \n]{2,30}){0,3})\s+([가-힣A-Za-z0-9"'][\s\S]+)$/
  );
  if (numSubMatch && numSubMatch[2].length > 15) {
    return `${hashes} ${numSubMatch[1].trim()}\n\n${numSubMatch[2].trim()}`;
  }

  // 11. General noun endings without number prefix
  const generalNounMatch = fullText.match(
    /^([^.!?\n]{3,60}?(?:대응|기전|분석|치료|요법|시스템|원리|안내|평가|특징|원인|증상|기준|소개|방법|접근|비교|차이|역할|회복|개요|정의|프로토콜|검사|포인트|핵심|과정|이유|리셋|딜레마|접점|메커니즘|중요성|확인))\s+([가-힣A-Za-z][\s\S]+)$/
  );
  if (generalNounMatch && generalNounMatch[2].length > 15) {
    return `${hashes} ${generalNounMatch[1].trim()}\n\n${generalNounMatch[2].trim()}`;
  }

  // 12. Fallback for long block (> 75 chars): split at first sentence ending
  if (fullText.length > 75) {
    const sentenceMatch = fullText.match(/^((?:\d+\.\d*|[①-⑩]|\d+\))?[^.!?\n]{5,70}?[.!?])\s+([\s\S]+)$/);
    if (sentenceMatch && sentenceMatch[2].length > 15) {
      return `${hashes} ${sentenceMatch[1].trim()}\n\n${sentenceMatch[2].trim()}`;
    }
  }

  return block;
}

const DEFAULT_QEEG_SLUG = '습식-정량-뇌파-측정-과정에-대해-안내해드립니다-314941';

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

export default function MarkdownView({ content, className = '', summary }: MarkdownViewProps) {
  if (!content) return null;

  // Step 1: Strip top duplicate summary block and duplicate summary paragraphs
  const strippedContent = removeTopDuplicateImage(stripTopDuplicateSummary(content, summary));

  let cleanContent = strippedContent
    .replace(/\{\s*"title"\s*:\s*"[\s\S]*?"logNo"\s*:\s*\d+[\s\S]*?\}/gi, '')
    .replace(/\{\s*"title"\s*:\s*"[^"]*"[\s\S]*?"blogDisplay"\s*:\s*true[\s\S]*?\}/gi, '')
    .replace(/\*\*[\s\u200B\uFEFF]*\*\*/g, '')
    .replace(/^[ \t]*\*{2,}[ \t]*$/gm, '')
    .replace(/\n([ \t]*\*{2,}[ \t]*\n)+/g, '\n\n')
    // Fix glued disclaimer prefix where "본 게시물은 was severed before the divider
    .replace(
      /([^\n\r]+?)\s*["'“]?\s*본\s*(?:게시물|글|포스팅)은\s*(?:\r?\n\s*)*---\s*(?:\r?\n\s*)*###\s*📚\s*의학 학술 레퍼런스 및 의료법 고지\s*(?:\r?\n\s*)*(?:["'“]?\s*본\s*(?:게시물|글|포스팅)은\s*)?/gi,
      '$1\n\n---\n\n### 📚 의학 학술 레퍼런스 및 의료법 고지\n\n본 게시물은 '
    )
    .replace(
      /(문의사항은\s*네이버톡톡으로\s*부탁드립니다[^\n]*?)\s*(?:["'“]?\s*본\s*(?:게시물|글|포스팅)은\s*의료법)/gi,
      '$1\n\n---\n\n### 📚 의학 학술 레퍼런스 및 의료법 고지\n\n본 게시물은 의료법'
    )
    .replace(/이\s*블로그의\s*체크인\s*이\s*장소의\s*다른\s*글/gi, '')
    .replace(/이\s*블로그의\s*체크인/gi, '')
    .replace(/이\s*장소의\s*다른\s*글/gi, '')
    .replace(/MY\s*플레이스/gi, '')
    .replace(/MY플레이스/gi, '')
    .replace(/(?:\r?\n)\s*[\*_]설명\s*:[^\r\n\*_]*[\*_]\s*(?:\r?\n|$)/gi, '\n\n')
    // Unwrap images inside bold tags: **... ![alt](src) ...**
    .replace(/\*\*([^*]*?)!\[([^\]]*)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)([^*]*?)\*\*/g, '**$1**\n\n![$2]($3)\n\n**$4**')
    // Separate all markdown images into their own standalone blocks
    .replace(/(!\[[^\]]*\]\((?:https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\))/g, '\n\n$1\n\n')
    // Unwrap link-wrapped images: [ ![alt](src) ](...)
    .replace(/\[\s*!\[([^\]]*)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)[^\]]*\]\([^)]*\)/gi, '\n\n![$1]($2)\n\n')
    .replace(/!\[([^\]]*?)(?:↗|\^)?(?:\s*설명:[^\]]*)?\]\(#\)/gi, '')
    .replace(/!\[[^\]]*\]\(\s*\)/gi, '')
    // Convert bare Naver image URLs in text into markdown image tags
    .replace(/(^|[\s\n])(https?:\/\/(?:[a-zA-Z0-9_-]+\.)*(?:phinf\.pstatic\.net|pstatic\.net)\/[^\s\)\"']+\.(?:png|jpe?g|webp|gif)(?:\?type=[^\s\)\"']*)?)([\s\n]|$)/gi, '$1\n\n![오브한의원 임상 칼럼]($2)\n\n$3')
    .replace(/![\"']([^\"'\n]+)[\"']/g, '\n\n**$1**\n\n');

  // Repair squashed tables & ensure headings are separated
  cleanContent = repairTableText(cleanContent);

  // Reference heading & bracket index separation
  // Fix: "### 참고 문헌 (References) [1]\n\n논문제목..." -> "### 참고 문헌 (References)\n\n[1] 논문제목..."
  cleanContent = cleanContent.replace(
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
  cleanContent = cleanContent.replace(
    /(^|\n)\s*(#{0,4}\s*\[?(?:참고\s*문헌|References?|참고자료|학술\s*출처(?:\s*및\s*참고\s*문헌)?)(?:\s*(?:및\s*출처\s*링크))?(?:\s*\((?:References?|참고\s*문헌|학술\s*출처|출처|근거|문헌)\))?\]?)\s+([A-Za-z가-힣\*\"'])/gi,
    (match, p1, heading, firstChar) => {
      const cleanHeading = heading.trim();
      const formattedHeading = cleanHeading.startsWith('#')
        ? cleanHeading
        : `### ${cleanHeading.replace(/^\[\s*|\s*\]$/g, '')}`;
      return `\n\n${formattedHeading}\n\n${firstChar}`;
    }
  );

  cleanContent = cleanContent.replace(/([^\n])[\u200B\s]*(#{2,4}\s+[^\n]+)/g, '$1\n\n$2');
  cleanContent = cleanContent.replace(/(#{2,4}\s+[^\n]+)\n([^\n#\s])/g, '$1\n\n$2');

  // Ensure glued list items, ordinals, bullets, and paragraphs have clean separate lines (outside table rows)
  const mdLines = cleanContent.split('\n');
  cleanContent = mdLines
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

  // Deduplicate multiple footer notice headings if repeated
  const noticeMatches = [...cleanContent.matchAll(/###\s*📚?\s*의학\s*학술\s*레퍼런스\s*및\s*의료법\s*고지/gi)];
  if (noticeMatches.length > 1) {
    const firstIdx = noticeMatches[0].index;
    const bodyBefore = cleanContent.slice(0, firstIdx).trim();
    const noticeSec = cleanContent.slice(firstIdx);

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

    cleanContent = `${bodyBefore}\n\n---\n\n### 📚 의학 학술 레퍼런스 및 의료법 고지\n\n${cleanedNoticeBody}`;
    if (archiveNotice) {
      cleanContent += `\n\n---\n\n${archiveNotice}`;
    }
  }

  // Remove any remaining stray zero-width spaces
  cleanContent = cleanContent.replace(/[\u200B\uFEFF]/g, '');

  // Split by double line breaks and ensure merged subheadings are split from body
  const rawBlocks = cleanContent.split(/\n{2,}/);
  const blocks: string[] = [];
  for (const b of rawBlocks) {
    const trimmed = b.trim();
    if (!trimmed || /^[ \t]*\*{2,}[ \t]*$/.test(trimmed) || trimmed === '**' || trimmed === '****') continue;
    const split = splitHeadingAndBody(trimmed);
    for (const sub of split.split(/\n{2,}/)) {
      const subTrimmed = sub.trim();
      if (subTrimmed && !/^[ \t]*\*{2,}[ \t]*$/.test(subTrimmed) && subTrimmed !== '**' && subTrimmed !== '****') {
        blocks.push(subTrimmed);
      }
    }
  }

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Pattern for inline elements: match image first ![alt](url), then links [text](url), **bold**, *italic*, `code`, <br>
    const inlineRegex = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|<br\s*\/?>)/i;

    while (remaining.length > 0) {
      const match = remaining.match(inlineRegex);
      if (!match || match.index === undefined) {
        parts.push(remaining);
        break;
      }

      if (match.index > 0) {
        parts.push(remaining.substring(0, match.index));
      }

      const token = match[0];

      // 1. Markdown Image: ![alt](src)
      if (token.startsWith('![') && token.includes('](')) {
        const textEnd = token.indexOf('](');
        let alt = token.slice(2, textEnd).trim();
        const src = token.slice(textEnd + 2, -1).trim();

        alt = alt
          .replace(/[\[\]\(\)\"#]/g, '')
          .replace(/↗/g, '')
          .replace(/\s*설명:\s*.*$/g, '')
          .replace(/\s*-\s*오브한의원\s*$/g, '')
          .trim();
        if (alt.length > 50 || alt.includes('오브한의원')) {
          alt = '오브한의원 임상 칼럼';
        }

        if (src && src !== '#') {
          parts.push(
            <img
              key={key++}
              src={src}
              alt={alt || '오브한의원 임상 칼럼'}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full rounded-lg my-6 shadow-sm block"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          );
        }
      }
      // 2. Markdown Link: [text](url)
      else if (token.startsWith('[') && token.includes('](')) {
        const textEnd = token.indexOf('](');
        let linkText = token.slice(1, textEnd).trim();
        let url = token.slice(textEnd + 2, -1).trim();

        // If linkText is an image ![...](...)
        if (linkText.startsWith('![') && linkText.includes('](')) {
          const innerTextEnd = linkText.indexOf('](');
          let innerAlt = linkText.slice(2, innerTextEnd).trim();
          const innerSrc = linkText.slice(innerTextEnd + 2, -1).trim();
          innerAlt = innerAlt
            .replace(/[\[\]\(\)\"#]/g, '')
            .replace(/↗/g, '')
            .replace(/\s*설명:\s*.*$/g, '')
            .replace(/\s*-\s*오브한의원\s*$/g, '')
            .trim();
          if (innerSrc && innerSrc !== '#') {
            parts.push(
              <img
                key={key++}
                src={innerSrc}
                alt={innerAlt || '오브한의원 임상 칼럼'}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full rounded-lg my-6 shadow-sm block"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            );
            remaining = remaining.substring(match.index + token.length);
            continue;
          }
        }

        // Strip bold markers inside linkText completely
        linkText = linkText.replace(/\*\*/g, '').trim();

        // Check if this link refers to QEEG/Brainwave measurement guide
        const isQeegLink =
          url.includes('qeeg') ||
          url.includes('314941') ||
          linkText.includes('정량화 뇌파') ||
          linkText.includes('정량뇌파') ||
          linkText.includes('뇌파검사') ||
          linkText.includes('뇌파 측정') ||
          (url.includes('blog.naver.com') && /qeeg|314941|뇌파/.test(`${url} ${linkText}`));

        let linkClass = 'article-link';
        let isButton = false;
        let isQeegButton = false;

        if (isQeegLink) {
          linkClass = 'article-action-btn article-btn-qeeg';
          isButton = true;
          isQeegButton = true;
          url = `/columns/${DEFAULT_QEEG_SLUG}`;
          linkText = '👉 오브한의원 습식 정량화 뇌파(QEEG) 측정 과정 및 장비 안내 보러가기';
        } else if (url.includes('booking.naver.com')) {
          linkClass = 'article-action-btn article-btn-booking';
          isButton = true;
        } else if (
          url.includes('map.naver.com') ||
          url.includes('naver.me') ||
          url.includes('place.naver.com') ||
          url === NAVER_PLACE_SEARCH_URL
        ) {
          linkClass = 'article-action-btn article-btn-map';
          isButton = true;
        } else if (url.includes('talk.naver.com')) {
          linkClass = 'article-action-btn article-btn-talk';
          isButton = true;
        } else if (url.startsWith('/columns/') || url.startsWith('/treatments/')) {
          linkClass = 'article-internal-link';
        }

        // Fix href="#" or place links to authentic Naver Place
        if (url === '#' || url === '' || url.startsWith('javascript:')) {
          const t = linkText.toLowerCase();
          if (
            t.includes('오브한의원') ||
            t.includes('마곡') ||
            t.includes('강서구') ||
            t.includes('마곡중앙로') ||
            t.includes('지도') ||
            t.includes('위치') ||
            t.includes('플레이스') ||
            t.includes('르웨스트')
          ) {
            url = NAVER_PLACE_SEARCH_URL;
            linkClass = 'article-action-btn article-btn-map';
            isButton = true;
          } else {
            // Render as plain span to prevent page jumping to top (#)
            parts.push(<span key={key++} className="article-text-muted">{linkText}</span>);
            remaining = remaining.substring(match.index + token.length);
            continue;
          }
        }

        const isExternal = url.startsWith('http') && !isQeegButton;

        parts.push(
          <a
            key={key++}
            href={url}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className={linkClass}
          >
            {linkText}
            {isExternal && !isButton && <span className="link-ext-icon" aria-hidden="true"> ↗</span>}
          </a>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(<strong key={key++}>{renderInline(token.slice(2, -2))}</strong>);
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(<em key={key++}>{renderInline(token.slice(1, -1))}</em>);
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(<code key={key++} className="inline-code">{token.slice(1, -1)}</code>);
      } else if (/^<br\s*\/?>$/i.test(token)) {
        parts.push(<br key={key++} />);
      } else {
        parts.push(token);
      }

      remaining = remaining.substring(match.index + token.length);
    }

    return parts;
  };

  let inRoutineSection = false;
  let hasArchiveNotice = false;

  return (
    <div
      className={`article-prose break-words ${className}`}
      style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
    >
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Check if block is the official archive notice
        if (trimmed.includes('정식 웹 아카이브 안내')) {
          hasArchiveNotice = true;
          return (
            <div key={index} className="article-archive-notice">
              <div className="archive-notice-header">
                <span aria-hidden="true">📌</span>
                <strong>[정식 웹 아카이브 안내]</strong>
              </div>
              <p>
                본 칼럼은 오브한의원 공식 네이버 블로그에 연재된 임상 칼럼을 기반으로, 의학적 근거와 최신 검사 기준을 보완하여 영구 보존·게재한 공식 웹 아카이브 문서입니다. 무단 복제 및 전재를 금합니다.
              </p>
            </div>
          );
        }

        // Check if entering routine footer (location, booking, references, medical law)
        if (
          trimmed.includes('오브한의원 마곡점 안내') ||
          trimmed.includes('학술 참고문헌') ||
          trimmed.includes('References') ||
          trimmed.includes('의료법 제56조')
        ) {
          inRoutineSection = true;
        }

        // Horizontal rule
        if (/^---+$/.test(trimmed)) {
          return <hr key={index} className="article-divider" />;
        }

        // Markdown Table
        const lines = trimmed.split('\n');
        if (lines.length >= 2 && lines[0].includes('|') && lines[1].includes('|') && lines[1].includes('---')) {
          const headerCells = lines[0]
            .split('|')
            .map((c) => c.trim())
            .filter((_, idx, arr) => (idx > 0 && idx < arr.length - 1) || (arr.length === 2 ? true : idx > 0));

          const bodyRows = lines.slice(2).filter((l) => l.trim().includes('|'));

          return (
            <div key={index} className="article-table-wrapper">
              <table className="article-table">
                <thead>
                  <tr>
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx}>{renderInline(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rIdx) => {
                    const cells = row
                      .split('|')
                      .map((c) => c.trim())
                      .filter((_, idx, arr) => (idx > 0 && idx < arr.length - 1) || (arr.length === 2 ? true : idx > 0));
                    return (
                      <tr key={rIdx}>
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx}>{renderInline(cell)}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        // Headings
        if (trimmed.startsWith('## ')) {
          return <h2 key={index} className="article-h2 text-xl font-bold mt-10 mb-4">{renderInline(trimmed.replace(/^##\s+/, ''))}</h2>;
        }
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s+/, '');
          return (
            <h3
              key={index}
              className={`article-h3 text-lg font-semibold mt-6 mb-3 ${inRoutineSection ? 'article-routine-heading' : ''}`}
            >
              {renderInline(headingText)}
            </h3>
          );
        }
        if (trimmed.startsWith('#### ')) {
          return <h4 key={index} className="article-h4">{renderInline(trimmed.replace(/^####\s+/, ''))}</h4>;
        }

        // Callout or Blockquote
        if (trimmed.startsWith('>')) {
          const isCallout =
            trimmed.includes('💡') ||
            trimmed.includes('[!NOTE]') ||
            trimmed.includes('임상 핵심') ||
            trimmed.includes('핵심 요약') ||
            trimmed.includes('Medical Summary');
          const quoteLines = trimmed
            .split('\n')
            .map((line) => line.replace(/^>\s?/, ''))
            .filter(Boolean);

          if (isCallout) {
            return (
              <div key={index} className="article-callout">
                {quoteLines.map((line, qIdx) => (
                  <p key={qIdx}>{renderInline(line)}</p>
                ))}
              </div>
            );
          }

          return (
            <blockquote key={index} className="article-blockquote">
              {renderInline(quoteLines.join(' '))}
            </blockquote>
          );
        }

        // Unordered list
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
          return (
            <ul key={index} className={`article-ul ${inRoutineSection ? 'article-routine-list' : ''}`}>
              {items.map((item, itemIdx) => {
                const itemContent = item.trim().replace(/^[-*]\s+/, '');
                return <li key={itemIdx}>{renderInline(itemContent)}</li>;
              })}
            </ul>
          );
        }

        // Ordered list
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()));
          return (
            <ol key={index} className={`article-ol ${inRoutineSection ? 'article-routine-list' : ''}`}>
              {items.map((item, itemIdx) => {
                const itemContent = item.trim().replace(/^\d+\.\s+/, '');
                return <li key={itemIdx}>{renderInline(itemContent)}</li>;
              })}
            </ol>
          );
        }

        // Inline Image: ![alt](url)
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)/);
        if (imgMatch) {
          let alt = (imgMatch[1] || '')
            .replace(/[\r\n]+/g, ' ')
            .replace(/[\[\]\(\)\"#]/g, '')
            .replace(/↗/g, '')
            .replace(/\s*설명:\s*.*$/g, '')
            .replace(/\s*-\s*오브한의원\s*$/g, '')
            .trim();
          if (alt.length > 50 || alt.includes('오브한의원')) {
            alt = '오브한의원 임상 칼럼';
          }
          const src = imgMatch[2];
          if (src && src !== '#') {
            return (
              <figure key={index} className="article-inline-image my-6">
                <img
                  src={src}
                  alt={alt || '오브한의원 임상 칼럼'}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full rounded-lg my-6 shadow-sm block"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </figure>
            );
          }
          return null;
        }

        // Standard paragraph with clear font-normal and leading-relaxed typography
        return (
          <p
            key={index}
            className={`article-p text-base font-normal leading-relaxed text-gray-800 mb-4 break-words ${inRoutineSection ? 'article-routine-p' : ''}`}
            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
          >
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {renderInline(line)}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}

      {/* Automatically ensure the official Google Duplicate Content Web Archive notice is appended */}
      {!hasArchiveNotice && (
        <div className="article-archive-notice">
          <div className="archive-notice-header">
            <span aria-hidden="true">📌</span>
            <strong>[정식 웹 아카이브 안내]</strong>
          </div>
          <p>
            본 칼럼은 오브한의원 공식 네이버 블로그에 연재된 임상 칼럼을 기반으로, 의학적 근거와 최신 검사 기준을 보완하여 영구 보존·게재한 공식 웹 아카이브 문서입니다. 무단 복제 및 전재를 금합니다.
          </p>
        </div>
      )}
    </div>
  );
}
