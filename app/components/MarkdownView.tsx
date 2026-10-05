'use client';

import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

const NAVER_PLACE_SEARCH_URL =
  'https://map.naver.com/p/search/%EC%98%A4%EB%B8%8C%ED%95%9C%EC%9D%98%EC%9B%90%20%EB%A7%88%EA%B3%A1%EC%A0%90';

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

  // 1. Bolded title at start: **1.1. 제목** 본문...
  const boldMatch = fullText.match(/^\*\*([^*]+)\*\*\s*[:\-]?\s*(.+)$/s);
  if (boldMatch) {
    return `${hashes} ${boldMatch[1].trim()}\n\n${boldMatch[2].trim()}`;
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

const DEFAULT_QEEG_SLUG = '습식-정량-뇌파-측정-과정에-대해-안내해드립니다-314941';

export default function MarkdownView({ content, className = '' }: MarkdownViewProps) {
  if (!content) return null;

  // Pre-clean Naver check-in UI and broken markdown wrappers before rendering
  const cleanContent = content
    .replace(/이\s*블로그의\s*체크인\s*이\s*장소의\s*다른\s*글/gi, '')
    .replace(/이\s*블로그의\s*체크인/gi, '')
    .replace(/이\s*장소의\s*다른\s*글/gi, '')
    .replace(/MY\s*플레이스/gi, '')
    .replace(/MY플레이스/gi, '')
    .replace(/(?:\r?\n)\s*[\*_]설명\s*:[^\r\n\*_]*[\*_]\s*(?:\r?\n|$)/gi, '\n\n')
    .replace(/\[\s*!\[([^\]]*)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)[^\]]*\]\([^)]*\)/gi, '\n\n![$1]($2)\n\n')
    .replace(/!\[([^\]]*?)(?:↗|\^)?(?:\s*설명:[^\]]*)?\]\(#\)/gi, '')
    .replace(/!\[[^\]]*\]\(\s*\)/gi, '')
    .replace(/![\"']([^\"'\n]+)[\"']/g, '\n\n**$1**\n\n');

  // Split by double line breaks and ensure merged subheadings are split from body
  const rawBlocks = cleanContent.split(/\n{2,}/);
  const blocks: string[] = [];
  for (const b of rawBlocks) {
    const trimmed = b.trim();
    if (!trimmed) continue;
    const split = splitHeadingAndBody(trimmed);
    for (const sub of split.split(/\n{2,}/)) {
      if (sub.trim()) blocks.push(sub.trim());
    }
  }

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Pattern for inline elements: match image first ![alt](url), then links [text](url), **bold**, *italic*, `code`
    const inlineRegex = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/;

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
        parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(<code key={key++} className="inline-code">{token.slice(1, -1)}</code>);
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
    <div className={`article-prose ${className}`}>
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
          <p key={index} className={`article-p text-base font-normal leading-relaxed text-gray-800 mb-4 ${inRoutineSection ? 'article-routine-p' : ''}`}>
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
