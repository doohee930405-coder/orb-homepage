import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MarkdownView from '../../components/MarkdownView';
import SafeImage from '../../components/SafeImage';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import TrackedLink from '../../components/TrackedLink';
import ColumnViewTracker from '../../components/ColumnViewTracker';
import HspSelfChecklist from '../../components/HspSelfChecklist';
import { clinic, SITE_URL } from '../../lib/clinic';
import { getAllColumns, getColumnBySlug } from '../../lib/columns';

export function generateStaticParams() {
  const columns = getAllColumns();
  return columns.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || '';
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {}
  let doubleDecodedSlug = decodedSlug;
  try {
    doubleDecodedSlug = decodeURIComponent(decodedSlug);
  } catch {}
  const column =
    getColumnBySlug(slug) ||
    getColumnBySlug(decodedSlug) ||
    getColumnBySlug(doubleDecodedSlug);
  if (!column) return {};

  const pageUrl = `${SITE_URL}/columns/${column.slug}`;
  const imageUrl = column.thumbnail.startsWith('http')
    ? column.thumbnail
    : `${SITE_URL}${column.thumbnail}`;

  const authorName = column.author || '오브한의원 대표원장 전두희';

  return {
    title: `${column.title} | 오브한의원 전두희 원장 칼럼`,
    description: column.summary,
    keywords: column.tags,
    authors: [{ name: authorName }],
    alternates: {
      canonical: pageUrl,
      languages: {
        ko: pageUrl,
      },
    },
    openGraph: {
      title: `${column.title} | 오브한의원 마곡점`,
      description: column.summary,
      url: pageUrl,
      siteName: '오브한의원 마곡점',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: column.date,
      modifiedTime: column.updatedAt || column.date,
      authors: [authorName],
      tags: column.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: column.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${column.title} | 오브한의원 전두희 원장`,
      description: column.summary,
      images: [imageUrl],
    },
    other: {
      'article:published_time': column.date,
      'article:modified_time': column.updatedAt || column.date,
      'article:author': authorName,
      'article:section': column.category,
      'article:tag': column.tags.join(', '),
      'datePublished': column.date,
      'dateModified': column.updatedAt || column.date,
      'author': authorName,
    },
  };
}

// Helper: Extract academic citations like [1], [2] from text
function extractCitations(content: string): string[] {
  const citations: string[] = [];
  const regex = /(?:^|\n)\s*(?:[-*]\s*)?\[(\d+)\]\s*([^\n\r]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[2].replace(/[*_#]/g, '').trim();
    if (text.length > 5) {
      citations.push(`[${match[1]}] ${text}`);
    }
  }
  return citations;
}

// Helper: Extract FAQ Q&A from ## headings
function extractFaqs(
  content: string,
  existingFaqs?: { question: string; answer: string }[]
): { question: string; answer: string }[] {
  if (existingFaqs && existingFaqs.length > 0) {
    return existingFaqs;
  }

  const faqs: { question: string; answer: string }[] = [];
  const sections = content.split(/\n(?=##\s+)/);

  for (const section of sections) {
    const match = section.match(/^##\s+([^\n\r]+)/);
    if (!match) continue;

    const rawQuestion = match[1].replace(/[*_#]/g, '').trim();
    // Exclude routine administrative/reference sections
    if (
      rawQuestion.includes('오브한의원') ||
      rawQuestion.includes('참고문헌') ||
      rawQuestion.includes('안내') ||
      rawQuestion.includes('의료법') ||
      rawQuestion.includes('References') ||
      rawQuestion.length < 5
    ) {
      continue;
    }

    // Get body after heading and locate the first substantive paragraph
    const bodyAfterHeading = section.replace(/^##\s+[^\n\r]+/, '').trim();
    const paragraphs = bodyAfterHeading.split(/\n\s*\n/);
    let answer = '';
    for (const p of paragraphs) {
      const cleanP = p.trim();
      if (
        cleanP &&
        !cleanP.startsWith('!') &&
        !cleanP.startsWith('>') &&
        !cleanP.startsWith('#') &&
        !cleanP.startsWith('---') &&
        !cleanP.startsWith('* [')
      ) {
        answer = cleanP
          .replace(/[*_#]/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .trim();
        break;
      }
    }

    if (rawQuestion && answer && answer.length >= 20) {
      faqs.push({
        question: rawQuestion,
        answer: answer.length > 300 ? answer.slice(0, 297) + '...' : answer,
      });
    }
  }

  return faqs;
}

// Helper: Map clinical category to schema medical specialties
function getMedicalSpecialty(category: string): string[] {
  const base = ['KoreanMedicine', 'FunctionalMedicine', 'Neuroscience'];
  switch (category) {
    case '자율신경실조증':
      return [...base, 'AutonomicNervousSystem', 'Dysautonomia', 'NeurovegetativeDisorders'];
    case '브레인포그':
      return [...base, 'CognitiveDisorders', 'Neuroinflammation', 'BrainFog'];
    case '초민감자(HSP)':
      return [...base, 'SensoryProcessingSensitivity', 'Neuropsychiatry'];
    case 'ADHD':
      return [...base, 'AttentionDeficitDisorder', 'Neurodevelopmental'];
    case '다이어트':
      return [...base, 'MetabolicSyndrome', 'ObesityMedicine', 'RadiofrequencyTherapy'];
    case '위장관':
      return [...base, 'Gastroenterology', 'BrainGutAxis', 'FunctionalGastrointestinalDisorders'];
    case '갑상선':
      return [...base, 'Endocrinology', 'ThyroidDisorders'];
    case '정량화뇌파검사':
      return [...base, 'QuantitativeEEG', 'ClinicalNeurophysiology', 'BrainMapping'];
    case '통증':
      return [...base, 'PainMedicine', 'Musculoskeletal', 'PhysicalTherapy', 'Orthopedics'];
    default:
      return base;
  }
}




// Helper: Smart recommendation algorithm for high-relevance internal linking & topic clustering
function getRecommendedColumns(current: any, all: any[], count: number = 3): any[] {
  const candidates = all.filter((c) => c.slug !== current.slug);
  if (candidates.length === 0) return [];

  // Extract keywords (length >= 2) from current title to match topical focus
  const currentTitleWords = (current.title || '')
    .replace(/[\[\]\(\)\·\-\,\?\!\:\;\"\'\/\~]/g, ' ')
    .split(/\s+/)
    .map((w: string) => w.trim())
    .filter((w: string) => w.length >= 2);

  const currentTags = new Set(
    (current.tags || []).map((t: string) => t.toLowerCase().trim())
  );

  const scored = candidates.map((cand) => {
    let score = 0;

    // 1. Same category match (+12 points)
    if (cand.category === current.category) {
      score += 12;
    }

    // 2. Shared tags (+4 points each)
    if (cand.tags && Array.isArray(cand.tags)) {
      for (const t of cand.tags) {
        if (currentTags.has(t.toLowerCase().trim())) {
          score += 4;
        }
      }
    }

    // 3. Shared title keywords (+3 points each match)
    for (const kw of currentTitleWords) {
      if (cand.title && cand.title.includes(kw)) {
        score += 3;
      }
    }

    // 4. Clinical affinity: 자율신경실조증, 브레인포그, 초민감자(HSP), 정량화뇌파검사 share high clinical synergy
    const neuroCluster = ['자율신경실조증', '브레인포그', '초민감자(HSP)', '정량화뇌파검사'];
    if (neuroCluster.includes(current.category) && neuroCluster.includes(cand.category)) {
      score += 5;
    }

    return { col: cand, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.col.date || '').localeCompare(a.col.date || '');
  });

  return scored.slice(0, count).map((s) => s.col);
}

function cleanDisplayText(text: string): string {
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

export default async function ColumnDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || '';
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {}
  let doubleDecodedSlug = decodedSlug;
  try {
    doubleDecodedSlug = decodeURIComponent(decodedSlug);
  } catch {}
  const column =
    getColumnBySlug(slug) ||
    getColumnBySlug(decodedSlug) ||
    getColumnBySlug(doubleDecodedSlug);

  if (!column) {
    notFound();
  }

  const allColumns = getAllColumns();

  // Related columns: Smart recommendation based on category, shared tags, and clinical keywords
  const relatedColumns = getRecommendedColumns(column, allColumns, 3);

  const pageUrl = `${SITE_URL}/columns/${column.slug}`;
  const imageUrl = column.thumbnail.startsWith('http')
    ? column.thumbnail
    : `${SITE_URL}${column.thumbnail}`;

  const citations = extractCitations(column.content);
  const faqs = extractFaqs(column.content, column.faqs);
  const medicalSpecialties = getMedicalSpecialty(column.category);

  // Advanced Schema.org Graph for Google Medical SEO & AI Search Engines (AEO / GEO)
  const schemaGraph: any[] = [
    {
      '@type': ['MedicalWebPage', 'Article'],
      '@id': `${pageUrl}#article`,
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        name: '오브한의원 마곡점',
        url: SITE_URL,
      },
      headline: column.title,
      description: column.summary,
      inLanguage: 'ko-KR',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
      datePublished: column.date,
      dateModified: column.updatedAt || column.date,
      image: [imageUrl],
      keywords: column.tags.join(', '),
      articleSection: column.category,
      medicalSpecialty: medicalSpecialties,
      citation: citations.length > 0 ? citations : undefined,
      relatedLink: relatedColumns.map((c) => `${SITE_URL}/columns/${c.slug}`),
      author: {
        '@type': 'Physician',
        '@id': `${SITE_URL}/#physician-jeon`,
        name: '전두희',
        jobTitle: '한의사 / 대표원장',
        description: '한의사, 대한뇌파한의학회 회원, 척추신경추나의학회 회원',
        url: SITE_URL,
        worksFor: {
          '@type': 'MedicalClinic',
          name: '오브한의원 마곡점',
          url: SITE_URL,
          telephone: '02-6959-5982',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '서울 강서구 마곡중앙로 111 롯데캐슬 르웨스트 104동 2층 238·239호',
            addressLocality: '강서구',
            addressRegion: '서울',
            addressCountry: 'KR',
          },
        },
      },
      publisher: {
        '@type': 'MedicalClinic',
        name: '오브한의원 마곡점',
        url: SITE_URL,
        telephone: '02-6959-5982',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '서울 강서구 마곡중앙로 111 롯데캐슬 르웨스트 104동 2층 238·239호',
          addressLocality: '강서구',
          addressRegion: '서울',
          addressCountry: 'KR',
        },
      },
      about: column.tags.map((tag) => ({
        '@type': 'MedicalCondition',
        name: tag,
      })),
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['.article-title', '.geo-summary-box', '.article-authority-box'],
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '칼럼 아카이브',
          item: `${SITE_URL}/columns`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: column.category,
          item: `${SITE_URL}/columns?category=${encodeURIComponent(column.category)}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: column.title,
          item: pageUrl,
        },
      ],
    },
  ];

  // Inject FAQPage Schema if FAQs extracted
  if (faqs.length > 0) {
    schemaGraph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': schemaGraph,
  };

  const isQeegGuide = column.slug === 'qeeg-guide';
  const isHspColumn =
    column.category === '초민감자(HSP)' ||
    column.tags?.some((t) => /hsp|초민감|감각처리|고감각|예민/i.test(t)) ||
    /초민감|hsp|감각처리민감성/i.test(column.title);

  return (
    <main className="site-shell column-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader locale="ko" compact />
      <ColumnViewTracker slug={column.slug} />

      {/* Article Header */}
      <article className="article-container" itemScope itemType="https://schema.org/Article">
        <meta itemProp="mainEntityOfPage" content={pageUrl} />
        <meta itemProp="dateModified" content={column.updatedAt || column.date} />
        {imageUrl && <meta itemProp="image" content={imageUrl} />}
        <header className="article-header">
          {/* 4-Step Semantic Breadcrumb Navigation */}
          <nav className="article-breadcrumb-nav" aria-label="브레드크럼 위치">
            <ol className="breadcrumb-ol">
              <li className="breadcrumb-li">
                <a href="/">홈</a>
                <span className="breadcrumb-sep" aria-hidden="true">›</span>
              </li>
              <li className="breadcrumb-li">
                <a href="/columns">칼럼 아카이브</a>
                <span className="breadcrumb-sep" aria-hidden="true">›</span>
              </li>
              <li className="breadcrumb-li">
                <a href={`/columns?category=${encodeURIComponent(column.category)}`}>
                  {column.category}
                </a>
                <span className="breadcrumb-sep" aria-hidden="true">›</span>
              </li>
              <li className="breadcrumb-li current" aria-current="page">
                <span>{column.title}</span>
              </li>
            </ol>
          </nav>

          <div className="article-header-meta">
            <span className="column-badge" itemProp="articleSection">{column.category}</span>
            <time dateTime={column.date} itemProp="datePublished">{column.date}</time>
            <span className="article-author" itemProp="author" itemScope itemType="https://schema.org/Person">
              <meta itemProp="jobTitle" content="대표원장" />
              <span itemProp="name">전두희 원장</span>
            </span>
          </div>

          <h1 className="article-title" itemProp="headline">{column.title}</h1>
        </header>

        {/* AI & GEO / AEO Summary Box (Answer Engine Optimized) */}
        {column.summary && (
          <section className="geo-summary-box" aria-label="Summary">
            <div className="geo-summary-title">
              <strong>Summary</strong>
            </div>
            <p>{column.summary}</p>
          </section>
        )}

        {/* Semantic Web & LLM Extraction: HSP Autonomic Dysregulation Self-Check */}
        {isHspColumn && <HspSelfChecklist headingLevel="h3" />}

        {/* Article Cover Image: Only displayed if the markdown body does not already contain inline images */}
        {column.thumbnail && !column.content.includes('![') && (
          <figure className="article-figure">
            <SafeImage
              src={column.thumbnail}
              alt={column.title}
            />
          </figure>
        )}

                {/* Article Body (Markdown with Table, Callouts & Action Links) */}
        <section className="article-content-wrapper">
          <MarkdownView content={column.content} summary={column.summary} />
        </section>

        {/* 함께 읽어보면 좋은 자율신경 칼럼 (Internal Link & Recommendation Component) */}
        {relatedColumns.length > 0 && (
          <nav
            className="recommended-columns-box"
            aria-labelledby="recommended-columns-heading"
          >
            <div className="recommended-columns-header">
              <div className="recommended-header-top">
                <span className="recommended-badge" aria-hidden="true">
                  <span className="recommended-dot" />
                  CLINICAL RECOMMENDATION
                </span>
                <span className="recommended-count">연관 칼럼 {relatedColumns.length}선</span>
              </div>
              <h3 id="recommended-columns-heading" className="recommended-title">
                함께 읽어보면 좋은 자율신경 칼럼
              </h3>
              <p className="recommended-desc">
                오브한의원 전두희 대표원장이 직접 집필한 연관 증상 및 질환별 심층 임상 칼럼입니다. 증상이 겹치거나 원인이 연결되는 의학 정보를 이어서 확인해 보세요.
              </p>
            </div>

            <ul className="recommended-articles-list">
              {relatedColumns.map((col, idx) => (
                <li key={col.slug} className="recommended-article-item">
                  <a
                    href={`/columns/${col.slug}`}
                    className="recommended-article-anchor"
                    title={`${cleanDisplayText(col.title)} - 칼럼 전문 읽기`}
                  >
                    <div className="recommended-item-lead">
                      <span className="recommended-index" aria-hidden="true">
                        0{idx + 1}
                      </span>
                      <div className="recommended-text-group">
                        <div className="recommended-tag-row">
                          <span className="recommended-cat-label">[{col.category}]</span>
                          {col.tags.slice(0, 2).map((t: string) => (
                            <span key={t} className="recommended-subtag">
                              #{t}
                            </span>
                          ))}
                        </div>
                        <strong className="recommended-item-title">
                          {cleanDisplayText(col.title)}
                        </strong>
                        {col.summary && (
                          <p className="recommended-item-summary">
                            {cleanDisplayText(col.summary)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="recommended-item-cta" aria-hidden="true">
                      <span>칼럼 읽기</span>
                      <span className="recommended-arrow">→</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* 크롤링 루프 및 사이트 내부 순환 네비게이션 */}
            <div className="crawling-loop-bar" aria-label="오브한의원 주요 탐색 순환 경로">
              <div className="crawling-loop-inner">
                <span className="crawling-loop-label">
                  <span className="crawling-loop-icon" aria-hidden="true">🔁</span>
                  사이트 순환 경로:
                </span>
                <div className="crawling-loop-links">
                  <a href="/" className="crawling-anchor" title="오브한의원 마곡점 메인 홈페이지">
                    🏠 마곡 오브한의원 홈
                  </a>
                  <span className="crawling-sep" aria-hidden="true">›</span>
                  <a
                    href="/treatments/autonomic-qeeg"
                    className="crawling-anchor"
                    title="마곡 자율신경실조증 치료·뇌파검사 클리닉 피지컬 허브"
                  >
                    🩺 자율신경·뇌파검사 클리닉
                  </a>
                  <span className="crawling-sep" aria-hidden="true">›</span>
                  <a
                    href={`/columns?category=${encodeURIComponent(column.category)}`}
                    className="crawling-anchor"
                    title={`오브한의원 ${column.category} 칼럼 전체 모아보기`}
                  >
                    📚 {column.category} 칼럼 아카이브
                  </a>
                  <span className="crawling-sep" aria-hidden="true">›</span>
                  <a
                    href="/columns"
                    className="crawling-anchor"
                    title="오브한의원 전체 의학 칼럼 아카이브"
                  >
                    전체 칼럼 목록
                  </a>
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Topic Cluster: Fixed QEEG Diagnostic Guide Internal Link Banner */}
        {!isQeegGuide && (
          <aside className="qeeg-internal-guide-banner" aria-label="핵심 진단 가이드">
            <div className="qeeg-guide-banner-inner">
              <div className="qeeg-guide-banner-badge">
                <span>DIAGNOSTIC PROTOCOL</span>
                <strong>핵심 진단 가이드</strong>
              </div>
              <div className="qeeg-guide-banner-text">
                <h4>각종 검사상 &lsquo;이상 없음&rsquo;에도 지속되는 고통, 원인을 규명합니다</h4>
                <p>
                  습식 정량화 뇌파(QEEG)와 정밀 자율신경 검사로 뇌 신경망 피로도와 불균형을 객관적 데이터로 분석하는 오브한의원의 진단 프로토콜을 확인해 보세요.
                </p>
              </div>
              <a href="/columns/qeeg-guide" className="qeeg-guide-banner-link">
                <span>습식 정량화 뇌파검사(QEEG) 원리 보러가기</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </aside>
        )}

        {/* Article Tags */}
        {column.tags.length > 0 && (
          <footer className="article-tags-section">
            <span className="tags-label">관련 전문 태그:</span>
            <div className="tags-list">
              {column.tags.map((tag) => (
                <a key={tag} href={`/columns?tag=${encodeURIComponent(tag)}`} className="tag-pill">
                  #{tag}
                </a>
              ))}
            </div>
          </footer>
        )}

        {/* E-E-A-T Medical Review Authority Box (Bottom Closure) */}
        <section className="article-authority-box bottom" aria-label="의학적 검증 및 진료 고지">
          <div className="authority-details">
            <div className="authority-text-block">
              <p className="authority-writer">
                <strong>의학적 집필 및 감수:</strong> 오브한의원 대표원장 <strong>전두희</strong>
              </p>
              <p className="authority-standard">
                <strong>진단 기준:</strong> 자율신경검사(HRV) 및 정량화 뇌파검사(QEEG), 기능 의학
              </p>
              <p className="authority-note">
                오브한의원은 과학적이고 정량화된 뇌파 및 자율신경 데이터에 근거하여 개인별 원인 치료를 진행합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Medical Disclaimer */}
        <div className="medical-disclaimer-box">
          <strong>[의료법 안내 및 진료 고지]</strong>
          <p>
            본 칼럼은 국민건강 증진과 올바른 의료 정보 전달을 목적으로 의료법 제56조 제1항을 준수하여 작성되었습니다.
            개인의 체질과 건강 상태에 따라 진단 및 치료 효과는 상이할 수 있으며, 정확한 치료 계획은 내원 후 의료진의 정밀 진찰을 통해 결정됩니다.
          </p>
        </div>

        {/* Back Link */}
        <div className="article-back-bar">
          <a href="/columns" className="button button-ghost">
            ← 전체 칼럼 목록으로 돌아가기
          </a>
        </div>
      </article>

      {/* Reservation CTA Section */}
      <section className="contact-section" id="contact">
        <p className="contact-slogan">“다시 건강의 궤도(ORBit) 위로”</p>
        <p className="eyebrow">RESERVATION</p>
        <h2>진료 예약과 문의</h2>
        <p>네이버톡톡/ 카카오톡 으로 언제든 문의주세요</p>
        <a className="contact-phone" href={clinic.phoneHref}>
          {clinic.phoneDisplay}
        </a>
      </section>

      {/* Topic Cluster: Related Category Columns */}
      {relatedColumns.length > 0 && (
        <section className="related-columns-section">
          <div className="related-columns-inner">
            <div className="section-heading">
              <p className="eyebrow">TOPIC CLUSTER · {column.category}</p>
              <h2>{column.category} 관련 추천 임상 칼럼</h2>
            </div>
            <div className="column-grid">
              {relatedColumns.map((col) => (
                <article key={col.slug} className="column-card">
                  <a href={`/columns/${col.slug}`} className="column-card-link">
                    <div className="column-card-thumb">
                      <div className="column-card-fallback" aria-hidden="true">
                        <div className="fallback-orb-mark">
                          <span className="fallback-orb-icon">ORB</span>
                          <span className="fallback-orb-sub">CLINICAL COLUMN</span>
                        </div>
                      </div>
                      {col.thumbnail && (
                        <SafeImage
                          src={col.thumbnail}
                          alt={col.title}
                          loading="lazy"
                        />
                      )}
                      <span className="column-badge">{col.category}</span>
                    </div>
                    <div className="column-card-copy">
                      <div className="column-meta">
                        <time dateTime={col.date}>{col.date}</time>
                      </div>
                      <h3 className="column-card-title">{cleanDisplayText(col.title)}</h3>
                      <p className="column-card-summary">{cleanDisplayText(col.summary)}</p>
                      <div className="column-card-footer">
                        <div className="column-tags">
                          {col.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="tag-pill">#{tag}</span>
                          ))}
                        </div>
                        <span className="column-read-more" aria-hidden="true">
                          읽기 →
                        </span>
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
